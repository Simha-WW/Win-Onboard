const sql = require('mssql');

const config = {
  server: 'sql-server-hackathon.database.windows.net',
  database: 'hackathon',
  user: 'sqladmin',
  password: 'admin@123',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function createTable() {
  try {
    await sql.connect(config);
    
    console.log('🔧 Creating bgv_verifications table...\n');
    
    // Create the table
    await sql.query`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bgv_verifications')
      BEGIN
          CREATE TABLE dbo.bgv_verifications (
              id INT IDENTITY(1,1) PRIMARY KEY,
              fresher_id INT NOT NULL,
              hr_user_id INT NOT NULL,
              document_type NVARCHAR(100) NOT NULL,
              document_section NVARCHAR(200) NOT NULL,
              status NVARCHAR(50) NOT NULL DEFAULT 'pending',
              comments NVARCHAR(MAX),
              verified_at DATETIME,
              created_at DATETIME DEFAULT GETDATE(),
              updated_at DATETIME DEFAULT GETDATE(),
              
              CONSTRAINT FK_bgv_verifications_fresher FOREIGN KEY (fresher_id) 
                  REFERENCES dbo.freshers(id) ON DELETE CASCADE,
              CONSTRAINT FK_bgv_verifications_hr_user FOREIGN KEY (hr_user_id) 
                  REFERENCES dbo.hr_users(id),
              CONSTRAINT CHK_verification_status CHECK (status IN ('pending', 'verified', 'rejected'))
          );
          
          PRINT 'Table bgv_verifications created successfully';
      END
      ELSE
      BEGIN
          PRINT 'Table bgv_verifications already exists';
      END
    `;
    
    console.log('✅ Table creation statement executed\n');
    
    // Create indexes
    console.log('🔧 Creating indexes...\n');
    
    await sql.query`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_bgv_verifications_fresher_id')
      BEGIN
          CREATE INDEX IX_bgv_verifications_fresher_id ON dbo.bgv_verifications(fresher_id);
          PRINT 'Index IX_bgv_verifications_fresher_id created';
      END
    `;
    
    await sql.query`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_bgv_verifications_hr_user_id')
      BEGIN
          CREATE INDEX IX_bgv_verifications_hr_user_id ON dbo.bgv_verifications(hr_user_id);
          PRINT 'Index IX_bgv_verifications_hr_user_id created';
      END
    `;
    
    await sql.query`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_bgv_verifications_status')
      BEGIN
          CREATE INDEX IX_bgv_verifications_status ON dbo.bgv_verifications(status);
          PRINT 'Index IX_bgv_verifications_status created';
      END
    `;
    
    await sql.query`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_bgv_verifications_document_type')
      BEGIN
          CREATE INDEX IX_bgv_verifications_document_type ON dbo.bgv_verifications(document_type);
          PRINT 'Index IX_bgv_verifications_document_type created';
      END
    `;
    
    console.log('✅ Indexes created\n');
    
    // Verify table was created
    const check = await sql.query`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'dbo' 
      AND TABLE_NAME = 'bgv_verifications'
    `;
    
    if (check.recordset.length > 0) {
      console.log('✅ SUCCESS: bgv_verifications table exists!\n');
      
      // Show structure
      const columns = await sql.query`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          CHARACTER_MAXIMUM_LENGTH,
          IS_NULLABLE,
          COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'bgv_verifications'
        ORDER BY ORDINAL_POSITION
      `;
      
      console.log('Table Structure:');
      columns.recordset.forEach(col => {
        console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}${col.COLUMN_DEFAULT ? ` DEFAULT ${col.COLUMN_DEFAULT}` : ''}`);
      });
    } else {
      console.log('❌ ERROR: Table was not created!\n');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Full error:', err);
  } finally {
    await sql.close();
  }
}

createTable();
