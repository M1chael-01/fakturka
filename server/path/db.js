/**
 * Database pool configuration using the `pg` (node-postgres) library.
 * This module exports a configured Pool instance for querying the PostgreSQL database.
 */

const { Pool } = require("pg");
require("dotenv").config();

/**
 * PostgreSQL connection pool.
 * Reads configuration from environment variables:
 * - PG_HOST
 * - PG_PORT
 * - PG_USER
 * - PG_PASSWORD
 * - PG_DATABASE
 */
const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

module.exports = pool;
