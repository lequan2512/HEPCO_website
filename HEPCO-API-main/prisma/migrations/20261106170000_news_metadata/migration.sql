-- Additive change; apply only after the existing production migration baseline is reconciled.
ALTER TABLE `news` ADD COLUMN `metadata` JSON NULL;
