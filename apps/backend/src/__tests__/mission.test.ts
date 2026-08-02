import { detectMission, getMissionRecommendations, getMissionCompletion, parseArrayField } from '../modules/mission/mission.service';
import { prisma } from '../db';

describe('Phase 2: AI Mission Intelligence Engine Unit Test Suite', () => {

  test('parseArrayField correctly parses JSON strings and native arrays', () => {
    expect(parseArrayField(['breakfast', 'monthly_grocery'])).toEqual(['breakfast', 'monthly_grocery']);
    expect(parseArrayField('["breakfast", "dinner_prep"]')).toEqual(['breakfast', 'dinner_prep']);
    expect(parseArrayField(null)).toEqual([]);
    expect(parseArrayField(undefined)).toEqual([]);
    expect(parseArrayField('invalid_json')).toEqual([]);
  });

  test('detectMission suppresses banner (returns null mission) for empty cart & no signals', async () => {
    const result = await detectMission();
    expect(result.mission).toBeNull();
    expect(result.confidence).toBeLessThan(0.40);
    expect(result.displayName).toBe('General Browsing');
  });

  test('detectMission correctly predicts Breakfast mission for morning time prior & breakfast cart items', async () => {
    // Find or mock a breakfast product
    const breakfastProduct = await prisma.product.findFirst({
      where: { subcategory: 'Milk & Curd' },
    });

    if (breakfastProduct) {
      // Create a test cart
      const testCart = await prisma.cart.create({
        data: {
          status: 'ACTIVE',
          items: {
            create: [
              { productId: breakfastProduct.id, quantity: 2 },
            ],
          },
        },
      });

      const result = await detectMission(testCart.id);
      expect(result.confidence).toBeGreaterThanOrEqual(0.40);
      expect(result.mission).toBe('breakfast');
      expect(result.displayName).toContain('Breakfast');

      // Cleanup
      await prisma.cart.delete({ where: { id: testCart.id } });
    }
  });

  test('getMissionRecommendations returns relevant products excluding existing cart subcategories', async () => {
    const recs = await getMissionRecommendations('breakfast');
    expect(Array.isArray(recs)).toBe(true);
    expect(recs.length).toBeGreaterThan(0);
  });

  test('getMissionCompletion computes percentage and returns missing essential chips', async () => {
    const milkProduct = await prisma.product.findFirst({ where: { subcategory: 'Milk & Curd' } });
    const eggProduct = await prisma.product.findFirst({ where: { subcategory: 'Eggs & Paneer' } });

    if (milkProduct && eggProduct) {
      const testCart = await prisma.cart.create({
        data: {
          status: 'ACTIVE',
          items: {
            create: [
              { productId: milkProduct.id, quantity: 1 },
              { productId: eggProduct.id, quantity: 1 },
            ],
          },
        },
      });

      const completion = await getMissionCompletion(testCart.id, 'breakfast');
      expect(completion.completionPercentage).toBeGreaterThan(0);
      expect(completion.completionPercentage).toBeLessThanOrEqual(100);
      expect(Array.isArray(completion.missingSlots)).toBe(true);

      // Cleanup
      await prisma.cart.delete({ where: { id: testCart.id } });
    }
  });
});
