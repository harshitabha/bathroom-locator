import * as db from './model/db.js';


export let clients = [];
// use shorter timeout for tests
const LONG_POLL_TIMEOUT = process.env.NODE_ENV === 'test' ? 1000 : 30000;
/**
 * @param {object} req request object
 * @param {object} res response object
 * @returns {Array} array of bathrooms in the bounds
 */
export async function getUpdates(req, res) {
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

  // limit # of bathrooms fetched, up to 200
  const lim = limit ?
    Math.max(1, Math.min(parseInt(limit, 10), 200)) : 200;

  // bounds dont cross anti-meridian, return results normally
  if (minLng <= maxLng) {
    const bathrooms = await db.getBathroomsInBounds(
        minLng,
        minLat,
        maxLng,
        maxLat,
        lim,
    );
    if (bathrooms.length > 0) {
      return res.status(200).json(bathrooms);
    } else {
      return res.status(200).json([]);
    }
  }

  // bounds cross anti-meridian, split into two before returning results
  const left =
    await db.getBathroomsInBounds(minLng, minLat, 180, maxLat, lim);
  const right =
    await db.getBathroomsInBounds(-180, minLat, maxLng, maxLat, lim);
  const bathrooms = [...left, ...right].slice(0, lim);
  return res.status(200).json(bathrooms);
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
