const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');

test('GET /api/v1/health returns API status', async () => {
  const response = await request(createApp()).get('/api/v1/health');

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
});

test('GET /api/v1/profile requires authentication', async () => {
  const response = await request(createApp()).get('/api/v1/profile');

  assert.equal(response.status, 401);
  assert.equal(response.body.message, 'Authentication required');
});

test('POST /api/v1/admin/login rejects invalid credentials', async () => {
  const response = await request(createApp())
    .post('/api/v1/admin/login')
    .send({ password: 'wrong-password' });

  assert.equal(response.status, 401);
  assert.equal(response.body.message, 'Incorrect admin password');
});

