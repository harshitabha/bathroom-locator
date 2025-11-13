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
          b.id,
          b.data->>'name' AS name, 
          b.data->>'description' AS description, 
          b.data->>'position' AS position,
          (b.data->>'num_stalls')::int AS num_stalls,
          b.data->>'amenities' AS amenities,
          COALESCE((b.data->>'likes')::int, 0) AS likes
        FROM bathrooms b;
      `,
      values: [],
    });
    rows.forEach((bathroom) => {
      bathroom.position = JSON.parse(bathroom.position);
      bathroom.amenities = JSON.parse(bathroom.amenities);
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
        RETURNING id;
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
          b.data->>'description' AS description,
          b.data->>'position' AS position,
          (b.data->>'num_stalls')::int AS num_stalls,
          b.data->>'amenities' AS amenities
        FROM bathrooms b
        WHERE
          ((b.data->'position'->>'lng')::double precision BETWEEN $1 AND $3)
          AND
          ((b.data->'position'->>'lat')::double precision BETWEEN $2 AND $4)
        LIMIT $5;
      `,
      values: [minLng, minLat, maxLng, maxLat, limit],
    });

    rows.forEach((bathroom) => {
      bathroom.position = JSON.parse(bathroom.position);
      bathroom.amenities = JSON.parse(bathroom.amenities);
    });
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * get user's liked bathrooms
 * @param {string} userId user id
 * @returns {object} user's liked bathroomIds
 */
export async function getUserLikes(userId) {
  const rows = await pool.query({
    text: `
      SELECT bathroomId
      FROM userLikes
      WHERE userId = $1;
    `,
    values: [userId],
  });

  const bathroomIds = rows.rows.map((bId) => bId.bathroomid);
  return bathroomIds;
}

/**
 * add like to bathroom
 * @param {string} userId user id
 * @param {string} bathroomId bathroom id
 */
export async function likeBathroom(userId, bathroomId) {
  try {
    await pool.query({
      text: `
        INSERT INTO userLikes
        VALUES ($1, $2)
      `,
      values: [userId, bathroomId],
    });

    await pool.query({
      text: `
        UPDATE bathrooms
        SET data = jsonb_set(
            data, 
            '{likes}',
            to_jsonb(COALESCE(data->>'likes', '0')::int + 1),
            true
        )
        WHERE id = $1
      `,
      values: [bathroomId],
    });
  } catch (error) {
    // will error if like already exists
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * get bathroom
 * @param {string} bathroomId bathroom id
 * @returns {object | undefined} bathroom if exists
 */
async function getBathroom(bathroomId) {
  const {rows} = await pool.query({
    text: `
      SELECT *
      FROM bathrooms
      WHERE id = $1
    `,
    values: [bathroomId],
  });

  return rows.length > 0 ? rows[0] : undefined;
}

/**
 * remove like from bathroom
 * @param {string} userId user id
 * @param {string} bathroomId bathroom id
 */
export async function unlikeBathroom(userId, bathroomId) {
  if (!(await getBathroom(bathroomId))) {
    throw (new Error('bathroom doesn\'t exist'));
  }

  await pool.query({
    text: `
      DELETE FROM userLikes
      WHERE userId = $1 AND bathroomId = $2
    `,
    values: [userId, bathroomId],
  });

  await pool.query({
    text: `
      UPDATE bathrooms
      SET data = jsonb_set(
          data, 
          '{likes}',
          to_jsonb(GREATEST(0, COALESCE(data->>'likes', '0')::int - 1)),
          true
      )
      WHERE id = $1
    `,
    values: [bathroomId],
  });
}
