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
