import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import path from 'path';
import authRouter from './modules/auth/auth.router';
import catalogRouter from './modules/catalog/catalog.router';
import cartRouter from './modules/cart/cart.router';
import ordersRouter from './modules/orders/orders.router';
import missionRouter from './modules/mission/mission.router';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Middleware
app.use(cors({ origin: '*' }));
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

  // Background DB seed for PostgreSQL/Railway
  if (process.env.DATABASE_URL?.includes('postgres')) {
    console.log('🔄 PostgreSQL DATABASE_URL detected. Running pre-compiled seed engine in background...');
    const seedScript = path.join(__dirname, 'prisma/seed.js');
    exec(`node "${seedScript}"`, (err, stdout, stderr) => {
      if (err) {
        console.error('⚠️ DB Seed Error:', err.message);
      } else {
        console.log('✅ DB Catalog seeded successfully!');
      }
    });
  }
});
