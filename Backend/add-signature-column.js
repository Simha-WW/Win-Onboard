require('dotenv').config();
const sql = require('mssql');

const config = {
    server: process.env.DB_SERVER || 'sql-server-winbuild.database.windows.net',
    database: process.env.DB_NAME || 'winbuild-db',
    user: process.env.DB_USER || 'sqladmin',
    password: process.env.DB_PASSWORD || 'Winwire@8520',
    options: {
        encrypt: true,
        trustServerCertificate: false
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

async function addSignatureColumn() {
    try {
        console.log('🔌 Connecting to database...');
        await sql.connect(config);
        console.log('✅ Connected');

        console.log('🔍 Checking if signature_url column exists...');
        const checkResult = await sql.query`
            SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'bgv_submissions' 
            AND COLUMN_NAME = 'signature_url'
        `;

        if (checkResult.recordset.length === 0) {
            console.log('➕ Adding signature_url column...');
            await sql.query`
                ALTER TABLE bgv_submissions 
                ADD signature_url NVARCHAR(500)
            `;
            console.log('✅ signature_url column added successfully');
        } else {
            console.log('ℹ️  signature_url column already exists');
        }

        await sql.close();
        console.log('✅ Migration complete');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

addSignatureColumn();
