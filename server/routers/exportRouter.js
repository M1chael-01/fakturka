// Import required modules
const express = require("express");

// Import the export controller
const controller = require("../controllers/exportController");

// Initialize router
const router = express.Router();

/**
 * ====================
 * Routes
 * ====================
 */

// POST /export/file
// Description: Handles generating and returning export files (CSV, Excel, PDF, etc.)
// Note: Consider adding validation middleware here if needed before invoking controller
router.post("/file", controller.exportFile);

/**
 * ====================
 * Export Router
 * ====================
 */
module.exports = router;
