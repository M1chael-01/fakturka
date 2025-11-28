import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFileInvoiceDollar,
  FaFileWord,
  FaFilePdf,
} from "react-icons/fa";
import "../../styles/admin/pages/InvoiceIssued.css";
import Navigation from "../Nav";
import InvoiceEditorA4 from "./InvoiceEditorA4";
import { Link } from "react-router-dom";



import image from "../../../access/pdf.png"
import { Generate } from "../../generatePDF";
import { ProcessInvoices } from "../../processInvoices";

import { ReadInvoice } from "../../../fetchAPI/readInvoices";
import GetBackendURL from "../../GetBackendURL";

const InvoiceIssued = () => {
  const [invoices, setInvoices] = useState([
    {
      id: 1,
      customer: "Test jedna",
      number: "V2025-001",
      date: "2025-07-20",
      total: 8300,
      status: "Vyplaceno",
      file: null,
    },
  ]);

  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    customer: "",
    number: "",
    date: "",
    total: "",
    status: "Nevyplaceno",
    file: null,
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      (file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ) {
      setNewInvoice({ ...newInvoice, file });
    } else {
      alert("Prosím nahrajte PDF nebo Word dokument.");
    }
  };

  const handleNewInvoiceChange = (e) => {
    const { name, value } = e.target;
    setNewInvoice({ ...newInvoice, [name]: value });
  };

  const handleCreateInvoice = () => {
    if (!newInvoice.customer || !newInvoice.number || !newInvoice.date || !newInvoice.total) {
      alert("Vyplňte všechna pole.");
      return;
    }
    const id = invoices.length + 1;
    const invoice = { ...newInvoice, id };
    setInvoices([...invoices, invoice]);
    setNewInvoice({
      customer: "",
      number: "",
      date: "",
      total: "",
      status: "Nevyplaceno",
      file: null,
    });
    setIsModalOpen(false);
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.customer.toLowerCase().includes(query.toLowerCase()) ||
      inv.number.toLowerCase().includes(query.toLowerCase())
  );

  const openLink = () => {
    window.location.href = "/faktury-vydane/nova";
  };

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const reader = new ReadInvoice();
    const data = await reader.fetchedData("VF");

    if (!data) {
      console.error("Data nejsou k dispozici.");
      return;
    }

    setInvoices(
      data.map((item, index) => ({
        id: index + 1,
        customer: item.supplier_name, // pokud chceš zákazníka, změň to na item.customer_name
        number: item.invoice_number,
        date: item.created_at?.split("T")[0],
        total: item.total_to_pay,
        status: item.status || "Nezaplaceno",
        file: item.file_name
          ? { name: item.file_name, url: `/uploads/${item.file_name}` }
          : null,
      }))
    );
  };
  
  const generate = new Generate();
   const processor = new ProcessInvoices();

const openPDF = async (id,date) => {
  try {
    const res = await fetch(`${GetBackendURL()}/invoice/getPDF`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // pokud používáš session cookies
    
    });

    if (!res.ok) {
      throw new Error("Nepodařilo se získat PDF");
    }

    const data = await res.json();
    console.log(date)

    if (!data.url) {
      throw new Error("Server nevrátil URL k PDF");
    }

    // otevření PDF v novém okně
    //window.open(data.url, "_blank");

    // nebo automatické stažení:
    /*
    const link = document.createElement("a");
    link.href = data.url;
    link.download = data.url.split("/").pop();
    document.body.appendChild(link);
    link.click();
    link.remove();
    */
  } catch (err) {
    console.error("Chyba při generování PDF:", err);
  }
};






  return (
    <section className="content">
      <Navigation />
      <div className="invoice-page">
        <div className="invoice-header">
          <h1>
            <FaFileInvoiceDollar /> Vydané faktury
          </h1>
          <button className="add-btn" onClick={openLink}>
            <Link>
              <FaPlus /> Nová faktura
            </Link>
          </button>
        </div>

        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Hledat zákazníka nebo číslo faktury..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="invoice-table advanced-design">
          <table>
            <thead>
              <tr>
                <th>Zákazník</th>
                <th>Číslo faktury</th>
                <th>Datum</th>
                <th>Částka</th>
                <th>Stav</th>
                <th>Soubor</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="7">Žádné faktury nenalezeny.</td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.customer}</td>
                    <td>{invoice.number}</td>
                    <td>{invoice.date}</td>
                    <td>{Number(invoice.total).toLocaleString("cs-CZ")} Kč</td>
                    <td>
                      <span
                        className={`status ${
                          invoice.status === "Vyplaceno" ? "paid" : "unpaid"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td onClick={() => openPDF(invoice.id, invoice)}>
                    <img  style={{ width: "40px", height: "40px" }} src={image} alt="description" />

                      
                    </td>
                    <td className="actions">
                      <button className="edit">
                        <FaEdit />
                      </button>
                      <button className="delete">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <InvoiceEditorA4
            onSave={(data) => {
              const id = invoices.length + 1;
              setInvoices([...invoices, { ...data, id }]);
              setIsModalOpen(false);
            }}
            onCancel={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </section>
  );
};

export default InvoiceIssued;
