import {describe, it, beforeAll, afterAll, expect} from 'vitest';
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

describe('POST Like Endpoint', () => {
  // like namaste lounge bathroom
  // UPDATE : change this to use get API to get a bathroom id
  // so it updates with any changes
  const like = {
    'userId': '6697fe75-586e-4f24-9c56-243d15d1d9f0',
    'bathroomId': '5f1169fe-4db2-48a2-b059-f05cfe63588b',
  };
  it('should successfully add a like to the userLikes table', async () => {
    await request.post(`/user/likes`)
        .send(like)
        .expect(201);
  });

  it('should increment the bathroom\'s likes', async () => {
    await request.get(`/bathroom`)
        .then((data) => {
          const bathroom = data.body.find((b) => b.id === like.bathroomId);
          expect(bathroom.likes).toBe(1);
        });
  });
});
