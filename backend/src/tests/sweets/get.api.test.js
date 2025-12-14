const request = require('supertest');
const app = require('../../server');
const { signToken } = require('../../utils/tokengenerator');
const Sweet = require('../../models/Sweet');
const { connectDB, clearDB, closeDB } = require('../../config/db');

describe('GET /api/sweets', () => {
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
    const res = await request(app).get('/api/sweets');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'No token provided');
  });

  it('should return empty array when no sweets exist', async () => {
    const res = await request(app)
      .get('/api/sweets')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return all sweets', async () => {
    await Sweet.create([
      { name: 'Chocolate', category: 'chocolate', price: 2.99, quantity: 50 },
      { name: 'Gummy Bears', category: 'gummy', price: 1.99, quantity: 100 }
    ]);

    const res = await request(app)
      .get('/api/sweets')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});
