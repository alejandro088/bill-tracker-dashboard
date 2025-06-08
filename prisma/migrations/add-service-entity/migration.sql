CREATE TABLE `Service` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(191) NOT NULL,
  `paymentProvider` VARCHAR(191),
  `recurrence` VARCHAR(191) NOT NULL DEFAULT 'none',
  `autoRenew` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

ALTER TABLE `Bill` ADD COLUMN `serviceId` VARCHAR(191);

CREATE INDEX `Bill_serviceId_idx` ON `Bill`(`serviceId`);

ALTER TABLE `Bill` ADD CONSTRAINT `Bill_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE SET NULL;

INSERT INTO `Service` (id, name, description, category, paymentProvider, recurrence, autoRenew, createdAt, updatedAt)
SELECT UUID(), name, MAX(description), category, paymentProvider, MAX(recurrence), MAX(autoRenew), NOW(), NOW()
FROM `Bill`
GROUP BY name, paymentProvider, category;

UPDATE `Bill` b
JOIN `Service` s ON b.name = s.name AND (b.paymentProvider <=> s.paymentProvider) AND b.category = s.category
SET b.serviceId = s.id;
