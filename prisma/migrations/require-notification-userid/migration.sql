
-- Add `userId` column to Notification and enforce NOT NULL when safe

-- Add column `userId` to `Notification` if it does not exist (start as NULL)
SET @col_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'Notification'
        AND COLUMN_NAME = 'userId'
);
SET @add_col_sql = IF(@col_exists = 0, 'ALTER TABLE `Notification` ADD COLUMN `userId` VARCHAR(191) NULL;', 'SELECT "Notification.userId exists";');
PREPARE add_col_stmt FROM @add_col_sql; EXECUTE add_col_stmt; DEALLOCATE PREPARE add_col_stmt;

-- Create index on `userId` if it doesn't exist
SET @idx_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'Notification'
        AND INDEX_NAME = 'Notification_userId_idx'
);
SET @add_idx_sql = IF(@idx_exists = 0, 'CREATE INDEX `Notification_userId_idx` ON `Notification`(`userId`);', 'SELECT "Notification_userId_idx exists";');
PREPARE add_idx_stmt FROM @add_idx_sql; EXECUTE add_idx_stmt; DEALLOCATE PREPARE add_idx_stmt;

-- Add foreign key constraint if it doesn't exist
SET @fk_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND TABLE_NAME = 'Notification'
        AND CONSTRAINT_NAME = 'Notification_userId_fkey'
);
SET @add_fk_sql = IF(@fk_exists = 0, 'ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;', 'SELECT "Notification_userId_fkey exists";');
PREPARE add_fk_stmt FROM @add_fk_sql; EXECUTE add_fk_stmt; DEALLOCATE PREPARE add_fk_stmt;

-- If there are no NULL values in Notification.userId, make the column NOT NULL
SET @null_count = (SELECT COUNT(*) FROM `Notification` WHERE `userId` IS NULL);
SET @make_not_null_sql = IF(@null_count = 0, 'ALTER TABLE `Notification` MODIFY COLUMN `userId` VARCHAR(191) NOT NULL;', 'SELECT CONCAT("Skipping NOT NULL enforcement; found ", @null_count, " NULL userId rows");');
PREPARE nn_stmt FROM @make_not_null_sql; EXECUTE nn_stmt; DEALLOCATE PREPARE nn_stmt;


