import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

import authRouter from './modules/auth/auth.router';
import catalogRouter from './modules/catalog/catalog.router';
import cartRouter from './modules/cart/cart.router';
import ordersRouter from './modules/orders/orders.router';
import missionRouter from './modules/mission/mission.router';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Middleware
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({
  origin: corsOrigin ? (corsOrigin.includes(',') ? corsOrigin.split(',') : corsOrigin) : '*',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'BlinkClone Backend API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api', catalogRouter);
app.use('/api', cartRouter);
app.use('/api', ordersRouter);
app.use('/api', missionRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BlinkClone Backend API running on 0.0.0.0:${PORT}`);

  // Run schema sync & db push asynchronously so health check passes instantly on Railway/Render
  if (process.env.DATABASE_URL) {
    const isPostgres = process.env.DATABASE_URL.includes('postgres');
    const schemaFile = isPostgres ? 'schema.postgresql.prisma' : 'schema.sqlite.prisma';
    const prismaDir = path.join(__dirname, '../prisma');
    const sourcePath = path.join(prismaDir, schemaFile);
    const targetPath = path.join(prismaDir, 'schema.prisma');

    try {
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`[Runtime Schema Sync] Copied ${schemaFile} -> schema.prisma`);
      }
    } catch (e: any) {
      console.error('[Runtime Schema Sync Warning]', e.message);
    }

    console.log('🔄 Triggering background database schema push...');
    const pushCmd = `npx prisma db push --schema="${targetPath}" --accept-data-loss`;
    exec(pushCmd, (err, stdout, stderr) => {
      if (err) {
        console.error('⚠️ DB Push Warning:', err.message);
      } else {
        console.log('✅ DB Schema pushed successfully!');
        if (isPostgres) {
          console.log('🔄 Seed script starting in background...');
          const seedScript = path.join(__dirname, 'prisma/seed.js');
          exec(`node "${seedScript}"`, (seedErr) => {
            if (seedErr) {
              console.error('⚠️ DB Seed Warning:', seedErr.message);
            } else {
              console.log('✅ DB Catalog seeded successfully!');
            }
          });
        }
      }
    });
  }
});

