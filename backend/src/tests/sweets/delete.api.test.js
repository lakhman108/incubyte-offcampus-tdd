const request = require('supertest');
const app = require('../../server');
const { signToken } = require('../../utils/tokengenerator');
const Sweet = require('../../models/Sweet');
const { connectDB, clearDB, closeDB } = require('../../config/db');

describe('DELETE /api/sweets/:id', () => {
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
      name: 'Test Sweet',
      category: 'chocolate',
      price: 5.0,
      quantity: 100
    });
    sweetId = sweet._id;
  });

  afterAll(async () => {
    await clearDB();
    await closeDB();
  });

  it('should require authentication', async () => {
    const response = await request(app).delete(`/api/sweets/${sweetId}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'No token provided');
  });

  it('should reject non-admin users', async () => {
    const response = await request(app)
      .delete(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Admin access required');
  });

  it('should delete sweet with admin token', async () => {
    const response = await request(app)
      .delete(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');

    const deletedSweet = await Sweet.findById(sweetId);
    expect(deletedSweet).toBeNull();
  });

  it('should return 404 for non-existent sweet', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const response = await request(app)
      .delete(`/api/sweets/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });
});
