-- Create Policies Table
-- Stores company policy documents with metadata

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'policies' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.policies (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        file_data VARBINARY(MAX) NOT NULL,
        file_name NVARCHAR(255) NOT NULL,
        file_type NVARCHAR(50) NOT NULL,
        file_size BIGINT NOT NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'required', -- 'required' or 'optional'
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        created_by NVARCHAR(255),
        updated_by NVARCHAR(255)
    );

    PRINT 'Policies table created successfully';
END
ELSE
BEGIN
    PRINT 'Policies table already exists';
END
GO

-- Create index for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_policies_status' AND object_id = OBJECT_ID('dbo.policies'))
BEGIN
    CREATE INDEX IX_policies_status ON dbo.policies(status, is_active);
    PRINT 'Index created on policies table';
END
GO
