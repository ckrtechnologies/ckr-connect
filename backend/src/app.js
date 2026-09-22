import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './shared/auth/routes.js';
import bootstrapRoutes from './shared/bootstrap/routes.js';
import mediaRoutes from './shared/media/routes.js';
import adminRoutes from './domains/admin/routes.js';
import bdmRoutes from './domains/bdm/routes.js';

import { errorHandler } from './middlewares/errorHandler.js';
import { errorResponse } from './utils/response.js';

const app = express();

// Security and utility middlewares
app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check (supports direct /health, /api/health, and /api/v1/health)
app.get(['/health', '/api/health', '/api/v1/health'], (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'CKR Connect Enterprise API',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime())
  });
});

// Domain and Shared API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bootstrap', bootstrapRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/bdm', bdmRoutes);

// 404 Not Found Handler
app.use((req, res) => {
  return errorResponse(res, `Route ${req.method} ${req.originalUrl} not found`, 'NOT_FOUND', 404);
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
