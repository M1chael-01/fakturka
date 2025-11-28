import React, { useState, useRef } from "react";
import Navigation from "../Nav";
import { QRCodeSVG } from "qrcode.react";
import "../../styles/admin/pages/InvoiceEditorA4.css";

import { ProcessInvoices } from "../../processInvoices";

const defaultItem = () => ({
  description: "Položka",
  quantity: 1,
  unitPrice: 1000,
  vatRate: 21,
});

const IssuedInvoiceEditorA4 = ({ onSave, onCancel }) => {
  const [data, setData] = useState({
    invoiceNumber: "2025-0001",
    issueDate: new Date().toISOString().slice(0, 10),
    taxableDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    paymentMethod: "Převodem",
    variableSymbol: "20250001",
    currency: "CZK",
    notes: "",
    paidAmount: 0,
    supplier: {
      name: "Moje firma, s.r.o.",
      address: "Náměstí Jiřího z Poděbrad 123, 600 00 Praha 6",
      ico: "11111111",
      dic: "CZ11111111",
      isVatPayer: true,
      bank: "0600",
      account: "0000001111",
      iban: "CZ65060000000000001111",
      swift: "AGBACZPP",
      website: "www.moje-firma.cz",
      email: "info@moje-firma.cz",
    },
    customer: {
      name: "Firma A, s.r.o.",
      address: "Febronova 12/18, 703 00 Ostrava",
      ico: "33344411",
      dic: "",
    },
    items: [defaultItem()],
  });

  const [page, setPage] = useState(0);
  const invoiceRef = useRef(null);

  const updateItem = (index, field, value) => {
    const items = [...data.items];
    if (field === "description") {
      items[index][field] = value;
    } else {
      items[index][field] = value === "" ? 0 : Number(value);
    }
    setData({ ...data, items });
  };

  const addItem = () => setData({ ...data, items: [...data.items, defaultItem()] });

  const removeItem = (i) => {
    if (data.items.length === 1) return; // Nelze smazat poslední položku
    setData({ ...data, items: data.items.filter((_, idx) => idx !== i) });
  };

  const calcRowTotal = (item) => item.quantity * item.unitPrice;
  const calcVatAmount = (item) => calcRowTotal(item) * (item.vatRate / 100);

  const totalBase = data.items.reduce((sum, i) => sum + calcRowTotal(i), 0);
  const totalVat = data.items.reduce((sum, i) => sum + calcVatAmount(i), 0);
  const total = totalBase + totalVat;

  const balance = total - data.paidAmount;

  const qrString = `SPD*1.0*ACC:${data.supplier.account}/${data.supplier.bank}*AM:${total.toFixed(
    2
  )}*CC:${data.currency}*X-VS:${data.variableSymbol}`;

  const processInvoices = new ProcessInvoices();

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;

    processInvoices.saveInvoices(data, "VF");
    await processInvoices.downloadInvoices(data, invoiceRef, (pageIndex) => {
      setPage(pageIndex);
    });
  };

  return (
    <section className="content">
      <Navigation />
      <div className="invoice-editor-cz" ref={invoiceRef}>
        <h1>{data.supplier.isVatPayer ? "Vydaná faktura – daňový doklad" : "Vydaná faktura"}</h1>
        <p>
          <strong>Číslo faktury:</strong> {data.invoiceNumber}
        </p>

        {/* Dodavatel a odběratel */}
        <div className="parties" style={{ display: "flex", gap: "2rem" }}>
          {/* Dodavatel */}
          <div>
            <h3>Dodavatel</h3>
            <p>
              <strong>{data.supplier.name}</strong>
            </p>
            <p>{data.supplier.address}</p>
            <p>IČO: {data.supplier.ico}</p>
            <p>DIČ: {data.supplier.dic}</p>
            <p>Email: {data.supplier.email}</p>
            <p>Web: {data.supplier.website}</p>
            <p>IBAN: {data.supplier.iban}</p>
            <p>SWIFT/BIC: {data.supplier.swift}</p>
            {!data.supplier.isVatPayer && <p><em>Faktura není plátcem DPH</em></p>}
          </div>

          {/* Odběratel */}
          <div>
            <h3>Odběratel</h3>
            <p>
              <strong>{data.customer.name}</strong>
            </p>
            <p>{data.customer.address}</p>
            <p>IČO: {data.customer.ico}</p>
            {data.customer.dic && <p>DIČ: {data.customer.dic}</p>}
          </div>
        </div>

        {/* Datum a další údaje */}
        <div className="dates">
          <p>
            <label>
              <strong>Datum vystavení:</strong>{" "}
              <input
                type="date"
                value={data.issueDate}
                onChange={(e) => setData({ ...data, issueDate: e.target.value })}
              />
            </label>
          </p>
          <p>
            <label>
              <strong>Datum uskutečnění zdanitelného plnění (DUZP):</strong>{" "}
              <input
                type="date"
                value={data.taxableDate}
                onChange={(e) => setData({ ...data, taxableDate: e.target.value })}
              />
            </label>
          </p>
          <p>
            <label>
              <strong>Datum splatnosti:</strong>{" "}
              <input
                type="date"
                value={data.dueDate}
                onChange={(e) => setData({ ...data, dueDate: e.target.value })}
              />
            </label>
          </p>
          <p>
            <label>
              <strong>Forma úhrady:</strong>{" "}
              <select
                value={data.paymentMethod}
                onChange={(e) => setData({ ...data, paymentMethod: e.target.value })}
              >
                <option value="Převodem">Převodem</option>
                <option value="Hotově">Hotově</option>
                <option value="Karta">Karta</option>
              </select>
            </label>
          </p>
          <p>
            <label>
              <strong>Variabilní symbol:</strong>{" "}
              <input
                type="text"
                value={data.variableSymbol}
                onChange={(e) => setData({ ...data, variableSymbol: e.target.value })}
              />
            </label>
          </p>
          <p>
            <label>
              <strong>Měna:</strong>{" "}
              <input
                type="text"
                value={data.currency}
                onChange={(e) => setData({ ...data, currency: e.target.value })}
              />
            </label>
          </p>
          <p>
            <label>
              <strong>Zaplaceno:</strong>{" "}
              <input
                type="number"
                min="0"
                value={data.paidAmount}
                onChange={(e) =>
                  setData({ ...data, paidAmount: e.target.value === "" ? 0 : Number(e.target.value) })
                }
              />{" "}
              {data.currency}
            </label>
          </p>
        </div>

        {/* Tabulka položek */}
        <table className="items">
          <thead>
            <tr>
              <th>Popis</th>
              <th>Množství</th>
              <th>Jednotková cena bez DPH</th>
              <th>Sazba DPH %</th>
              <th>Bez DPH</th>
              <th>DPH</th>
              <th>Celkem s DPH</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i}>
                <td>
                  <input
                    value={item.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(i, "unitPrice", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={item.vatRate}
                    onChange={(e) => updateItem(i, "vatRate", e.target.value)}
                  />
                </td>
                <td>{calcRowTotal(item).toFixed(2)} {data.currency}</td>
                <td>{calcVatAmount(item).toFixed(2)} {data.currency}</td>
                <td>{(calcRowTotal(item) + calcVatAmount(item)).toFixed(2)} {data.currency}</td>
                <td>
                  <button
                    disabled={data.items.length === 1}
                    onClick={() => removeItem(i)}
                    title={data.items.length === 1 ? "Nelze odstranit poslední položku" : "Odstranit položku"}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={addItem}>+ Přidat položku</button>

        {/* QR, součty, podpis */}
        <div
          className="qr-signature-row"
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "20px",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div className="qr-box">
            <p><strong>QR platba:</strong></p>
            <QRCodeSVG value={qrString} size={140} />
          </div>

          <div className="payment-info" style={{ minWidth: "250px", fontSize: "0.9rem" }}>
            <p>
              Úhrada: {data.paidAmount.toFixed(2)} {data.currency}
            </p>
            <p>
              Zbývá zaplatit: {balance.toFixed(2)} {data.currency}
            </p>
            <p>Variabilní symbol: {data.variableSymbol}</p>
            <p>Forma úhrady: {data.paymentMethod}</p>
            <hr />
            <p>
              <strong>Celkem bez DPH:</strong> {totalBase.toFixed(2)} {data.currency}
            </p>
            <p>
              <strong>DPH:</strong> {totalVat.toFixed(2)} {data.currency}
            </p>
            <p>
              <strong>Celkem k úhradě:</strong> {total.toFixed(2)} {data.currency}
            </p>
          </div>

          <div className="stamp">
            <p>
              <strong>Razítko a podpis</strong>
            </p>
            <div style={{ border: "1px solid #000", width: "200px", height: "100px" }}></div>
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <button onClick={handleDownloadPdf}>Stáhnout PDF</button>{" "}
          <button onClick={() => onSave && onSave(data)}>Uložit</button>{" "}
          <button onClick={() => onCancel && onCancel()}>Zrušit</button>
        </div>
      </div>
    </section>
  );
};

export default IssuedInvoiceEditorA4;
