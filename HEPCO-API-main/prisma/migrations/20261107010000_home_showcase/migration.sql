CREATE TABLE `home_showcases` (
  `id` INTEGER NOT NULL,
  `data` JSON NOT NULL,
  `version` INTEGER NOT NULL DEFAULT 1,
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
