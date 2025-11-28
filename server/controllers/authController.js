// 📦 Dependencies
const bcrypt = require("bcrypt");
const Utils = require("../utils/utils");
const { pool, generalSettingsDB } = require("../config/db");
require("dotenv").config();

const utils = new Utils();
const TABLE = process.env.TABLE;

/**
 * ========================================
 * 👤 USER REGISTRATION & LOGIN
 * ========================================
 */

//  Register a new user
async function register(req, res) {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: "Všechna pole jsou povinná." });
  }

  try {
    const result = await pool.query(`SELECT username, email FROM ${TABLE}`);

    const userExists = result.rows.some(row => {
      return (
        utils.decrypt(row.username) === username ||
        utils.decrypt(row.email) === email
      );
    });

    if (userExists) {
      return res.status(409).json({ message: "Uživatel již existuje." });
    }

    const encryptedEmail = utils.encrypt(email);
    const encryptedUsername = utils.encrypt(username);
    const hashedPassword = await bcrypt.hash(password, 10);
    const code = utils.generateCode();

    const insertResult = await pool.query(
      `INSERT INTO ${TABLE} (username, email, password, plan, created_at, code)
       VALUES ($1, $2, $3, $4, NOW(), $5) RETURNING id`,
      [encryptedUsername, encryptedEmail, hashedPassword, "1", code]
    );

    const userId = insertResult.rows[0].id;

    await createDefaultAppSetting(userId);

    res.status(201).json({ message: "Účet byl vytvořen." });
  } catch (err) {
    console.error("❌ Chyba při registraci:", err);
    res.status(500).json({ message: "Chyba serveru." });
  }
}

// 🔧 Create default settings for new user
async function createDefaultAppSetting(userId) {
  const defaultSetting = {
    dark: false,
    synch: false,
    gdpr: true,
    cookie: true,
  };

  try {
    await generalSettingsDB.query(
      `INSERT INTO one_general_setting ("user", "setting")
       VALUES ($1, $2)`,
      [userId, JSON.stringify(defaultSetting)]
    );
  } catch (err) {
    console.error("❌ Chyba při vytváření výchozího nastavení:", err);
  }
}

//  Login user
async function login(req, res) {
  const { email, password } = req.body;
  const code = utils.generateCode();

  try {
    const result = await pool.query(`SELECT id, email, password, code FROM ${TABLE}`);

    const user = result.rows.find(row => utils.decrypt(row.email) === email);
    if (!user) return res.status(404).json({ message: "Email nenalezen" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Neplatné heslo" });

    await pool.query(`UPDATE ${TABLE} SET code = $1 WHERE id = $2`, [code, user.id]);

    req.session.user = {
      id: user.id,
      token: code,
      loggedIn: true,
    };

    res.status(200).json({ message: "Přihlášení úspěšné" });
  } catch (err) {
    console.error("❌ Chyba při přihlášení:", err);
    res.status(500).json({ message: "Chyba serveru." });
  }
}

//  Check if user is logged in via token
async function isLogin(req, res) {
  const token = req.session?.user?.token;
  if (!token) return res.status(401).json({ message: "Chybí token v session." });

  try {
    const result = await pool.query(`SELECT code FROM ${TABLE}`);
    const found = result.rows.find(row => row.code === token);

    if (!found) {
      return res.status(401).json({ message: "Token neodpovídá žádnému záznamu." });
    }

    res.status(200).json({ loggedIn: true });
  } catch (err) {
    console.error("❌ Chyba při ověřování tokenu:", err);
    res.status(500).json({ message: "Chyba serveru." });
  }
}

//  Verify user by ID + code
async function checkUserAutentizationCode(id, code, pool) {
  try {
    const result = await pool.query(
      "SELECT id FROM public.one_user WHERE id = $1 AND code = $2",
      [id, code]
    );
    return result.rows.length > 0;
  } catch (err) {
    console.error("❌ Chyba při ověřování autentizace:", err);
    return false;
  }
}

// 🔒 Logout user
function logout(req, res) {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: "Chyba při odhlašování" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Odhlášení úspěšné" });
  });
}

