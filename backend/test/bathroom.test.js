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

describe('GET Bathroom Endpoint', async () => {
  it('should get all bathrooms - status code', async () => {
    await request.get(`/bathroom`)
        .then((data) => {
          expect(200);
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
        });
  });
});

describe('GET bathroom with bounds', async () => {
  const position = {
    minLng: 2.33,
    minLat: 48.85,
    maxtLgn: 2.34,
    maxLat: 48.86,
  };

  it('status code', async () => {
    await request.get('/bathroom')
        .query({...position})
        .expect(200);
  });
  it('number of bathrooms returned', async () => {
    await request.get('/bathroom')
        .query({...position})
        .then((data) => {
          expect(data.body.length).toBe(2);
        });
  });

  it('Min latitute is within bounds', async () => {
    await request.get('/bathroom')
        .query({...position})
        .then((data) => {
          const minLatInBounds = data.body[0].position.lat >= position.minLat &&
              data.body[1].position.lat >= position.minLat;
          expect(minLatInBounds).toBe(true);
        });
  });

  it('Max latitute is within bounds', async () => {
    await request.get('/bathroom')
        .query({...position})
        .then((data) => {
          const maxLatInBounds = data.body[0].position.lat <= position.maxLat &&
              data.body[1].position.lat <= position.maxLat;
          expect(maxLatInBounds).toBe(true);
        });
  });

  it('Min logitude is within bounds', async () => {
    await request.get('/bathroom')
        .query({...position})
        .then((data) => {
          const maxLatInBounds = data.body[0].position.lat >= position.minLng &&
              data.body[1].position.lat >= position.minLng;
          expect(maxLatInBounds).toBe(true);
        });
  });

  it('Min logitude is within bounds', async () => {
    await request.get('/bathroom')
        .query({...position})
        .then((data) => {
          const inBounds = data.body[0].position.lat <= position.maxtLgn &&
              data.body[1].position.lat <= position.maxtLgn;
          expect(inBounds).toBe(true);
        });
  });

  it('Status code - no bathrooms recieved if not in bounds', async () => {
    await request.get('/bathroom')
        .query({
          minLng: 0,
          minLat: 0,
          maxLng: 0.001,
          maxLat: 0.001,
        })
        .expect(200);
  });

  it('Content length - no bathrooms recieved if not in bounds', async () => {
    await request.get('/bathroom')
        .query({
          minLng: 0,
          minLat: 0,
          maxLng: 0.001,
          maxLat: 0.001,
        })
        .then((data) => {
          expect(data.body.length).toBe(0);
        });
  });
});

describe('GET /bathroom/updates endpoint', () => {
  // TODO: Check in with Cheryl why web sockets weren't used
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
    const getUpdates = request.get('/bathroom/updates');

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
    const response = await request.get('/bathroom/updates');
    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
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
            bathroomId = data.body[0].id;
          });
      await request.get('/bathroom')
          .then((data) => {
            const inGet = data.body.some((b) => b.id == bathroomId);
            expect(inGet).toBe(true);
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
          .expect(200);
    });
  });
});
