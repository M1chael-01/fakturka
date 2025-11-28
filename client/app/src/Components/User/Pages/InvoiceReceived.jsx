import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFileInvoice,
  FaFileUpload,
  FaFileWord,
  FaFilePdf,
} from "react-icons/fa";
import "../../styles/admin/pages/InvoiceReceived.css";
import Navigation from "../Nav";
import GetBackendURL from "../../GetBackendURL";
import { ReadInvoice } from "../../../fetchAPI/readInvoices";

import image from "../../../access/pdf.png"

const InvoiceReceived = () => {
  const [invoices, setInvoices] = useState([]);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    supplier: "",
    number: "",
    date: "",
    total: "",
    status: "Nezaplaceno",
    file: null,
  });

  // ✅ Načíst faktury po načtení komponenty
  useEffect(() => {
    getData();
  }, []);


  




const getData = async () => {
  const reader = new ReadInvoice();
const data = await reader.fetchedData("PF"); // nebo jiný typ

    setInvoices(
      data.map((item, index) => ({
        id: index + 1,
        supplier: item.supplier_name,
        number: item.invoice_number,
        date: item.created_at?.split("T")[0],
        total: item.total_to_pay,
        status: item.status || "Nezaplaceno",
        file: item.file_name ? { name: item.file_name } : null,
      }))
    );
  
};


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
    if (
      !newInvoice.supplier ||
      !newInvoice.number ||
      !newInvoice.date ||
      !newInvoice.total
    ) {
      alert("Vyplňte všechna pole.");
      return;
    }

    const id = invoices.length + 1;
    const invoice = { ...newInvoice, id };
    setInvoices([...invoices, invoice]);
    setNewInvoice({
      supplier: "",
      number: "",
      date: "",
      total: "",
      status: "Nezaplaceno",
      file: null,
    });
    setIsModalOpen(false);
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.supplier.toLowerCase().includes(query.toLowerCase()) ||
      inv.number.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="content">
      <Navigation />
      <div className="invoice-page">
        <div className="invoice-header">
          <h1>
            <FaFileInvoice /> Přijaté faktury
          </h1>
          <button
            className="add-btn"
            onClick={() => (window.location.href = "/faktury-prijate/nova")}
          >
            <FaPlus /> Nová faktura
          </button>
        </div>

        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Hledat dodavatele nebo číslo faktury..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="invoice-table advanced-design">
          <table>
            <thead>
              <tr>
                <th>Dodavatel</th>
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
                    <td>{invoice.supplier}</td>
                    <td>{invoice.number}</td>
                    <td>{invoice.date}</td>
                    <td>{Number(invoice.total).toLocaleString("cs-CZ")} Kč</td>
                    <td>
                      <span
                        className={`status ${
                          invoice.status === "Zaplaceno" ? "paid" : "unpaid"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td>
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
          <div className="modal-overlay">
            <div className="modal">
              <h2>Nová přijatá faktura</h2>
              <div className="form-group">
                <label>Dodavatel</label>
                <input
                  name="supplier"
                  value={newInvoice.supplier}
                  onChange={handleNewInvoiceChange}
                />
              </div>
              <div className="form-group">
                <label>Číslo faktury</label>
                <input
                  name="number"
                  value={newInvoice.number}
                  onChange={handleNewInvoiceChange}
                />
              </div>
              <div className="form-group">
                <label>Datum</label>
                <input
                  type="date"
                  name="date"
                  value={newInvoice.date}
                  onChange={handleNewInvoiceChange}
                />
              </div>
              <div className="form-group">
                <label>Částka (Kč)</label>
                <input
                  type="number"
                  name="total"
                  value={newInvoice.total}
                  onChange={handleNewInvoiceChange}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={newInvoice.status}
                  onChange={handleNewInvoiceChange}
                >
                  <option value="Zaplaceno">Zaplaceno</option>
                  <option value="Nezaplaceno">Nezaplaceno</option>
                </select>
              </div>
              <div className="form-group file-upload">
                <label htmlFor="file">
                  <FaFileUpload /> Nahrát soubor (PDF nebo Word)
                </label>
                <input
                  type="file"
                  id="file"
                  accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                />
                {newInvoice.file && (
                  <small>Nahráno: {newInvoice.file.name}</small>
                )}
              </div>
              <div className="modal-actions">
                <button className="btn save" onClick={handleCreateInvoice}>
                  Uložit
                </button>
                <button
                  className="btn reset"
                  onClick={() => setIsModalOpen(false)}
                >
                  Zrušit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default InvoiceReceived;
