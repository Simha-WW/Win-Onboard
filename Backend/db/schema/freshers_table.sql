-- Freshers Table Schema
-- Stores details of newly onboarded employees/freshers

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='freshers' AND xtype='U')
BEGIN
    CREATE TABLE freshers (
        id INT IDENTITY(1,1) PRIMARY KEY,
        first_name NVARCHAR(100) NOT NULL,
        last_name NVARCHAR(100) NOT NULL,
        email NVARCHAR(255) UNIQUE NOT NULL,
        date_of_birth DATE,
        phone NVARCHAR(20),
        username NVARCHAR(100) UNIQUE NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        department NVARCHAR(100),
        designation NVARCHAR(100),
        joining_date DATE,
        manager_email NVARCHAR(255),
        status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'onboarding')),
        hr_id INT NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        
        -- Foreign key relationship with HR table
        CONSTRAINT FK_freshers_hr_id FOREIGN KEY (hr_id) REFERENCES hr_users(id)
    );

    -- Create indexes for better performance
    CREATE INDEX IX_freshers_email ON freshers(email);
    CREATE INDEX IX_freshers_username ON freshers(username);
    CREATE INDEX IX_freshers_status ON freshers(status);
    CREATE INDEX IX_freshers_hr_id ON freshers(hr_id);
    CREATE INDEX IX_freshers_joining_date ON freshers(joining_date);
END

-- Create update trigger to automatically set updated_at
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_freshers_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER TR_freshers_updated_at
    ON freshers
    AFTER UPDATE
    AS
    BEGIN
        UPDATE freshers 
        SET updated_at = GETDATE()
        WHERE id IN (SELECT id FROM inserted);
    END
    ');
END

-- Create update trigger for HR table as well
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_hr_users_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER TR_hr_users_updated_at
    ON hr_users
    AFTER UPDATE
    AS
    BEGIN
        UPDATE hr_users 
        SET updated_at = GETDATE()
        WHERE id IN (SELECT id FROM inserted);
    END
    ');
END

PRINT 'Freshers table created successfully with triggers';