-- AlterTable para Bill
ALTER TABLE Bill
ADD COLUMN currency ENUM('ARS', 'USD') NOT NULL DEFAULT 'ARS';

-- AlterTable para Payment
ALTER TABLE Payment
ADD COLUMN currency ENUM('ARS', 'USD') NOT NULL DEFAULT 'ARS',
ADD COLUMN exchangeRate DECIMAL(10,2);

-- AlterTable para Service
ALTER TABLE Service
ADD COLUMN defaultCurrency ENUM('ARS', 'USD') NOT NULL DEFAULT 'ARS';
