const { getMSSQLPool, initializeDatabases } = require('./dist/config/database.js');

async function setupPersonalDetailsTables() {
    try {
        console.log('🔧 Initializing database connection...');
        await initializeDatabases();
        const pool = getMSSQLPool();
        
        console.log('🔍 Checking existing BGV tables...');
        const result = await pool.request().query("SELECT name FROM sys.tables WHERE name LIKE 'bgv_%' ORDER BY name");
        console.log('📋 Current BGV tables:', result.recordset.map(t => t.name));
        
        console.log('🔍 Checking for bgv_emergency_contacts table...');
        const emergencyCheck = await pool.request().query("SELECT COUNT(*) as count FROM sys.tables WHERE name = 'bgv_emergency_contacts'");
        
        if (emergencyCheck.recordset[0].count === 0) {
            console.log('🔧 Creating bgv_emergency_contacts table...');
            await pool.request().query(`
                CREATE TABLE bgv_emergency_contacts (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    submission_id INT NOT NULL,
                    contact_person_name NVARCHAR(100) NOT NULL,
                    mobile NVARCHAR(15) NOT NULL,
                    relationship NVARCHAR(50) NOT NULL,
                    created_at DATETIME2 DEFAULT GETDATE(),
                    updated_at DATETIME2 DEFAULT GETDATE(),
                    FOREIGN KEY (submission_id) REFERENCES bgv_submissions(id) ON DELETE CASCADE
                )
            `);
            console.log('✅ bgv_emergency_contacts table created successfully');
        } else {
            console.log('✅ bgv_emergency_contacts table already exists');
        }
        
        // Check and update bgv_personal column name if needed
        console.log('🔍 Checking bgv_personal table structure...');
        const columnCheck = await pool.request().query(`
            SELECT name FROM sys.columns 
            WHERE object_id = OBJECT_ID('bgv_personal') 
            AND name IN ('num_children', 'number_of_children')
        `);
        
        console.log('📊 Personal table columns found:', columnCheck.recordset.map(c => c.name));
        
        if (columnCheck.recordset.some(c => c.name === 'num_children')) {
            console.log('🔧 Renaming num_children to number_of_children...');
            await pool.request().query("EXEC sp_rename 'bgv_personal.num_children', 'number_of_children', 'COLUMN'");
            console.log('✅ Column renamed successfully');
        }
        
        console.log('🎉 Database setup complete! Personal details functionality is ready.');
        
    } catch (err) {
        console.error('❌ Error setting up tables:', err.message);
        console.error('Stack:', err.stack);
    }
}

setupPersonalDetailsTables();