const express = require("express");
const businessController = require("../controllers/businessController");

const router = express.Router();

// Create a new supplier record
// POST /createNewSupplierRecord
router.post("/createNewSupplierRecord", businessController.createNewSupplierRecord);

// Create a new customer record
// POST /createNewCustomerRecord
router.post("/createNewCustomerRecord", businessController.createNewCustomerRecord);

// Get a list of all suppliers
// GET /selectSuppliers
router.get("/selectSuppliers", businessController.selectSuppliers);

// Get a list of all customers
// GET /selectCustomers
router.get("/selectCustomers", businessController.selectCustomers);

// Delete a record (supplier or customer)
// POST /deleteRecord
router.post("/deleteRecord", businessController.deleteRecord);

// Update an existing record (supplier or customer)
// PUT /updateRecord
router.put("/updateRecord", businessController.updateRecord);

module.exports = router;
