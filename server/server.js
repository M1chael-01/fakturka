// Import required modules
require("dotenv").config(); // Načte .env proměnné
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

// Import middleware and route modules
const sessionMiddleware = require("./config/session"); // Optional: pokud používáš sessions
const authRoutes = require("./routers/authRoutes"); // Authentication-related routes
const appSettingController = require("./routers/appSettingRoute"); // User settings routes
const cashflowController = require("./routers/cashflow"); // Cashflow-related routes
const businessController = require("./routers/businessRouter"); // Business management routes
const exportController = require("./routers/exportRouter"); // Exporting/reporting routes
const paymentController = require("./routers/paymentRouter"); // Payment routes
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


// Session middleware (volitelně, pokud stále potřebuješ sessions)
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

// Protected routes – dostupné jen s platným JWT
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

// Definuj port serveru
const PORT = process.env.PORT || 5000;

// Spusť server
app.listen(PORT, () => console.log(`Server běží na portu ${PORT}`));
