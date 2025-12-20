-- Create vendor_verified table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='vendor_verified' AND xtype='U')
CREATE TABLE vendor_verified (
    id INT PRIMARY KEY IDENTITY(1,1),
    fresher_id INT NOT NULL,
    verified_by INT,
    verified_at DATETIME DEFAULT GETDATE(),
    comments NVARCHAR(1000),
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_vendor_verified_fresher FOREIGN KEY (fresher_id) REFERENCES freshers(id),
    CONSTRAINT FK_vendor_verified_hr FOREIGN KEY (verified_by) REFERENCES hr_users(id)
);

-- Create vendor_rejected table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='vendor_rejected' AND xtype='U')
CREATE TABLE vendor_rejected (
    id INT PRIMARY KEY IDENTITY(1,1),
    fresher_id INT NOT NULL,
    rejected_by INT,
    rejected_at DATETIME DEFAULT GETDATE(),
    rejection_reason NVARCHAR(1000),
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_vendor_rejected_fresher FOREIGN KEY (fresher_id) REFERENCES freshers(id),
    CONSTRAINT FK_vendor_rejected_hr FOREIGN KEY (rejected_by) REFERENCES hr_users(id)
);

-- Display the created tables
SELECT 'vendor_verified' as table_name, COUNT(*) as record_count FROM vendor_verified
UNION ALL
SELECT 'vendor_rejected' as table_name, COUNT(*) as record_count FROM vendor_rejected;
