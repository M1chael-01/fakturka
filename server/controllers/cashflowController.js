// 📦 Dependencies
const { cashflow } = require("../config/db");
const Utils = require("../utils/utils");
require("dotenv").config();

const utils = new Utils();

/**
 * ================================
 * 💰 CREATE FUNCTIONS
 * ================================
 */

// 📥 Create an income entry
async function createIncomeEntry(req, res) {
  const userId = req.session.user?.id;
  const { date, description, payment, amount, categorie, note } = req.body;

  // Validation
  if (!userId) return res.status(401).send("Unauthorized");
  if (!date || !description || !payment || !amount || !categorie) {
    return res.status(400).json({ message: "Chybí povinná pole." });
  }

  try {
    // Encrypt sensitive fields
    const encryptedDescription = utils.encrypt(description);
    const encryptedNote = note ? utils.encrypt(note) : null;
    const encryptedPayment = utils.encrypt(payment);
    const encryptedCategory = utils.encrypt(categorie);

    const values = [
      userId,
      date,
      encryptedDescription,
      encryptedPayment,
      parseFloat(amount),
      encryptedCategory,
      encryptedNote
    ];

    const query = `
      INSERT INTO public.one_cashflow
        ("userID", operation, date, description, payment, amount, categorie, note)
      VALUES ($1, 'income', $2, $3, $4, $5, $6, $7)
      RETURNING id, "userID", operation, date, description, payment, amount, categorie, note;
    `;

    const result = await cashflow.query(query, values);

    res.status(201).json({
      message: "Příjem byl úspěšně uložen.",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("❌ Chyba při ukládání příjmu:", err.message);
    res.status(500).send("Server error");
  }
}

// 📤 Create an expense entry
async function createExpenseEntry(req, res) {
  const userId = req.session.user?.id;
  const { date, description, payment, amount, categorie, note } = req.body;

  if (!userId) return res.status(401).send("Unauthorized");
  if (!date || !description || !payment || !amount || !categorie) {
    return res.status(400).json({ message: "Chybí povinná pole." });
  }

  try {
    const encryptedDescription = utils.encrypt(description);
    const encryptedNote = note ? utils.encrypt(note) : null;
    const encryptedPayment = utils.encrypt(payment);
    const encryptedCategory = utils.encrypt(categorie);

    const values = [
      userId,
      date,
      encryptedDescription,
      encryptedPayment,
      parseFloat(amount),
      encryptedCategory,
      encryptedNote
    ];

    const query = `
      INSERT INTO public.one_cashflow
        ("userID", operation, date, description, payment, amount, categorie, note)
      VALUES ($1, 'expense', $2, $3, $4, $5, $6, $7)
      RETURNING id, "userID", operation, date, description, payment, amount, categorie, note;
    `;

    const result = await cashflow.query(query, values);

    res.status(201).json({
      message: "Výdaj byl úspěšně uložen.",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("❌ Chyba při ukládání výdaje:", err.message);
    res.status(500).send("Server error");
  }
}

/**
 * ================================
 * 📄 READ FUNCTIONS
 * ================================
 */

// Get decrypted list of all expense entries
async function getMoreExpenseDetails(req, res) {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).send("Unauthorized");

  try {
    const query = `
      SELECT id, date, description, payment, amount, categorie, note
      FROM public.one_cashflow
      WHERE "userID" = $1 AND operation = 'expense'
      ORDER BY date DESC;
    `;

    const result = await cashflow.query(query, [userId]);

    // Decrypt all returned rows
    const decryptedRows = result.rows.map(row => ({
      ...row,
      description: utils.decrypt(row.description),
      payment: utils.decrypt(row.payment),
      categorie: utils.decrypt(row.categorie),
      note: row.note ? utils.decrypt(row.note) : null
    }));

    res.status(200).json({ expenses: decryptedRows });
  } catch (error) {
    console.error("❌ Chyba při načítání výdajů:", error.message);
    res.status(500).send("Server error");
  }
}

// Get decrypted list of all income entries
async function getMoreIncomeDetails(req, res) {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).send("Unauthorized");

  try {
    const query = `
      SELECT id, date, description, payment, amount, categorie, note
      FROM public.one_cashflow
      WHERE "userID" = $1 AND operation = 'income'
      ORDER BY date DESC;
    `;

    const result = await cashflow.query(query, [userId]);

    const decryptedRows = result.rows.map(row => ({
      ...row,
      description: utils.decrypt(row.description),
      payment: utils.decrypt(row.payment),
      categorie: utils.decrypt(row.categorie),
      note: row.note ? utils.decrypt(row.note) : null
    }));

    res.status(200).json({ incomes: decryptedRows });
  } catch (err) {
    console.error("❌ Chyba při načítání příjmů:", err.message);
    res.status(500).send("Server error");
  }
}

// Get both income and expense for a user
async function getAllData(req, res) {
  const userId = req.session.user?.id;

  if (!userId) return res.status(401).json({ message: 'Neautorizovaný přístup.' });

  try {
    const query = `
      SELECT id, date, description, payment, amount, categorie, note, operation
      FROM public.one_cashflow
      WHERE "userID" = $1 
      ORDER BY date DESC;
    `;

    const result = await cashflow.query(query, [userId]);

    const decryptedRows = result.rows.map(row => ({
      ...row,
      description: utils.decrypt(row.description),
      payment: utils.decrypt(row.payment),
      categorie: utils.decrypt(row.categorie),
      note: row.note ? utils.decrypt(row.note) : null
    }));

    return res.status(200).json(decryptedRows);
  } catch (err) {
    console.error('Chyba při načítání dat:', err);
    return res.status(500).json({ message: 'Chyba serveru při načítání dat.' });
  }
}

/**
 * ================================
 * ✏️ UPDATE FUNCTIONS
 * ================================
 */

// Update an existing expense
async function updateExpense(req, res) {
  const userId = req.session.user?.id;
  const { id, date, description, payment, amount, categorie, note } = req.body;

  // Validation
  if (!userId) return res.status(401).json({ error: "Uživatel není přihlášen." });
  if (!id || !date || !description || !payment || !amount || !categorie) {
    return res.status(400).json({ error: "Chybí povinná data." });
  }
  if (isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: "Částka musí být kladné číslo." });
  }

  try {
    // Encrypt updated fields
    const encryptedDescription = utils.encrypt(description);
    const encryptedNote = note ? utils.encrypt(note) : null;
    const encryptedPayment = utils.encrypt(payment);
    const encryptedCategory = utils.encrypt(categorie);
    const parsedAmount = parseFloat(amount);

    // Update query
    await cashflow.query(
      `UPDATE public.one_cashflow SET 
         date = $1,
         description = $2,
         payment = $3,
         amount = $4,
         categorie = $5,
         note = $6
       WHERE "userID" = $7 AND operation = 'expense' AND id = $8`,
      [
        date,
        encryptedDescription,
        encryptedPayment,
        parsedAmount,
        encryptedCategory,
        encryptedNote,
        userId,
        id
      ]
    );

    // Fetch updated data
    const { rows } = await cashflow.query(
      `SELECT id, date, description, payment, amount, categorie, note
       FROM public.one_cashflow
       WHERE "userID" = $1 AND operation = 'expense' AND id = $2`,
      [userId, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Výdaj nenalezen." });
    }

    const row = rows[0];
    const decryptedRow = {
      ...row,
      description: utils.decrypt(row.description),
      payment: utils.decrypt(row.payment),
      categorie: utils.decrypt(row.categorie),
      note: row.note ? utils.decrypt(row.note) : null
    };

    res.status(200).json({ message: "Výdaj aktualizován.", data: decryptedRow });
  } catch (err) {
    console.error("Chyba při aktualizaci výdajů:", err);
    res.status(500).json({ error: "Serverová chyba" });
  }
}

// Update an existing income
async function updateIncome(req, res) {
  const userId = req.session.user?.id;
  const { id, date, description, payment, amount, categorie, note } = req.body;

  if (!userId) return res.status(401).json({ error: "Uživatel není přihlášen." });
  if (!id || !date || !description || !payment || !amount || !categorie) {
    return res.status(400).json({ error: "Chybí povinná data." });
  }
  if (isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: "Částka musí být kladné číslo." });
  }

  try {
    const encryptedDescription = utils.encrypt(description);
    const encryptedNote = note ? utils.encrypt(note) : null;
    const encryptedPayment = utils.encrypt(payment);
    const encryptedCategory = utils.encrypt(categorie);
    const parsedAmount = parseFloat(amount);

    await cashflow.query(
      `UPDATE public.one_cashflow SET
         date = $1,
         description = $2,
         payment = $3,
         amount = $4,
         categorie = $5,
         note = $6
       WHERE "userID" = $7 AND operation = 'income' AND id = $8`,
      [
        date,
        encryptedDescription,
        encryptedPayment,
        parsedAmount,
        encryptedCategory,
        encryptedNote,
        userId,
        id
      ]
    );

    const { rows } = await cashflow.query(
      `SELECT id, date, description, payment, amount, categorie, note
       FROM public.one_cashflow
       WHERE "userID" = $1 AND operation = 'income' AND id = $2`,
      [userId, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Příjem nenalezen." });
    }

    const row = rows[0];
    const decryptedRow = {
      ...row,
      description: utils.decrypt(row.description),
      payment: utils.decrypt(row.payment),
      categorie: utils.decrypt(row.categorie),
      note: row.note ? utils.decrypt(row.note) : null
    };

    res.status(200).json({ message: "Příjem aktualizován.", data: decryptedRow });
  } catch (err) {
    console.error("Chyba při aktualizaci příjmů:", err);
    res.status(500).json({ error: "Serverová chyba" });
  }
}

