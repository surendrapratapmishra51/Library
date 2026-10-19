-- Database schema for Digital Library Solution
CREATE DATABASE IF NOT EXISTS `library` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `library`;

-- 1. Membership Plans Table
CREATE TABLE IF NOT EXISTS `membership_plans` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `duration` VARCHAR(50),
  `durationUnit` VARCHAR(20) DEFAULT 'Months',
  `price` DECIMAL(10,2) NOT NULL,
  `originalPrice` DECIMAL(10,2),
  `billingCycle` VARCHAR(50),
  `badge` VARCHAR(50),
  `isPopular` BOOLEAN DEFAULT FALSE,
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
  `hasPowerOutlet` BOOLEAN DEFAULT TRUE,
  `hasDeskLamp` BOOLEAN DEFAULT TRUE,
  `isCornerOrWindow` BOOLEAN DEFAULT FALSE,
  `occupiedBy` VARCHAR(100),
  `assignedUntil` VARCHAR(50),
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
  `planId` VARCHAR(50),
  `seat` VARCHAR(20),
  `joiningDate` VARCHAR(30),
  `expiryDate` VARCHAR(30),
  `status` ENUM('Active', 'Discontinued') DEFAULT 'Active',
  `previousSeat` VARCHAR(20),
  `discontinuedDate` VARCHAR(30),
  `history` JSON,
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
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
