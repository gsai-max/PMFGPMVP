import { Router, Response } from 'express';
import { prisma, sessionCache } from '../../db';
import { AuthRequest, authenticateJWT } from '../auth/auth.service';

const router = Router();

// POST /api/orders - Place order with Idempotency Protection
router.post('/orders', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    // Check Idempotency Key Guard
    const idempotencyKey = (req.headers['x-idempotency-key'] || req.headers['idempotency-key']) as string;
    if (idempotencyKey) {
      const cachedOrder = sessionCache.get(`idempotency_${idempotencyKey}`);
      if (cachedOrder) {
        console.log(`[Idempotency Guard] Returning cached order response for key: ${idempotencyKey}`);
        return res.json(cachedOrder);
      }
    }

    const { cartId, address, discountAmount = 0 } = req.body;
    if (!cartId) return res.status(400).json({ error: 'cartId is required' });

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty or not found' });
    }

    const subtotal = cart.items.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0);
    const deliveryFee = subtotal > 299 ? 0 : 25;
    const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

    // Create or locate Address Record
    let addressRecord = null;
    if (address && req.user?.id) {
      addressRecord = await prisma.address.create({
        data: {
          userId: req.user.id,
          line1: address.line1 || '123 Indiranagar, 100ft Road',
          city: address.city || 'Bengaluru',
          pincode: address.pincode || '560038',
          isDefault: true,
        },
      });
    }

    // Create Order Record
    const order = await prisma.order.create({
      data: {
        userId: req.user?.id || null,
        cartId: cart.id,
        addressId: addressRecord?.id || null,
        totalAmount,
        discountAmount,
        deliveryFee,
        status: 'PLACED',
        paymentStatus: 'PAID',
        items: {
          create: cart.items.map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity,
            priceAtPurchase: i.product.price,
          })),
        },
      },
      include: { items: { include: { product: true } }, address: true },
    });

    // Mark active cart as CHECKED_OUT
    await prisma.cart.update({
      where: { id: cart.id },
      data: { status: 'CHECKED_OUT' },
    });

    // Cache idempotency response if key provided (5 min TTL)
    if (idempotencyKey) {
      sessionCache.set(`idempotency_${idempotencyKey}`, order, 300);
    }

    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders - Order history listing
router.get('/orders', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const orders = await prisma.order.findMany({
      where: userId ? { userId } : {},
      orderBy: { placedAt: 'desc' },
      take: 20,
      include: { items: { include: { product: true } } },
    });

    // Calculate dynamic status for each order based on elapsed time
    const updatedOrders = orders.map((order: any) => {
      const elapsedMinutes = (Date.now() - new Date(order.placedAt).getTime()) / (1000 * 60);
      let dynamicStatus = 'PLACED';
      if (elapsedMinutes > 1) dynamicStatus = 'PACKED';
      if (elapsedMinutes > 3) dynamicStatus = 'OUT_FOR_DELIVERY';
      if (elapsedMinutes > 8) dynamicStatus = 'DELIVERED';
      return { ...order, status: dynamicStatus };
    });

    res.json(updatedOrders);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
});

// GET /api/orders/:id - Order detail with dynamic elapsed-time status tracking
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true } }, address: true },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Simulated status progression based on elapsed time
    const elapsedMinutes = (Date.now() - new Date(order.placedAt).getTime()) / (1000 * 60);
    let dynamicStatus = 'PLACED';
    if (elapsedMinutes > 1) dynamicStatus = 'PACKED';
    if (elapsedMinutes > 3) dynamicStatus = 'OUT_FOR_DELIVERY';
    if (elapsedMinutes > 8) dynamicStatus = 'DELIVERED';

    res.json({ ...order, status: dynamicStatus });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST /api/orders/:id/reorder - 1-Tap reorder into a new active cart
router.post('/orders/:id/reorder', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Create new active cart with items from previous order
    const newCart = await prisma.cart.create({
      data: {
        userId: req.user?.id || null,
        status: 'ACTIVE',
        items: {
          create: order.items.map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    res.json(newCart);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reorder' });
  }
});

export default router;
