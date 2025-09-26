const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { invoices } = require("../config/db"); // uprav dle svého projektu
const PDFDocument = require("pdfkit");

// --- Multer storage s dynamickou cestou podle userId ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.session.user?.id;
    if (!userId) {
      return cb(new Error("Uživatel není přihlášen."));
    }
    const uploadDir = path.join(__dirname, "..", "uploads", String(userId));
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const now = new Date();
    const dateStr = `${now.getDate()}.${now.getMonth()}-${now.getFullYear()}- ${now.getHours()}-${now.getMinutes()}-${now.getMilliseconds()}`
    const ext = path.extname(file.originalname);
      cb(null, `pdf-${dateStr}.pdf`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Pouze PDF soubory jsou povoleny."));
    }
  },
}).single("file"); // očekává pole 'file' v multipart/form-data

// --- Pomocná funkce pro převod datumu z "dd.mm.yyyy" ---
function parseDate(dateStr) {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split(".");
  return new Date(`${year}-${month}-${day}`);
}

// --- Uložení nové faktury do DB ---
async function createNewInvoice(req, res) {
  const userId = req.session.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Uživatel není přihlášen." });
  }

  const data = req.body;
  if (!data) {
    return res.status(400).json({ error: "Chybějící data faktury." });
  }

  const {
    invoiceDetails,
    supplierInfo,
    customerInfo,
    invoiceItems,
    totals,
  } = data;

  try {
    let values = [];
    let placeholders = [];
    let paramIndex = 1;

    for (const item of invoiceItems) {
      const rowValues = [
        userId,
        invoiceDetails.invoiceNumber,
        parseDate(invoiceDetails.createdDate),
        invoiceDetails.dueDate ? parseDate(invoiceDetails.dueDate) : null,
        invoiceDetails.currency || "CZK",

        supplierInfo.name,
        supplierInfo.address,
        supplierInfo.ico,
        supplierInfo.dic,
        supplierInfo.email,
        supplierInfo.website,
        supplierInfo.iban,
        supplierInfo.swift,
        supplierInfo.bankAccount,

        customerInfo.name,
        customerInfo.address,
        customerInfo.ico,
        customerInfo.dic,

        parseFloat(totals.totalWithoutVat || 0),
        parseFloat(totals.totalVat || 0),
        parseFloat(totals.totalToPay || 0),
        parseFloat(totals.paidAmount || 0),
        parseFloat(totals.balanceDue || 0),

        item.index,
        item.description,
        parseFloat(item.quantity),
        parseFloat(item.unitPrice),
        parseFloat(item.vatRate),
        parseFloat(item.total),
        parseFloat(item.vatAmount),

        item.type || "issued"
      ];

      values.push(...rowValues);
      const placeholderRow = `(${rowValues.map(() => `$${paramIndex++}`).join(", ")})`;
      placeholders.push(placeholderRow);
    }

    const insertQuery = `
      INSERT INTO one_invoice (
        user_id,
        invoice_number,
        created_date,
        due_date,
        currency,
        supplier_name,
        supplier_address,
        supplier_ico,
        supplier_dic,
        supplier_email,
        supplier_website,
        supplier_iban,
        supplier_swift,
        supplier_bank_account,
        customer_name,
        customer_address,
        customer_ico,
        customer_dic,
        total_without_vat,
        total_vat,
        total_to_pay,
        paid_amount,
        balance_due,
        item_index,
        item_description,
        quantity,
        unit_price,
        vat_rate,
        item_total,
        item_vat_amount,
        invoice_type
      )
      VALUES ${placeholders.join(", ")}
      RETURNING invoice_number;
    `;

    const result = await invoices.query(insertQuery, values);

    res.status(201).json({
      success: true,
      invoiceNumber: result.rows[0].invoice_number,
    });
  } catch (err) {
    console.error("❌ Chyba při vytváření faktury:", err.message);
    res.status(500).json({ error: "Chyba serveru při ukládání faktury." });
  }
}

