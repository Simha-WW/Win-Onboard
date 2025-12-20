-- Passport and Visa Information Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'passport_visa')
BEGIN
    CREATE TABLE passport_visa (
        id INT IDENTITY(1,1) PRIMARY KEY,
        fresher_id INT NOT NULL,
        has_passport BIT DEFAULT 0,
        passport_number NVARCHAR(50),
        passport_issue_date DATE,
        passport_expiry_date DATE,
        passport_copy_url NVARCHAR(500),
        has_visa BIT DEFAULT 0,
        visa_type NVARCHAR(100),
        visa_expiry_date DATE,
        visa_document_url NVARCHAR(500),
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (fresher_id) REFERENCES freshers(id)
    );
    PRINT 'passport_visa table created successfully';
END
ELSE
BEGIN
    PRINT 'passport_visa table already exists';
END
GO
