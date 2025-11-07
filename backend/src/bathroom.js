import * as db from './db.js';

/**
 * returns all the bathrooms in the database
 * @param {object} req request object
 * @param {object} res response object
 */
export async function getBathrooms(req, res) {
  const bathrooms = await db.getBathrooms();
  if (bathrooms.length > 0) {
    res.status(200).json(bathrooms);
  } else {
    res.status(404).send();
  }
}

/**
 * returns bathrooms in the database within bounds
 * @param {object} req request object
 * @param {object} res response object
 * @returns {Array} array of bathrooms in the bounds
 */
export async function getBathroomsInBounds(req, res) {
  const {minLng, minLat, maxLng, maxLat, limit} = req.query;

  const hasBounds =
    minLng !== undefined && minLat !== undefined &&
    maxLng !== undefined && maxLat !== undefined;

  if (hasBounds) {
    const a = parseFloat(minLng);
    const b = parseFloat(minLat);
    const c = parseFloat(maxLng);
    const d = parseFloat(maxLat);
    // limit # of bathrooms fetched, up to 200
    const lim = limit ?
      Math.max(1, Math.min(parseInt(limit, 10), 200)) : 200;

    if ([a, b, c, d].some(Number.isNaN)) {
      return res.status(400).json({error: 'Invalid bounds'});
    }

    try {
      // bounds dont cross anti-meridian, return results normally
      if (a <= c) {
        const bathrooms = await db.getBathroomsInBounds(a, b, c, d, lim);
        if (bathrooms.length > 0) {
          return res.status(200).json(bathrooms);
        } else {
          return res.status(200).json([]);
        }
      }

      // bounds cross anti-meridian, split into two before returning results
      const left = await db.getBathroomsInBounds(a, b, 180, d, lim);
      const right = await db.getBathroomsInBounds(-180, b, c, d, lim);
      const bathrooms = [...left, ...right].slice(0, lim);
      if (bathrooms.length > 0) {
        return res.status(200).json(bathrooms);
      } else {
        return res.status(200).json([]);
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({error: 'Server error'});
    }
  }
}

/**
 * creates a new bathroom in the database
 * @param {object} req request object
 * @param {object} res response object
 */
export async function createBathroom(req, res) {
  const bathroom = await db.createBathroom(req.body);
  if (bathroom) {
    res.status(201).send(bathroom);
  }
}
