-- HR Table Schema
-- Stores HR personnel information who can manage the onboarding process
-- HR users authenticate via Microsoft Azure AD, no username/password needed

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='hr_users' AND xtype='U')
BEGIN
    CREATE TABLE hr_users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        first_name NVARCHAR(100) NOT NULL,
        last_name NVARCHAR(100) NOT NULL,
        email NVARCHAR(255) UNIQUE NOT NULL, -- Primary identifier from Microsoft authentication
        role NVARCHAR(50) DEFAULT 'hr_executive' CHECK (role IN ('hr_admin', 'hr_manager', 'hr_executive')),
        department NVARCHAR(100),
        phone NVARCHAR(20),
        is_active BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );

    -- Create indexes for better performance
    CREATE INDEX IX_hr_users_email ON hr_users(email);
    CREATE INDEX IX_hr_users_is_active ON hr_users(is_active);
END

-- Insert HR user records
-- Add your work email for testing HR login functionality
IF NOT EXISTS (SELECT * FROM hr_users WHERE email = 'simha.pulipati@winwire.com')
BEGIN
    INSERT INTO hr_users (
        first_name, 
        last_name, 
        email, 
        role, 
        department, 
        phone, 
        is_active
    ) VALUES (
        'Simha',
        'Pulipati',
        'simha.pulipati@winwire.com',
        'hr_admin',
        'Human Resources',
        '+1-555-0101',
        1
    );
END

-- Keep the test user for development
IF NOT EXISTS (SELECT * FROM hr_users WHERE email = 'vijayasimhatest@gmail.com')
BEGIN
    INSERT INTO hr_users (
        first_name, 
        last_name, 
        email, 
        role, 
        department, 
        phone, 
        is_active
    ) VALUES (
        'Vijaya Simha',
        'Test',
        'vijayasimhatest@gmail.com',
        'hr_admin',
        'Human Resources',
        '+1-555-0100',
        1
    );
END

PRINT 'HR users table created successfully with initial test user';