/**
 * Setup Learning Tables
 * Run this script to create the required learning tracking tables
 */

const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// Database configuration
const config = {
  server: process.env.SERVER_NAME || 'localhost',
  database: process.env.DB_NAME || 'hackathon',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
    requestTimeout: 30000,
    connectTimeout: 30000
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
  config.options.trustedConnection = true;
}

async function setupLearningTables() {
  try {
    console.log('🔄 Connecting to database...');
    await sql.connect(config);
    console.log('✅ Connected to database');

    // Read SQL script
    const sqlFilePath = path.join(__dirname, 'create-learning-tables.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    // Split by GO statements and execute each batch
    const batches = sqlScript
      .split(/^\s*GO\s*$/gim)
      .filter(batch => batch.trim().length > 0);

    console.log(`\n📋 Executing ${batches.length} SQL batches...\n`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i].trim();
      if (batch) {
        try {
          const result = await sql.query(batch);
          if (result.recordset && result.recordset.length > 0) {
            result.recordset.forEach(row => {
              if (row['']) {
                console.log(row['']);
              }
            });
          }
        } catch (batchError) {
          console.error(`❌ Error in batch ${i + 1}:`, batchError.message);
        }
      }
    }

    console.log('\n✅ Learning tracking tables setup completed!');
    console.log('\n📊 Verifying tables...');

    // Verify tables exist
    const tables = await sql.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('user_learning_assignments', 'user_learning_progress')
      ORDER BY TABLE_NAME
    `);

    if (tables.recordset.length === 2) {
      console.log('✅ Both tables created successfully:');
      tables.recordset.forEach(table => {
        console.log(`   - ${table.TABLE_NAME}`);
      });
    } else {
      console.log('⚠️  Warning: Expected 2 tables but found', tables.recordset.length);
    }

  } catch (error) {
    console.error('❌ Error setting up learning tables:', error);
    throw error;
  } finally {
    await sql.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the setup
setupLearningTables()
  .then(() => {
    console.log('\n✨ Setup completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Setup failed:', error.message);
    process.exit(1);
  });
