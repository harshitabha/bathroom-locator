import * as db from './db.js';

/**
 * returns all the bathrooms in the database
 * @param {object} req request object
 * @param {object} res response object
 */
export async function getBathrooms(req, res) {
  const bathrooms = await db.getBathrooms();
  res.status(200).json(bathrooms);
}

export let clients = [];
// use shorter timeout for tests
const LONG_POLL_TIMEOUT = process.env.NODE_ENV === 'test' ? 1000 : 30000;
/**
 * @param {object} req request object
 * @param {object} res response object
 * @returns {Array} array of bathrooms in the bounds
 */
export async function getUpdates(req, res) {
  try {
    req.setTimeout(0);
    const client = {res, sent: false};
    clients.push(client);

    if (typeof global.clientRegistered === 'function') {
      global.clientRegistered();
    }

    const timer = setTimeout(() => {
      if (!client.sent) {
        client.sent = true;
        clients = clients.filter((c) => c !== client);
        res.json([]); // no updates, send empty
      }
    }, LONG_POLL_TIMEOUT);

    res.on('close', () => {
      if (!client.sent) {
        client.sent = true;
        clearTimeout(timer);
        clients = clients.filter((c) => c !== client);
      }
    });
  } catch (err) {
    console.error('Error in getUpdates:', err);
    if (!res.headersSent) {
      res.status(500).json({error: 'Internal Server Error'});
    }
  }
}

/**
 * Called when a new bathroom is added to notify waiting clients
 * @param {object} newBathroom - The new bathroom that was added.
 */
export async function notifyNewBathroom(newBathroom) {
  clients.forEach((client) => {
    if (!client.sent) {
      client.sent = true;
      client.res.json([newBathroom]);
    }
  });
  clients = clients.filter((client) => client.sent === false);
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
  // Notify long-poll clients
  notifyNewBathroom(bathroom);
  if (bathroom) {
    res.status(201).send(bathroom);
  }
}

/**
 * update a bathroom
 * @param {object} req request object
 * @param {object} res response object
 */
export async function updateBathroom(req, res) {
  try {
    await db.updateBathroom(req.body);
    // notifyNewBathroom(bathroom);  // do i need this for real time updates?
    res.status(204).send();
  } catch (err) {
    console.error('Error in updateBathroom:', err);
  }
}

/**
 * gets user's liked bathrooms
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} empty object for now
 */
export async function getUserLikes(req, res) {
  const {userId} = req.query;
  const bathroomIds = await db.getUserLikes(userId);
  return res.status(200).json(bathroomIds);
}

/**
 * creates a new like in userLikes and adds a like to the bathroom
 * @param {object} req request object
 * @param {object} res response object
 */
export async function likeBathroom(req, res) {
  try {
    await db.likeBathroom(req.body.userId, req.body.bathroomId);
    res.status(201).send();
  } catch (err) {
    console.error('Error in likeBathroom:', err);
    res.status(400).send();
  }
}

/**
 * removes like in userLikes and decrements bathroom likes
 * @param {object} req request object
 * @param {object} res response object
 */
export async function unlikeBathroom(req, res) {
  try {
    await db.unlikeBathroom(req.body.userId, req.body.bathroomId);
    res.status(200).send();
  } catch (err) {
    console.error('Error in unlikeBathroom:', err);
    res.status(404).send();
  }
}
