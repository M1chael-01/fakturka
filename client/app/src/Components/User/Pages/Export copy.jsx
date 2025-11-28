import React, { useState, useMemo, useEffect } from "react";
import "../../../styles/admin/pages/Export.css";
import Navigation from "../Nav";

const formatValue = (val) => {
  if (typeof val === "number")
    return val.toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " Kč";
  if (val instanceof Date) return val.toISOString().split("T")[0];
  return val?.toString() ?? "";
};

const exportToCSV = (data, headers, fileName = "export.csv", delimiter = ";") => {
  if (!data.length || !headers.length) return;

  const csvRows = [
    headers.map((h) => `"${h}"`).join(delimiter),
    ...data.map((row) =>
      headers.map((header) => `"${formatValue(row[header])}"`).join(delimiter)
    ),
  ];

  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
  const encodedUri = encodeURI(csvContent);

  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToJSON = (data, fileName = "export.json") => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const Export = ({ income = [], expenses = [], invoiceReceived = [], invoiceIssued = [] }) => {
  const [selectedDataSets, setSelectedDataSets] = useState({
    příjmy: true,
    výdaje: true,
    "faktury přijaté": true,
    "faktury vydané": true,
  });

  const [exportFormat, setExportFormat] = useState("csv");
  const [message, setMessage] = useState("");
  const [messageVisible, setMessageVisible] = useState(false);

  const dataSets = { příjmy: income, výdaje: expenses, "faktury přijaté": invoiceReceived, "faktury vydané": invoiceIssued };

  const summary = useMemo(() => {
    const summ = {};
    for (const [key, data] of Object.entries(dataSets)) {
      summ[key] = {
        count: data.length,
        sum: data.reduce((acc, item) => acc + (item.amount ?? 0), 0),
      };
    }
    return summ;
  }, [income, expenses, invoiceReceived, invoiceIssued]);

  const combinedHeaders = useMemo(() => {
    const keys = new Set();
    Object.entries(dataSets).forEach(([key, data]) => {
      if (selectedDataSets[key]) {
        data.forEach((item) => Object.keys(item).forEach((k) => keys.add(k)));
      }
    });
    return Array.from(keys);
  }, [selectedDataSets, dataSets]);

  const combinedData = useMemo(() => {
    let result = [];
    if (selectedDataSets["příjmy"]) {
      result = [...result, ...income.map((item) => ({ ...item, _typ: "Příjem" }))];
    }
    if (selectedDataSets["výdaje"]) {
      result = [...result, ...expenses.map((item) => ({ ...item, _typ: "Výdaj" }))];
    }
    if (selectedDataSets["faktury přijaté"]) {
      result = [...result, ...invoiceReceived.map((item) => ({ ...item, _typ: "Faktura přijatá" }))];
    }
    if (selectedDataSets["faktury vydané"]) {
      result = [...result, ...invoiceIssued.map((item) => ({ ...item, _typ: "Faktura vydaná" }))];
    }
    return result;
  }, [selectedDataSets, income, expenses, invoiceReceived, invoiceIssued]);

  const canExport = combinedData.length > 0;

  const handleExportClick = () => {
    if (!canExport) {
      showMessage("Není vybrána žádná data k exportu.", true);
      return;
    }

    if (exportFormat === "csv") {
      exportToCSV(combinedData, combinedHeaders, `export_ucetnictvi.${exportFormat}`);
      showMessage("Export do CSV proběhl úspěšně!");
    } else if (exportFormat === "json") {
      exportToJSON(combinedData, `export_ucetnictvi.${exportFormat}`);
      showMessage("Export do JSON proběhl úspěšně!");
    } else {
      showMessage("Nepodporovaný formát exportu.", true);
    }
  };

  const showMessage = (msg, isError = false) => {
    setMessage((isError ? "❌ " : "✅ ") + msg);
    setMessageVisible(true);
  };

  useEffect(() => {
    if (messageVisible) {
      const timer = setTimeout(() => setMessageVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [messageVisible]);

  const toggleDataSet = (key) => {
    setSelectedDataSets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <section className="content">
        <Navigation />
        <div className="exportContainer">
          <h1 className="exportTitle">Export účetních dat</h1>

          <fieldset className="exportFieldset" aria-label="Výběr dat pro export">
            <legend className="exportLegend">Vyberte data k exportu</legend>
            <div className="checkboxGroup">
              {Object.keys(dataSets).map((key) => (
                <label key={key} className="checkboxLabel" tabIndex={0}>
                  <input
                    type="checkbox"
                    checked={selectedDataSets[key]}
                    onChange={() => toggleDataSet(key)}
                    className="checkboxInput"
                    aria-checked={selectedDataSets[key]}
                    aria-label={`Vybrat ${key}`}
                  />
                  <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="exportFormatContainer">
            <label htmlFor="format" className="exportFormatLabel">
              Formát exportu:
            </label>
            <select
              id="format"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="exportFormatSelect"
              aria-label="Vyberte formát exportu"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <button
            className="exportButton"
            aria-label="Exportovat vybraná účetní data"
            onClick={handleExportClick}
            disabled={!canExport}
          >
            Exportovat data
          </button>

          <div
            role="alert"
            aria-live="polite"
            className={`message ${messageVisible ? "visible" : ""} ${message.startsWith("❌") ? "error" : "success"}`}
          >
            {messageVisible && message}
          </div>

          <div className="dataPreview">
            <h3 className="dataPreviewTitle">Náhled exportovaných dat (max. 10 řádků)</h3>
            {combinedData.length === 0 ? (
              <p className="noDataText">Nevybrali jste žádná data k exportu.</p>
            ) : (
              <table className="dataPreviewTable" role="grid" aria-label="Náhled dat k exportu">
                <thead>
                  <tr>
                    {combinedHeaders.map((header) => (
                      <th key={header} scope="col">
                        {header.charAt(0).toUpperCase() + header.slice(1)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {combinedData.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "evenRow" : "oddRow"}>
                      {combinedHeaders.map((header) => (
                        <td key={header} title={formatValue(row[header])}>
                          {formatValue(row[header])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Export;
