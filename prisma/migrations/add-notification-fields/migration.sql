-- CreateTable
ALTER TABLE `Notification` ADD COLUMN `type` VARCHAR(191) NOT NULL DEFAULT 'info',
ADD COLUMN `title` VARCHAR(191) NOT NULL,
ADD COLUMN `actionUrl` VARCHAR(191) NULL;
