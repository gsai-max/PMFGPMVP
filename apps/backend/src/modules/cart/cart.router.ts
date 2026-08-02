import { Router, Response } from 'express';
import { prisma } from '../../db';
import { AuthRequest, authenticateJWT } from '../auth/auth.service';

const router = Router();

// Helper to get or create active cart
async function getOrCreateCart(cartId?: string, userId?: string) {
  if (cartId) {
    const existing = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { product: true } } },
    });
    if (existing && existing.status === 'ACTIVE') return existing;
  }

  if (userId) {
    const userCart = await prisma.cart.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { items: { include: { product: true } } },
    });
    if (userCart) return userCart;
  }

  return await prisma.cart.create({
    data: { userId: userId || null, status: 'ACTIVE' },
    include: { items: { include: { product: true } } },
  });
}

// GET /api/cart
router.get('/cart', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const cartId = req.query.cartId as string;
    const cart = await getOrCreateCart(cartId, req.user?.id);
    res.json(cart);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart/items - Add or update product quantity (1-10 stepper cap)
router.post('/cart/items', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { cartId, productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });

    const cart = await getOrCreateCart(cartId, req.user?.id);

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      let newQty = existingItem.quantity + quantity;
      if (newQty > 10) newQty = 10; // 1-10 quantity stepper cap

      if (newQty <= 0) {
        await prisma.cartItem.delete({ where: { id: existingItem.id } });
      } else {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQty },
        });
      }
    } else if (quantity > 0) {
      const cappedQty = Math.min(10, Math.max(1, quantity));
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity: cappedQty },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    });

    res.json(updatedCart);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// PATCH /api/cart/items/:id - Direct quantity set with 1-10 bounds cap
router.patch('/cart/items/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: req.params.id } });
    } else {
      const cappedQty = Math.min(10, Math.max(1, quantity));
      await prisma.cartItem.update({
        where: { id: req.params.id },
        data: { quantity: cappedQty },
      });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to patch cart item' });
  }
});

// DELETE /api/cart/items/:id - Remove item
router.delete('/cart/items/:id', async (req, res) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

// DELETE /api/cart/:id/clear - Clear all cart items
router.delete('/cart/:id/clear', async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({ where: { cartId: req.params.id } });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// POST /api/cart/merge - Merge guest cart into authenticated user cart
router.post('/cart/merge', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { guestCartId } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    if (!guestCartId) return res.status(400).json({ error: 'guestCartId is required' });

    const guestCart = await prisma.cart.findUnique({
      where: { id: guestCartId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      const userCart = await getOrCreateCart(undefined, userId);
      return res.json(userCart);
    }

    const userCart = await getOrCreateCart(undefined, userId);

    for (const guestItem of guestCart.items) {
      const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: userCart.id, productId: guestItem.productId },
      });

      if (existingItem) {
        const mergedQty = Math.min(10, existingItem.quantity + guestItem.quantity);
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: mergedQty },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: guestItem.productId,
            quantity: Math.min(10, guestItem.quantity),
          },
        });
      }
    }

    // Delete or mark guest cart as inactive
    await prisma.cart.delete({ where: { id: guestCartId } }).catch(() => {});

    const updatedUserCart = await prisma.cart.findUnique({
      where: { id: userCart.id },
      include: { items: { include: { product: true } } },
    });

    res.json(updatedUserCart);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to merge cart' });
  }
});

// POST /api/cart/apply-coupon
router.post('/cart/apply-coupon', async (req, res) => {
  try {
    const { code, cartTotal = 0 } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.active) {
      return res.status(400).json({ error: 'Invalid or expired coupon code' });
    }
    if (cartTotal < coupon.minCartValue) {
      return res.status(400).json({ error: `Minimum order value of ₹${coupon.minCartValue} required for coupon ${coupon.code}.` });
    }

    let discount = 0;
    if (coupon.discountType === 'FLAT') {
      discount = coupon.value;
    } else {
      discount = (cartTotal * coupon.value) / 100;
    }

    res.json({ coupon, discountAmount: Math.round(discount) });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to apply coupon' });
  }
});

export default router;