/**
 * ========================================
 * 👤 USER PROFILE
 * ========================================
 */

// 👁️ Get user info (for profile)
async function getUserInfo(req, res) {
  const id = req.session.user?.id;
  if (!id) return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await pool.query(
      `SELECT username, email, plan, moreinfo FROM ${TABLE} WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const row = result.rows[0];
    const decrypted = {
      username: utils.decrypt(row.username),
      email: utils.decrypt(row.email),
      plan: row.plan,
      moreinfo: row.moreinfo ?? null
    };

    res.json(decrypted);
  } catch (err) {
    console.error("❌ Chyba při načítání uživatele:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
}

// 💾 Update user info
async function saveUserInfo(req, res) {
  const id = req.session.user?.id;
  const { data } = req.body;

  if (!id || !data) {
    return res.status(400).json({ error: "Missing user ID or data." });
  }

  try {
    const fields = [];
    const values = [];
    let index = 1;

    if (data.email) {
      fields.push(`email = $${index}`);
      values.push(utils.encrypt(data.email));
      index++;
    }

    if (data.username) {
      fields.push(`username = $${index}`);
      values.push(utils.encrypt(data.username));
      index++;
    }

    if (data.moreInfo) {
      fields.push(`moreInfo = $${index}`);
      values.push(data.moreInfo); // assumed to be JSON
      index++;
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update." });
    }

    values.push(id);

    const query = `
      UPDATE ${TABLE}
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *;
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const updated = result.rows[0];

    if (updated.email) updated.email = utils.decrypt(updated.email);
    if (updated.username) updated.username = utils.decrypt(updated.username);

    res.json({ success: true, user: updated });
  } catch (err) {
    console.error("❌ Chyba při aktualizaci uživatele:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// 📤 Get current user ID
function getUserId(req, res) {
  const id = req.session.user?.id;
  res.status(200).json({ userID: id });
}

/**
 * ========================================
 * 🔐 PASSWORD MANAGEMENT
 * ========================================
 */

// 🔁 Update password
async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const id = req.session.user?.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).send("Missing fields");
  }

  try {
    const storedPassword = await getHashPassword(id);
    if (!storedPassword) return res.status(404).send("User not found");

    const isMatch = await bcrypt.compare(currentPassword, storedPassword);
    if (!isMatch) return res.status(403).send("Current password is incorrect");

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
       `UPDATE ${TABLE} SET password = $1 WHERE id = $2`,
      [hashedNewPassword, id]
    ); res.status(200).send("Password updated successfully");
  } catch (error) {
    console.error("❌ Password update failed:", error);
    res.status(500).send("Server error");
  }
}

// Pomocná funkce pro získání zahashovaného hesla uživatele z DB
async function getHashPassword(id) {
  try {
    const result = await pool.query(
      `SELECT password FROM ${TABLE} WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    return result.rows[0].password;
  } catch (err) {
    console.error("❌ Error fetching password:", err);
    return null;
  }
}

/**
 * ========================================
 * 🔒 MIDDLEWARE
 * ========================================
 */

async function getUserEmail(req, res) {
  const id = req.session.user?.id;

  if (!id) {
    return res.status(401).json({ error: "Uživatel není přihlášen." });
  }

  try {
    const result = await pool.query(
      `SELECT email FROM users WHERE id = $1`,  // změň "users" na název tvé tabulky
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Uživatel nenalezen." });
    }

    const email = result.rows[0].email;
    return res.json({ email });
  } catch (err) {
    console.error("Chyba při získávání emailu:", err);
    return res.status(500).json({ error: "Chyba serveru." });
  }
}


// Middleware pro kontrolu přihlášení
function isAuthenticated(req, res, next) {
  if (req.session.user?.loggedIn) {
    return next();
  }
  res.status(401).json({ message: "Nepřihlášený uživatel" });
}

module.exports = {
  register,
  login,
  isLogin,
  logout,
  isAuthenticated,
  checkUserAutentizationCode,
  getUserInfo,
  saveUserInfo,
  updatePassword,
  getUserEmail,
  getUserId,
};

