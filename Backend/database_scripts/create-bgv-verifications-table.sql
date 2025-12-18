-- Create BGV Verifications Table
-- This table tracks HR verification status for each document in the BGV form

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bgv_verifications')
BEGIN
    CREATE TABLE dbo.bgv_verifications (
        id INT IDENTITY(1,1) PRIMARY KEY,
        fresher_id INT NOT NULL,
        hr_user_id INT NOT NULL,
        document_type NVARCHAR(100) NOT NULL, -- 'demographics', 'personal', 'education', etc.
        document_section NVARCHAR(200) NOT NULL, -- Specific field name like 'passport', 'degree_certificate', etc.
        status NVARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
        comments NVARCHAR(MAX), -- HR comments for rejection or notes
        verified_at DATETIME,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        
        -- Foreign Keys
        CONSTRAINT FK_bgv_verifications_fresher FOREIGN KEY (fresher_id) 
            REFERENCES dbo.freshers(id) ON DELETE CASCADE,
        CONSTRAINT FK_bgv_verifications_hr_user FOREIGN KEY (hr_user_id) 
            REFERENCES dbo.hr_users(id),
            
        -- Constraints
        CONSTRAINT CHK_verification_status CHECK (status IN ('pending', 'verified', 'rejected'))
    );
    
    -- Create indexes for better query performance
    CREATE INDEX IX_bgv_verifications_fresher_id ON dbo.bgv_verifications(fresher_id);
    CREATE INDEX IX_bgv_verifications_hr_user_id ON dbo.bgv_verifications(hr_user_id);
    CREATE INDEX IX_bgv_verifications_status ON dbo.bgv_verifications(status);
    CREATE INDEX IX_bgv_verifications_document_type ON dbo.bgv_verifications(document_type);
    
    PRINT 'Table bgv_verifications created successfully';
END
ELSE
BEGIN
    PRINT 'Table bgv_verifications already exists';
END
GO
