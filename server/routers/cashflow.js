const express = require("express");
const cashflowController = require("../controllers/cashflowController");

const router = express.Router();

// Create a new expense entry
// POST /createExpense
router.post("/createExpense", cashflowController.createExpenseEntry);

// Create a new income entry
// POST /createIncome
router.post("/createIncome", cashflowController.createIncomeEntry);

// Get detailed information about a specific income entry
// POST /getMoreDetailsIncome
router.post("/getMoreDetailsIncome", cashflowController.getMoreIncomeDetails);

// Get detailed information about a specific expense entry
// POST /getMoreDetailsExpence
router.post("/getMoreDetailsExpence", cashflowController.getMoreExpenseDetails);

// Update an existing expense entry
// POST /updateExpense
router.post("/updateExpense", cashflowController.updateExpense);

// Update an existing income entry
// POST /updateIncome
router.post("/updateIncome", cashflowController.updateIncome);

// Delete a specific income entry
// POST /deleteIncome
router.post("/deleteIncome", cashflowController.deleteIncome);

// Delete a specific expense entry
// POST /deleteExpense
router.post("/deleteExpense", cashflowController.deleteExpense);

// Retrieve all cashflow data (both incomes and expenses)
// GET /allData
router.get("/allData", cashflowController.getAllData);

// Retrieve exported cashflow data (e.g., for download or report)
// GET /exportedData
router.get("/exportedData", cashflowController.exportedData);

module.exports = router;
