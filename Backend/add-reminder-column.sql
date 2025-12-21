-- Add last_reminder_sent column to user_learning_assignments table

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('user_learning_assignments') AND name = 'last_reminder_sent')
BEGIN
    ALTER TABLE user_learning_assignments
    ADD last_reminder_sent DATETIME NULL;
    PRINT 'Added last_reminder_sent column';
END
ELSE
BEGIN
    PRINT 'last_reminder_sent column already exists';
END
