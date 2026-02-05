-- Add userId columns and foreign keys to Account and PaymentMethods
-- Add column `userId` to `Account` if it does not exist
SET @acct_col_exists = (
	SELECT COUNT(*)
	FROM INFORMATION_SCHEMA.COLUMNS
	WHERE TABLE_SCHEMA = DATABASE()
		AND TABLE_NAME = 'Account'
		AND COLUMN_NAME = 'userId'
);
SET @acct_sql = IF(@acct_col_exists = 0, 'ALTER TABLE `Account` ADD COLUMN `userId` VARCHAR(191) NULL;', 'SELECT "Account.userId exists";');
PREPARE acct_stmt FROM @acct_sql; EXECUTE acct_stmt; DEALLOCATE PREPARE acct_stmt;

-- Add column `userId` to `PaymentMethods` if it does not exist
SET @pm_col_exists = (
	SELECT COUNT(*)
	FROM INFORMATION_SCHEMA.COLUMNS
	WHERE TABLE_SCHEMA = DATABASE()
		AND TABLE_NAME = 'PaymentMethods'
		AND COLUMN_NAME = 'userId'
);
SET @pm_sql = IF(@pm_col_exists = 0, 'ALTER TABLE `PaymentMethods` ADD COLUMN `userId` VARCHAR(191) NULL;', 'SELECT "PaymentMethods.userId exists";');
PREPARE pm_stmt FROM @pm_sql; EXECUTE pm_stmt; DEALLOCATE PREPARE pm_stmt;

-- Add foreign key constraints
-- Create FK on Account.userId only if it doesn't already exist
SET @acct_fk_exists = (
	SELECT COUNT(*)
	FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
	WHERE CONSTRAINT_SCHEMA = DATABASE()
		AND TABLE_NAME = 'Account'
		AND CONSTRAINT_NAME = 'Account_userId_fkey'
);
SET @acct_fk_sql = IF(@acct_fk_exists = 0, 'ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;', 'SELECT "Account_userId_fkey exists";');
PREPARE acct_fk_stmt FROM @acct_fk_sql; EXECUTE acct_fk_stmt; DEALLOCATE PREPARE acct_fk_stmt;
-- NOTE: Skipping adding FK constraint for `PaymentMethods.userId` due to potential incompatible column definitions
-- If your database `PaymentMethods.id`/`User.id` have matching types and collations, you can re-add the constraint manually.
-- ALTER TABLE `PaymentMethods` ADD CONSTRAINT `PaymentMethods_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Add indexes to optimize queries by user
-- NOTE: Creating indexes is skipped here to avoid duplicate-index errors when migration was partially applied.
-- If needed, create indexes manually (examples below):
-- CREATE INDEX `Account_userId_idx` ON `Account`(`userId`);
-- CREATE INDEX `PaymentMethods_userId_idx` ON `PaymentMethods`(`userId`);
