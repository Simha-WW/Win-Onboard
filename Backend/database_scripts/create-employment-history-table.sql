-- Employment History Table (Optional Section)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'employment_history')
BEGIN
    CREATE TABLE employment_history (
        id INT IDENTITY(1,1) PRIMARY KEY,
        fresher_id INT NOT NULL,
        company_name NVARCHAR(200),
        designation NVARCHAR(150),
        employment_start_date DATE,
        employment_end_date DATE,
        reason_for_leaving NVARCHAR(MAX),
        offer_letter_url NVARCHAR(500),
        experience_letter_url NVARCHAR(500),
        payslips_url NVARCHAR(MAX), -- Can store multiple payslips as JSON array
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (fresher_id) REFERENCES freshers(id)
    );
    PRINT 'employment_history table created successfully';
END
ELSE
BEGIN
    PRINT 'employment_history table already exists';
END
GO
