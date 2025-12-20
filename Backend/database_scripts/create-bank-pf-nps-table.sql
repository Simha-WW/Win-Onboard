-- Bank, PF and NPS Information Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bank_pf_nps')
BEGIN
    CREATE TABLE bank_pf_nps (
        id INT IDENTITY(1,1) PRIMARY KEY,
        fresher_id INT NOT NULL,
        number_of_bank_accounts INT DEFAULT 1,
        bank_account_number NVARCHAR(50),
        ifsc_code NVARCHAR(20),
        name_as_per_bank NVARCHAR(200),
        bank_name NVARCHAR(200),
        branch NVARCHAR(200),
        cancelled_cheque_url NVARCHAR(500),
        uan_pf_number NVARCHAR(50),
        pran_nps_number NVARCHAR(50),
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (fresher_id) REFERENCES freshers(id)
    );
    PRINT 'bank_pf_nps table created successfully';
END
ELSE
BEGIN
    PRINT 'bank_pf_nps table already exists';
END
GO
