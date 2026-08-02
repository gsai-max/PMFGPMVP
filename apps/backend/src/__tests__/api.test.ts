import request from 'supertest';
import express from 'express';
import cors from 'cors';
import authRouter from '../modules/auth/auth.router';
import catalogRouter from '../modules/catalog/catalog.router';
import cartRouter from '../modules/cart/cart.router';
import ordersRouter from '../modules/orders/orders.router';
import missionRouter from '../modules/mission/mission.router';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api', catalogRouter);
app.use('/api', cartRouter);
app.use('/api', ordersRouter);
app.use('/api', missionRouter);

describe('Phase 2: REST API Gateway & Commerce Services Suite', () => {

  test('GET /api/categories returns taxonomy tree', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/products returns paginated catalog', async () => {
    const res = await request(app).get('/api/products?limit=10');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('products');
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.products.length).toBeLessThanOrEqual(10);
  });

  test('POST /api/cart/apply-coupon validates min cart value and code', async () => {
    const resValid = await request(app)
      .post('/api/cart/apply-coupon')
      .send({ code: 'WELCOME100', cartTotal: 500 });
    
    expect(resValid.status).toBe(200);
    expect(resValid.body.discountAmount).toBe(100);

    const resInvalid = await request(app)
      .post('/api/cart/apply-coupon')
      .send({ code: 'WELCOME100', cartTotal: 100 });
    
    expect(resInvalid.status).toBe(400);
  });

  test('POST /api/orders enforces idempotency key protection', async () => {
    const productsRes = await request(app).get('/api/products?limit=1');
    const prodId = productsRes.body.products[0].id;

    // Create cart
    const cartRes = await request(app)
      .post('/api/cart/items')
      .send({ productId: prodId, quantity: 2 });
    
    const cartId = cartRes.body.id;
    const idempotencyKey = `test_key_${Date.now()}`;

    // First checkout call
    const order1 = await request(app)
      .post('/api/orders')
      .set('X-Idempotency-Key', idempotencyKey)
      .send({ cartId, discountAmount: 10 });

    expect(order1.status).toBe(200);

    // Immediate second checkout call with same idempotency key
    const order2 = await request(app)
      .post('/api/orders')
      .set('X-Idempotency-Key', idempotencyKey)
      .send({ cartId, discountAmount: 10 });

    expect(order2.status).toBe(200);
    expect(order2.body.id).toBe(order1.body.id);
  });
});
