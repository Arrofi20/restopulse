import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import salesRoutes from './routes/sales.routes';
import adminRoutes from './routes/admin.routes';
import dashboardRoutes from './routes/dashboard.routes';
import reportRoutes from './routes/report.routes';
import outletRoutes from './routes/outlet.routes';
import aiRoutes from './routes/ai.routes';
import expenseRoutes from './routes/expense.routes';
import cateringRoutes from './routes/catering.routes';
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
  res.status(200).json({ message: 'RestoPulse API is running', version: '1.1.0' });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.1.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/outlet', outletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/catering', cateringRoutes);

app.use(errorHandler);
