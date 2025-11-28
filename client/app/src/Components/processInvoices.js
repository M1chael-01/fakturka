import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import GetBackendURL from "./GetBackendURL";


export class ProcessInvoices {
  // 🧾 Metoda pro uložení a export faktury
  saveInvoices(data,type) {
    console.log("=== 🧾 Ukládání faktury - souhrn ===");

    const now = new Date();
    const formattedDate = `${now.getDate()}.${now.getMonth()}-${now.getFullYear()}- ${now.getHours()}-${now.getMinutes()}-${now.getMilliseconds()}`

    // ✅ 1. Základní údaje
    const invoiceDetails = {
      invoiceNumber: data.invoiceNumber || "",
      createdDate: formattedDate,
      dueDate: data.dueDate || "",
      currency: data.currency || "Kč",
    };

    // ✅ 2. Položky faktury
    const invoiceItems = Array.isArray(data.items)
      ? data.items.map((item, index) => {
          const rowTotal = item.quantity * item.unitPrice;
          const vatRate = item.vatRate || 0;
          const vatAmount = rowTotal * (vatRate / 100);
          return {
            index: index + 1,
            description: item.description || "",
            quantity: item.quantity || 0,
            unitPrice: item.unitPrice || 0,
            vatRate,
            total: rowTotal.toFixed(2),
            vatAmount: vatAmount.toFixed(2),
          };
        })
      : [];

    // ✅ 3. Výpočty
    const totalWithoutVat = data.items?.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    ) || 0;

    const totalVat = data.items?.reduce((sum, item) => {
      const vat = (item.vatRate || 0) / 100;
      return sum + item.quantity * item.unitPrice * vat;
    }, 0) || 0;

    const totalWithVat = totalWithoutVat + totalVat;
    const paid = parseFloat(data.paidAmount) || 0;

    const totals = {
      totalWithoutVat: totalWithoutVat.toFixed(2),
      totalVat: totalVat.toFixed(2),
      totalToPay: totalWithVat.toFixed(2),
      paidAmount: paid.toFixed(2),
      balanceDue: (totalWithVat - paid).toFixed(2),
    };

    // ✅ 4. Dodavatel
    const supplierInfo = {
      name: data.supplier?.name || "",
      address: data.supplier?.address || "",
      ico: data.supplier?.ico || "",
      dic: data.supplier?.dic || "",
      email: data.supplier?.email || "",
      website: data.supplier?.website || "",
      iban: data.supplier?.iban || "",
      swift: data.supplier?.swift || "",
      bankAccount: data.supplier?.bu || "",
    };

    // ✅ 5. Odběratel
    const customerInfo = {
      name: data.customer?.name || "",
      address: data.customer?.address || "",
      ico: data.customer?.ico || "",
      dic: data.customer?.dic || "",
    };

    const types = {type}

    // ✅ 6. Kompletní faktura
    const invoiceSummary = {
      invoiceDetails,
      supplierInfo,
      customerInfo,
      invoiceItems,
      totals,
      types
    };

  

    // ✅ Záznam faktury do backendu
    this.createNewRecord(invoiceSummary);

    console.log(invoiceSummary);
    console.log("✅ Faktura připravena k exportu.");
    console.log("=============================================");

    return invoiceSummary;
  }

  // 🧾 Metoda pro stažení vícestránkového PDF
   async downloadInvoices(data, invoiceRef, renderPageCallback) {
    if (!invoiceRef.current) {
      console.warn("⚠️ Invoice ref není nastavený.");
      return;
    }
   

    const ITEMS_PER_PAGE = 7;
    const totalPages = Math.ceil(data.items.length / ITEMS_PER_PAGE) || 1;

    document.body.classList.remove("dark");
    invoiceRef.current.classList.add("pdf-mode");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeightPage = pdf.internal.pageSize.getHeight();

    for (let page = 0; page < totalPages; page++) {
      renderPageCallback(page, ITEMS_PER_PAGE);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (page > 0) pdf.addPage();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Footer
      const footerY = pdfHeightPage - 20;
      const now = new Date();
      const generatedDate = now.toLocaleDateString("cs-CZ") + " " + now.toLocaleTimeString("cs-CZ");

      pdf.setFontSize(9);
      pdf.setTextColor(100);

      const leftText = `Faktura vygenerována dne ${generatedDate} pomocí Fakturky`;
      const rightText = `Strana ${page + 1} / ${totalPages}`;
      const margin = 10;
      const leftX = margin;
      const rightX = pdfWidth - pdf.getTextWidth(rightText) - margin;

      pdf.text(leftText, leftX, footerY);
      pdf.text(rightText, rightX, footerY);
    }

    // Získání PDF jako Blob
    const pdfBlob = pdf.output("blob");

    // Vytvoření FormData a přidání PDF souboru
    const formData = new FormData();
    formData.append("file", pdfBlob, `Faktura_${data.invoiceNumber}.pdf`);

    console.log(formData);
    try {
      const res = await fetch("http://localhost:5000/invoice/uploadPdf", {
        method: "POST",
        body: formData,
        credentials: "include", // pokud potřebuješ cookies/sessions
      });

      if (res.ok) {
        const result = await res.json();
        console.log("✅ PDF bylo úspěšně odesláno a uloženo:", result);
      } else {
        console.error("❌ Chyba při odesílání PDF:", res.statusText);
      }
    } catch (err) {
      console.error("❌ Chyba fetch odeslání PDF:", err);
    }

    invoiceRef.current.classList.remove("pdf-mode");
    document.body.classList.add("dark");
  }

  // 💾 Uložení faktury na server
  async createNewRecord(data) {
    
    try {
      const res = await fetch(`${GetBackendURL()}/invoice/newInvoices`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const responseData = await res.json();
        console.log("✅ API odpověď:", responseData);
      } else {
        throw new Error("❌ Server vrátil chybu");
      }
    } catch (err) {
      console.error("❌ Chyba při ukládání faktury:", err);
    }
  }
}
