-- Manual migration: remove categoryId and recurrence from Bill

-- Drop foreign key constraint if present (Prisma naming convention)
ALTER TABLE `Bill` DROP FOREIGN KEY `Bill_categoryId_fkey`;

-- Drop index if present
DROP INDEX `Bill_categoryId_idx` ON `Bill`;

-- Drop columns (if they exist; will error if not)
ALTER TABLE `Bill`
  DROP COLUMN `categoryId`,
  DROP COLUMN `recurrence`;

-- Note: If your DB uses different FK/index names or already dropped columns,
-- adjust the statements accordingly before applying.
