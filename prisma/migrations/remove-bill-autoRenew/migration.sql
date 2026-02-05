-- Migration: remove `autoRenew` column from `Bill` table
-- This migration is idempotent: it checks whether the column exists before attempting to drop it.

SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Bill'
    AND COLUMN_NAME = 'autoRenew'
);

SET @sql = IF(@col_exists = 1,
  'ALTER TABLE `Bill` DROP COLUMN `autoRenew`;',
  'SELECT "Bill.autoRenew does not exist, skipping";'
);

PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- COMMIT is not necessary for DDL in MySQL, but left here for clarity if wrapped in transaction manager.
