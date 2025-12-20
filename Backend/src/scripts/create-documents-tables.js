require('dotenv').config();
const mssql = require('mssql');
const fs = require('fs');
const path = require('path');

const config = {
  user: process.env.DB_USERNAME || 'sqladmin',
  password: process.env.DB_PASSWORD || 'admin@123',
  server: process.env.SERVER_NAME || 'sql-server-winbuild.database.windows.net',
  database: process.env.DB_NAME || 'hackathon',
  options: {
    encrypt: true, // Required for Azure SQL
    trustServerCertificate: true
  }
};

async function createTables() {
  try {
    console.log('🔌 Connecting to database...');
    const pool = await mssql.connect(config);
    console.log('✅ Connected to database');

    // Employment History Table
    console.log('\n📋 Creating employment_history table...');
    const sql1 = fs.readFileSync(path.join(__dirname, '../../database_scripts/create-employment-history-table.sql'), 'utf8');
    const statements1 = sql1.split('GO').filter(stmt => stmt.trim());
    for (const stmt of statements1) {
      if (stmt.trim()) await pool.request().query(stmt);
    }
    console.log('✅ Employment history table created');

    // Passport Visa Table
    console.log('\n📋 Creating passport_visa table...');
    const sql2 = fs.readFileSync(path.join(__dirname, '../../database_scripts/create-passport-visa-table.sql'), 'utf8');
    const statements2 = sql2.split('GO').filter(stmt => stmt.trim());
    for (const stmt of statements2) {
      if (stmt.trim()) await pool.request().query(stmt);
    }
    console.log('✅ Passport visa table created');

    // Bank PF NPS Table
    console.log('\n📋 Creating bank_pf_nps table...');
    const sql3 = fs.readFileSync(path.join(__dirname, '../../database_scripts/create-bank-pf-nps-table.sql'), 'utf8');
    const statements3 = sql3.split(/\bGO\b/gi).map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of statements3) {
      await pool.request().query(stmt);
    }
    console.log('✅ Bank PF NPS table created');

    // Verify tables exist
    console.log('\n🔍 Verifying tables...');
    const result = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
        AND TABLE_NAME IN ('employment_history', 'passport_visa', 'bank_pf_nps')
      ORDER BY TABLE_NAME
    `);
    
    console.log('✅ Found tables:', result.recordset.map(r => r.TABLE_NAME));

    await pool.close();
    console.log('\n🎉 All tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

createTables();
