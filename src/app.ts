import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import salesRoutes from './routes/sales.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middleware/errorHandler';
import { authRateLimiter } from './middleware/rateLimiter';

dotenv.config();

export const app: Application = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'RestoPulse API is running', version: '1.0.0' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);
