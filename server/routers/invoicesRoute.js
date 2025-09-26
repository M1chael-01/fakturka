const express = require("express");
const invoicesController = require("../controllers/invoicesController");

const router = express.Router();



router.post("/newInvoices" , invoicesController.createNewInvoice);
router.get("/getInvoices" , invoicesController.readData);
router.post("/generateFile" , invoicesController.generateFile);
router.post("/uploadPdf" , invoicesController.uploadPdf);
router.post("/getPDF" , invoicesController.getPDF);


module.exports = router;





