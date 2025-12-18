-- Simple script to create missing BGV tables
-- Run this manually in SQL Server Management Studio or sqlcmd

-- Create bgv_emergency_contacts table if it doesn't exist
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

-- Update bgv_personal table column name if needed
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_personal') AND name = 'num_children')
BEGIN
    EXEC sp_rename 'bgv_personal.num_children', 'number_of_children', 'COLUMN';
    PRINT 'Renamed num_children to number_of_children';
END

-- Add unique constraint to prevent duplicate mobile numbers per submission (optional)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UK_bgv_emergency_contacts_submission_mobile' AND object_id = OBJECT_ID('bgv_emergency_contacts'))
BEGIN
    ALTER TABLE bgv_emergency_contacts 
    ADD CONSTRAINT UK_bgv_emergency_contacts_submission_mobile 
    UNIQUE (submission_id, mobile);
    PRINT 'Added unique constraint for emergency contact mobile numbers';
END