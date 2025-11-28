import React, { useState, useRef } from "react";
import Navigation from "../Nav";
import { QRCodeSVG } from "qrcode.react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "../../styles/admin/pages/InvoiceEditorA4.css";

import { ProcessInvoices } from "../../processInvoices";

const defaultItem = () => ({
  description: "Položka",
  quantity: 1,
  unitPrice: 1000,
  vatRate: 21,
});

const ReceivedInvoiceEditorA4 = ({ onSave, onCancel }) => {
  const [data, setData] = useState({
    invoiceNumber: "20251111",
    issueDate: new Date().toISOString().slice(0, 10),
    taxableDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    paymentMethod: "Převodem",
    variableSymbol: "20251111",
    currency: "CZK",
    notes: "",
    paidAmount: 0,
    supplier: {
      name: "Dodavatel, s.r.o.",
      address: "Náměstí Dodavatele 1, 110 00 Praha",
      ico: "22222222",
      dic: "CZ22222222",
      isVatPayer: true,
      bank: "0600",
      bu:"0000000/2010",
      account: "0000002222",
      iban: "CZ65060000000000002222",
      swift: "AGBACZPP",
      website: "www.dodavatel.cz",
      email: "info@dodavatel.cz",
    },
    customer: {
      name: "Moje firma, s.r.o.",
      address: "Ulice 123, 602 00 Brno",
      ico: "11111111",
      dic: "CZ11111111",
    },
    items: [defaultItem()],
  });

  const invoiceRef = useRef(null);

  const updateItem = (index, field, value) => {
    const items = [...data.items];
    items[index][field] = field === "description" ? value : Number(value);
    setData({ ...data, items });
  };

  const addItem = () => setData({ ...data, items: [...data.items, defaultItem()] });
  const removeItem = (i) => setData({ ...data, items: data.items.filter((_, idx) => idx !== i) });

  const calcRowTotal = (item) => item.quantity * item.unitPrice;
  const calcVatAmount = (item) => calcRowTotal(item) * (item.vatRate / 100);

  const totalBase = data.items.reduce((sum, i) => sum + calcRowTotal(i), 0);
  const totalVat = data.items.reduce((sum, i) => sum + calcVatAmount(i), 0);
  const total = totalBase + totalVat;
  const balance = total - data.paidAmount;

  const qrString = `SPD*1.0*ACC:${data.supplier.account}/${data.supplier.bank}*AM:${total.toFixed(
    2
  )}*CC:${data.currency}*X-VS:${data.variableSymbol}`;

const handleDownloadPdf = async () => {
  if (!invoiceRef.current) return;



  await saveInvoices();

  return;

  // --- Pokračujeme s generováním PDF ---

  // Odebereme dark mode a přidáme třídu pro pdf styl
  document.body.classList.remove("dark");
  invoiceRef.current.classList.add("pdf-mode");

  // Vytvoříme canvas faktury
  const canvasInvoice = await html2canvas(invoiceRef.current, { scale: 2 });

  // Vytvoříme nový PDF dokument
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeightPage = pdf.internal.pageSize.getHeight();

  // Vypočítáme výšku obrázku dle poměru stran
  const imgProps = pdf.getImageProperties(canvasInvoice.toDataURL("image/png"));
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  // Přidáme obrázek do PDF (jedna stránka)
  pdf.addImage(canvasInvoice.toDataURL("image/png"), "PNG", 0, 0, pdfWidth, pdfHeight);

  // Počet stran (prozatím vždy 1)
  const totalPages = pdf.getNumberOfPages();

  // Footer pozice 20 mm od spodního okraje
  const footerY = pdfHeightPage - 20;

  // Aktuální datum a čas vygenerování
  const now = new Date();
  const generatedDate = now.toLocaleDateString("cs-CZ") + " " + now.toLocaleTimeString("cs-CZ");

  pdf.setFontSize(9);
  pdf.setTextColor(100);

  // Footer - levý text: datum + info
  const leftText = `Faktura vygenerována dne ${generatedDate} pomocí Fakturky`;

  // Footer - pravý text: číslo strany / počet stran
  const rightText = `Strana 1 / ${totalPages}`;

  // Vypočítáme šířky textů
  const leftTextWidth = pdf.getTextWidth(leftText);
  const rightTextWidth = pdf.getTextWidth(rightText);

  // Pozice textů
  const margin = 10;
  const rightX = pdfWidth - rightTextWidth - margin;
  const leftX = margin;

  // Přidáme texty do footeru
  pdf.text(leftText, leftX, footerY);
  pdf.text(rightText, rightX, footerY);

  // Uložíme PDF
  pdf.save(`Faktura_${data.invoiceNumber}.pdf`);

  // Vrátíme třídy a dark mode zpět
  invoiceRef.current.classList.remove("pdf-mode");
  document.body.classList.add("dark");
};

const saveInvoices = async () => {
  console.log("=== Ukládání faktury - souhrn ===");

  // Základní údaje
  console.log("🧾 Číslo faktury:", data.invoiceNumber);
  const now = new Date();
  console.log("📅 Datum vystavení:", `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`);
  console.log("📅 Datum splatnosti:", data.dueDate);

  // Objekt dodavatele
  const supplier = {
    name: data.supplier.name,
    address: data.supplier.address,
    ico: data.supplier.ico,
    dic: data.supplier.dic,
    email: data.supplier.email,
    website: data.supplier.website,
    iban: data.supplier.iban,
    swift: data.supplier.swift,
    bu: data.supplier.bu,
  };

  // Objekt odběratele
  const customer = {
    name: data.customer.name,
    address: data.customer.address,
    ico: data.customer.ico,
    dic: data.customer.dic,
  };

  // Bankovní spojení - vytaženo z dodavatele (předpoklad)
  const bankDetails = {
    iban: data.supplier.iban,
    swift: data.supplier.swift,
    bu: data.supplier.bu,
  };

 console.log(supplier)
  console.log(customer)
  console.log(bankDetails)

  // Výpočty sum
  const totalExclVat = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalVat = data.items.reduce((sum, item) => {
    const vat = (item.vatRate || 0) / 100;
    return sum + item.quantity * item.unitPrice * vat;
  }, 0);
  const totalInclVat = totalExclVat + totalVat;

  // Výpis sum
  console.log("\n💰 Celkové částky:");
  console.log(`  Celkem bez DPH: ${totalExclVat.toFixed(2)} Kč`);
  console.log(`  Celkem DPH: ${totalVat.toFixed(2)} Kč`);
  console.log(`  Celkem k úhradě: ${totalInclVat.toFixed(2)} Kč`);

  console.log("\n✅ Faktura připravena k exportu.");
  console.log("=============================================");
};





  return (
    <>
      <section className="content">
        <Navigation />
        <div className="invoice-editor-cz" ref={invoiceRef}>
          <h1>PŘIJATÁ FAKTURA č. {data.invoiceNumber}</h1>

          {/* Dodavatel a odběratel */}
          <div className="parties" style={{ display: "flex", gap: "2rem" }}>
            <div>
              <h3>Dodavatel</h3>
              <p
                contentEditable
                suppressContentEditableWarning={true}
                onInput={(e) =>
                  setData({ ...data, supplier: { ...data.supplier, name: e.currentTarget.textContent || "" } })
                }
              >
                <strong>{data.supplier.name}</strong>
              </p>
              <p
                contentEditable
                suppressContentEditableWarning={true}
                onInput={(e) =>
                  setData({ ...data, supplier: { ...data.supplier, address: e.currentTarget.textContent || "" } })
                }
              >
                {data.supplier.address}
              </p>
              <p
                contentEditable
                suppressContentEditableWarning={true}
                onInput={(e) =>
                  setData({ ...data, supplier: { ...data.supplier, ico: e.currentTarget.textContent || "" } })
                }
              >
                IČO: {data.supplier.ico}
              </p>
              <p
                contentEditable
                suppressContentEditableWarning={true}
                onInput={(e) =>
                  setData({ ...data, supplier: { ...data.supplier, dic: e.currentTarget.textContent || "" } })
                }
              >
                DIČ: {data.supplier.dic}
              </p>
              <p
                contentEditable
                suppressContentEditableWarning={true}
                onInput={(e) =>
                  setData({ ...data, supplier: { ...data.supplier, email: e.currentTarget.textContent || "" } })
                }
              >
                Email: {data.supplier.email}
              </p>
              <p
                contentEditable
                suppressContentEditableWarning={true}
                onInput={(e) =>
                  setData({ ...data, supplier: { ...data.supplier, website: e.currentTarget.textContent || "" } })
                }
              >
                Web: {data.supplier.website}
              </p>
              <p
                contentEditable
                suppressContentEditableWarning={true}
                onInput={(e) =>
                  setData({ ...data, supplier: { ...data.supplier, iban: e.currentTarget.textContent || "" } })
                }
              >
                IBAN: {data.supplier.iban}
              </p>
                <p
  contentEditable
  suppressContentEditableWarning={true}
  onInput={(e) =>
    setData({
      ...data,
      supplier: { ...data.supplier, bankName: e.currentTarget.textContent?.replace("BÚ: ", "") || "" },
    })
  }
>
  BÚ: {data.supplier.bankName || "0000000/2010"}
</p>

              <p
                contentEditable
                suppressContentEditableWarning={true}
                onInput={(e) =>
                  setData({ ...data, supplier: { ...data.supplier, swift: e.currentTarget.textContent || "" } })
                }
              >
                SWIFT/BIC: {data.supplier.swift}
              </p>
              {!data.supplier.isVatPayer && <p><em>Dodavatel není plátcem DPH</em></p>}
            </div>

            <div>
              <h3>Odběratel</h3>
              <p
                contentEditable
                suppressContentEditableWarning={true}
                onInput={(e) =>
                  setData({ ...data, customer: { ...data.customer, name: e.currentTarget.textContent || "" } })
                }
              >
                <strong>{data.customer.name}</strong>
              </p>
              <p
                contentEditable
                suppressContentEditableWarning={true}
                onInput={(e) =>
                  setData({ ...data, customer: { ...data.customer, address: e.currentTarget.textContent || "" } })
                }
              >
                {data.customer.address}
              </p>
              <p
                contentEditable
                suppressContentEditableWarning={true}
                onInput={(e) =>
                  setData({ ...data, customer: { ...data.customer, ico: e.currentTarget.textContent || "" } })
                }
              >
                IČO: {data.customer.ico}
              </p>
              <p
                contentEditable
                suppressContentEditableWarning={true}
                onInput={(e) =>
                  setData({ ...data, customer: { ...data.customer, dic: e.currentTarget.textContent || "" } })
                }
              >
                DIČ: {data.customer.dic}
              </p>
            </div>
          </div>

          {/* Datum a další údaje */}
          <div className="dates">
            <p>
              <strong>Datum vystavení:</strong>{" "}
              <input type="date" value={data.issueDate} onChange={(e) => setData({ ...data, issueDate: e.target.value })} />
            </p>
            <p>
              <strong>DUZP:</strong>{" "}
              <input
                type="date"
                value={data.taxableDate}
                onChange={(e) => setData({ ...data, taxableDate: e.target.value })}
              />
            </p>
            <p>
              <strong>Splatnost:</strong>{" "}
              <input type="date" value={data.dueDate} onChange={(e) => setData({ ...data, dueDate: e.target.value })} />
            </p>
            <p>
              <strong>Forma úhrady:</strong>{" "}
              <select value={data.paymentMethod} onChange={(e) => setData({ ...data, paymentMethod: e.target.value })}>
                <option value="Převodem">Převodem</option>
                <option value="Hotově">Hotově</option>
                <option value="Karta">Karta</option>
              </select>
            </p>
            <p>
              <strong>Variabilní symbol:</strong>{" "}
              <input
                type="text"
                value={data.variableSymbol}
                onChange={(e) => setData({ ...data, variableSymbol: e.target.value })}
              />
            </p>
            <p>
              <strong>Měna:</strong>{" "}
              <input type="text" value={data.currency} onChange={(e) => setData({ ...data, currency: e.target.value })} />
            </p>
           
          </div>

          {/* Položky */}
          <table className="items" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Popis</th>
                <th>Množství</th>
                <th>Cena za MJ</th>
                <th>DPH %</th>
                <th>Částka bez DPH</th>
                <th>DPH</th>
                <th>Celkem</th>
                <th>Odstranit</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i}>
                  <td
                    contentEditable
                    suppressContentEditableWarning={true}
                    onInput={(e) => updateItem(i, "description", e.currentTarget.textContent || "")}
                    style={{ border: "1px solid #ddd" }}
                  >
                    {item.description}
                  </td>
                  <td
                    contentEditable
                    suppressContentEditableWarning={true}
                    onInput={(e) => updateItem(i, "quantity", e.currentTarget.textContent || "0")}
                    style={{ border: "1px solid #ddd", textAlign: "right" }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    contentEditable
                    suppressContentEditableWarning={true}
                    onInput={(e) => updateItem(i, "unitPrice", e.currentTarget.textContent || "0")}
                    style={{ border: "1px solid #ddd", textAlign: "right" }}
                  >
                    {item.unitPrice.toFixed(2)}
                  </td>
                  <td
                    contentEditable
                    suppressContentEditableWarning={true}
                    onInput={(e) => updateItem(i, "vatRate", e.currentTarget.textContent || "0")}
                    style={{ border: "1px solid #ddd", textAlign: "right" }}
                  >
                    {item.vatRate}
                  </td>
                  <td style={{ border: "1px solid #ddd", textAlign: "right" }}>
                    {calcRowTotal(item).toFixed(2)}
                  </td>
                  <td style={{ border: "1px solid #ddd", textAlign: "right" }}>
                    {calcVatAmount(item).toFixed(2)}
                  </td>
                  <td style={{ border: "1px solid #ddd", textAlign: "right" }}>
                    {(calcRowTotal(item) + calcVatAmount(item)).toFixed(2)}
                  </td>
                  <td style={{ border: "1px solid #ddd", textAlign: "center" }}>
                    <button onClick={() => removeItem(i)}>x</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={addItem}>Přidat položku</button>

          {/* Součty */}
          <div className="totals" style={{ marginTop: "1rem", textAlign: "right" }}>
            <p>Základ DPH: {totalBase.toFixed(2)} {data.currency}</p>
            <p>DPH celkem: {totalVat.toFixed(2)} {data.currency}</p>
            <p><strong>Celkem k úhradě: {total.toFixed(2)} {data.currency}</strong></p>
            <p>Uhrazeno: {data.paidAmount.toFixed(2)} {data.currency}</p>
            <p><strong>Zbývá uhradit: {balance.toFixed(2)} {data.currency}</strong></p>
          </div>

         
        </div>

        <div style={{ marginTop: "1rem" }}>
          <button onClick={handleDownloadPdf}>Stáhnout PDF</button>
          <button onClick={onSave}>Uložit</button>
          <button onClick={onCancel}>Zrušit</button>
        </div>
      </section>
    </>
  );
};

export default ReceivedInvoiceEditorA4;
