const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

const registerAndLogin = async () => {
  const email = `usertester+${Date.now()}@example.com`;
  const password = 'password123';

  await request(app)
    .post('/api/users')
    .send({ email, password })
    .expect(200);

  const loginRes = await request(app)
    .post('/api/login')
    .send({ email, password })
    .expect(200);

  return loginRes.body.token;
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.DB = mongoServer.getUri();
  process.env.TOKEN_SECRET = 'test-token-secret';
  process.env.SESSION_SECRET = 'test-session-secret';

  app = require('../server');
  await mongoose.connection.asPromise();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Users endpoints', () => {
  it('lists users when authenticated', async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('rejects invalid emails on registration', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'not-an-email', password: 'password123' })
      .expect(400);

    expect(res.body.error).toMatch(/Email address not valid/);
  });

  it('rejects duplicate registrations', async () => {
    const payload = { email: 'duplicate@example.com', password: 'password123' };

    await request(app)
      .post('/api/users')
      .send(payload)
      .expect(200);

    const res = await request(app)
      .post('/api/users')
      .send(payload)
      .expect(400);

    expect(res.body.error).toMatch(/already found/i);
  });

  it('updates and deletes a user', async () => {
    const token = await registerAndLogin();

    const listRes = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const userId = listRes.body.data?.[0]?._id;
    expect(userId).toBeTruthy();

    const updateRes = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'updated@example.com' })
      .expect(200);

    expect(updateRes.body.email).toBe('updated@example.com');

    await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
