import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
console.log(process.env.DB_PASSWORD)
const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.DB_PASSWORD,
});

// write db functions here

/**
 * returns list of all bathrooms in database
 * @returns {object} array of bathroom objects
 */
export async function getBathrooms() {
  const {rows} = await pool.query({
    text: `SELECT b FROM bathrooms b`,
    values: [],
  });
  console.log(rows);
  return rows;
}