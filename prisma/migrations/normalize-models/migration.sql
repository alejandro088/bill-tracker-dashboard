ALTER TABLE `Bill` DROP COLUMN `paymentProvider`, MODIFY `serviceId` VARCHAR(191) NOT NULL;
ALTER TABLE `Payment` DROP COLUMN `name`, DROP COLUMN `dueDate`, DROP COLUMN `recurrence`, DROP COLUMN `category`, MODIFY `paymentProvider` VARCHAR(191) NOT NULL;
