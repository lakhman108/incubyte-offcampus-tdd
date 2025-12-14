const request = require('supertest');
const app = require('../../server');
const { signToken } = require('../../utils/tokengenerator');
const Sweet = require('../../models/Sweet');
const { connectDB, clearDB, closeDB } = require('../../config/db');

describe('POST /api/sweets/:id/purchase', () => {
  let customerToken;
  let sweetId;

  beforeAll(async () => {
    await connectDB();

    const customer = { _id: 'customer123', role: 'customer' };
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
      .post(`/api/sweets/${sweetId}/purchase`)
      .send({ quantity: 1 });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'No token provided');
  });

  it('should allow customer to purchase sweet', async () => {
    const response = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 2 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.sweet.quantity).toBe(8);
  });

  it('should return 400 when quantity is 0 or out of stock', async () => {
    await Sweet.findByIdAndUpdate(sweetId, { quantity: 0 });

    const response = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 1 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 when purchase quantity exceeds available stock', async () => {
    await Sweet.findByIdAndUpdate(sweetId, { quantity: 5 });

    const response = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 10 });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('stock');
  });

  it('should return 404 for non-existent sweet', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const response = await request(app)
      .post(`/api/sweets/${fakeId}/purchase`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 1 });

    expect(response.status).toBe(404);
  });
});
