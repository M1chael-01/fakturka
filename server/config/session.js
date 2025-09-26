// config/session.js
const session = require("express-session");
const dotenv = require("dotenv");
dotenv.config();

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "tajne-heslo", // silné tajemství pro podpis cookie
  resave: false,
  saveUninitialized: false, // neukládej prázdné sessiony
  cookie: {
    secure: false,           // true pouze pokud používáš HTTPS
    httpOnly: true,
    sameSite: "lax",         // nebo "none" pokud potřebuješ přes domény
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dní
  }
});

module.exports = sessionMiddleware;
