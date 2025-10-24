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

export async function createBathroom(req, res) {
  const bathroom = await db.createBathroom(req.body);
  if (bathroom) {
    res.status(201).send(bathroom);
  }
}