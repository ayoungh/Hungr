const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

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

describe('Auth flow', () => {
  it('registers and logs in a user', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    const registerRes = await request(app)
      .post('/api/users')
      .send({ email, password })
      .expect(200);

    expect(registerRes.body.email).toBe(email);

    const loginRes = await request(app)
      .post('/api/login')
      .send({ email, password })
      .expect(200);

    expect(loginRes.body.token).toBeDefined();
    expect(loginRes.body.user.email).toBe(email);
  });

  it('rejects short passwords', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'short@example.com', password: 'short' })
      .expect(400);

    expect(res.body.error).toMatch(/Password must be at least 8/);
  });
});
