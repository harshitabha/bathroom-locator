import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: 'postgres',
  password: process.env.DB_PASSWORD,
});


/**
 * returns list of all bathrooms in database
 * @returns {object} array of bathroom objects
 */
export async function getBathrooms() {
  try {
    const {rows} = await pool.query({
      text: `
        SELECT
          b.id, b.data->>'name' AS name, 
          b.data->>'details' AS details, 
          b.data->>'position' AS position
        FROM bathrooms b
      `,
      values: [],
    });
    rows.forEach((bathroom) => {
      bathroom.position = JSON.parse(bathroom.position);
    });
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * creates a new bathroom in the database
 * @param {object} bathroom bathroom object
 * @returns {object} the newly created bathroom
 */
export async function createBathroom(bathroom) {
  try {
    const {rows} = await pool.query({
      text: `
        INSERT INTO bathrooms(data) 
        VALUES ($1)
        RETURNING id
      `,
      values: [bathroom],
    });

    const newBathroom = {
      ...bathroom,
      id: rows[0].id,
    };

    return newBathroom;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * returns list of bathrooms in database within bounds
 * @param {number} minLng minimum longitute of the bounds
 * @param {number} minLat minimum latitute of the bounds
 * @param {number} maxLng max longitute of the bounds
 * @param {number} maxLat max latitute of the bounds
 * @param {number} limit limit of bathrooms to fetch
 * @returns {object} array of bathroom objects
 */
export async function getBathroomsInBounds(
    minLng, minLat, maxLng, maxLat, limit = 200,
) {
  try {
    const {rows} = await pool.query({
      text: `
        SELECT
          b.id,
          b.data->>'name' AS name,
          b.data->>'details' AS details,
          b.data->>'position' AS position
        FROM bathrooms b
        WHERE
          ((b.data->'position'->>'lng')::double precision BETWEEN $1 AND $3)
          AND
          ((b.data->'position'->>'lat')::double precision BETWEEN $2 AND $4)
        LIMIT $5
      `,
      values: [minLng, minLat, maxLng, maxLat, limit],
    });

    rows.forEach((bathroom) => {
      bathroom.position = JSON.parse(bathroom.position);
    });
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