/**
 * ================================
 * ❌ DELETE FUNCTIONS
 * ================================
 */

// Delete an income entry
async function deleteIncome(req, res) {
  const { id } = req.body;

  if (!id) return res.status(400).json({ message: "Chybí ID příjmu k smazání." });

  try {
    const result = await cashflow.query(`DELETE FROM one_cashflow WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Příjem s tímto ID nebyl nalezen." });
    }

    res.json({ message: "Příjem úspěšně smazán." });
  } catch (err) {
    console.error("Chyba při mazání příjmu:", err);
    res.status(500).json({ message: "Interní chyba serveru." });
  }
}

// Delete an expense entry
async function deleteExpense(req, res) {
  const { id } = req.body;

  if (!id) return res.status(400).json({ message: "Chybí ID výdaje k smazání." });

  try {
    const result = await cashflow.query(
      "DELETE FROM one_cashflow WHERE id = $1 AND operation = 'expense'",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Výdaj s tímto ID nebyl nalezen." });
    }

    res.json({ message: "Výdaj byl úspěšně smazán." });
  } catch (err) {
    console.error("❌ Chyba při mazání výdaje:", err);
    res.status(500).json({ message: "Interní chyba serveru." });
  }
}

/**
 * ================================
 * ⬇️ EXPORT HANDLER (WIP)
 * ================================
 */

// Handle export data preview or transformation
async function exportedData(req, res) {
  const userID = req.session.user?.id;
  const { dataSets, format } = req.body;

  const tb = dataSets.join("").split(",")[0];
  const subject = dataSets.join("").split(",")[1];

  console.log(tb);
  console.log(subject);
  console.log(userID);

  // TODO: Implement real export logic
  res.send("Export handler not implemented yet.");
}

/**
 * ================================
 * 📦 EXPORT MODULE
 * ================================
 */
module.exports = {
  createIncomeEntry,
  createExpenseEntry,
  getMoreExpenseDetails,
  getMoreIncomeDetails,
  updateExpense,
  updateIncome,
  deleteIncome,
  deleteExpense,
  getAllData,
  exportedData
};
