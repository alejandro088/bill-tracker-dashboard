-- AlterTable
ALTER TABLE `Payment` MODIFY `billId` String NULL;

-- Add category and description to payments
ALTER TABLE `Payment` ADD COLUMN `category` String NOT NULL DEFAULT 'others';
ALTER TABLE `Payment` ADD COLUMN `description` String NULL;
