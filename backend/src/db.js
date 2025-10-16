import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
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
    text: `SELECT b.id, b.data->>'name' AS name, ` +
    `b.data->>'details' AS details, b.data->>'position' AS position ` +
    `FROM bathrooms b`,
    values: [],
  });
  rows.forEach((bathroom) => {
    bathroom.position = JSON.parse(bathroom.position);
  });
  return rows;
}