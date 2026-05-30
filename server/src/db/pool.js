const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";
const useSSL = process.env.DB_SSL === "true" || isProduction;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

module.exports = pool;
