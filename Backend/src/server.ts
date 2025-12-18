/**
 * Server Entry Point
 * Main server startup file that initializes the Express application
 * 
 * This file:
 * - Loads environment variables
 * - Starts the HTTP server
 * - Handles graceful shutdown
 * - Connects to database (when implemented)
 */

// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
console.log('DEBUG: Loading .env file from:', process.cwd());
const dotenvResult = dotenv.config();
if (dotenvResult.error) {
  console.error('ERROR loading .env file:', dotenvResult.error);
} else {
  console.log('SUCCESS: .env file loaded');
}

// Debug: Check if basic env vars are loaded
console.log('DEBUG: NODE_ENV =', process.env.NODE_ENV);
console.log('DEBUG: PORT =', process.env.PORT);
console.log('DEBUG: SMTP_HOST =', process.env.SMTP_HOST);

// NOW import app (which will have env vars available)
import { app } from './app';
import { initializeDatabases, closeDatabaseConnections } from './config/database';

/**
 * Server Configuration
 */
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start Server
 */
async function startServer() {
  try {
    // Try to initialize database connections
    console.log('🔌 Initializing databases...');
    try {
      await initializeDatabases();
      console.log('✅ Database connections established');
      
      // Initialize IT service and ensure IT_users table exists
      try {
        const { ITService } = await import('./services/it.service');
        await ITService.ensureITUsersTable();
        console.log('✅ IT service initialized successfully');
      } catch (itError) {
        console.error('⚠️ IT service initialization failed:', itError);
      }

      // Initialize BGV service and ensure BGV tables exist
      try {
        const { BGVService } = await import('./services/bgv.service');
        await BGVService.initializeBGVTables();
        await BGVService.updatePersonalTableSchema();
        await BGVService.updateEducationalTableSchema();
        console.log('✅ BGV service initialized successfully');
      } catch (bgvError) {
        console.error('⚠️ BGV service initialization failed:', bgvError);
      }
    } catch (dbError) {
      console.log('⚠️  Database connection failed, starting server without database');
      console.log('Note: Authentication and database features will not work until database is connected');
    }
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 WinOnboard Server started successfully`);
      console.log(`📍 Server running on port: ${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
      
      if (NODE_ENV === 'development') {
        console.log(`\n📋 Available endpoints:`);
        console.log(`   GET  /                    - Server health`);
        console.log(`   GET  /api/health         - API health check`);
        console.log(`   POST /api/hr/freshers    - Create new fresher`);
        console.log(`   GET  /api/hr/freshers    - Get all freshers`);
        console.log(`   GET  /api/hr/freshers/:id - Get fresher by ID`);
        console.log(`   POST /api/hr/freshers/:id/resend-email - Resend email`);
      }
    });

    /**
     * Graceful Shutdown Handlers
     */
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('📴 HTTP server closed');
        
        // Close database connections
        await closeDatabaseConnections();
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('💥 Forced shutdown - timeout exceeded');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
      // Don't exit in development
      if (NODE_ENV === 'production') {
        process.exit(1);
      }
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Initialize and start the server
 */
startServer();