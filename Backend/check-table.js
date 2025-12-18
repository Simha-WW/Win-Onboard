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

async function checkTable() {
  try {
    await sql.connect(config);
    
    // Check if bgv_verifications table exists
    const result = await sql.query`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'dbo' 
      AND TABLE_NAME = 'bgv_verifications'
    `;
    
    console.log('\n=== BGV_VERIFICATIONS TABLE CHECK ===\n');
    
    if (result.recordset.length > 0) {
      console.log('✅ Table EXISTS: bgv_verifications');
      
      // Get table structure
      const columns = await sql.query`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          CHARACTER_MAXIMUM_LENGTH,
          IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'bgv_verifications'
        ORDER BY ORDINAL_POSITION
      `;
      
      console.log('\nTable Columns:');
      columns.recordset.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''}) ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      // Check foreign keys
      const fks = await sql.query`
        SELECT 
          fk.name AS FK_NAME,
          OBJECT_NAME(fk.parent_object_id) AS TABLE_NAME,
          COL_NAME(fc.parent_object_id, fc.parent_column_id) AS COLUMN_NAME,
          OBJECT_NAME(fk.referenced_object_id) AS REFERENCED_TABLE,
          COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS REFERENCED_COLUMN
        FROM sys.foreign_keys AS fk
        INNER JOIN sys.foreign_key_columns AS fc 
          ON fk.object_id = fc.constraint_object_id
        WHERE OBJECT_NAME(fk.parent_object_id) = 'bgv_verifications'
      `;
      
      if (fks.recordset.length > 0) {
        console.log('\nForeign Keys:');
        fks.recordset.forEach(fk => {
          console.log(`  - ${fk.FK_NAME}: ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE}.${fk.REFERENCED_COLUMN}`);
        });
      }
      
      // Check indexes
      const indexes = await sql.query`
        SELECT 
          i.name AS INDEX_NAME,
          i.type_desc,
          COL_NAME(ic.object_id, ic.column_id) AS COLUMN_NAME
        FROM sys.indexes AS i
        INNER JOIN sys.index_columns AS ic 
          ON i.object_id = ic.object_id AND i.index_id = ic.index_id
        WHERE i.object_id = OBJECT_ID('bgv_verifications')
        AND i.is_primary_key = 0
      `;
      
      if (indexes.recordset.length > 0) {
        console.log('\nIndexes:');
        indexes.recordset.forEach(idx => {
          console.log(`  - ${idx.INDEX_NAME} on ${idx.COLUMN_NAME}`);
        });
      }
      
      // Get row count
      const count = await sql.query`SELECT COUNT(*) as count FROM bgv_verifications`;
      console.log(`\nTotal Records: ${count.recordset[0].count}`);
      
    } else {
      console.log('❌ Table DOES NOT EXIST: bgv_verifications');
      console.log('\nAvailable tables:');
      
      const tables = await sql.query`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = 'dbo'
        ORDER BY TABLE_NAME
      `;
      
      tables.recordset.forEach(t => {
        console.log(`  - ${t.TABLE_NAME}`);
      });
    }
    
    console.log('\n=====================================\n');
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sql.close();
  }
}

checkTable();
