-- IT Tasks Table
-- Tracks onboarding tasks that need to be completed by IT team for each new hire

-- Drop table if exists (for re-running migration)
IF OBJECT_ID('dbo.it_tasks', 'U') IS NOT NULL
    DROP TABLE dbo.it_tasks;
GO

-- Create IT tasks table
CREATE TABLE dbo.it_tasks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    fresher_id INT NOT NULL,
    sent_to_it_date DATETIME2 DEFAULT GETDATE(),
    
    -- Task completion status (bit fields = boolean in MSSQL)
    work_email_generated BIT DEFAULT 0,
    laptop_allocated BIT DEFAULT 0,
    software_installed BIT DEFAULT 0,
    access_cards_issued BIT DEFAULT 0,
    training_scheduled BIT DEFAULT 0,
    hardware_accessories BIT DEFAULT 0,
    vpn_setup BIT DEFAULT 0,
    network_access_granted BIT DEFAULT 0,
    domain_account_created BIT DEFAULT 0,
    security_tools_configured BIT DEFAULT 0,
    
    -- Metadata
    notes NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    -- Foreign key constraint
    CONSTRAINT FK_it_tasks_fresher_id FOREIGN KEY (fresher_id) 
        REFERENCES freshers(id) ON DELETE CASCADE,
    
    -- Ensure one IT task record per fresher
    CONSTRAINT UQ_it_tasks_fresher_id UNIQUE(fresher_id)
);
GO

-- Index for faster lookups
CREATE INDEX idx_it_tasks_fresher_id ON dbo.it_tasks(fresher_id);
GO

-- Trigger to auto-update updated_at timestamp
CREATE OR ALTER TRIGGER trg_it_tasks_updated_at
ON dbo.it_tasks
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE it_tasks
    SET updated_at = GETDATE()
    FROM it_tasks
    INNER JOIN inserted ON it_tasks.id = inserted.id;
END;
GO
