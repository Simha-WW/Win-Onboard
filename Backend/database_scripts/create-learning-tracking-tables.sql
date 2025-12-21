-- Create user learning assignments table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_learning_assignments')
BEGIN
    CREATE TABLE user_learning_assignments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        fresher_id INT NOT NULL,
        department NVARCHAR(100) NOT NULL,
        assigned_date DATETIME DEFAULT GETDATE(),
        completed_count INT DEFAULT 0,
        total_count INT DEFAULT 0,
        FOREIGN KEY (fresher_id) REFERENCES freshers(id),
        UNIQUE(fresher_id)
    );
    PRINT 'Created user_learning_assignments table';
END
GO

-- Create user learning progress table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_learning_progress')
BEGIN
    CREATE TABLE user_learning_progress (
        id INT IDENTITY(1,1) PRIMARY KEY,
        fresher_id INT NOT NULL,
        learning_id INT NOT NULL,
        learning_table NVARCHAR(50) NOT NULL, -- 'da_learnings', 'app_dev_learnings', etc.
        title NVARCHAR(255) NOT NULL,
        learning_link NVARCHAR(500),
        description NVARCHAR(MAX),
        duration_minutes INT,
        is_completed BIT DEFAULT 0,
        completed_date DATETIME NULL,
        started_date DATETIME NULL,
        progress_percentage INT DEFAULT 0,
        notes NVARCHAR(MAX),
        FOREIGN KEY (fresher_id) REFERENCES freshers(id),
        CONSTRAINT UQ_User_Learning UNIQUE(fresher_id, learning_id, learning_table)
    );
    PRINT 'Created user_learning_progress table';
END
GO

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_learning_assignments_fresher 
ON user_learning_assignments(fresher_id);

CREATE INDEX IF NOT EXISTS idx_user_learning_progress_fresher 
ON user_learning_progress(fresher_id);

CREATE INDEX IF NOT EXISTS idx_user_learning_progress_completed 
ON user_learning_progress(is_completed);

PRINT 'Learning tracking tables created successfully!';
