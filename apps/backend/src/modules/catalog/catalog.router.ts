import { Router, Request, Response } from 'express';
import { prisma } from '../../db';

const router = Router();

// GET /api/categories - Full taxonomy tree
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
      },
    });
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/products - Paginated product search & filtering
router.get('/products', async (req: Request, res: Response) => {
  try {
    const { category, subcategory, q, sort, limit = '30', page = '1' } = req.query;

    const where: any = {};
    if (category) {
      where.category = {
        OR: [
          { slug: String(category) },
          { parent: { slug: String(category) } },
        ],
      };
    }
    if (subcategory) {
      where.subcategory = { contains: String(subcategory), mode: 'insensitive' };
    }
    if (q) {
      where.OR = [
        { name: { contains: String(q), mode: 'insensitive' } },
        { subcategory: { contains: String(q), mode: 'insensitive' } },
        { description: { contains: String(q), mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { name: 'asc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'discount') orderBy = { mrp: 'desc' };

    const take = parseInt(String(limit), 10);
    const skip = (parseInt(String(page), 10) - 1) * take;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take,
        skip,
        orderBy,
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(String(page), 10),
        pages: Math.ceil(total / take),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - Single product detail
router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: req.params.id }, { slug: req.params.id }],
      },
      include: { category: { include: { parent: true } } },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

export default router;
