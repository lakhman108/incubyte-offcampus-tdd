const request = require('supertest');
const app = require('../../server');
const { signToken } = require('../../utils/tokengenerator');
const Sweet = require('../../models/Sweet');
const { connectDB, clearDB, closeDB } = require('../../config/db');

describe('POST /api/sweets', () => {
  let customerToken;

  beforeAll(async () => {
    await connectDB();

    const customer = { _id: 'customer123', role: 'customer' };
    customerToken = signToken(customer);
  });

  afterEach(async () => {
    await Sweet.deleteMany({});
  });

  afterAll(async () => {
    await clearDB();
    await closeDB();
  });

  it('should reject request without token', async () => {
    const res = await request(app).post('/api/sweets').send({
      name: 'Chocolate Bar',
      category: 'chocolate',
      price: 2.99,
      quantity: 50
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'No token provided');
  });

  it('should reject request with invalid token', async () => {
    const res = await request(app)
      .post('/api/sweets')
      .set('Authorization', 'Bearer invalid-token')
      .send({
        name: 'Chocolate Bar',
        category: 'chocolate',
        price: 2.99,
        quantity: 50
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid token');
  });

  it('should create sweet with valid token', async () => {
    const res = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        name: 'Chocolate Bar',
        category: 'chocolate',
        price: 2.99,
        quantity: 50
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('name', 'Chocolate Bar');
    expect(res.body).toHaveProperty('category', 'chocolate');
    expect(res.body).toHaveProperty('price', 2.99);
    expect(res.body).toHaveProperty('quantity', 50);
  });
});
