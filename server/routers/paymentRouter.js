const express = require("express");
const paymentController = require("../controllers/paymentController")

const route = express.Router();




route.get("/bankInfo" , paymentController.getBankInfomation);

route.post("/onlinePayment" , paymentController.onlinePayment);

route.post("/accepted" , paymentController.paymentAccepted);

route.get("/isPaid" ,  paymentController.checkPaid);

route.get("/paymentInformation" , paymentController.paymentInformation)





module.exports = route
