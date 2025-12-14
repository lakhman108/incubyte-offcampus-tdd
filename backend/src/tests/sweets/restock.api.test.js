const request = require('supertest');
const app = require('../../server');
const { signToken } = require('../../utils/tokengenerator');
const Sweet = require('../../models/Sweet');
const { connectDB, clearDB, closeDB } = require('../../config/db');

describe('POST /api/sweets/:id/restock', () => {
  let adminToken;
  let customerToken;
  let sweetId;

  beforeAll(async () => {
    await connectDB();

    const admin = { _id: 'admin123', role: 'admin' };
    const customer = { _id: 'customer123', role: 'customer' };

    adminToken = signToken(admin);
    customerToken = signToken(customer);

    const sweet = await Sweet.create({
      name: 'Chocolate Bar',
      category: 'chocolate',
      price: 5.0,
      quantity: 10
    });
    sweetId = sweet._id;
  });

  afterAll(async () => {
    await clearDB();
    await closeDB();
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .send({ quantity: 5 });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'No token provided');
  });

  it('should reject non-admin users', async () => {
    const response = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 5 });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Admin access required');
  });

  it('should allow admin to restock sweet', async () => {
    const response = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 20 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.sweet.quantity).toBe(30);
  });

  it('should increase sweet quantity after restock', async () => {
    const beforeSweet = await Sweet.findById(sweetId);
    const initialQuantity = beforeSweet.quantity;

    await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 15 });

    const afterSweet = await Sweet.findById(sweetId);
    expect(afterSweet.quantity).toBe(initialQuantity + 15);
  });

  it('should return 400 for invalid quantity', async () => {
    const response = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: -5 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 404 for non-existent sweet', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const response = await request(app)
      .post(`/api/sweets/${fakeId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 10 });

    expect(response.status).toBe(404);
  });
});
