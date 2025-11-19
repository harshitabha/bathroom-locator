import {pool} from './pool.js';

/**
 * creates a new bathroom in the database
 * @param {object} bathroom bathroom object
 * @returns {object} the newly created bathroom
 */
export async function createBathroom(bathroom) {
  const defaultAmenities = {
    toilet_paper: false,
    soap: false,
    paper_towel: false,
    hand_dryer: false,
    menstrual_products: false,
    mirror: false,
  };

  const defaultGender = {
    female: false,
    male: false,
    gender_neutral: false,
  };

  const bathroomToInsert = {
    ...bathroom,
    // treat 0 as nothing is selected
    'num_stalls': bathroom['num_stalls'] || 0,
    'amenities': bathroom.amenities || defaultAmenities,
    'gender': bathroom.gender || defaultGender,
  };

  const {rows} = await pool.query({
    text: `
      INSERT INTO bathrooms(data) 
      VALUES ($1)
      RETURNING id;
    `,
    values: [bathroomToInsert],
  });

  const newBathroom = {
    ...bathroomToInsert,
    id: rows[0].id,
  };

  return newBathroom;
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
  const {rows} = await pool.query({
    text: `
      SELECT
        b.id,
        b.data->>'name' AS name,
        b.data->>'description' AS description,
        data->>'position' AS position,
        (b.data->>'num_stalls')::int AS num_stalls,
        b.data->>'amenities' AS amenities,
        b.data->>'gender' AS gender,
        COALESCE((b.data->>'likes')::int, 0) AS likes
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
    bathroom.gender = JSON.parse(bathroom.gender);
  });
  return rows;
}

/**
 * merges the fields of the bathroom object with the new values
 * @param {object} bathroom object
 * @returns {object} the newly editted bathroom object
 */
export async function updateBathroom(bathroom) {
  const {id, ...bathroomBase} = bathroom;
  await pool.query({
    text: `
      UPDATE bathrooms
      SET data = data || $1
      WHERE id = $2
      RETURNING id;
    `,
    values: [bathroomBase, id],
  });
}

/**
 * get user's liked bathrooms
 * @param {string} userId user id
 * @returns {object} user's liked bathroomIds
 */
export async function getUserLikes(userId) {
  const {rows} = await pool.query({
    text: `
      SELECT bathroomId
      FROM userLikes
      WHERE userId = $1;
    `,
    values: [userId],
  });

  const bathroomIds = rows.map((bId) => bId.bathroomid);
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
 * @returns {object} list of bathrooms
 */
export async function getBathroom(bathroomId) {
  const {rows} = await pool.query({
    text: `
      SELECT *
      FROM bathrooms
      WHERE id = $1
    `,
    values: [bathroomId],
  });

  return rows[0];
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
