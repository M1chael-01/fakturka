const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000
});

const generalSettingsDB = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE_SETTING,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000
});

const cashflow = new Pool({
   host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE_CASH_FLOW,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000
})

const business = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE_BUSINESS,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000
})

const payment = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE_PAYMENT,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000
})

const invoices = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE_INVOICES,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000
})

module.exports = { pool, generalSettingsDB,cashflow,business,payment,invoices };