// --- Načtení faktur uživatele podle typu ---
async function readData(req, res) {
  const userId = req.session.user?.id;
  const { type } = req.query;

  if (!userId) {
    return res.status(401).json({ error: "Uživatel není přihlášen." });
  }

  try {
    const result = await invoices.query(
      `SELECT invoice_number, supplier_name, created_date, total_to_pay, created_at
       FROM one_invoice 
       WHERE user_id = $1 AND invoice_type = $2
       ORDER BY created_date DESC`,
      [userId, type]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Chyba při čtení faktur:", err.message);
    res.status(500).json({ error: "Chyba serveru při načítání dat." });
  }
}

// --- Generování souboru (PDF apod.) ---
async function generateFile(req, res) {
  const { id } = req.body;
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Uživatel není přihlášen." });
  }
  if (!id) {
    return res.status(400).json({ error: "Chybí ID faktury." });
  }

  try {
    const result = await invoices.query(
      `SELECT * FROM one_invoice WHERE user_id = $1 AND id = $2`,
      [userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Faktura nebyla nalezena." });
    }

    const invoice = result.rows[0];

    // TODO: Přidej generování PDF zde

    res.status(200).json({ success: true, invoice });
  } catch (err) {
    console.error("❌ Chyba při generování souboru:", err.message);
    res.status(500).json({ error: "Chyba serveru." });
  }
}

// --- Upload PDF souboru ---
async function uploadPdf(req, res) {
  const userId = req.session.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Uživatel není přihlášen." });
  }
    

  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "PDF soubor nebyl nahrán." });
    }

    console.log(`PDF soubor uložen: ${req.file.path}`);

    // Můžeš uložit info o souboru do DB tady

    return res.status(200).json({
      success: true,
      message: "PDF soubor byl úspěšně nahrán.",
      filename: req.file.filename,
      path: req.file.path,
    });
  });
}

async function getPDF(req, res) {
  const userId = req.session.user?.id;

  try {
    // 1️⃣ Načteme první fakturu daného uživatele
   const invoiceId = 23;

const { rows } = await invoices.query(
  `SELECT * FROM one_invoice 
   WHERE user_id = $1 
   AND id = $2`,
  [userId, invoiceId]
);


    if (!rows.length) {
      return res.status(404).json({ error: "Žádná faktura nenalezena" });
    }

    const faktura = rows[0];

   console.log(formatDateTime(faktura.created_at));

    // 2️⃣ Cesta k souboru
    const fileName = `pdf-8-8-2025-1754647924955.pdf`;
    const filePath = path.join(__dirname, `../uploads/${userId}/${fileName}`);

    // 3️⃣ Pokud už existuje, pošleme URL
    if (fs.existsSync(filePath)) {
      return res.json({ url: `/uploads/${userId}/${fileName}` });
    }

    // 4️⃣ Vygenerujeme PDF
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(filePath));

    // Hlavička faktury
    doc.fontSize(18).text(`Faktura č. ${faktura.invoice_id || "-"}`, { align: "center" });
    doc.moveDown();

    // Dodavatel / Odběratel
    doc.fontSize(12).text(`Dodavatel: ${faktura.supplier_name || ""}`);
    doc.text(`Odběratel: ${faktura.customer_name || ""}`);
    doc.moveDown();

    // Datum a částky
    doc.text(`Datum vystavení: ${faktura.created_date || ""}`);
    doc.text(`Částka celkem: ${faktura.total_amount || 0} Kč`);
    doc.text(`Zůstatek: ${faktura.remaining_amount || 0} Kč`);

    doc.end();

    // 5️⃣ Pošleme URL
    res.json({ url: `/uploads/${userId}/${fileName}` });

  } catch (err) {
    console.error("Chyba při generování PDF:", err);
    res.status(500).json({ error: "Chyba při generování PDF" });
  }
}

function formatDateTime(date) {
  const d = new Date(date);
  const pad = (n) => n.toString().padStart(2, '0');

  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();

  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}

module.exports = {
  createNewInvoice,
  readData,
  generateFile,
  uploadPdf,
  getPDF
};
