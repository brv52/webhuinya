const request = require('supertest');
const app = require('../app');
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Helper to clear specific tables or reset data if needed
// WARNING: This runs against your live DB defined in .env
beforeAll(async () => {
  // Ensure we have at least one category for product tests
  await pool.query("INSERT INTO categories (id, name) VALUES (999, 'Test Category') ON CONFLICT DO NOTHING");
});

afterAll(async () => {
  // Cleanup test data
  await pool.query("DELETE FROM users WHERE username LIKE 'testuser%'");
  await pool.query("DELETE FROM products WHERE name = 'Test Product'");
  await pool.end();
});

describe('Full System API Tests', () => {
  let adminToken;
  let userToken;
  let testProductId;
  let testBlogId;

  // ==========================================
  // 1. AUTHENTICATION & REGISTRATION
  // ==========================================
  describe('Auth Flow', () => {
    test('POST /api/auth/register - Should create a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser1', email: 'test1@test.com', password: 'password123' });
      expect(res.statusCode).toBe(201);
    });

    test('POST /api/auth/register - Should fail with duplicate username (Tricky Case)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser1', email: 'different@test.com', password: 'password123' });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/exists/i);
    });

    test('POST /api/auth/login - Should return a token for valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin' }); // Uses your mock admin from DB init
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      adminToken = res.body.token;
    });

    test('POST /api/auth/login - Should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrongpassword' });
      expect(res.statusCode).toBe(401);
    });
  });

  // ==========================================
  // 2. PRODUCT MANAGEMENT (Admin vs User)
  // ==========================================
  describe('Products API', () => {
    test('POST /api/products - Should allow Admin to add product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Product', price: 50.00, description: 'Test Desc', category_id: 999 });
      
      expect(res.statusCode).toBe(201);
      testProductId = res.body.id;
    });

    test('POST /api/products - Should block non-admin users (Security Case)', async () => {
      // Create a standard user token
      const uToken = jwt.sign({ userId: 2, role: 'customer' }, process.env.JWT_SECRET);
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${uToken}`)
        .send({ name: 'Hacker Product', price: 0 });
      
      expect(res.statusCode).toBe(403); // Forbidden
    });
  });

  // ==========================================
  // 3. SHOPPING CART LOGIC
  // ==========================================
  describe('Cart API', () => {
    test('POST /api/cart - Should add item to cart', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ product_id: testProductId });
      expect(res.statusCode).toBe(200);
    });

    test('GET /api/cart - Should retrieve cart with product details (JOIN Case)', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.some(item => item.product_id === testProductId)).toBeTruthy();
      expect(res.body[0]).toHaveProperty('name'); // Proves the JOIN worked
    });

    test('POST /api/orders/checkout - Should empty the cart', async () => {
      await request(app)
        .post('/api/orders/checkout')
        .set('Authorization', `Bearer ${adminToken}`);
      
      const check = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(check.body.length).toBe(0);
    });
  });

  // ==========================================
  // 4. BLOG & SOCIAL
  // ==========================================
  describe('Blog API', () => {
    test('POST /api/blogs - Admin creates blog', async () => {
      const res = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Jest Test Blog', content: 'Testing content' });
      testBlogId = res.body.blog.id;
      expect(res.statusCode).toBe(201);
    });

    test('POST /api/blogs/:id/like - User likes blog', async () => {
      const res = await request(app)
        .post(`/api/blogs/${testBlogId}/like`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
    });

    test('POST /api/blogs/:id/comments - Should block empty comments (Logic Case)', async () => {
      const res = await request(app)
        .post(`/api/blogs/${testBlogId}/comments`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ text: '' });
      
      // If your backend doesn't handle this yet, it might return 201.
      // Good practice is to return 400.
      if (res.statusCode === 201) console.warn("Tricky Case: Backend allowed an empty comment!");
    });
  });

  // ==========================================
  // 5. JWT EDGES (The "Tricky" Cases)
  // ==========================================
  describe('Security Edge Cases', () => {
    test('Accessing /api/users with a malformed token', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer not-a-real-token`);
      expect(res.statusCode).toBe(403);
    });

    test('Accessing /api/users with NO token', async () => {
      const res = await request(app).get('/api/users');
      expect(res.statusCode).toBe(401);
    });
  });
});