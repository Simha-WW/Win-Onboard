/**
 * Find Fresher ID by Email
 */

require('dotenv').config();
const sql = require('mssql');

const config = {
  server: process.env.SERVER_NAME,
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function findFresher() {
  try {
    await sql.connect(config);
    console.log('✅ Connected to database\n');
    
    const email = 'vijayasimha8878@gmail.com';
    
    console.log(`🔍 Searching for fresher: ${email}\n`);
    
    const result = await sql.query`
      SELECT 
        id, 
        first_name, 
        last_name, 
        email, 
        designation, 
        department,
        created_at
      FROM freshers 
      WHERE email = ${email}
    `;
    
    if (result.recordset.length === 0) {
      console.log('❌ No fresher found with this email');
    } else {
      const fresher = result.recordset[0];
      console.log('✅ Fresher found:');
      console.log('='.repeat(60));
      console.log(`ID:          ${fresher.id}`);
      console.log(`Name:        ${fresher.first_name} ${fresher.last_name}`);
      console.log(`Email:       ${fresher.email}`);
      console.log(`Designation: ${fresher.designation || 'N/A'}`);
      console.log(`Department:  ${fresher.department || 'N/A'}`);
      console.log(`Created:     ${fresher.created_at}`);
      console.log('='.repeat(60));
      console.log('');
      console.log('💡 To test email notifications, run:');
      console.log(`   node test-email-direct.js ${fresher.id}`);
    }
    
    await sql.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findFresher();
