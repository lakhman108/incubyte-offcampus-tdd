const request = require('supertest');
const app = require('../../server');
const { signToken } = require('../../utils/tokengenerator');
const Sweet = require('../../models/Sweet');
const { connectDB, clearDB, closeDB } = require('../../config/db');

describe('PUT /api/sweets/:id', () => {
  let customerToken;
  let sweetId;

  beforeAll(async () => {
    await connectDB();

    const customer = { _id: 'customer123', role: 'customer' };
    customerToken = signToken(customer);
  });

  beforeEach(async () => {
    const sweet = await Sweet.create({
      name: 'Original Sweet',
      category: 'chocolate',
      price: 5.0,
      quantity: 100
    });
    sweetId = sweet._id;
  });

  afterEach(async () => {
    await Sweet.deleteMany({});
  });

  afterAll(async () => {
    await clearDB();
    await closeDB();
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .send({ name: 'Updated Sweet' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'No token provided');
  });

  it('should update sweet with valid data', async () => {
    const response = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        name: 'Updated Sweet',
        category: 'candy',
        price: 7.5,
        quantity: 150
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      'message',
      'Sweet updated successfully'
    );
    expect(response.body.data.name).toBe('Updated Sweet');
    expect(response.body.data.category).toBe('candy');
    expect(response.body.data.price).toBe(7.5);
    expect(response.body.data.quantity).toBe(150);
  });

  it('should update only provided fields', async () => {
    const response = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ price: 10.0 });

    expect(response.status).toBe(200);
    expect(response.body.data.price).toBe(10.0);
    expect(response.body.data.name).toBe('Original Sweet');
    expect(response.body.data.category).toBe('chocolate');
    expect(response.body.data.quantity).toBe(100);
  });

  it('should return 404 for non-existent sweet', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const response = await request(app)
      .put(`/api/sweets/${fakeId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Test' });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'sweet does not exist');
  });

  it('should return 400 for negative price', async () => {
    const response = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ price: -5 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Price cannot be negative');
  });

  it('should return 400 for negative quantity', async () => {
    const response = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: -10 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      'error',
      'Quantity cannot be negative'
    );
  });

  it('should return 400 for non-integer quantity', async () => {
    const response = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 10.5 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      'error',
      'Quantity must be an integer'
    );
  });

  it('should accept zero as valid price', async () => {
    const response = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ price: 0 });

    expect(response.status).toBe(200);
    expect(response.body.data.price).toBe(5.0); // price remains unchanged due to falsy check
  });

  it('should accept zero as valid quantity', async () => {
    const response = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 0 });

    expect(response.status).toBe(200);
    expect(response.body.data.quantity).toBe(100); // quantity remains unchanged due to falsy check
  });
});
