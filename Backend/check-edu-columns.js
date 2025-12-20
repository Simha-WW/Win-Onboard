const sql = require('mssql');
require('dotenv').config();

async function checkEducationalColumns() {
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

        // Get column information for educational_details table
        const result = await pool.request().query(`
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                CHARACTER_MAXIMUM_LENGTH,
                IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'educational_details'
            ORDER BY ORDINAL_POSITION
        `);

        console.log('Columns in educational_details table:');
        console.table(result.recordset);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

checkEducationalColumns();
