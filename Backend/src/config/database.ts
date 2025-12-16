/**
 * Database Configuration
 * Handles MSSQL connection for all database operations
 * 
 * This module provides:
 * - MSSQL connection pool management
 * - Connection health checks
 * - Graceful connection handling
 */

import mssql from 'mssql';

/**
 * MSSQL Configuration (hackathon database)
 */
const mssqlConfig: mssql.config = (() => {
  const config: mssql.config = {
    server: process.env.SERVER_NAME || 'localhost',
    database: process.env.DB_NAME || 'hackathon',
    options: {
      encrypt: true, // Required for Azure SQL Server
      trustServerCertificate: true, // Required for Azure SQL Server
      enableArithAbort: true,
      requestTimeout: 30000,
      connectionTimeout: 30000
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };

  // Use Windows Authentication if no username provided
  if (process.env.DB_USERNAME) {
    config.user = process.env.DB_USERNAME;
    config.password = process.env.DB_PASSWORD;
  } else {
    // Windows Authentication
    config.options!.trustedConnection = true;
  }

  return config;
})();

/**
 * MSSQL connection pool
 */
let mssqlPool: mssql.ConnectionPool;

/**
 * Initialize MSSQL connection
 */
async function initializeMSSQLConnection(): Promise<mssql.ConnectionPool> {
  try {
    mssqlPool = new mssql.ConnectionPool(mssqlConfig);
    await mssqlPool.connect();
    
    console.log('✅ MSSQL connection established successfully');
    return mssqlPool;
  } catch (error) {
    console.error('❌ MSSQL connection failed:', error);
    throw error;
  }
}

/**
 * Initialize database connection
 */
async function initializeDatabases() {
  console.log('🔌 Initializing database connection...');
  
  try {
    await initializeMSSQLConnection();
    console.log('✅ Database connection initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Get MSSQL pool instance
 */
function getMSSQLPool(): mssql.ConnectionPool {
  if (!mssqlPool) {
    throw new Error('MSSQL pool not initialized. Call initializeDatabases() first.');
  }
  return mssqlPool;
}

/**
 * Execute MSSQL query with error handling
 */
async function executeMSSQLQuery<T = any>(query: string): Promise<T[]> {
  try {
    const pool = getMSSQLPool();
    const result = await pool.request().query(query);
    return result.recordset as T[];
  } catch (error) {
    console.error('MSSQL query error:', { query, error });
    throw error;
  }
}

/**
 * Check database connection health
 */
async function checkDatabaseHealth(): Promise<{mssql: boolean}> {
  const health = { mssql: false };
  
  try {
    await executeMSSQLQuery('SELECT 1 as test');
    health.mssql = true;
  } catch (error) {
    console.error('MSSQL health check failed:', error);
  }
  
  return health;
}

/**
 * Close database connection gracefully
 */
async function closeDatabaseConnections(): Promise<void> {
  console.log('🔌 Closing database connection...');
  
  if (mssqlPool) {
    try {
      await mssqlPool.close();
      console.log('✅ MSSQL connection closed');
    } catch (error) {
      console.error('❌ Error closing MSSQL connection:', error);
    }
  }
}

export {
  initializeDatabases,
  getMSSQLPool,
  executeMSSQLQuery,
  checkDatabaseHealth,
  closeDatabaseConnections
};