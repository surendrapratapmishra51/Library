-- Database schema for Digital Library Solution
CREATE DATABASE IF NOT EXISTS `library` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `library`;

-- 1. Membership Plans Table
CREATE TABLE IF NOT EXISTS `membership_plans` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `duration` VARCHAR(50),
  `duration_unit` VARCHAR(20) DEFAULT 'Months',
  `price` DECIMAL(10,2) NOT NULL,
  `original_price` DECIMAL(10,2),
  `billing_cycle` VARCHAR(50),
  `badge` VARCHAR(50),
  `is_popular` BOOLEAN DEFAULT FALSE,
  `features` JSON,
  `timing` VARCHAR(100),
  `description` TEXT,
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Seats Table
CREATE TABLE IF NOT EXISTS `seats` (
  `id` VARCHAR(50) PRIMARY KEY,
  `number` VARCHAR(20) UNIQUE NOT NULL,
  `floor` INT NOT NULL,
  `section` VARCHAR(10) NOT NULL,
  `status` ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
  `has_power_outlet` BOOLEAN DEFAULT TRUE,
  `has_desk_lamp` BOOLEAN DEFAULT TRUE,
  `is_corner_or_window` BOOLEAN DEFAULT FALSE,
  `occupied_by` VARCHAR(100),
  `assigned_until` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Users / Students Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `mobile` VARCHAR(30) UNIQUE,
  `email` VARCHAR(100) UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'student') DEFAULT 'student',
  `address` TEXT,
  `plan` VARCHAR(100),
  `plan_id` VARCHAR(50) DEFAULT 'monthly',
  `seat` VARCHAR(20) DEFAULT 'None',
  `joining_date` VARCHAR(30),
  `expiry_date` VARCHAR(30),
  `status` ENUM('Active', 'Discontinued') DEFAULT 'Active',
  `previous_seat` VARCHAR(20),
  `discontinued_date` VARCHAR(30),
  `history` JSON,
  `base_fee` DECIMAL(10,2) DEFAULT 0,
  `discount` DECIMAL(10,2) DEFAULT 0,
  `discount_reason` VARCHAR(255),
  `final_fee` DECIMAL(10,2) DEFAULT 0,
  `paid_amount` DECIMAL(10,2) DEFAULT 0,
  `balance_due` DECIMAL(10,2) DEFAULT 0,
  `payment_status` ENUM('Paid', 'Partial', 'Pending') DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Activity Log Table
CREATE TABLE IF NOT EXISTS `activities` (
  `id` VARCHAR(50) PRIMARY KEY,
  `type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `timestamp` VARCHAR(100),
  `details` TEXT,
  `meta` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Payments / Receipts Table
CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(50) PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `user_mobile` VARCHAR(30) NOT NULL,
  `plan_name` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'Cash',
  `payment_date` VARCHAR(30) NOT NULL,
  `status` ENUM('Completed', 'Pending', 'Failed') DEFAULT 'Completed',
  `transaction_id` VARCHAR(100),
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_payments_user_id` (`user_id`)
) ENGINE=InnoDB;
