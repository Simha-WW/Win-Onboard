const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'Startup@123',
    server: 'localhost\\SQLEXPRESS',
    database: 'WinBoard',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        connectionTimeout: 30000,
        requestTimeout: 30000
    }
};

async function createEmergencyContactsTable() {
    try {
        console.log('Connecting to database...');
        const pool = await sql.connect(config);
        console.log('✅ Connected to database');
        
        // Create emergency contacts table
        const createTableQuery = `
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bgv_emergency_contacts')
            BEGIN
                CREATE TABLE bgv_emergency_contacts (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    submission_id INT NOT NULL,
                    contact_person_name NVARCHAR(100) NOT NULL,
                    mobile NVARCHAR(15) NOT NULL,
                    relationship NVARCHAR(50) NOT NULL,
                    created_at DATETIME2 DEFAULT GETDATE(),
                    updated_at DATETIME2 DEFAULT GETDATE(),
                    FOREIGN KEY (submission_id) REFERENCES bgv_submissions(id) ON DELETE CASCADE
                );
                PRINT 'Created bgv_emergency_contacts table';
            END
            ELSE
            BEGIN
                PRINT 'bgv_emergency_contacts table already exists';
            END
        `;
        
        await pool.request().query(createTableQuery);
        console.log('✅ Emergency contacts table created/verified');
        
        // Update bgv_personal table structure
        const updatePersonalQuery = `
            IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_personal') AND name = 'num_children')
            BEGIN
                EXEC sp_rename 'bgv_personal.num_children', 'number_of_children', 'COLUMN';
                PRINT 'Renamed num_children to number_of_children';
            END
        `;
        
        await pool.request().query(updatePersonalQuery);
        console.log('✅ Personal table updated');
        
        await pool.close();
        console.log('Database connection closed');
        
    } catch (err) {
        console.error('❌ Error creating tables:', err);
        process.exit(1);
    }
}

createEmergencyContactsTable();