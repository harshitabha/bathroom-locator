import {describe, it, beforeAll, afterAll, expect} from 'vitest';
import supertest from 'supertest';
import http from 'http';

import * as db from './db.js';
import app from '../src/index.js';

import {notifyNewBathroom} from '../src/bathroom.js';

let server;
let request;

beforeAll(() => {
  server = http.createServer(app);
  server.listen();
  request = supertest(server);
  return db.reset();
});

afterAll(async () => {
  db.close();
  await server.close();
});

describe('GET Bathroom Endpoint', () => {
  it('should get all bathrooms', async () => {
    await request.get(`/bathroom`)
        .then((data) => {
          expect(200);
          expect(data.body.length).toBe(9);
        });
  });

  it('should return the correct bathroom data', async () => {
    await request.get(`/bathroom`)
        .then((data) => {
          const first = data.body[0];
          expect(first.id).toBe('5f1169fe-4db2-48a2-b059-f05cfe63588b');
          expect(first.name).toBe('Namaste Lounge Bathroom');
          expect(first.position.lat).toBe(37.00076576303953);
          expect(first.position.lng).toBe(-122.05719563060227);
          expect(first.description).toBe('more details');
          expect(first.num_stalls).toBe(1);
          expect(first.amenities.toilet_paper).toBe(true);
          expect(first.amenities.hand_dryer).toBe(false);
          expect(first.likes).toBe(0);
        });
  });
});

describe('GET bathroom with bounds', () => {
  it('should get bathrooms within the bounds', async () => {
    await request
        .get('/bathroom')
        .query({
          minLng: 2.33,
          minLat: 48.85,
          maxLng: 2.34,
          maxLat: 48.86,
        })
        .then((data) => {
          expect(data.status).toBe(200);
          expect(data.body.length).toBe(2);
          for (const b of data.body) {
            expect(b.position.lat).toBeGreaterThanOrEqual(48.85);
            expect(b.position.lat).toBeLessThanOrEqual(48.86);
            expect(b.position.lng).toBeGreaterThanOrEqual(2.33);
            expect(b.position.lng).toBeLessThanOrEqual(2.34);
          }
        });
  });

  it('should get nothing when no bathrooms are inside the bounds', async () => {
    await request
        .get('/bathroom')
        .query({
          minLng: 0,
          minLat: 0,
          maxLng: 0.001,
          maxLat: 0.001,
        })
        .then((data) => {
          expect(data.status).toBe(200);
          expect(data.body.length).toBe(0);
        });
  });
});

describe('GET /bathroom/updates endpoint', () => {
  // simulate new bathroom
  const newBathroom = {
    'id': 'cf0c26a5-fa2e-4685-8120-feafc76eb009',
    'name': 'New Bathroom',
    'position': {
      'lat': 36.996621249644626,
      'lng': -122.0626488260964,
    },
    'description': 'more details',
    'num_stalls': 1,
    'amenities': {
      'toilet_paper': true,
      'soap': true,
      'paper_towel': true,
      'hand_dryer': false,
      'menstrual_products': true,
      'mirror': true,
    },
  };

  it('should wait and receive new bathroom updates', async () => {
    const getUpdates = supertest(app).get('/bathroom/updates');

    setTimeout(() => {
      notifyNewBathroom(newBathroom);
    }, 100);

    const response = await getUpdates;
    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toEqual(newBathroom);
  }, 5000);
  it('should timeout and return empty after 30 seconds', async () => {
    const response = await supertest(app).get('/bathroom/updates');
    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });
});

describe('POST Bathroom Endpoint', () => {
  const bathroom = {
    'name': 'New Bathroom',
    'position': {
      'lat': 36.996621249644626,
      'lng': -122.0626488260964,
    },
    'description': 'next to media theater, very large',
    'num_stalls': 1,
    'amenities': {
      'toilet_paper': true,
      'soap': true,
      'paper_towel': true,
      'hand_dryer': false,
      'menstrual_products': true,
      'mirror': true,
    },
  };
  it('should return a 201 status code', async () => {
    await request.post(`/bathroom`)
        .send(bathroom)
        .expect(201);
  });
  it('should create a new bathroom and return it', async () => {
    await request.post(`/bathroom`)
        .send(bathroom)
        .then((data) => {
          const newBathroom = data.body;
          expect(newBathroom).toHaveProperty('id');
          expect(newBathroom.name).toBe(bathroom.name);
          expect(newBathroom.position.lat).toBe(bathroom.position.lat);
          expect(newBathroom.description).toBe(bathroom.description);
          expect(newBathroom.num_stalls).toBe(bathroom.num_stalls);
          expect(newBathroom.amenities).toEqual(bathroom.amenities);
        });
  });
  it('should then exist in the database', async () => {
    await request.get(`/bathroom`)
        .then((data) => {
          expect(200);
          expect(data.body.length).toBe(11);
        });
  });
});

describe('PUT Bathroom Endpoint', () => {
  /**
   * returns an arbitrary bathroom object
   * @returns {object} a bathroom object
   */
  async function getBathroom() {
    let bathroom;
    await request.get(`/bathroom`)
        .then((bathrooms) => {
          bathroom = bathrooms.body[0];
        });
    return bathroom;
  }

  it('should return a 200 status code', async () => {
    const bathroom = await getBathroom();
    bathroom.name = 'STATUS CODE TEST';
    await request.put(`/bathroom`)
        .send(bathroom)
        .expect(200);
  });

  it('should return the updated bathroom', async () => {
    const bathroom = await getBathroom();
    bathroom.name = 'RETURN VALUE TEST';
    await request.put(`/bathroom`)
        .send(bathroom)
        .then((data) => {
          expect(data.body).toEqual(bathroom);
        });
  });

  it('should update the bathroom', async () => {
    const bathroom = await getBathroom();
    bathroom.name = 'UPDATED TEST';
    await request.put(`/bathroom`)
        .send(bathroom);
    await request.get(`/bathroom`)
        .then((data) => {
          const updatedBathroom = data.body.find((b) => b.id === bathroom.id);
          expect(updatedBathroom.id).toBe(bathroom.id);
          expect(updatedBathroom.name).toBe(bathroom.name);
        });
  });

  it('should return a 400 status code on an invalid input', async () => {
    const bathroom = await getBathroom();
    bathroom.num_stalls = 'invalid input';
    await request.put(`/bathroom`)
        .send(bathroom)
        .expect(400);
  });

  it('should not update the bathroom on an invalid input', async () => {
    const bathroom = await getBathroom();
    const actualNumStalls = bathroom.num_stalls;
    bathroom.num_stalls = 'invalid input';
    await request.put(`/bathroom`)
        .send(bathroom);
    await request.get(`/bathroom`)
        .then((data) => {
          const updatedBathroom = data.body.find((b) => b.id === bathroom.id);
          expect(updatedBathroom.id).toBe(bathroom.id);
          expect(updatedBathroom.num_stalls).toBe(actualNumStalls);
        });
  });

  it('should return a 404 status code if bathroom doesn\'t exist', async () => {
    const bathroom = await getBathroom();
    bathroom.id = '6d6a6a5f-217d-4fea-9ab4-1f21ea2c1b0b';
    await request.put(`/bathroom`)
        .send(bathroom)
        .expect(404);
  });
});
