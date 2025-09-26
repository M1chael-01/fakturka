const bcrypt = require("bcrypt");
const Utils = require("../utils/utils"); // uprav podle své struktury
const { pool, generalSettingsDB } = require("../config/db");


const utils = new Utils();

require("dotenv").config();

// Registrace uživatele
async function register(req, res) {
  let { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: "Všechna pole jsou povinná." });
  }

  try {
    // Zkontroluj, jestli uživatel existuje
    const result = await pool.query(`SELECT username, email FROM ${process.env.TABLE}`);
    const userExists = result.rows.some((item) => {
      const decryptedUsername = utils.decrypt(item.username);
      const decryptedEmail = utils.decrypt(item.email);
      return decryptedUsername === username || decryptedEmail === email;
    });

    if (userExists) {
      return res.status(409).json({ message: "Uživatel již existuje." });
    }

    // Zašifruj data
    const encryptedEmail = utils.encrypt(email);
    const encryptedUsername = utils.encrypt(username);
    const hashedPassword = await bcrypt.hash(password, 10);
    const code = utils.generateCode();

   const insertResult = await pool.query(`
  INSERT INTO ${process.env.TABLE} (username, email, password, plan, created_at, code)
  VALUES ($1, $2, $3, $4, NOW(), $5)
  RETURNING id
`, [encryptedUsername, encryptedEmail, hashedPassword, "1", code]);

const insertedUserId = insertResult.rows[0].id;

console.log(insertedUserId,"id");


    res.status(201).json({ message: "Účet byl vytvořen." });
   await createDefaultAppSetting(insertedUserId)
  } catch (err) {
    console.error("Chyba při registraci:", err);
    res.status(500).json({ message: "Chyba serveru." });
  }
}

async function createDefaultAppSetting(userId) {
  const defaultSetting = {
    dark: false,
    synch: false,
    gdpr: true,
    cookie: true
  };
  console.log("callback ?" , defaultSetting);

  try {
   await generalSettingsDB.query(`
  INSERT INTO one_general_setting ("user", "setting")
  VALUES ($1, $2)
`, [userId, JSON.stringify(defaultSetting)]);


  } catch (err) {
    console.error("Chyba při vytváření výchozího nastavení:", err);
  }
}




// Přihlášení uživatele
async function login(req, res) {
  const { email, password } = req.body;
  const code = utils.generateCode(); // nový code

  try {
    const result = await pool.query(`SELECT id, email, password, code FROM ${process.env.TABLE}`);

    const user = result.rows.find((item) => {
      const decryptedEmail = utils.decrypt(item.email);
      return decryptedEmail === email;
    });

    if (!user) {
      return res.status(404).json({ message: "Email nenalezen" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Neplatné heslo" });
    }

    // Aktualizace kódu v DB
    await pool.query(
      `UPDATE ${process.env.TABLE} SET code = $1 WHERE id = $2`,
      [code, user.id]
    );

    // Uložení do session s novým code
    req.session.user = {
      id: user.id,
      token: code,
      loggedIn: true
    };

    console.log("Session po přihlášení:", req.session.user);

    res.status(200).json({ message: "Přihlášení úspěšné" });
  } catch (err) {
    console.error("Chyba při přihlášení:", err);
    res.status(500).json({ message: "Chyba serveru." });
  }
}


async function isLogin(req, res) {
  const token = req.session?.user?.token;

  if (!token) {
    return res.status(401).json({ message: "Chybí token v session." });
  }

  try {
    // Vyber jen sloupec "code"
    const result = await pool.query(`SELECT code FROM ${process.env.TABLE}`);

    // Najdi, jestli je token v seznamu
    const found = result.rows.find((row) => row.code === token);

    if (!found) {
      return res.status(401).json({ message: "Token neodpovídá žádnému záznamu." });
    }

    return res.status(200).json({ loggedIn: true });
  } catch (err) {
    console.error("Chyba při ověřování tokenu:", err);
    return res.status(500).json({ message: "Chyba serveru." });
  }
}

// Funkce na ověření uživatele podle id a code z DB
async function checkUserAutentizationCode(id, code, pool) {
  try {
    const result = await pool.query(
      "SELECT id FROM public.one_user WHERE id = $1 AND code = $2",
      [id, code]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error("Chyba při ověřování autentizace:", error);
    return false;
  }
}


async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const id = req.session.user?.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).send("Missing fields");
  }

  try {
    const storedPassword = await getHashPassword(id);

    if (!storedPassword) {
      return res.status(404).send("User not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, storedPassword);
    if (!isMatch) {
      return res.status(403).send("Current password is incorrect");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      `UPDATE ${process.env.TABLE} SET password = $1 WHERE id = $2`,
      [hashedNewPassword, id]
    );

    res.status(200).send("Password updated successfully");
  } catch (error) {
    console.error("Password update failed:", error);
    res.status(500).send("Server error");
  }
  
}

async function getHashPassword(id) {
  try {
    const result = await pool.query(
      `SELECT password FROM ${process.env.TABLE} WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    return result.rows[0].password;
  } catch (err) {
    console.error("Error fetching password:", err);
    return null;
  }
}


// Odhlášení uživatele
function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Chyba při odhlašování" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Odhlášení úspěšné" });
  });
}

async function getUserInfo(req, res) {
  const id = req.session.user?.id;
  console.log("User ID from session:", id);

  if (!id) {
    return res.status(401).json({ error: 'Unauthorized: No user ID found in session' });
  }

  try {
    const result = await pool.query(
      `SELECT username, email, plan, moreinfo FROM ${process.env.TABLE} WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const row = result.rows[0];

    const decrypted = {
      username: utils.decrypt(row.username),
      email: utils.decrypt(row.email),
      plan: row.plan,
      moreinfo: row.moreinfo ?? null // include if present
    };

    return res.json(decrypted);

  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function saveUserInfo(req, res) {
  const id = req.session.user?.id;
  const { data } = req.body;
  const table = process.env.TABLE;

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
      values.push(data.moreInfo); // JSONB
      index++;
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update." });
    }

    // Add user ID for WHERE clause
    values.push(id);

    const query = `
      UPDATE ${table}
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *;
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const updated = result.rows[0];

    // Decrypt sensitive fields
    if (updated.email) updated.email = utils.decrypt(updated.email);
    if (updated.username) updated.username = utils.decrypt(updated.username);

    return res.json({ success: true, user: updated });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

function getUserId(req,res) {
   const id = req.session.user?.id;
   res.status(201).json({userID:id});

}



// Middleware pro ověření přihlášení
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
  getUserId
};
