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
import cron from 'node-cron';

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
        await BGVService.updateVerificationTableSchema();
        console.log('✅ BGV service initialized successfully');
      } catch (bgvError) {
        console.error('⚠️ BGV service initialization failed:', bgvError);
      }
    } catch (dbError) {
      console.log('⚠️  Database connection failed, starting server without database');
      console.log('Note: Authentication and database features will not work until database is connected');
    }
    
    // Start HTTP server
    const server = app.listen(PORT, async () => {
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

      // Initialize Learning Reminder Scheduler
      try {
        const { LearningReminderService } = await import('./services/learning-reminder.service');
        const { DeadlineExpiryService } = await import('./services/deadline-expiry.service');
        const { ProgressReportService } = await import('./services/progress-report.service');
        
        // Schedule reminder job to run weekly at 9:00 AM every Monday
        // Cron format: minute hour day month weekday
        // Run at 9:00 AM every Monday: '0 9 * * 1'
        const reminderSchedule = process.env.REMINDER_SCHEDULE || '0 9 * * 1';
        
        cron.schedule(reminderSchedule, async () => {
          console.log('\n⏰ Running scheduled learning reminder job...');
          try {
            await LearningReminderService.sendReminders();
            console.log('✅ Reminder job completed successfully\n');
          } catch (error) {
            console.error('❌ Reminder job failed:', error);
          }
        });

        console.log(`✅ Learning reminder scheduler initialized (Schedule: ${reminderSchedule})`);
        
        // Schedule deadline expiry check to run daily at 10:00 AM
        // Cron format: '0 10 * * *' (10:00 AM every day)
        const deadlineCheckSchedule = process.env.DEADLINE_CHECK_SCHEDULE || '0 10 * * *';
        
        cron.schedule(deadlineCheckSchedule, async () => {
          console.log('\n⏰ Running scheduled deadline expiry check...');
          try {
            await DeadlineExpiryService.checkAndNotifyExpiredDeadlines();
            console.log('✅ Deadline expiry check completed successfully\n');
          } catch (error) {
            console.error('❌ Deadline expiry check failed:', error);
          }
        });

        console.log(`✅ Deadline expiry scheduler initialized (Schedule: ${deadlineCheckSchedule})`);
        
        // Schedule 30/60/90 day progress reports to run daily at 11:00 AM
        // Cron format: '0 11 * * *' (11:00 AM every day)
        const progressReportSchedule = process.env.PROGRESS_REPORT_SCHEDULE || '0 11 * * *';
        
        cron.schedule(progressReportSchedule, async () => {
          console.log('\n⏰ Running scheduled 30/60/90 day progress report check...');
          try {
            await ProgressReportService.sendProgressReports();
            console.log('✅ Progress report check completed successfully\n');
          } catch (error) {
            console.error('❌ Progress report check failed:', error);
          }
        });

        console.log(`✅ Progress report scheduler initialized (Schedule: ${progressReportSchedule})`);
        
        // Optional: Send reminders immediately on startup (for testing)
        if (process.env.SEND_REMINDERS_ON_STARTUP === 'true') {
          setTimeout(async () => {
            try {
              await LearningReminderService.sendReminders();
            } catch (error) {
              console.error('❌ Initial reminder send failed:', error);
            }
          }, 5000); // Wait 5 seconds after startup
        }

        // Optional: Check expired deadlines immediately on startup (for testing)
        if (process.env.CHECK_DEADLINES_ON_STARTUP === 'true') {
          setTimeout(async () => {
            try {
              await DeadlineExpiryService.checkAndNotifyExpiredDeadlines();
            } catch (error) {
              console.error('❌ Initial deadline check failed:', error);
            }
          }, 7000); // Wait 7 seconds after startup
        }
      } catch (error) {
        console.error('⚠️ Failed to initialize reminder scheduler (non-critical):', error);
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