const { pool, generalSettingsDB } = require("../config/db");
require("dotenv").config();

async function getUserSetting(req, res) {
  const id = req.session.user?.id;

  if (!id) {
    return res.status(401).json({ message: "Uživatel není přihlášen." });
  }

  try {
    const result = await generalSettingsDB.query(
      `SELECT setting FROM one_general_setting WHERE "user" = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Nastavení nenalezeno." });
    }

    const userSetting = result.rows[0].setting;

    res.status(200).json(userSetting);
  } catch (error) {
    console.error("Chyba při načítání nastavení:", error);
    res.status(500).json({ message: "Chyba serveru." });
  }
}

async function updateSetting(req, res) {
  try {
    const { data } = req.body;
    const id = req.session.user?.id;

    if (!data || !id) {
      return res.status(400).json({ message: "Missing user ID or settings data." });
    }

    // Připrav JSON string
    const settingsJson = JSON.stringify(data);

    // Zjistit, jestli už záznam existuje
    const existsResult = await generalSettingsDB.query(
      `SELECT 1 FROM one_general_setting WHERE "user" = $1`,
      [id]
    );

    if (existsResult.rows.length === 0) {
      // Pokud neexistuje, vložíme nový záznam
      await generalSettingsDB.query(
        `INSERT INTO one_general_setting ("user", setting) VALUES ($1, $2)`,
        [id, settingsJson]
      );
    } else {
      // Pokud existuje, aktualizujeme stávající
      await generalSettingsDB.query(
        `UPDATE one_general_setting SET setting = $1 WHERE "user" = $2`,
        [settingsJson, id]
      );
    }

    console.log("Settings saved:", settingsJson, "for user:", id);

    res.status(200).json({ message: "Settings saved successfully" });
  } catch (error) {
    console.error("Error saving settings:", error);
    res.status(500).json({ message: "Failed to save settings" });
  }
}

async function changePlan(req, res) {
  const userId = req.session.user?.id;
  const { planID } = req.body;

  console.log('Plan ID:', planID);
  console.log('User ID:', userId);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: user not logged in' });
  }

  if (typeof planID !== 'number' && typeof planID !== 'string') {
    return res.status(400).json({ error: 'Invalid planID' });
  }

  try {
    const result = await pool.query(
      `UPDATE ${process.env.TABLE} SET plan = $1 WHERE id = $2`,
      [planID, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found or plan not updated' });
    }

    return res.status(200).json({ message: 'Plan updated successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}



module.exports = {
  getUserSetting,
  updateSetting,
  changePlan
};
