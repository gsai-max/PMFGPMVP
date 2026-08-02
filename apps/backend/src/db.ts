import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Memory store fallback for sessions/caching if Redis is not configured
class SimpleCache {
  private store = new Map<string, { value: any; expiresAt: number }>();

  set(key: string, value: any, ttlSeconds: number = 300) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  get(key: string): any | null {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  delete(key: string) {
    this.store.delete(key);
  }
}

export const sessionCache = new SimpleCache();
