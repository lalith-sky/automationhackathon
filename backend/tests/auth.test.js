/**
 * JARVIS OMEGA PROTOCOL - Authentication Tests
 * Tests for user registration, login, and authentication
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

describe('Authentication API Tests', () => {
    
    beforeAll(async () => {
        // Connect to test database
        const testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/jarvis-ai-test';
        await mongoose.connect(testDbUri);
    });

    afterAll(async () => {
        // Clean up and close connection
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear users before each test
        await User.deleteMany({});
    });

    describe('POST /api/auth/register', () => {
        
        test('Should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe('test@example.com');
            expect(response.body.user).not.toHaveProperty('password');
        });

        test('Should fail with missing username', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        test('Should fail with invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'invalid-email',
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        test('Should fail with short password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'short'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        test('Should fail with duplicate email', async () => {
            // Create first user
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser1',
                    email: 'test@example.com',
                    password: 'password123'
                });

            // Try to create second user with same email
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser2',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        
        beforeEach(async () => {
            // Create a test user
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123'
                });
        });

        test('Should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe('test@example.com');
        });

        test('Should fail with incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
        });

        test('Should fail with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
        });

        test('Should fail with missing credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/auth/me', () => {
        
        let authToken;

        beforeEach(async () => {
            // Register and login to get token
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123'
                });
            
            authToken = response.body.token;
        });

        test('Should get current user with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe('test@example.com');
        });

        test('Should fail without token', async () => {
            const response = await request(app)
                .get('/api/auth/me');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
        });

        test('Should fail with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('PUT /api/auth/preferences', () => {
        
        let authToken;

        beforeEach(async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123'
                });
            
            authToken = response.body.token;
        });

        test('Should update user preferences', async () => {
            const response = await request(app)
                .put('/api/auth/preferences')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    theme: 'dark',
                    notifications: true
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('preferences');
            expect(response.body.preferences.theme).toBe('dark');
        });

        test('Should fail without authentication', async () => {
            const response = await request(app)
                .put('/api/auth/preferences')
                .send({
                    theme: 'dark'
                });

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/auth/logout', () => {
        
        let authToken;

        beforeEach(async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123'
                });
            
            authToken = response.body.token;
        });

        test('Should logout successfully', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
        });
    });

    describe('Password Security', () => {
        
        test('Should hash password before saving', async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123'
                });

            const user = await User.findOne({ email: 'test@example.com' });
            expect(user.password).not.toBe('password123');
            expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
        });

        test('Should validate password correctly', async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123'
                });

            const user = await User.findOne({ email: 'test@example.com' });
            const isValid = await user.comparePassword('password123');
            expect(isValid).toBe(true);

            const isInvalid = await user.comparePassword('wrongpassword');
            expect(isInvalid).toBe(false);
        });
    });

    describe('JWT Token', () => {
        
        test('Should generate valid JWT token', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123'
                });

            const token = response.body.token;
            expect(token).toBeTruthy();
            expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
        });

        test('Should include user ID in token payload', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123'
                });

            const token = response.body.token;
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            expect(payload).toHaveProperty('userId');
        });
    });
});
