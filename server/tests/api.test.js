const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const request = require('supertest');

const serverSrcRoot = path.join(__dirname, '..', 'src');

function clearServerCache() {
  for (const key of Object.keys(require.cache)) {
    if (key.startsWith(serverSrcRoot)) {
      delete require.cache[key];
    }
  }
}

function loadAppWithMocks({
  runFunction = async () => [],
  sendOtpEmail = async ({ otp }) => ({ delivery: 'log', dev_otp: otp }),
  sendContactEmail = async () => ({ delivery: 'log' }),
  uploadImageFiles = async () => [],
  uploadVideoFile = async () => '',
} = {}) {
  clearServerCache();

  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-customer-secret';
  process.env.ADMIN_JWT_SECRET = 'test-admin-secret';
  const db = require('../src/config/db');
  db.runFunction = runFunction;

  const mailService = require('../src/services/mailService');
  mailService.sendOtpEmail = sendOtpEmail;
  mailService.sendContactEmail = sendContactEmail;

  const mediaService = require('../src/services/mediaService');
  mediaService.uploadImageFiles = uploadImageFiles;
  mediaService.uploadVideoFile = uploadVideoFile;

  const auth = require('../src/lib/auth');
  const { createApp } = require('../src/app');

  return {
    app: createApp(),
    signAdminToken: auth.signAdminToken,
    verifyAdminToken: auth.verifyAdminToken,
    signCustomerToken: auth.signCustomerToken,
  };
}

function createProductRow(overrides = {}) {
  return {
    id: 1,
    name: 'Olive Branch Earrings',
    slug: 'olive-branch-earrings',
    price: 1299,
    description: 'Handcrafted piece',
    materials: 'Sterling Silver',
    category_id: 1,
    category_name: 'Jewellery',
    photos: ['https://example.com/photo-1.jpg'],
    video_url: null,
    badge: 'featured',
    in_stock: true,
    created_at: '2026-06-10T00:00:00.000Z',
    ...overrides,
  };
}

function createOrderRow(overrides = {}) {
  return {
    id: 12,
    customer_id: 7,
    customer_name: 'Test User',
    customer_email: 'test@example.com',
    phone: '9876543210',
    address: 'Sample Address',
    pincode: '395007',
    note: 'Handle with care',
    total: 2598,
    status: 'new',
    created_at: '2026-06-10T00:00:00.000Z',
    items: [
      {
        quantity: 2,
        product: {
          ...createProductRow(),
        },
      },
    ],
    ...overrides,
  };
}

test.afterEach(() => {
  clearServerCache();
});

test('GET /api/v1/products returns paginated catalog data', async () => {
  const { app } = loadAppWithMocks({
    runFunction: async (functionName) => {
      assert.equal(functionName, 'sp_get_products');
      return [{ ...createProductRow(), total_count: 1 }];
    },
  });

  const response = await request(app).get('/api/v1/products?featured=true');

  assert.equal(response.status, 200);
  assert.equal(response.body.total, 1);
  assert.equal(response.body.data.length, 1);
  assert.equal(response.body.data[0].slug, 'olive-branch-earrings');
});

test('GET /api/v1/settings/whatsapp returns public settings payload', async () => {
  const { app } = loadAppWithMocks({
    runFunction: async (functionName) => {
      assert.equal(functionName, 'sp_get_public_settings');
      return [{
        whatsapp_number: '919876543210',
        contact_email: 'hello@crochus.com',
        instagram_url: 'https://instagram.com/crochus',
      }];
    },
  });

  const response = await request(app).get('/api/v1/settings/whatsapp');

  assert.equal(response.status, 200);
  assert.equal(response.body.whatsapp_number, '919876543210');
  assert.equal(response.body.contact_email, 'hello@crochus.com');
});

