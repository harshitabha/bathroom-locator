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

/**
 * generates a sample like
 * @returns {Array} like containing userId and bathroomId
 */
async function getSampleLike() {
  const bathroomId = await request.get(`/bathroom`)
      .then((bathrooms) => {
        const bathroomId = bathrooms.body[0].id;
        return bathroomId;
      });
  const like = {
    'userId': '6697fe75-586e-4f24-9c56-243d15d1d9f0',
    'bathroomId': bathroomId,
  };

  return like;
}

describe('POST Like Endpoint', () => {
  it('should successfully add a like to the userLikes table', async () => {
    const like = await getSampleLike();
    await request.post(`/user/likes`)
        .send(like)
        .expect(201);
  });

  it('should create and increment likes if column doesn\'t exist', async () => {
    const like = await getSampleLike();
    await request.post(`/user/likes`)
        .send(like);
    await request.get(`/bathroom`)
        .then((data) => {
          const bathroom = data.body.find((b) => b.id === like.bathroomId);
          expect(bathroom.id).toBe(like.bathroomId);
          expect(bathroom.likes).toBe(1);
        });
  });

  it('shouldn\'t add a repeating like', async () => {
    const like = await getSampleLike();
    await request.post(`/user/likes`)
        .send(like);
    await request.post(`/user/likes`)
        .send(like)
        .expect(400);
  });

  it('should\'t increment bathroom\'s likes for a repeating like', async () => {
    const like = await getSampleLike();
    await request.post(`/user/likes`)
        .send(like);
    await request.post(`/user/likes`)
        .send(like);
    await request.get(`/bathroom`)
        .then((data) => {
          const bathroom = data.body.find((b) => b.id === like.bathroomId);
          expect(bathroom.likes).toBe(1);
        });
  });

  it('should increment the bathroom\'s existing likes', async () => {
    const like = await getSampleLike();
    const like2 = {
      'userId': '6697fe75-586e-4f24-9c56-243d15d1d9f1',
      'bathroomId': like.bathroomId,
    };
    await request.post(`/user/likes`)
        .send(like);
    await request.post(`/user/likes`)
        .send(like2);
    await request.get(`/bathroom`)
        .then((data) => {
          const bathroom = data.body.find((b) => b.id === like.bathroomId);
          expect(bathroom.likes).toBe(2);
        });
  });
});
