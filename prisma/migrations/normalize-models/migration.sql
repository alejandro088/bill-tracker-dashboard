ALTER TABLE `Bill` DROP COLUMN `paymentProvider`;
ALTER TABLE `Payment` DROP COLUMN `name`, DROP COLUMN `dueDate`, DROP COLUMN `recurrence`, DROP COLUMN `category`;