test('POST /api/v1/admin/login verifies the existing admin password hash', async () => {
  const password = 'test-admin-password';
  const passwordHash = await bcrypt.hash(password, 10);
  const { app, verifyAdminToken } = loadAppWithMocks({
    runFunction: async (functionName) => {
      assert.equal(functionName, 'sp_get_customer_auth');
      return [{ id: 2, password_hash: passwordHash }];
    },
  });

  const response = await request(app)
    .post('/api/v1/admin/login')
    .send({ password });

  assert.equal(response.status, 200);
  assert.equal(verifyAdminToken(response.body.token).role, 'admin');
});

test('POST /api/v1/admin/login rejects an incorrect password', async () => {
  const passwordHash = await bcrypt.hash('test-admin-password', 10);
  const { app } = loadAppWithMocks({
    runFunction: async () => [{ id: 2, password_hash: passwordHash }],
  });

  const response = await request(app)
    .post('/api/v1/admin/login')
    .send({ password: 'incorrect-password' });

  assert.equal(response.status, 401);
  assert.equal(response.body.message, 'Incorrect admin password');
});

test('POST /api/v1/auth/register creates OTP workflow response', async () => {
  const calls = [];
  const { app } = loadAppWithMocks({
    runFunction: async (functionName, params) => {
      calls.push({ functionName, params });

      if (functionName === 'sp_get_customer_auth') {
        return [];
      }

      if (functionName === 'sp_create_auth_otp') {
        return [{
          id: 1,
          purpose: 'register',
          email: params[1],
          otp: params[2],
          expires_at: params[3],
        }];
      }

      throw new Error(`Unexpected function call: ${functionName}`);
    },
  });

  const response = await request(app).post('/api/v1/auth/register').send({
    full_name: 'New User',
    email: 'new@example.com',
    mobile: '9876543210',
    password: 'secret123',
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.message, 'OTP sent successfully');
  assert.match(response.body.dev_otp, /^\d{6}$/);
  assert.deepEqual(calls.map((call) => call.functionName), ['sp_get_customer_auth', 'sp_create_auth_otp']);
});

test('POST /api/v1/cart returns the refreshed cart for an authenticated customer', async () => {
  const { app, signCustomerToken } = loadAppWithMocks({
    runFunction: async (functionName) => {
      if (functionName === 'sp_add_cart_item') {
        return [{ success: true }];
      }

      if (functionName === 'sp_get_cart') {
        return [{ ...createProductRow(), quantity: 3 }];
      }

      throw new Error(`Unexpected function call: ${functionName}`);
    },
  });

  const token = signCustomerToken({ id: 7, email: 'cart@example.com' });
  const response = await request(app)
    .post('/api/v1/cart')
    .set('Authorization', `Bearer ${token}`)
    .send({ product_id: 1, quantity: 3 });

  assert.equal(response.status, 201);
  assert.equal(response.body.length, 1);
  assert.equal(response.body[0].quantity, 3);
  assert.equal(response.body[0].product.id, 1);
});

test('POST /api/v1/orders returns a persisted order and WhatsApp number', async () => {
  const { app, signCustomerToken } = loadAppWithMocks({
    runFunction: async (functionName) => {
      if (functionName === 'sp_create_order') {
        return [{ order_id: 12, total: 2598 }];
      }

      if (functionName === 'sp_get_order_detail') {
        return [createOrderRow()];
      }

      if (functionName === 'sp_get_whatsapp_number') {
        return [{ whatsapp_number: '919876543210' }];
      }

      throw new Error(`Unexpected function call: ${functionName}`);
    },
  });

  const token = signCustomerToken({ id: 7, email: 'orders@example.com' });
  const response = await request(app)
    .post('/api/v1/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({
      full_name: 'Test User',
      phone: '9876543210',
      address: 'Sample Address',
      pincode: '395007',
      note: 'Handle with care',
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.order.id, 12);
  assert.equal(response.body.order.items.length, 1);
  assert.equal(response.body.whatsapp_number, '919876543210');
});

test('PUT /api/v1/admin/settings/whatsapp updates the public WhatsApp number', async () => {
  const { app, signAdminToken } = loadAppWithMocks({
    runFunction: async (functionName, params) => {
      assert.equal(functionName, 'sp_admin_update_whatsapp');
      return [{ whatsapp_number: params[0] }];
    },
  });

  const response = await request(app)
    .put('/api/v1/admin/settings/whatsapp')
    .set('Authorization', `Bearer ${signAdminToken()}`)
    .send({ whatsapp_number: '919999999999' });

  assert.equal(response.status, 200);
  assert.equal(response.body.whatsapp_number, '919999999999');
});

test('POST /api/v1/admin/products accepts multipart photos[] uploads', async () => {
  const { app, signAdminToken } = loadAppWithMocks({
    uploadImageFiles: async (files) => {
      assert.equal(files.length, 1);
      return ['https://cdn.example.com/uploaded-photo.jpg'];
    },
    uploadVideoFile: async () => {
      return '';
    },
    runFunction: async (functionName, params) => {
      assert.equal(functionName, 'sp_admin_add_product');
      assert.equal(params[0], 'Test Product');
      assert.deepEqual(params[9], [
        'https://assets.example.com/existing-photo.jpg',
        'https://cdn.example.com/uploaded-photo.jpg',
      ]);

      return [createProductRow({
        id: 22,
        name: params[0],
        slug: params[1],
        price: params[2],
        description: params[3],
        materials: params[4],
        category_id: params[5],
        badge: params[6],
        in_stock: params[7],
        video_url: params[8],
        photos: params[9],
      })];
    },
  });

  const response = await request(app)
    .post('/api/v1/admin/products')
    .set('Authorization', `Bearer ${signAdminToken()}`)
    .field('name', 'Test Product')
    .field('price', '1999')
    .field('description', 'Admin created product')
    .field('materials', 'Cotton')
    .field('category_id', '1')
    .field('badge', 'featured')
    .field('in_stock', 'true')
    .field('photo_urls', JSON.stringify(['https://assets.example.com/existing-photo.jpg']))
    .attach('photos[]', Buffer.from('fake-image-content'), 'photo.jpg');

  assert.equal(response.status, 201);
  assert.equal(response.body.name, 'Test Product');
  assert.equal(response.body.photos.length, 2);
});

test('PUT /api/v1/admin/products/:id accepts multipart photos[] uploads', async () => {
  const { app, signAdminToken } = loadAppWithMocks({
    uploadImageFiles: async (files) => {
      assert.equal(files.length, 1);
      return ['https://res.cloudinary.com/crochus/image/upload/product.jpg'];
    },
    runFunction: async (functionName, params) => {
      assert.equal(functionName, 'sp_admin_update_product');
      assert.equal(params[0], 13);
      assert.deepEqual(params[10], [
        'https://assets.example.com/existing-photo.jpg',
        'https://res.cloudinary.com/crochus/image/upload/product.jpg',
      ]);

      return [createProductRow({
        id: params[0],
        name: params[1],
        slug: params[2],
        price: params[3],
        description: params[4],
        materials: params[5],
        category_id: params[6],
        badge: params[7],
        in_stock: params[8],
        video_url: params[9],
        photos: params[10],
      })];
    },
  });

  const response = await request(app)
    .put('/api/v1/admin/products/13')
    .set('Authorization', `Bearer ${signAdminToken()}`)
    .field('name', 'Updated Product')
    .field('price', '1999')
    .field('description', 'Updated product description')
    .field('category_id', '1')
    .field('photo_urls', JSON.stringify(['https://assets.example.com/existing-photo.jpg']))
    .attach('photos[]', Buffer.from('fake-image-content'), 'photo.jpg');

  assert.equal(response.status, 200);
  assert.equal(response.body.id, 13);
  assert.deepEqual(response.body.photos, [
    'https://assets.example.com/existing-photo.jpg',
    'https://res.cloudinary.com/crochus/image/upload/product.jpg',
  ]);
});
