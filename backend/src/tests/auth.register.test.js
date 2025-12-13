const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const { connectDB, clearDB, closeDB } = require('../config/db');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await clearDB();
    await closeDB();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('Post /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const res = await request(app).post('/api/auth/register').send(userData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty(
        'message',
        'User registered successfully'
      );
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('username', userData.username);
      expect(res.body.user).toHaveProperty('email', userData.email);
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should return 400 when email is missing', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123'
      };

      const res = await request(app).post('/api/auth/register').send(userData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('should return 400 when password is missing', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'john',
        email: 'john@example.com'
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
    test('should return 400 when username is missing', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'john@example.com',
        password: 'password123'
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 when invalid mail is provided', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'john',
        email: 'john#example.com',
        password: 'password123'
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should return 409 for duplicate email', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'john1',
        email: 'john@gmail.com',
        password: 'password@123'
      });

      const response = await request(app).post('/api/auth/register').send({
        username: 'john2',
        email: 'john@gmail.com',
        password: 'password@123'
      });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 password length is less than 6', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'john',
        email: 'john@example.com',
        password: 'passw'
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 password length is greater than 20', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'john',
        email: 'john@example.com',
        password: 'passwpasswpasswpassw1'
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
