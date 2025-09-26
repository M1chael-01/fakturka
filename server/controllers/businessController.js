// 📦 Dependencies
const { business } = require("../config/db");
const Utils = require("../utils/utils");
require("dotenv").config();

const utils = new Utils();

/**
 * ================================
 * 📥 CREATE RECORD FUNCTIONS
 * ================================
 */

// Create a new supplier
function createNewSupplierRecord(req, res) {
  CreateNewRecord(req, res, "supplier");
}

// Create a new customer
function createNewCustomerRecord(req, res) {
  CreateNewRecord(req, res, "customer");
}

// Core function to create a new record (supplier/customer)
async function CreateNewRecord(req, res, operation) {
  const userID = req.session.user?.id;
  const data = req.body.data;

  if (!userID) return res.status(401).send("Uživatel není přihlášen.");
  if (!data) return res.status(400).send("Chybí data z formuláře.");

  try {
    const encryptedData = {
      name: utils.encrypt(data.name),
      email: utils.encrypt(data.email),
      phone: utils.encrypt(data.phone),
      place: utils.encrypt(data.address),
      ico: utils.encrypt(data.ico),
      bank: utils.encrypt(data.bankAccount),
      note: data.note ? utils.encrypt(data.note) : null,
      operation,
      userID
    };

    const query = `
      INSERT INTO one_business (name, email, phone, place, ico, bank, note, operation, "userID")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    await business.query(query, Object.values(encryptedData));

    res.status(200).json({ message: "Záznam byl úspěšně uložen." });
  } catch (err) {
    console.error("❌ Chyba při ukládání záznamu:", err);
    res.status(500).send("Chyba serveru při ukládání.");
  }
}

/**
 * ================================
 * 📄 SELECT RECORD FUNCTIONS
 * ================================
 */

// Select suppliers
function selectSuppliers(req, res) {
  selectRecord(req, res, "supplier");
}

// Select customers
function selectCustomers(req, res) {
  selectRecord(req, res, "customer");
}

// Core function to select supplier/customer records
async function selectRecord(req, res, operation) {
  const userID = req.session.user?.id;
  if (!userID) return res.status(400).send("User not authenticated.");

  try {
    const query = `
      SELECT id, name, email, phone, place, ico, bank, note
      FROM one_business
      WHERE "userID" = $1 AND operation = $2
    `;

    const result = await business.query(query, [userID, operation]);

    const decryptedRows = result.rows.map((row, index) => {
      try {
        return {
          id: row.id,
          name: utils.decrypt(row.name),
          email: utils.decrypt(row.email),
          phone: utils.decrypt(row.phone),
          address: row.place ? utils.decrypt(row.place) : null,
          ico: utils.decrypt(row.ico),
          bankAccount: utils.decrypt(row.bank),
          note: row.note ? utils.decrypt(row.note) : null
        };
      } catch (err) {
        console.error(`❌ Decryption failed for row ${index}:`, row);
        console.error("Error:", err.message);
        return { ...row, decryptionError: true };
      }
    });

    res.status(200).json(decryptedRows);
  } catch (err) {
    console.error("❌ DB Select error:", err);
    res.status(500).send("Chyba při načítání dat z databáze.");
  }
}

/**
 * ================================
 * 🗑️ DELETE RECORD FUNCTION
 * ================================
 */

async function deleteRecord(req, res) {
  const userID = req.session.user?.id;
  const { id } = req.body;

  if (!userID) return res.status(401).send("Uživatel není přihlášen.");
  if (!id) return res.status(400).send("Chybí ID záznamu.");

  try {
    const result = await business.query(
      `DELETE FROM one_business WHERE id = $1 AND "userID" = $2`,
      [id, userID]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Záznam nenalezen nebo nepatří tomuto uživateli.");
    }

    res.status(200).json({ message: "Záznam byl úspěšně odstraněn." });
  } catch (err) {
    console.error("❌ Chyba při mazání záznamu:", err);
    res.status(500).send("Chyba serveru.");
  }
}

/**
 * ================================
 * ✏️ UPDATE RECORD FUNCTION
 * ================================
 */

async function updateRecord(req, res) {
  const userID = req.session.user?.id;
  const { id, name, email, phone, ico, bankAccount, address, note } = req.body;

  if (!userID) return res.status(401).send("Uživatel není přihlášen.");
  if (!id) return res.status(400).send("Chybí ID záznamu k aktualizaci.");

  try {
    const encrypted = {
      name: utils.encrypt(name),
      email: utils.encrypt(email),
      phone: utils.encrypt(phone),
      place: utils.encrypt(address),
      ico: utils.encrypt(ico),
      bank: utils.encrypt(bankAccount),
      note: note ? utils.encrypt(note) : null
    };

    const query = `
      UPDATE one_business
      SET name = $1, email = $2, phone = $3, place = $4, ico = $5, bank = $6, note = $7
      WHERE id = $8 AND "userID" = $9
    `;

    const result = await business.query(query, [
      encrypted.name,
      encrypted.email,
      encrypted.phone,
      encrypted.place,
      encrypted.ico,
      encrypted.bank,
      encrypted.note,
      id,
      userID
    ]);

    if (result.rowCount === 0) {
      return res.status(404).send("Záznam nenalezen nebo nepovolený přístup.");
    }

    res.status(200).json({ message: "Záznam úspěšně aktualizován." });
  } catch (err) {
    console.error("❌ Chyba při aktualizaci záznamu:", err);
    res.status(500).send("Chyba serveru při aktualizaci.");
  }
}

/**
 * ================================
 * 📦 EXPORT MODULE
 * ================================
 */

module.exports = {
  createNewSupplierRecord,
  createNewCustomerRecord,
  selectSuppliers,
  selectCustomers,
  deleteRecord,
  updateRecord
};
