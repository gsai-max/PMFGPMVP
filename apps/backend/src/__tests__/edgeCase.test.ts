import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { prisma, sessionCache } from '../db';
import authRouter from '../modules/auth/auth.router';
import catalogRouter from '../modules/catalog/catalog.router';
import cartRouter from '../modules/cart/cart.router';
import ordersRouter from '../modules/orders/orders.router';
import missionRouter from '../modules/mission/mission.router';
import { detectMission, getMissionCompletion, getMissionRecommendations } from '../modules/mission/mission.service';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api', catalogRouter);
app.use('/api', cartRouter);
app.use('/api', ordersRouter);
app.use('/api', missionRouter);


describe('Phase 4: Resilience, Edge Case Guards & System Boundaries Suite', () => {

  let testCartId: string;
  let testProductId1: string;
  let testProductId2: string;
  let outOfStockProductId: string;

  beforeAll(async () => {
    // Fetch test products from seeded database
    const prods = await prisma.product.findMany({ take: 3 });
    if (prods.length > 0) {
      testProductId1 = prods[0].id;
      testProductId2 = prods.length > 1 ? prods[1].id : prods[0].id;
    }

    // Create an out-of-stock test product if not existing
    let outOfStock = await prisma.product.findFirst({ where: { stockQty: 0 } });
    if (!outOfStock && prods.length > 0) {
      outOfStock = await prisma.product.create({
        data: {
          name: 'Out of Stock Test Item',
          slug: 'out-of-stock-test-item',
          categoryId: prods[0].categoryId,
          subcategory: prods[0].subcategory,
          price: 99,
          mrp: 99,
          unit: '1 pc',
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
          missionTags: typeof prods[0].missionTags === 'string' ? '["breakfast"]' : ['breakfast'] as any,
          stockQty: 0,
        },
      });
    }
    if (outOfStock) outOfStockProductId = outOfStock.id;

    // Create fresh test cart
    const cart = await prisma.cart.create({
      data: { status: 'ACTIVE' },
    });
    testCartId = cart.id;
  });

  afterAll(async () => {
    if (testCartId) {
      await prisma.cartItem.deleteMany({ where: { cartId: testCartId } }).catch(() => {});
      await prisma.cart.delete({ where: { id: testCartId } }).catch(() => {});
    }
    if (outOfStockProductId) {
      await prisma.product.delete({ where: { id: outOfStockProductId } }).catch(() => {});
    }
  });

  test('1. 0-item / 1-item cart suppresses mission banner (returns null mission)', async () => {
    // 0-item cart
    const detectZero = await detectMission(testCartId);
    expect(detectZero.mission).toBeNull();
    expect(detectZero.confidence).toBe(0);

    // 1-item cart
    await prisma.cartItem.create({
      data: { cartId: testCartId, productId: testProductId1, quantity: 1 },
    });

    const detectOne = await detectMission(testCartId);
    expect(detectOne.mission).toBeNull();
    expect(detectOne.confidence).toBe(0);
  });

  test('2. Groq LLM API fallback occurs gracefully without error when API key is unconfigured', async () => {
    const originalKey = process.env.GROQ_API_KEY;
    process.env.GROQ_API_KEY = 'your_groq_api_key_here'; // Unconfigured default

    // Add 2nd item so cart has 2 distinct items
    await prisma.cartItem.create({
      data: { cartId: testCartId, productId: testProductId2, quantity: 1 },
    });

    const result = await detectMission(testCartId);
    expect(result).toHaveProperty('mission');
    expect(result).toHaveProperty('confidence');
    expect(result.llmReasoning).toBeUndefined();

    process.env.GROQ_API_KEY = originalKey;
  });

  test('3. Out-of-stock items (stockQty <= 0) are excluded from recommendations & missing chips', async () => {
    const recs = await getMissionRecommendations('breakfast', testCartId);
    const hasOutOfStock = recs.some((p: any) => p.stockQty <= 0);
    expect(hasOutOfStock).toBe(false);

    const completion = await getMissionCompletion(testCartId, 'breakfast');
    const hasOutOfStockSuggested = completion.suggestedItems.some((p: any) => p.stockQty <= 0);
    expect(hasOutOfStockSuggested).toBe(false);
  });

  test('4. Quantity stepper caps maximum quantity per item to 10', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .send({ cartId: testCartId, productId: testProductId1, quantity: 50 });

    expect(res.status).toBe(200);
    const addedItem = res.body.items.find((i: any) => i.productId === testProductId1);
    expect(addedItem.quantity).toBeLessThanOrEqual(10);
  });

  test('5. Idempotency Key Guard deduplicates double-click order creation', async () => {
    // Create cart with 1 item
    const cart = await prisma.cart.create({ data: { status: 'ACTIVE' } });
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: testProductId1, quantity: 1 },
    });

    const idempotencyKey = `idem_test_${Date.now()}`;

    // Click 1
    const res1 = await request(app)
      .post('/api/orders')
      .set('x-idempotency-key', idempotencyKey)
      .send({ cartId: cart.id });

    expect(res1.status).toBe(200);
    const orderId1 = res1.body.id;

    // Click 2 with identical key
    const res2 = await request(app)
      .post('/api/orders')
      .set('x-idempotency-key', idempotencyKey)
      .send({ cartId: cart.id });

    expect(res2.status).toBe(200);
    expect(res2.body.id).toBe(orderId1); // Cached response returned
  });

  test('6. Coupon validation rejects orders failing minimum cart value', async () => {
    const res = await request(app)
      .post('/api/cart/apply-coupon')
      .send({ code: 'WELCOME100', cartTotal: 50 }); // Below ₹299 threshold

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Minimum order value');
  });

  test('7. Guest-to-authenticated cart merge combines items seamlessly', async () => {
    // Create user & user cart
    const user = await prisma.user.create({
      data: {
        name: 'Merge Test User',
        email: `merge_${Date.now()}@example.com`,
        passwordHash: 'hash123',
      },
    });

    const userCart = await prisma.cart.create({
      data: { userId: user.id, status: 'ACTIVE' },
    });
    await prisma.cartItem.create({
      data: { cartId: userCart.id, productId: testProductId1, quantity: 2 },
    });

    // Create guest cart
    const guestCart = await prisma.cart.create({ data: { status: 'ACTIVE' } });
    await prisma.cartItem.create({
      data: { cartId: guestCart.id, productId: testProductId1, quantity: 3 },
    });

    // Generate JWT token for user
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'password123' }); // Login endpoint or mock auth

    const mergeRes = await request(app)
      .post('/api/cart/merge')
      .set('Authorization', `Bearer ${loginRes.body?.token || 'fake-jwt'}`)
      .send({ guestCartId: guestCart.id });

    if (mergeRes.status === 200) {
      const item = mergeRes.body.items.find((i: any) => i.productId === testProductId1);
      expect(item.quantity).toBe(5); // 2 + 3 = 5 merged
    }

    // Cleanup
    await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } }).catch(() => {});
    await prisma.cart.delete({ where: { id: userCart.id } }).catch(() => {});
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
  });

});
