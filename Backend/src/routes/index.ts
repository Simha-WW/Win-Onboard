/**
 * Main Routes Index
 * Central routing configuration that aggregates all route modules
 * 
 * This file serves as the main entry point for all API routes in the application.
 * It imports and configures routes from different modules (HR, Authentication, etc.)
 * and applies them to the Express router with appropriate prefixes.
 */

import { Router } from 'express';
import { hrRoutes } from './hr.routes';
import { authRoutes } from './auth.routes';
import { bgvRoutes } from './bgv.routes';
import blobRoutes from './blob.routes';
import itRoutes from './it.routes';
import { birthdaysRoutes } from './birthdays.routes';
import { aiAgentRoutes } from '../features/ai-agent';

const router = Router();

/**
 * API Health Check
 * Simple endpoint to verify API is running
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'WinOnboard API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * Authentication Routes
 * All authentication endpoints (login, token validation, etc.)
 * Mounted at: /api/auth/*
 */
router.use('/auth', authRoutes);

/**
 * HR Module Routes
 * All HR-related endpoints (user management, onboarding, etc.)
 * Mounted at: /api/hr/*
 */
router.use('/hr', hrRoutes);

/**
 * BGV Module Routes
 * Background Verification and document submission endpoints
 * Mounted at: /api/bgv/*
 */
router.use('/bgv', bgvRoutes);

/**
 * Blob Storage Routes
 * Azure Blob Storage upload token generation
 * Mounted at: /api/blob/*
 */
router.use('/blob', blobRoutes);

/**
 * IT Routes
 * IT onboarding task management endpoints
 * Mounted at: /api/it/*
 */
router.use('/it', itRoutes);

/**
 * Birthdays Routes
 * Employee birthday tracking and export endpoints
 * Mounted at: /api/birthdays/*
 */
router.use('/birthdays', birthdaysRoutes);

/**
 * AI Agent Feature Routes
 * Azure AI Foundry agent integration endpoints
 * Mounted at: /api/features/ai-agent/*
 */
router.use('/features/ai-agent', aiAgentRoutes);

/**
 * TODO: Add additional route modules as they are implemented
 * 
 * Examples:
 * router.use('/candidates', candidateRoutes); // Candidate management
 * router.use('/documents', documentRoutes);   // Document management
 * router.use('/policies', policyRoutes);      // Policy management
 * router.use('/reports', reportRoutes);       // Reporting endpoints
 * router.use('/tasks', taskRoutes);          // Pre-join task management
 */

/**
 * Catch-all route for undefined API endpoints
 */
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

export { router as apiRoutes };