import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { csrfGuard } from './middleware/authMiddleware.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import { productRoutes, categoryRoutes, settingsRoutes } from './routes/catalogRoutes.js';

const app = express();
app.disable('x-powered-by');
if (env.isProd) app.set('trust proxy', 1); // correct client IPs and secure cookies behind a hosting proxy
app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
app.use('/api', csrfGuard);

app.get('/api/health', (_req, res) => res.json({ success: true, status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/imagekit', imageRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/orders', orderRoutes); // price/stock check only; orders are never saved or confirmed here

app.use(notFound);
app.use(errorHandler);
export default app;
