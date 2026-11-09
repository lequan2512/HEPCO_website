-- Run only on the empty HEPCO preview instance.
CREATE DATABASE IF NOT EXISTS `hepco_preview` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `hepco_preview`;

-- CreateTable
CREATE TABLE `ip_whitelists` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ip` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NULL,

    UNIQUE INDEX `ip_whitelists_ip_key`(`ip`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `date` VARCHAR(20) NOT NULL,
    `content` TEXT NULL,
    `thumbnail` VARCHAR(500) NULL,
    `type` VARCHAR(50) NULL DEFAULT 'news',
    `author_id` INTEGER NULL,
    `metadata` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `banners` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(500) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `type` INTEGER NULL DEFAULT 1,
    `parent_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `departments_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_code` VARCHAR(20) NOT NULL,
    `full_name` VARCHAR(150) NOT NULL,
    `department_id` INTEGER NULL,
    `position` VARCHAR(100) NULL,
    `employee_type` INTEGER NULL DEFAULT 2,
    `email` VARCHAR(150) NULL,
    `phone` VARCHAR(20) NULL,
    `status` INTEGER NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `employees_employee_code_key`(`employee_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pos_devices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `asset_code` VARCHAR(50) NULL,
    `serial_number` VARCHAR(100) NOT NULL,
    `imei` VARCHAR(100) NULL,
    `sim_number` VARCHAR(50) NULL,
    `sim_imei` VARCHAR(100) NULL,
    `telecom_plan` VARCHAR(100) NULL,
    `enterprise` ENUM('BSH', 'NSH') NOT NULL DEFAULT 'BSH',
    `department_id` INTEGER NULL,
    `region` VARCHAR(255) NULL,
    `status` ENUM('in_stock', 'in_use', 'borrowed', 'broken', 'retired') NOT NULL DEFAULT 'in_stock',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pos_devices_serial_number_key`(`serial_number`),
    INDEX `pos_devices_status_idx`(`status`),
    INDEX `pos_devices_enterprise_idx`(`enterprise`),
    INDEX `pos_devices_department_id_idx`(`department_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pos_assignments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pos_id` INTEGER NOT NULL,
    `employee_id` INTEGER NULL,
    `employee_name` VARCHAR(150) NULL,
    `assigned_date` DATE NOT NULL,
    `returned_date` DATE NULL,
    `assigned_by` VARCHAR(100) NULL,
    `region` VARCHAR(255) NULL,
    `note` VARCHAR(255) NULL,

    INDEX `pos_assignments_pos_id_idx`(`pos_id`),
    INDEX `pos_assignments_employee_id_idx`(`employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pos_borrowings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pos_id` INTEGER NOT NULL,
    `borrower_name` VARCHAR(150) NOT NULL,
    `employee_id` INTEGER NULL,
    `borrow_date` DATE NOT NULL,
    `expected_return_date` DATE NULL,
    `returned_date` DATE NULL,
    `purpose` VARCHAR(255) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'borrowing',
    `note` VARCHAR(255) NULL,

    INDEX `pos_borrowings_pos_id_idx`(`pos_id`),
    INDEX `pos_borrowings_employee_id_idx`(`employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pos_paper_inventories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paper_name` VARCHAR(150) NOT NULL,
    `code` VARCHAR(50) NULL,
    `total_quantity` INTEGER NOT NULL DEFAULT 0,
    `in_stock_quantity` INTEGER NOT NULL DEFAULT 0,
    `issued_quantity` INTEGER NOT NULL DEFAULT 0,
    `unit_price` DECIMAL(15, 2) NULL,
    `supplier_name` VARCHAR(150) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pos_paper_inventories_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pos_paper_issues` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paper_id` INTEGER NOT NULL,
    `employee_id` INTEGER NULL,
    `employee_name` VARCHAR(150) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `issue_date` DATE NOT NULL,
    `issued_by` VARCHAR(100) NULL,
    `note` VARCHAR(255) NULL,

    INDEX `pos_paper_issues_paper_id_idx`(`paper_id`),
    INDEX `pos_paper_issues_employee_id_idx`(`employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `device_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NULL,
    `name` VARCHAR(100) NOT NULL,
    `is_component` BOOLEAN NULL DEFAULT false,
    `description` VARCHAR(255) NULL,
    `parent_id` INTEGER NULL,

    UNIQUE INDEX `device_categories_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `contact_person` VARCHAR(100) NULL,
    `phone` VARCHAR(20) NULL,
    `email` VARCHAR(150) NULL,
    `address` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `devices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `asset_code` VARCHAR(30) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `category_id` INTEGER NOT NULL,
    `parent_device_id` INTEGER NULL,
    `brand` VARCHAR(100) NULL,
    `model` VARCHAR(100) NULL,
    `serial_number` VARCHAR(100) NULL,
    `spec_detail` VARCHAR(255) NULL,
    `manufacture_year` YEAR NULL,
    `purchase_date` DATE NULL,
    `purchase_price` DECIMAL(15, 2) NULL,
    `warranty_expiry` DATE NULL,
    `supplier_id` INTEGER NULL,
    `status` ENUM('in_stock', 'in_use', 'broken', 'retired') NULL DEFAULT 'in_stock',
    `location` VARCHAR(150) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `devices_asset_code_key`(`asset_code`),
    UNIQUE INDEX `devices_serial_number_key`(`serial_number`),
    INDEX `devices_status_idx`(`status`),
    INDEX `devices_category_id_idx`(`category_id`),
    INDEX `devices_parent_device_id_idx`(`parent_device_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `device_assignments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `device_id` INTEGER NOT NULL,
    `employee_id` INTEGER NOT NULL,
    `assigned_date` DATE NOT NULL,
    `returned_date` DATE NULL,
    `assigned_by` VARCHAR(100) NULL,
    `note` VARCHAR(255) NULL,

    INDEX `device_assignments_employee_id_idx`(`employee_id`),
    INDEX `device_assignments_device_id_idx`(`device_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `home_showcases` (
    `id` INTEGER NOT NULL,
    `data` JSON NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `departments` ADD CONSTRAINT `departments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_devices` ADD CONSTRAINT `pos_devices_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_assignments` ADD CONSTRAINT `pos_assignments_pos_id_fkey` FOREIGN KEY (`pos_id`) REFERENCES `pos_devices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_assignments` ADD CONSTRAINT `pos_assignments_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_borrowings` ADD CONSTRAINT `pos_borrowings_pos_id_fkey` FOREIGN KEY (`pos_id`) REFERENCES `pos_devices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_borrowings` ADD CONSTRAINT `pos_borrowings_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_paper_issues` ADD CONSTRAINT `pos_paper_issues_paper_id_fkey` FOREIGN KEY (`paper_id`) REFERENCES `pos_paper_inventories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_paper_issues` ADD CONSTRAINT `pos_paper_issues_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_categories` ADD CONSTRAINT `device_categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `device_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devices` ADD CONSTRAINT `devices_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `device_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devices` ADD CONSTRAINT `devices_parent_device_id_fkey` FOREIGN KEY (`parent_device_id`) REFERENCES `devices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devices` ADD CONSTRAINT `devices_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_assignments` ADD CONSTRAINT `device_assignments_device_id_fkey` FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_assignments` ADD CONSTRAINT `device_assignments_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

