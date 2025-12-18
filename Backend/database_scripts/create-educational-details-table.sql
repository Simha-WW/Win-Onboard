-- Create educational_details table to store both educational qualifications and additional certificates
-- This table supports multiple qualifications per employee with document storage

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'educational_details')
BEGIN
    CREATE TABLE educational_details (
        id INT IDENTITY(1,1) PRIMARY KEY,
        employee_id NVARCHAR(100) NOT NULL,
        
        -- Type: 'educational' or 'additional'
        qualification_type NVARCHAR(50) NOT NULL,
        
        -- Fields for Educational Qualifications
        qualification NVARCHAR(200),              -- e.g., 10th, 12th, Bachelor's, Master's, etc.
        university_institution NVARCHAR(500),     -- University or Institution name
        cgpa_percentage NVARCHAR(50),             -- e.g., 8.2, 82%, 7.5/10
        year_of_passing INT,                      -- Year of passing
        
        -- Field for Additional Qualifications/Certificates
        certificate_name NVARCHAR(500),           -- Name of the certificate/qualification
        
        -- Documents storage (JSON array)
        documents NVARCHAR(MAX),                  -- JSON array of document objects: [{name, data, type, size}]
        
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    
    PRINT '✅ Created educational_details table successfully';
END
ELSE
BEGIN
    PRINT 'ℹ️ educational_details table already exists';
END

GO
