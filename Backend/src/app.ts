/**
 * Express Server Configuration
 * Main server setup with middleware, routes, and error handling
 * 
 * This file configures the Express server with:
 * - Security middleware (CORS, helmet)
 * - Request parsing (JSON, URL-encoded)
 * - API routes
 * - Error handling
 * - Database connection (when implemented)
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { apiRoutes } from './routes';

/**
 * Create Express application instance
 */
const app: Application = express();

/**
 * Security Middleware
 */

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.FRONTEND_URL || 'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// Compress responses
app.use(compression());

/**
 * Request Parsing Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request Logging Middleware
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

/**
 * API Routes
 * Mount all API routes under /api prefix
 */
app.use('/api', apiRoutes);

/**
 * Health Check Endpoint
 * Basic server health check at root
 */
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'WinOnboard Backend Server',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * Global Error Handler
 */
interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    error: 'Internal Server Error',
    message: isProduction ? 'Something went wrong' : err.message,
    timestamp: new Date().toISOString(),
    ...(isProduction ? {} : { stack: err.stack })
  });
});

/**
 * 404 Handler for undefined routes
 */
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

export { app };