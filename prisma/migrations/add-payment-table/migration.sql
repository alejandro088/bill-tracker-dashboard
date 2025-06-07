CREATE TABLE `Payment` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `billId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `amount` DOUBLE NOT NULL,
  `dueDate` DATETIME(3) NOT NULL,
  `paidAt` DATETIME(3) NOT NULL,
  `paymentProvider` VARCHAR(191),
  `recurrence` VARCHAR(191) NOT NULL DEFAULT 'none',
  `category` VARCHAR(191),
  INDEX `Payment_billId_idx`(`billId`),
  CONSTRAINT `Payment_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `Bill`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;
