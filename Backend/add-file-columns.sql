-- Add file storage columns to existing bgv_demographics table
USE hackathon;

-- Add Aadhaar file storage columns
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'aadhaar_file_data')
    ALTER TABLE bgv_demographics ADD aadhaar_file_data VARBINARY(MAX);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'aadhaar_file_name')
    ALTER TABLE bgv_demographics ADD aadhaar_file_name NVARCHAR(255);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'aadhaar_file_type')
    ALTER TABLE bgv_demographics ADD aadhaar_file_type NVARCHAR(100);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'aadhaar_file_size')
    ALTER TABLE bgv_demographics ADD aadhaar_file_size BIGINT;

-- Add PAN file storage columns
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'pan_file_data')
    ALTER TABLE bgv_demographics ADD pan_file_data VARBINARY(MAX);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'pan_file_name')
    ALTER TABLE bgv_demographics ADD pan_file_name NVARCHAR(255);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'pan_file_type')
    ALTER TABLE bgv_demographics ADD pan_file_type NVARCHAR(100);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'pan_file_size')
    ALTER TABLE bgv_demographics ADD pan_file_size BIGINT;

-- Add Resume file storage columns
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'resume_file_data')
    ALTER TABLE bgv_demographics ADD resume_file_data VARBINARY(MAX);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'resume_file_name')
    ALTER TABLE bgv_demographics ADD resume_file_name NVARCHAR(255);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'resume_file_type')
    ALTER TABLE bgv_demographics ADD resume_file_type NVARCHAR(100);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'resume_file_size')
    ALTER TABLE bgv_demographics ADD resume_file_size BIGINT;

PRINT 'File storage columns added to bgv_demographics table successfully!';