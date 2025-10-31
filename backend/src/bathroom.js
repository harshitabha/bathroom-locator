import * as db from './db.js';

/**
 * returns all the bathrooms in the database
 * @param {*} req request object
 * @param {*} res response object
 */
export async function getBathrooms(req, res) {
  const bathrooms = await db.getBathrooms();
  if (bathrooms.length > 0) {
    res.status(200).json(bathrooms);
  } else {
    res.status(404).send();
  }
}

let clients = [];
/**
 * 
 */
export async function getUpdates(req, res) {
  req.setTimeout(0);

  clients.push(res);

  // remove after 30 seconds (no new data)
  setTimeout(() => {
    clients = clients.filter(c => c !== res);
    res.json([]); // no updates, send empty
  }, 30000);
}

/**
 * Called when a new bathroom is added to notify waiting clients
 */
export async function notifyNewBathroom(newBathroom) {
  clients.forEach(c => c.json([newBathroom]));
  clients = []; // clear all waiting clients
}