const sql = require('mssql');
require('dotenv').config();

async function createVendorTable() {
    let pool;
    
    try {
        // Create connection
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
        console.log('Connected to database');

        // Create vendor_details table
        const createTableQuery = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='vendor_details' AND xtype='U')
            CREATE TABLE vendor_details (
                vendor_id INT PRIMARY KEY IDENTITY(1,1),
                vendor_name NVARCHAR(255) NOT NULL,
                email NVARCHAR(255) NOT NULL UNIQUE,
                contact_number NVARCHAR(20),
                company_name NVARCHAR(255),
                status NVARCHAR(50) DEFAULT 'active',
                created_at DATETIME DEFAULT GETDATE(),
                updated_at DATETIME DEFAULT GETDATE()
            )
        `;

        await pool.request().query(createTableQuery);
        console.log('✓ vendor_details table created successfully');

        // Check if vendor already exists
        const checkQuery = `SELECT * FROM vendor_details WHERE email = 'vijayasimhatest@gmail.com'`;
        const checkResult = await pool.request().query(checkQuery);

        if (checkResult.recordset.length === 0) {
            // Insert initial vendor
            const insertQuery = `
                INSERT INTO vendor_details (vendor_name, email, company_name, status) 
                VALUES ('Test Vendor', 'vijayasimhatest@gmail.com', 'Document Verification Services', 'active')
            `;

            await pool.request().query(insertQuery);
            console.log('✓ Initial vendor added successfully');
        } else {
            console.log('✓ Vendor already exists');
        }

        // Verify the data
        const result = await pool.request().query('SELECT * FROM vendor_details');
        console.log('\nVendor details:');
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

createVendorTable();
