-- Normalización de campos de moneda
-- Fecha: 2026-02-08

-- 1. Modificar Transfer.currency de VARCHAR a ENUM
ALTER TABLE `Transfer` 
  MODIFY COLUMN `currency` ENUM('ARS', 'USD') NOT NULL DEFAULT 'ARS';

-- 2. Añadir campo currency a Income
ALTER TABLE `Income` 
  ADD COLUMN `currency` ENUM('ARS', 'USD') NOT NULL DEFAULT 'ARS' AFTER `amount`;

-- Verificar los cambios
SELECT 'Migración completada: campos de moneda normalizados' AS status;
