// Import required modules
require("dotenv").config(); 
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

// Import middleware and route modules
const sessionMiddleware = require("./config/session"); 
const authRoutes = require("./routers/authRoutes"); 
const appSettingController = require("./routers/appSettingRoute"); 
const cashflowController = require("./routers/cashflow"); 
const businessController = require("./routers/businessRouter"); 
const exportController = require("./routers/exportRouter"); 
const paymentController = require("./routers/paymentRouter"); 
const invoicesController = require("./routers/invoicesRoute");
// Initialize Express application
const app = express();

/**
 * ====================
 * Middleware Setup
 * ====================
 */

// Helmet – zabezpečení hlaviček
app.use(helmet());

// Povolení CORS s podporou cookies
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true,
}));

// Middleware pro čtení cookies
app.use(sessionMiddleware);

// Middleware pro parsování JSONu
app.use(express.json());

/**
 * ====================
 * Route Setup
 * ====================
 */

// Auth routes (login, logout, check login)
app.use("/auth", authRoutes);

app.use("/userSetting", appSettingController);
app.use("/cashflow",cashflowController);
app.use("/business", businessController);
app.use("/export",exportController);
app.use("/payment",paymentController);
app.use("/invoice" , invoicesController);


/**
 * ====================
 * Server Initialization
 * ====================
 */


const PORT = process.env.PORT || 5000;


app.listen(PORT, () => console.log(`Server běží na portu ${PORT}`));
