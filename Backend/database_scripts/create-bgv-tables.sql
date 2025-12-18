-- BGV Tables Creation Script
-- Creates all necessary tables for Background Verification system

-- Create BGV Submissions table (main tracking table)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bgv_submissions')
BEGIN
    CREATE TABLE bgv_submissions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        fresher_id INT NOT NULL,
        submission_status NVARCHAR(20) DEFAULT 'draft' CHECK (submission_status IN ('draft', 'submitted', 'in_review', 'verified', 'rejected')),
        current_section NVARCHAR(50) DEFAULT 'demographics',
        submitted_at DATETIME2,
        reviewed_at DATETIME2,
        reviewed_by NVARCHAR(100),
        review_comments NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Created bgv_submissions table';
END
ELSE
BEGIN
    PRINT 'bgv_submissions table already exists';
END

GO

-- Create BGV Demographics table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bgv_demographics')
BEGIN
    CREATE TABLE bgv_demographics (
        id INT IDENTITY(1,1) PRIMARY KEY,
        submission_id INT NOT NULL,
        
        -- Basic Information
        salutation NVARCHAR(10),
        first_name NVARCHAR(100),
        middle_name NVARCHAR(100),
        last_name NVARCHAR(100),
        name_for_records NVARCHAR(200),
        dob_as_per_records DATE,
        celebrated_dob DATE,
        gender NVARCHAR(20),
        blood_group NVARCHAR(5),
        
        -- Contact Information
        whatsapp_number NVARCHAR(15),
        linkedin_url NVARCHAR(500),
        
        -- Identity Documents
        aadhaar_card_number NVARCHAR(12),
        pan_card_number NVARCHAR(10),
        
        -- Communication Address
        comm_house_number NVARCHAR(100),
        comm_street_name NVARCHAR(200),
        comm_city NVARCHAR(100),
        comm_district NVARCHAR(100),
        comm_state NVARCHAR(100),
        comm_country NVARCHAR(100) DEFAULT 'India',
        comm_pin_code NVARCHAR(10),
        
        -- Permanent Address
        perm_same_as_comm BIT DEFAULT 0,
        perm_house_number NVARCHAR(100),
        perm_street_name NVARCHAR(200),
        perm_city NVARCHAR(100),
        perm_district NVARCHAR(100),
        perm_state NVARCHAR(100),
        perm_country NVARCHAR(100) DEFAULT 'India',
        perm_pin_code NVARCHAR(10),
        
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (submission_id) REFERENCES bgv_submissions(id) ON DELETE CASCADE
    );
    PRINT 'Created bgv_demographics table';
END
ELSE
BEGIN
    PRINT 'bgv_demographics table already exists';
END

GO

-- Create BGV Personal Information table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bgv_personal')
BEGIN
    CREATE TABLE bgv_personal (
        id INT IDENTITY(1,1) PRIMARY KEY,
        submission_id INT NOT NULL,
        
        marital_status NVARCHAR(20),
        num_children INT DEFAULT 0,
        
        -- Father Information
        father_name NVARCHAR(100),
        father_dob DATE,
        father_deceased BIT DEFAULT 0,
        
        -- Mother Information
        mother_name NVARCHAR(100),
        mother_dob DATE,
        mother_deceased BIT DEFAULT 0,
        
        -- Emergency Contact
        emergency_contact_name NVARCHAR(100),
        emergency_contact_phone NVARCHAR(15),
        emergency_contact_relationship NVARCHAR(50),
        
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (submission_id) REFERENCES bgv_submissions(id) ON DELETE CASCADE
    );
    PRINT 'Created bgv_personal table';
END
ELSE
BEGIN
    PRINT 'bgv_personal table already exists';
END

GO

-- Create BGV Education table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bgv_education')
BEGIN
    CREATE TABLE bgv_education (
        id INT IDENTITY(1,1) PRIMARY KEY,
        submission_id INT NOT NULL,
        
        qualification NVARCHAR(100),
        university_institution NVARCHAR(200),
        cgpa_percentage NVARCHAR(10),
        year_of_passing NVARCHAR(4),
        additional_qualification_name NVARCHAR(100),
        
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (submission_id) REFERENCES bgv_submissions(id) ON DELETE CASCADE
    );
    PRINT 'Created bgv_education table';
END
ELSE
BEGIN
    PRINT 'bgv_education table already exists';
END

GO

-- Create BGV Employment History table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bgv_employment')
BEGIN
    CREATE TABLE bgv_employment (
        id INT IDENTITY(1,1) PRIMARY KEY,
        submission_id INT NOT NULL,
        
        company_name NVARCHAR(200),
        job_title NVARCHAR(100),
        employment_type NVARCHAR(50),
        start_date DATE,
        end_date DATE,
        is_current BIT DEFAULT 0,
        reason_for_leaving NVARCHAR(MAX),
        
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (submission_id) REFERENCES bgv_submissions(id) ON DELETE CASCADE
    );
    PRINT 'Created bgv_employment table';
END
ELSE
BEGIN
    PRINT 'bgv_employment table already exists';
END

GO

-- Create BGV Documents table (for file uploads)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bgv_documents')
BEGIN
    CREATE TABLE bgv_documents (
        id INT IDENTITY(1,1) PRIMARY KEY,
        submission_id INT NOT NULL,
        
        document_type NVARCHAR(50) NOT NULL, -- 'aadhaar', 'pan', 'resume', 'passport', etc.
        document_name NVARCHAR(200),
        file_path NVARCHAR(500),
        file_size BIGINT,
        mime_type NVARCHAR(100),
        verification_status NVARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
        verified_by NVARCHAR(100),
        verified_at DATETIME2,
        rejection_reason NVARCHAR(MAX),
        
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (submission_id) REFERENCES bgv_submissions(id) ON DELETE CASCADE
    );
    PRINT 'Created bgv_documents table';
END
ELSE
BEGIN
    PRINT 'bgv_documents table already exists';
END

GO

PRINT 'BGV database schema creation completed successfully!';