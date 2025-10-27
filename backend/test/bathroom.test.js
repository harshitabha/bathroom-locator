import {describe, it, test, beforeAll, afterAll, expect} from 'vitest';
import supertest from 'supertest';
import http from 'http';

import * as db from './db.js';
import app from '../src/index.js';

test('adds two numbers correctly', () => {
  expect(1+2).toBe(3);
});

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
