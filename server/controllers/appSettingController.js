const { pool, generalSettingsDB } = require("../config/db");
require("dotenv").config();

// Get user settings from the database based on session user ID
async function getUserSetting(req, res) {
  const id = req.session.user?.id;

  // Check if user is logged in
  if (!id) {
    return res.status(401).json({ message: "User is not logged in." });
  }

  try {
    // Query the settings for the given user ID
    const result = await generalSettingsDB.query(
      `SELECT setting FROM one_general_setting WHERE "user" = $1`,
      [id]
    );

    // If no settings found, return 404
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Settings not found." });
    }

    // Return the user settings as JSON
    const userSetting = result.rows[0].setting;
    res.status(200).json(userSetting);

  } catch (error) {
    // Log and return server error
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Server error." });
  }
}

// Update or create user settings in the database
async function updateSetting(req, res) {
  try {
    const { data } = req.body;
    const id = req.session.user?.id;

    // Validate presence of user ID and data
    if (!data || !id) {
      return res.status(400).json({ message: "Missing user ID or settings data." });
    }

    // Convert data object to JSON string for storage
    const settingsJson = JSON.stringify(data);

    // Check if a settings record already exists for this user
    const existsResult = await generalSettingsDB.query(
      `SELECT 1 FROM one_general_setting WHERE "user" = $1`,
      [id]
    );

    if (existsResult.rows.length === 0) {
      // Insert new settings if none exist
      await generalSettingsDB.query(
        `INSERT INTO one_general_setting ("user", setting) VALUES ($1, $2)`,
        [id, settingsJson]
      );
    } else {
      // Update existing settings record
      await generalSettingsDB.query(
        `UPDATE one_general_setting SET setting = $1 WHERE "user" = $2`,
        [settingsJson, id]
      );
    }

    // Log successful save and return success message
    console.log("Settings saved:", settingsJson, "for user:", id);
    res.status(200).json({ message: "Settings saved successfully" });

  } catch (error) {
    // Log and return server error
    console.error("Error saving settings:", error);
    res.status(500).json({ message: "Failed to save settings" });
  }
}

// Change the user's plan in the main user table
async function changePlan(req, res) {
  const userId = req.session.user?.id;
  const { planID } = req.body;

  console.log('Plan ID:', planID);
  console.log('User ID:', userId);

  // Check if user is logged in
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: user not logged in' });
  }

  // Validate planID type (number or string)
  if (typeof planID !== 'number' && typeof planID !== 'string') {
    return res.status(400).json({ error: 'Invalid planID' });
  }

  try {
    // Update user's plan in the main user table
    const result = await pool.query(
      `UPDATE ${process.env.TABLE} SET plan = $1 WHERE id = $2`,
      [planID, userId]
    );

    // If no rows updated, user was not found
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found or plan not updated' });
    }

    // Return success response
    return res.status(200).json({ message: 'Plan updated successfully' });

  } catch (error) {
    // Log and return server error
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getUserSetting,
  updateSetting,
  changePlan
};
