const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const getTableData = async () => {
  const result = await pool.query('SELECT * FROM videos');
  return result.rows;
};

module.exports = { getTableData };

