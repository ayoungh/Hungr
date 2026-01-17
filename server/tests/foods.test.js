const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

const registerAndLogin = async () => {
  const email = 'foodtester@example.com';
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

describe('Foods endpoints', () => {
  it('rejects unauthenticated requests', async () => {
    await request(app)
      .get('/api/foods')
      .expect(401);
  });

  it('creates and lists foods for authenticated users', async () => {
    const token = await registerAndLogin();

    await request(app)
      .post('/api/foods')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Tacos', image: 'https://example.com/tacos.jpg' })
      .expect(200);

    const listRes = await request(app)
      .get('/api/foods')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data.length).toBeGreaterThan(0);
    expect(listRes.body.data[0].name).toBe('Tacos');
  });

  it('validates food creation payload', async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post('/api/foods')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);

    expect(res.body.error).toMatch(/Food name is required/);
  });

  it('updates and deletes a food item', async () => {
    const token = await registerAndLogin();

    const createRes = await request(app)
      .post('/api/foods')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Temp Dish' })
      .expect(200);

    const foodId = createRes.body.data?._id;
    expect(foodId).toBeTruthy();

    const updateRes = await request(app)
      .put(`/api/foods/${foodId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Dish' })
      .expect(200);

    expect(updateRes.body.data?.name).toBe('Updated Dish');

    await request(app)
      .delete(`/api/foods/${foodId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const listRes = await request(app)
      .get('/api/foods')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const ids = (listRes.body.data || []).map((food) => food._id);
    expect(ids).not.toContain(foodId);
  });
});
