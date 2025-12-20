/**
 * Create Learning & Development Department Table
 * Run with: node create-learning-dept-table.js
 */

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

async function createLearningDeptTable() {
    try {
        console.log('🔌 Connecting to database...');
        await sql.connect(config);
        console.log('✅ Connected');

        console.log('📋 Creating learning_dept table...');
        
        // Create learning_dept table
        await sql.query`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='learning_dept' AND xtype='U')
            BEGIN
                CREATE TABLE learning_dept (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    email NVARCHAR(255) NOT NULL UNIQUE,
                    password NVARCHAR(255) NOT NULL,
                    first_name NVARCHAR(100),
                    last_name NVARCHAR(100),
                    role NVARCHAR(100) DEFAULT 'L&D Coordinator',
                    department NVARCHAR(50) DEFAULT 'Learning & Development',
                    phone_number NVARCHAR(20),
                    is_active BIT DEFAULT 1,
                    notification_preferences NVARCHAR(MAX) DEFAULT '{"training_notifications": true, "new_employee_notifications": true}',
                    created_at DATETIME2 DEFAULT GETDATE(),
                    updated_at DATETIME2 DEFAULT GETDATE()
                );
                PRINT 'Learning department table created successfully';
            END
            ELSE
            BEGIN
                PRINT 'Learning department table already exists';
            END
        `;

        console.log('✅ Table structure created');

        // Check if the user already exists
        console.log('🔍 Checking if L&D user exists...');
        const existingUser = await sql.query`
            SELECT id FROM learning_dept WHERE email = 'saitharakreddyv59@gmail.com'
        `;

        if (existingUser.recordset.length > 0) {
            console.log('ℹ️  L&D user already exists, updating password...');
            await sql.query`
                UPDATE learning_dept 
                SET password = '#Since2004',
                    updated_at = GETDATE()
                WHERE email = 'saitharakreddyv59@gmail.com'
            `;
            console.log('✅ Password updated');
        } else {
            console.log('➕ Inserting default L&D user...');
            await sql.query`
                INSERT INTO learning_dept (
                    email, 
                    password, 
                    first_name, 
                    last_name, 
                    role, 
                    department,
                    is_active,
                    notification_preferences
                ) VALUES (
                    'saitharakreddyv59@gmail.com',
                    '#Since2004',
                    'Learning',
                    'Administrator',
                    'L&D Coordinator',
                    'Learning & Development',
                    1,
                    '{"training_notifications": true, "new_employee_notifications": true}'
                )
            `;
            console.log('✅ Default L&D user created');
        }

        // Verify the data
        console.log('🔍 Verifying L&D users...');
        const users = await sql.query`
            SELECT id, email, first_name, last_name, role, department, is_active, created_at
            FROM learning_dept
        `;

        console.log('📋 L&D Users:');
        console.table(users.recordset);

        await sql.close();
        console.log('✅ Setup complete!');
        console.log('\n📧 L&D Team Member Created:');
        console.log('   Email: saitharakreddyv59@gmail.com');
        console.log('   Password: #Since2004');
        console.log('   Role: L&D Coordinator');

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

createLearningDeptTable();
