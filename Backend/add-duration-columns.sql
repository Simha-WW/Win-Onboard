-- Add duration_to_complete_days and deadline columns to user_learning_assignments table

-- Check if columns already exist before adding them
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('user_learning_assignments') AND name = 'duration_to_complete_days')
BEGIN
    ALTER TABLE user_learning_assignments
    ADD duration_to_complete_days INT NULL;
    PRINT 'Added duration_to_complete_days column';
END
ELSE
BEGIN
    PRINT 'duration_to_complete_days column already exists';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('user_learning_assignments') AND name = 'deadline')
BEGIN
    ALTER TABLE user_learning_assignments
    ADD deadline DATETIME NULL;
    PRINT 'Added deadline column';
END
ELSE
BEGIN
    PRINT 'deadline column already exists';
END

-- Add duration_minutes column to user_learning_progress if not exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('user_learning_progress') AND name = 'duration_minutes')
BEGIN
    ALTER TABLE user_learning_progress
    ADD duration_minutes INT NULL DEFAULT 0;
    PRINT 'Added duration_minutes column to user_learning_progress';
END
ELSE
BEGIN
    PRINT 'duration_minutes column already exists in user_learning_progress';
END
