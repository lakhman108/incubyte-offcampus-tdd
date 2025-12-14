const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Sweet = require('../../models/Sweet');
const User = require('../../models/User');
const { signToken } = require('../../utils/tokengenerator');
const { connectDB } = require('../../config/db');

describe('Sweet Search API', () => {
  let authToken;

  beforeAll(async () => {
    connectDB();

    const user = await User.create({
      username: 'searchuser',
      email: 'search@test.com',
      password: 'Password123!',
      role: 'customer'
    });
    authToken = signToken(user);

    await Sweet.create([
      {
        name: 'Chocolate Bar',
        category: 'chocolate',
        price: 2.5,
        quantity: 100
      },
      {
        name: 'Dark Chocolate',
        category: 'chocolate',
        price: 5.0,
        quantity: 50
      },
      {
        name: 'Strawberry Gummy',
        category: 'gummy',
        price: 1.5,
        quantity: 200
      },
      { name: 'Lemon Drops', category: 'candy', price: 3.0, quantity: 150 },
      { name: 'Caramel Chews', category: 'caramel', price: 4.0, quantity: 75 }
    ]);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .get('/api/sweets/search')
      .query({ name: 'chocolate' });

    expect(response.status).toBe(401);
  });

  it('should search sweets by name (case-insensitive)', async () => {
    const response = await request(app)
      .get('/api/sweets/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ name: 'chocolate' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(
      response.body.every((s) => s.name.toLowerCase().includes('chocolate'))
    ).toBe(true);
  });

  it('should search sweets by category', async () => {
    const response = await request(app)
      .get('/api/sweets/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ category: 'chocolate' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body.every((s) => s.category === 'chocolate')).toBe(true);
  });

  it('should search sweets by price range', async () => {
    const response = await request(app)
      .get('/api/sweets/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ minPrice: 2.0, maxPrice: 4.0 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body.every((s) => s.price >= 2.0 && s.price <= 4.0)).toBe(
      true
    );
  });

  it('should search with combined filters', async () => {
    const response = await request(app)
      .get('/api/sweets/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ category: 'chocolate', maxPrice: 3.0 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Chocolate Bar');
  });

  it('should return empty array when no matches found', async () => {
    const response = await request(app)
      .get('/api/sweets/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ name: 'nonexistent' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
});
