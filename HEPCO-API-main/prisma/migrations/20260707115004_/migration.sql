-- CreateTable
CREATE TABLE `departments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_code` VARCHAR(20) NOT NULL,
    `full_name` VARCHAR(150) NOT NULL,
    `department_id` INTEGER NULL,
    `email` VARCHAR(150) NULL,
    `phone` VARCHAR(20) NULL,
    `status` ENUM('active', 'inactive') NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `employees_employee_code_key`(`employee_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `device_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NULL,
    `name` VARCHAR(100) NOT NULL,
    `is_component` BOOLEAN NULL DEFAULT false,
    `description` VARCHAR(255) NULL,

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
CREATE TABLE `device_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,

    UNIQUE INDEX `device_types_category_id_name_key`(`category_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `devices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `asset_code` VARCHAR(30) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `category_id` INTEGER NOT NULL,
    `type_id` INTEGER NULL,
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
    `status` ENUM('in_stock', 'in_use', 'maintenance', 'broken', 'retired') NULL DEFAULT 'in_stock',
    `location` VARCHAR(150) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `devices_asset_code_key`(`asset_code`),
    UNIQUE INDEX `devices_serial_number_key`(`serial_number`),
    INDEX `devices_status_idx`(`status`),
    INDEX `devices_category_id_idx`(`category_id`),
    INDEX `devices_type_id_idx`(`type_id`),
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
CREATE TABLE `maintenance_records` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `device_id` INTEGER NOT NULL,
    `reported_date` DATE NOT NULL,
    `issue_description` TEXT NOT NULL,
    `handled_by` VARCHAR(100) NULL,
    `resolution` TEXT NULL,
    `cost` DECIMAL(15, 2) NULL DEFAULT 0,
    `status` ENUM('pending', 'in_progress', 'done', 'cancelled') NULL DEFAULT 'pending',
    `completed_date` DATE NULL,

    INDEX `maintenance_records_device_id_idx`(`device_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `device_specs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `device_id` INTEGER NOT NULL,
    `spec_name` VARCHAR(100) NOT NULL,
    `spec_value` VARCHAR(100) NOT NULL,
    `unit` VARCHAR(20) NULL,

    INDEX `device_specs_device_id_idx`(`device_id`),
    INDEX `device_specs_spec_name_idx`(`spec_name`),
    UNIQUE INDEX `device_specs_device_id_spec_name_key`(`device_id`, `spec_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_types` ADD CONSTRAINT `device_types_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `device_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devices` ADD CONSTRAINT `devices_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `device_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devices` ADD CONSTRAINT `devices_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `device_types`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devices` ADD CONSTRAINT `devices_parent_device_id_fkey` FOREIGN KEY (`parent_device_id`) REFERENCES `devices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devices` ADD CONSTRAINT `devices_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_assignments` ADD CONSTRAINT `device_assignments_device_id_fkey` FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_assignments` ADD CONSTRAINT `device_assignments_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_records` ADD CONSTRAINT `maintenance_records_device_id_fkey` FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_specs` ADD CONSTRAINT `device_specs_device_id_fkey` FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
