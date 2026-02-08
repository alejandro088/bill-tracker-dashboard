-- Add reminder preference columns to User
ALTER TABLE `User`
  ADD COLUMN `reminderEnabled` BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN `reminderWindowDays` INT NOT NULL DEFAULT 3,
  ADD COLUMN `reminderChannel` VARCHAR(255) NOT NULL DEFAULT 'email';

-- Create ReminderLog table
CREATE TABLE `ReminderLog` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `billId` VARCHAR(255) NOT NULL,
  `userId` VARCHAR(255) NOT NULL,
  `channel` VARCHAR(255) NOT NULL,
  `sentAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_reminderlog_billId` (`billId`),
  INDEX `idx_reminderlog_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
