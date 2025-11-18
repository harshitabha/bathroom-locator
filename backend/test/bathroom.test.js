import {describe, it, beforeAll, afterAll, expect, beforeEach} from 'vitest';
import supertest from 'supertest';
import http from 'http';

import * as db from './db.js';
import app from '../src/app.js';

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

describe('GET bathroom with bounds', async () => {
  const validBounds = {
    minLng: 2.33,
    minLat: 48.85,
    maxLng: 2.34,
    maxLat: 48.86,
    limit: 50,
  };

  const noBathroomBounds = {
    minLng: 0,
    minLat: 0,
    maxLng: 0.001,
    maxLat: 0.001,
  };

  it('status code', async () => {
    await request.get(`/bathroom`)
        .query(validBounds)
        .expect(200);
  });
  it('number of bathrooms returned', async () => {
    await request.get('/bathroom')
        .query(validBounds)
        .then((data) => {
          expect(data.body.length).toBe(2);
        });
  });

  it('Min latitute is within bounds', async () => {
    await request.get('/bathroom')
        .query(validBounds)
        .then((data) => {
          const minLatInBounds =
            data.body[0].position.lat >= validBounds.minLat &&
            data.body[1].position.lat >= validBounds.minLat;
          expect(minLatInBounds).toBe(true);
        });
  });

  it('Max latitute is within bounds', async () => {
    await request.get('/bathroom')
        .query({...validBounds})
        .then((data) => {
          const maxLatInBounds =
            data.body[0].position.lat <= validBounds.maxLat &&
            data.body[1].position.lat <= validBounds.maxLat;
          expect(maxLatInBounds).toBe(true);
        });
  });

  it('Min logitude is within bounds', async () => {
    await request.get('/bathroom')
        .query({...validBounds})
        .then((data) => {
          const maxLatInBounds =
            data.body[0].position.lng >= validBounds.minLng &&
            data.body[1].position.lng >= validBounds.minLng;
          expect(maxLatInBounds).toBe(true);
        });
  });

  it('Max logitude is within bounds', async () => {
    await request.get('/bathroom')
        .query({...validBounds})
        .then((data) => {
          const inBounds =
            data.body[0].position.lng <= validBounds.maxLng &&
            data.body[1].position.lng <= validBounds.maxLng;
          expect(inBounds).toBe(true);
        });
  });

  it('Status code - no bathrooms recieved if not in bounds', async () => {
    await request.get('/bathroom')
        .query(noBathroomBounds)
        .expect(200);
  });

  it('Content length - no bathrooms recieved if not in bounds', async () => {
    await request.get('/bathroom')
        .query(noBathroomBounds)
        .then((data) => {
          expect(data.body.length).toBe(0);
        });
  });
});

describe('GET /bathroom/updates endpoint', async () => {
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
    'gender': {
      'female': true,
      'male': false,
      'gender_neutral': false,
    },
  };
  let res;
  describe('Request doesn\'t timeout', async () => {
    beforeEach(async () => {
      const getUpdates = request.get('/bathroom/updates');

      setTimeout(() => {
        notifyNewBathroom(newBathroom);
      }, 100);

      res = await getUpdates;
    });

    it('Success Status code', async () => {
      expect(res.status).toBe(200);
    });

    it('Returns only the bathroom that was added', async () => {
      expect(res.body.length).toBe(1);
    });

    it('response should contain the new bathroom added', async () => {
      // Assertions
      expect(res.body[0]).toEqual(newBathroom);
    });
  });

  describe('Request times out', async () => {
    beforeEach(async () => {
      res = await request.get('/bathroom/updates');
    });
    it('Status code', async () => {
      expect(res.status).toBe(200);
    });

    it('Nothing is returned in the res', async () => {
      expect(res.body.length).toBe(0);
    });
  });
});

describe('Creating a bathroom', () => {
  describe('Basic Bathroom', async () => {
    const basicBathroom = {
      'name': 'Basic Bathroom',
      'position': {
        'lat': 36.996621249644626,
        'lng': -122.0626488260964,
      },
      'description': 'next to media theater, very large',
    };

    it('Status code', async () => {
      await request.post(`/bathroom`)
          .send(basicBathroom)
          .expect(201);
    });

    it('Existing in database after creation', async () => {
      let bathroomId;
      await request.post(`/bathroom`)
          .send(basicBathroom)
          .then((data) => {
            bathroomId = data.body.id;
          });
      await request.get('/bathroom')
          .query({
            minLat: basicBathroom.position.lat - 0.01,
            minLng: basicBathroom.position.lng - 0.01,
            maxLat: basicBathroom.position.lat + 0.01,
            maxLng: basicBathroom.position.lng + 0.01,
          })
          .then((data) => {
            const inDatabase = data.body.some((b) => b.id == bathroomId);
            expect(inDatabase).toBe(true);
          });
    });

    it('Fails if there are any unexpected properties', async () => {
      await request.post('/bathroom')
          .send({
            ...basicBathroom,
            description: 123,
          })
          .expect(400);
    });
  });

  describe('Complex Bathroom', async () => {
    const complexBathroom = {
      'name': 'Complex Bathroom',
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
      'gender': {
        'female': true,
        'male': false,
        'gender_neutral': false,
      },
    };

    it('Status code', async () => {
      await request.post(`/bathroom`)
          .send(complexBathroom)
          .expect(201);
    });
  });
});
