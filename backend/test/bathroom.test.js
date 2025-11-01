import {describe, it, test, beforeAll, afterAll, expect} from 'vitest';
import supertest from 'supertest';
import http from 'http';

import * as db from './db.js';
import app from '../src/index.js';

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
          expect(first.details).toBe('more details');
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

describe('POST Bathroom Endpoint', () => {
  const bathroom = {
    'name': 'New Bathroom',
    'position': {
      'lat': 36.996621249644626,
      'lng': -122.0626488260964
    },
    'details': 'next to media theater, very large'
  }
  it('should create a new bathroom and return it', async () => {
    await request.post(`/bathroom`)
        .send(bathroom)
        .then((data) => {
          const newBathroom = data.body;
          expect(201);
          expect(newBathroom).toHaveProperty('id');
          expect(newBathroom.name).toBe(bathroom.name);
          expect(newBathroom.position.lat).toBe(bathroom.position.lat);
          expect(newBathroom.details).toBe(bathroom.details);
        });
  });
  it('should then exist in the database', async () => {
    await request.get(`/bathroom`)
        .then((data) => {
          expect(200);
          expect(data.body.length).toBe(10);
        });
  });
});