-- Manual migration: remove categoryId and recurrence from Bill
-- Manual migration: remove categoryId and recurrence from Bill

-- Safely drop foreign key if it exists
SELECT CONSTRAINT_NAME INTO @fkName
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'Bill'
  AND COLUMN_NAME = 'categoryId'
  AND REFERENCED_TABLE_NAME IS NOT NULL
LIMIT 1;

SET @s = IF(@fkName IS NULL, 'SELECT 1', CONCAT('ALTER TABLE `Bill` DROP FOREIGN KEY `', @fkName, '`'));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Safely drop index on categoryId if it exists
SELECT INDEX_NAME INTO @idxName
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'Bill'
  AND COLUMN_NAME = 'categoryId'
LIMIT 1;

SET @s = IF(@idxName IS NULL, 'SELECT 1', CONCAT('DROP INDEX `', @idxName, '` ON `Bill`'));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop columns only if they exist
SELECT COLUMN_NAME INTO @col1 FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Bill' AND COLUMN_NAME = 'categoryId' LIMIT 1;
SET @s = IF(@col1 IS NULL, 'SELECT 1', 'ALTER TABLE `Bill` DROP COLUMN `categoryId`');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COLUMN_NAME INTO @col2 FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Bill' AND COLUMN_NAME = 'recurrence' LIMIT 1;
SET @s = IF(@col2 IS NULL, 'SELECT 1', 'ALTER TABLE `Bill` DROP COLUMN `recurrence`');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Note: If your DB uses different FK/index names or already dropped columns,
-- these statements will safely no-op instead of failing.
