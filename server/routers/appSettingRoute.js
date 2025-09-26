const express = require("express");
const setting = require("../controllers/appSettingController");

const router = express.Router();

// Route to get user settings
// Expects user to be logged in (session)
// POST /getUserSetting
router.post("/getUserSetting", setting.getUserSetting);

// Route to save/update user settings
// Expects JSON body with new settings data
// POST /saveSetting
router.post("/saveSetting", setting.updateSetting);

// Route to change user's subscription plan
// Expects JSON body with planID
// PUT /changePlan
router.put("/changePlan", setting.changePlan);

module.exports = router;
