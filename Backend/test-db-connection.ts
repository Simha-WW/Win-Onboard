import mssql from 'mssql';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testConnection = async () => {
  console.log('Testing Azure SQL Server Connection...');
  console.log(`Server: ${process.env.SERVER_NAME}`);
  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`Username: ${process.env.DB_USERNAME}`);
  
  const config: mssql.config = {
    server: process.env.SERVER_NAME!,
    database: process.env.DB_NAME!,
    user: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    options: {
      encrypt: true,
      trustServerCertificate: false,
      enableArithAbort: true,
      connectTimeout: 60000,
      requestTimeout: 30000
    }
  };

  try {
    console.log('Attempting to connect...');
    const pool = await mssql.connect(config);
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const result = await pool.request().query('SELECT 1 as test');
    console.log('✅ Query successful:', result.recordset);
    
    await pool.close();
    console.log('✅ Connection closed successfully');
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error code:', (error as any).code);
    console.error('Error number:', (error as any).number);
    console.error('Error message:', (error as any).message);
    console.error('Full error:', error);
  }
};

testConnection();