import React, { useState } from "react";
import "../../../styles/admin/pages/Export.css";
import Navigation from "../Nav";
import GetBackendURL from "../../GetBackendURL";
import { FaFilePdf, FaFileExcel, FaFileCsv, FaFileWord } from "react-icons/fa";

export default function Export() {
  const [exportFormat, setExportFormat] = useState("csv");
  const [selectedDataSets, setSelectedDataSets] = useState({
    "one_business,customer": false,
    "one_business,supplier": false,
    "one_cashflow,income": false,
    "one_cashflow,expense": false,
  });

  const getUserId = async () => {
    try {
      const res = await fetch(`${GetBackendURL()}/auth/getUserID`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Nepodařilo se získat userID");
      const result = await res.json();
      return result.userID;
    } catch (err) {
      console.error("Chyba při získávání userID:", err);
      return null;
    }
  };

  const handleExportClick = async () => {
    const selected = Object.keys(selectedDataSets).filter((key) => selectedDataSets[key]);
    if (selected.length === 0) {
      alert("Vyberte alespoň jednu datovou sadu.");
      return;
    }

    try {
      const userID = await getUserId();
      if (!userID) return;

      const res = await fetch(`${GetBackendURL()}/export/file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataSets: selected, format: exportFormat, userID }),
      });

      if (!res.ok) throw new Error("Chyba při exportu dat ze serveru.");

      const blob = await res.blob();
      const filename = `export.${getExtension(exportFormat)}`;
      downloadBlob(blob, res.headers.get("Content-Type"), filename);

      alert("Export dokončen.");
    } catch (err) {
      console.error("Chyba při exportu:", err);
      alert("Nepodařilo se exportovat data.");
    }
  };

  const toggleDataSet = (key) => {
    setSelectedDataSets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatIcons = {
    pdf: <FaFilePdf color="#d32f2f" size={20} />,
    excel: <FaFileExcel color="#2e7d32" size={20} />,
    csv: <FaFileCsv color="#0277bd" size={20} />,
    docx: <FaFileWord color="#1a73e8" size={20} />,
  };

  const getExtension = (format) => {
    switch (format) {
      case "csv": return "csv";
      case "excel": return "xlsx";
      case "pdf": return "pdf";
      case "docx": return "docx";
      default: return "txt";
    }
  };

  const downloadBlob = (blob, mime, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <section className="content">
      <Navigation />
      <div className="export-container">
        <h1>Export dat</h1>

        {/* Výběr formátu */}
        <section>
          <h2>Typ souboru</h2>
          <div className="radio-group">
            {["csv", "excel", "docx", "pdf"].map((format) => (
              <label key={format}>
                <input
                  type="radio"
                  name="filetype"
                  value={format}
                  checked={exportFormat === format}
                  onChange={() => setExportFormat(format)}
                />
                <span className="icon-label">
                  {formatIcons[format]} {format.toUpperCase()}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Výběr dat */}
        <section>
          <h2>Vyberte data</h2>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={selectedDataSets["one_business,customer"]}
                onChange={() => toggleDataSet("one_business,customer")}
              />
              Seznam odběratelů
            </label>
            <label>
              <input
                type="checkbox"
                checked={selectedDataSets["one_business,supplier"]}
                onChange={() => toggleDataSet("one_business,supplier")}
              />
              Seznam dodavatelů
            </label>
            <label>
              <input
                type="checkbox"
                checked={selectedDataSets["one_cashflow,income"]}
                onChange={() => toggleDataSet("one_cashflow,income")}
              />
              Vaše příjmy
            </label>
            <label>
              <input
                type="checkbox"
                checked={selectedDataSets["one_cashflow,expense"]}
                onChange={() => toggleDataSet("one_cashflow,expense")}
              />
              Vaše výdaje
            </label>
          </div>
        </section>

        <button className="export-button" onClick={handleExportClick}>
          Exportovat
        </button>
      </div>
    </section>
  );
}
