const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const { Document, Packer, Paragraph, TextRun } = require("docx");
const { cashflow, business } = require("../config/db");

const Utils = require("../utils/utils");
const utils = new Utils();

// Choose the right DB based on the input
function selectDB(name) {
  switch (name) {
    case "one_business": return business;
    case "one_cashflow": return cashflow;
    default: return null;
  }
}

async function exportFile(req, res) {
  try {
    const { dataSets, format, userID } = req.body;

    if (!Array.isArray(dataSets) || !userID) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const allRows = [];

    for (const pair of dataSets) {
      const [tb, subject] = pair.split(",");
      const db = selectDB(tb);
      if (!db) continue;

      let sql = `SELECT * FROM ${tb} WHERE "userID" = $1`;
      const vals = [userID];

      if (subject && subject !== "default") {
        sql += ` AND operation = $2`;
        vals.push(subject);
      }

      const result = await db.query(sql, vals);

      // Decrypt necessary fields
      const decryptedRows = result.rows.map(row => {
        const newRow = { ...row };
        Object.entries(row).forEach(([key, val]) => {
          if (
            typeof val === "string" &&
            !key.startsWith("__") &&
            key !== "userID" &&
            key !== "id" &&
            key !== "date"
          ) {
            try {
              newRow[key] = utils.decrypt(val);
            } catch (e) {
              console.warn(`Decrypt error on key ${key}:`, e);
              newRow[key] = val;
            }
          }
        });

        // Format date if it exists
        if (newRow.date) {
          try {
            newRow.date = new Date(newRow.date).toLocaleDateString("cs-CZ", {
              year: "numeric",
              month: "long",
              day: "numeric"
            });
          } catch (e) {
            // Ignore formatting errors
          }
        }

        newRow.__dataset = `${tb}_${subject}`;
        return newRow;
      });

      allRows.push(...decryptedRows);
    }

    if (allRows.length === 0) {
      return res.status(404).json({ error: "No data to export." });
    }

    function formatHeader(key) {
      return key
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, c => c.toUpperCase());
    }

    // ======= CSV EXPORT =======
    if (format === "csv") {
      const grouped = {};
      allRows.forEach(row => {
        const { __dataset, ...data } = row;
        if (!grouped[__dataset]) grouped[__dataset] = [];
        grouped[__dataset].push(data);
      });

      let finalCSV = "\uFEFF"; // UTF-8 BOM to ensure encoding
      for (const [dataset, rows] of Object.entries(grouped)) {
        if (rows.length === 0) continue;

        const cleanRows = rows.map(row => {
          const cleaned = {};
          for (const [key, value] of Object.entries(row)) {
            cleaned[formatHeader(key)] = value;
          }
          return cleaned;
        });

        const csvPart = new Parser().parse(cleanRows);
        finalCSV += `\n--- Datová sada: ${dataset} ---\n`;
        finalCSV += csvPart + "\n";
      }

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="export.csv"');
      return res.send(finalCSV);
    }

    // ======= EXCEL EXPORT =======
    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Firemní export");

      const headers = Object.keys(allRows[0]).filter(k => k !== "__dataset");
      sheet.columns = headers.map(h => ({
        header: formatHeader(h),
        key: h,
        width: 25,
        style: { font: { name: "Calibri", size: 11 } }
      }));

      // Header styling
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, size: 12, name: "Calibri" };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };
      headerRow.eachCell(cell => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4F81BD" }
        };
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        };
      });

      // Fill rows
      allRows.forEach(row => {
        const { __dataset, ...cleanedRow } = row;
        sheet.addRow(cleanedRow);
      });

      sheet.eachRow({ includeEmpty: false }, row => {
        if (row.number !== 1) {
          row.alignment = { vertical: "middle", horizontal: "left" };
          row.eachCell(cell => {
            cell.border = {
              top: { style: "thin", color: { argb: "FFDDDDDD" } },
              left: { style: "thin", color: { argb: "FFDDDDDD" } },
              bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
              right: { style: "thin", color: { argb: "FFDDDDDD" } }
            };
          });
        }
      });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", 'attachment; filename="export.xlsx"');
      await workbook.xlsx.write(res);
      return res.end();
    }

    // ======= PDF EXPORT =======
    if (format === "pdf") {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="export.pdf"');
      doc.pipe(res);

      // Title and date
      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .fillColor("#003366")
        .text("Faktura / Export dat", { align: "center" });
      doc.moveDown(0.5);
      doc
        .fontSize(12)
        .font("Helvetica-Oblique")
        .fillColor("black")
        .text(`Datum exportu: ${new Date().toLocaleDateString("cs-CZ")}`, { align: "center" });
      doc.moveDown(2);

      // Record entries
      allRows.forEach((row, i) => {
        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .fillColor("#003366")
          .text(`Záznam č. ${i + 1}`, { underline: true });

        doc.moveDown(0.5);

        Object.entries(row)
          .filter(([k]) => k !== "__dataset")
          .forEach(([key, val]) => {
            const formattedKey = formatHeader(key);
            doc
              .font("Helvetica-Bold")
              .fillColor("black")
              .text(`${formattedKey}: `, { continued: true })
              .font("Helvetica")
              .text(String(val));
          });

        doc.moveDown(1.5);
        doc.moveTo(doc.x, doc.y).lineTo(550, doc.y).stroke("#ccc");
        doc.moveDown(1);
      });

      doc.end();
      return;
    }

    // ======= DOCX EXPORT =======
    if (format === "docx") {
      const formattedRows = allRows.map((row, index) => {
        const paragraphs = [];

        paragraphs.push(new Paragraph({
          text: `Záznam č. ${index + 1}`,
          heading: "Heading1",
          spacing: { after: 300 }
        }));

        Object.entries(row)
          .filter(([key]) => key !== "__dataset")
          .forEach(([key, val]) => {
            const formattedKey = formatHeader(key);

            paragraphs.push(new Paragraph({
              children: [
                new TextRun({ text: `${formattedKey}: `, bold: true }),
                new TextRun(String(val))
              ],
              spacing: { after: 100 }
            }));
          });

        paragraphs.push(new Paragraph({ text: "", spacing: { after: 500 } }));
        return paragraphs;
      }).flat();

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Faktura / Export dat", bold: true, size: 32 })],
              alignment: "center",
              spacing: { after: 300 }
            }),
            new Paragraph({
              children: [new TextRun({ text: `Datum exportu: ${new Date().toLocaleDateString("cs-CZ")}`, italic: true })],
              alignment: "center",
              spacing: { after: 400 }
            }),
            ...formattedRows
          ]
        }]
      });

      const buffer = await Packer.toBuffer(doc);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", 'attachment; filename="export.docx"');
      return res.send(buffer);
    }

    return res.status(400).json({ error: "Unsupported format" });

  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { exportFile };
