const sql = require('mssql');
require('dotenv').config();

async function createVendorVerificationTables() {
    let pool;
    
    try {
        const config = {
            server: process.env.SERVER_NAME,
            database: process.env.DB_NAME,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            options: {
                encrypt: true,
                trustServerCertificate: true,
                enableArithAbort: true
            }
        };

        pool = await sql.connect(config);
        console.log('Connected to database\n');

        // Create vendor_verified table
        const createVerifiedTable = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='vendor_verified' AND xtype='U')
            CREATE TABLE vendor_verified (
                id INT PRIMARY KEY IDENTITY(1,1),
                fresher_id INT NOT NULL,
                verified_by INT,
                verified_at DATETIME DEFAULT GETDATE(),
                comments NVARCHAR(1000),
                created_at DATETIME DEFAULT GETDATE(),
                CONSTRAINT FK_vendor_verified_fresher FOREIGN KEY (fresher_id) REFERENCES freshers(id),
                CONSTRAINT FK_vendor_verified_hr FOREIGN KEY (verified_by) REFERENCES hr_users(id)
            )
        `;

        await pool.request().query(createVerifiedTable);
        console.log('✓ vendor_verified table created successfully');

        // Create vendor_rejected table
        const createRejectedTable = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='vendor_rejected' AND xtype='U')
            CREATE TABLE vendor_rejected (
                id INT PRIMARY KEY IDENTITY(1,1),
                fresher_id INT NOT NULL,
                rejected_by INT,
                rejected_at DATETIME DEFAULT GETDATE(),
                rejection_reason NVARCHAR(1000),
                created_at DATETIME DEFAULT GETDATE(),
                CONSTRAINT FK_vendor_rejected_fresher FOREIGN KEY (fresher_id) REFERENCES freshers(id),
                CONSTRAINT FK_vendor_rejected_hr FOREIGN KEY (rejected_by) REFERENCES hr_users(id)
            )
        `;

        await pool.request().query(createRejectedTable);
        console.log('✓ vendor_rejected table created successfully');

        // Verify the tables
        const verifyQuery = `
            SELECT 'vendor_verified' as table_name, COUNT(*) as record_count FROM vendor_verified
            UNION ALL
            SELECT 'vendor_rejected' as table_name, COUNT(*) as record_count FROM vendor_rejected
        `;

        const result = await pool.request().query(verifyQuery);
        console.log('\nTable verification:');
        console.table(result.recordset);

    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    } finally {
        if (pool) {
            await pool.close();
            console.log('\nDatabase connection closed');
        }
    }
}

createVendorVerificationTables();
