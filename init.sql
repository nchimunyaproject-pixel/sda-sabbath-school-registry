-- ============================================
-- SDA CHURCH REGISTRY COMPLETE DATABASE v3.0 (HIERARCHICAL)
-- ============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- ============================================
-- 1. BASE TABLES
-- ============================================

-- Languages table
CREATE TABLE IF NOT EXISTS `languages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `language_name` VARCHAR(50) NOT NULL UNIQUE,
  `language_code` VARCHAR(10) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Class Options (for dropdown)
CREATE TABLE IF NOT EXISTS `class_options` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `class_name` VARCHAR(50) NOT NULL UNIQUE,
  `class_description` TEXT,
  `max_students` INT DEFAULT 30,
  `recommended_age` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 2. ADMINISTRATIVE HIERARCHY
-- ============================================

-- Conferences table
CREATE TABLE IF NOT EXISTS `conferences` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Districts table
CREATE TABLE IF NOT EXISTS `districts` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `conferenceId` VARCHAR(50) NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`conferenceId`) REFERENCES `conferences`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uniq_conf_dist` (`conferenceId`, `name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Churches table
CREATE TABLE IF NOT EXISTS `churches` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `church_name` VARCHAR(100) NOT NULL UNIQUE,
  `districtId` VARCHAR(50) NOT NULL,
  `province` VARCHAR(100) NOT NULL,
  `location` VARCHAR(150) NOT NULL, -- Physical Address
  `email` VARCHAR(100) NOT NULL,
  `phone_number` VARCHAR(50) NOT NULL,
  `clerkName` VARCHAR(100) NOT NULL,
  `clerkEmail` VARCHAR(100) NOT NULL,
  `clerkPassword` VARCHAR(255) DEFAULT NULL,
  `pastor_name` VARCHAR(100) DEFAULT NULL,
  `membership` INT DEFAULT 0,
  `status` ENUM('pending', 'approved') NOT NULL DEFAULT 'pending',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`districtId`) REFERENCES `districts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pending District Registrations
CREATE TABLE IF NOT EXISTS `pending_district_registrations` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `districtName` VARCHAR(100) NOT NULL,
  `conferenceId` VARCHAR(50) NOT NULL,
  `adminName` VARCHAR(100) NOT NULL,
  `adminEmail` VARCHAR(100) NOT NULL,
  `phone_number` VARCHAR(50) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `status` VARCHAR(20) DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. USERS (Conferences, Districts, Clerks, Teachers, Viewers)
-- ============================================

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('CONFERENCE_ADMIN', 'DISTRICT_ADMIN', 'CLERK', 'TEACHER', 'VIEWER') NOT NULL DEFAULT 'TEACHER',
  `assignedClass` VARCHAR(50) DEFAULT NULL,
  `language` VARCHAR(50) DEFAULT NULL,
  `churchName` VARCHAR(100) DEFAULT NULL,
  `churchId` VARCHAR(50) DEFAULT NULL,
  `districtId` VARCHAR(50) DEFAULT NULL,
  `conferenceId` VARCHAR(50) DEFAULT NULL,
  `is_first_login` BOOLEAN DEFAULT FALSE,
  `temp_password` VARCHAR(255) DEFAULT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `last_login` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_email_role_scope` (`email`),
  FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`districtId`) REFERENCES `districts`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`conferenceId`) REFERENCES `conferences`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 4. CLASSES (Actual classes with teachers)
-- ============================================

CREATE TABLE IF NOT EXISTS `classes` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `teacherId` VARCHAR(50) NOT NULL,
  `language` VARCHAR(50) NOT NULL,
  `churchId` VARCHAR(50) NOT NULL,
  `max_capacity` INT DEFAULT 30,
  `current_count` INT DEFAULT 0,
  `meeting_time` VARCHAR(50) DEFAULT 'Sabbath Morning',
  `room_number` VARCHAR(20) DEFAULT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 5. STUDENTS
-- ============================================

CREATE TABLE IF NOT EXISTS `students` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `classId` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `address` VARCHAR(150) DEFAULT NULL,
  `age` INT DEFAULT NULL,
  `gender` ENUM('MALE', 'FEMALE', 'OTHER') DEFAULT NULL,
  `baptized` BOOLEAN DEFAULT FALSE,
  `member_since` DATE DEFAULT NULL,
  `emergency_contact` VARCHAR(100) DEFAULT NULL,
  `medical_notes` TEXT DEFAULT NULL,
  `attendanceStatus` VARCHAR(20) DEFAULT 'unmarked',
  `lessonStudied` BOOLEAN DEFAULT FALSE,
  `attendanceNote` VARCHAR(255) DEFAULT NULL,
  `churchId` VARCHAR(50) NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`classId`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 6. ATTENDANCE RECORDS
-- ============================================

CREATE TABLE IF NOT EXISTS `attendance_records` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `date` DATE NOT NULL,
  `classId` VARCHAR(50) NOT NULL,
  `className` VARCHAR(100) NOT NULL,
  `teacherId` VARCHAR(50) NOT NULL,
  `teacherName` VARCHAR(100) NOT NULL,
  `totalStudents` INT NOT NULL DEFAULT 0,
  `presentCount` INT NOT NULL DEFAULT 0,
  `absentCount` INT NOT NULL DEFAULT 0,
  `visitorCount` INT NOT NULL DEFAULT 0,
  `lessonStudyCount` INT NOT NULL DEFAULT 0,
  `notes` TEXT DEFAULT NULL,
  `churchId` VARCHAR(50) NOT NULL,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Attendance Students details (snapshot)
CREATE TABLE IF NOT EXISTS `attendance_students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `recordId` VARCHAR(50) NOT NULL,
  `studentId` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  `lessonStudied` BOOLEAN DEFAULT FALSE,
  `churchId` VARCHAR(50) NOT NULL,
  `checkin_time` TIME DEFAULT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (`recordId`) REFERENCES `attendance_records`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 7. VISITORS
-- ============================================

CREATE TABLE IF NOT EXISTS `visitors` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `recordId` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `classId` VARCHAR(50) NOT NULL,
  `contact` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `location` VARCHAR(100) DEFAULT NULL,
  `purpose` TEXT DEFAULT NULL,
  `churchId` VARCHAR(50) NOT NULL,
  `interest_level` ENUM('HIGH', 'MEDIUM', 'LOW') DEFAULT 'MEDIUM',
  `follow_up_required` BOOLEAN DEFAULT FALSE,
  `follow_up_notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`recordId`) REFERENCES `attendance_records`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 8. ANNOUNCEMENTS (Hierarchical)
-- ============================================

CREATE TABLE IF NOT EXISTS `announcements` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `teacherId` VARCHAR(50) NOT NULL,
  `teacherName` VARCHAR(100) NOT NULL,
  `className` VARCHAR(100) NOT NULL,
  `content` TEXT NOT NULL,
  `category` ENUM('REPORT', 'ANNOUNCEMENT', 'PRAYER_REQUEST', 'TESTIMONY') DEFAULT 'REPORT',
  `status` VARCHAR(20) DEFAULT 'pending',
  `approved_by` VARCHAR(50) DEFAULT NULL,
  `approved_at` DATETIME DEFAULT NULL,
  `timestamp` DATETIME NOT NULL,
  `churchId` VARCHAR(50) DEFAULT NULL,
  `targetType` ENUM('CONFERENCE', 'DISTRICT', 'CHURCH') NOT NULL DEFAULT 'CHURCH',
  `targetId` VARCHAR(50) NOT NULL,
  `priority` ENUM('NORMAL', 'IMPORTANT', 'URGENT') DEFAULT 'NORMAL',
  `expiryDate` DATE DEFAULT NULL,
  `isArchived` BOOLEAN DEFAULT FALSE,
  `readReceipts` JSON DEFAULT NULL, -- Array of user IDs who read it
  `richText` TEXT DEFAULT NULL,
  `attachments` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 9. OFFERINGS
-- ============================================

CREATE TABLE IF NOT EXISTS `offerings` (
  `id` VARCHAR(20) NOT NULL,
  `weeklyMission` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `thirteenthSabbath` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `birthdayThank` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `investmentFund` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `churchId` VARCHAR(50) NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`churchId`, `id`),
  FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 10. NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `senderId` VARCHAR(50) NOT NULL,
  `senderName` VARCHAR(100) NOT NULL,
  `recipientType` ENUM('CONFERENCE', 'DISTRICT', 'CHURCH', 'USER') NOT NULL,
  `recipientId` VARCHAR(50) NOT NULL,
  `isRead` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 11. INSERT SEED DATA
-- ============================================

-- Languages
INSERT IGNORE INTO `languages` (`language_name`, `language_code`) VALUES
('English', 'EN'),
('Bemba', 'BM'),
('Nyanja', 'NY'),
('Tonga', 'TO'),
('Lozi', 'LZ');

-- Class Options
INSERT IGNORE INTO `class_options` (`class_name`, `class_description`, `recommended_age`) VALUES
('Beginners', 'Ages 0-2 (Cradle Roll)', '0-2 years'),
('Kindergarten', 'Ages 3-5 (Kindergarten)', '3-5 years'),
('Primary Class', 'Primary Sabbath School', '6-9 years'),
('Youth Ministry', 'Youth and Young adults', '14-25 years'),
('Adult Sabbath School', 'Adult Bible study', '26+ years');

-- Conferences
INSERT IGNORE INTO `conferences` (`id`, `name`) VALUES
('conf_001', 'Zambia Union Conference');

-- Districts
INSERT IGNORE INTO `districts` (`id`, `name`, `conferenceId`) VALUES
('dist_001', 'Lusaka Central District', 'conf_001'),
('dist_002', 'Copperbelt North District', 'conf_001');

INSERT IGNORE INTO `churches` (`id`, `church_name`, `districtId`, `province`, `location`, `email`, `phone_number`, `clerkName`, `clerkEmail`, `pastor_name`, `membership`, `status`) VALUES
('demo', 'Demo Central Church', 'dist_001', 'Lusaka', 'Independence Avenue, Lusaka', 'demo@church.org', '+260971234567', 'Sarah Miller', 'clerk@church.com', 'Pastor John Phiri', 250, 'approved'),
('church_001', 'Central SDA Church', 'dist_001', 'Lusaka', 'Independence Avenue, Lusaka', 'central@church.org', '+260971234567', 'Sarah Miller', 'clerk@church.com', 'Pastor John Phiri', 250, 'approved'),
('church_002', 'Northside SDA Church', 'dist_001', 'Lusaka', 'Roma, Lusaka', 'northside@church.org', '+260972345678', 'David Wilson', 'david@church.com', 'Pastor John Phiri', 180, 'approved'),
('church_003', 'Southgate SDA Church', 'dist_002', 'Copperbelt', 'Southgate, Kitwe', 'southgate@church.org', '+260973456789', 'Robert Johnson', 'robert@church.com', 'Pastor Sarah Mwamba', 150, 'approved'),
('church_004', 'Westview SDA Church', 'dist_002', 'Copperbelt', 'Westview, Kitwe', 'westview@church.org', '+260974567890', 'Maria Garcia', 'maria@church.com', 'Pastor Sarah Mwamba', 90, 'pending');

-- Users (Hashed password for 'password123' is $2b$10$YourHashedPasswordHere. Let's seed with plain password or bcrypt equivalent. Since server logic supports plain fallback, we seed with plain passwords to ensure easy login check!)
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `role`, `assignedClass`, `language`, `churchName`, `churchId`, `districtId`, `conferenceId`) VALUES
-- Conference Admin
('conf_admin_001', 'Elder Mutale', 'conference@church.com', 'password123', 'CONFERENCE_ADMIN', NULL, 'English', NULL, NULL, NULL, 'conf_001'),
-- District Admin
('dist_admin_001', 'Pastor Phiri', 'district@church.com', 'password123', 'DISTRICT_ADMIN', NULL, 'English', NULL, NULL, 'dist_001', NULL),
-- Clerks
('clerk_001', 'Sarah Miller', 'clerk@church.com', 'password123', 'CLERK', NULL, 'English', 'Central SDA Church', 'church_001', 'dist_001', 'conf_001'),
('clerk_002', 'David Wilson', 'david@church.com', 'password123', 'CLERK', NULL, 'English', 'Northside SDA Church', 'church_002', 'dist_001', 'conf_001'),
-- Teachers
('teacher_001', 'John Doe', 'john@church.com', 'password123', 'TEACHER', 'Primary Class', 'English', 'Central SDA Church', 'church_001', 'dist_001', 'conf_001'),
('teacher_002', 'Jane Smith', 'jane@church.com', 'password123', 'TEACHER', 'Youth Ministry', 'English', 'Northside SDA Church', 'church_002', 'dist_001', 'conf_001');

-- Classes
INSERT IGNORE INTO `classes` (`id`, `name`, `teacherId`, `language`, `churchId`) VALUES
('class_001', 'Primary Class', 'teacher_001', 'English', 'church_001'),
('class_002', 'Youth Ministry', 'teacher_002', 'English', 'church_002');

-- Students
INSERT IGNORE INTO `students` (`id`, `name`, `classId`, `age`, `gender`, `baptized`, `churchId`) VALUES
('stu_001', 'Michael Brown', 'class_001', 8, 'MALE', FALSE, 'church_001'),
('stu_002', 'Emily Davis', 'class_001', 9, 'FEMALE', FALSE, 'church_001'),
('stu_003', 'James Wilson', 'class_002', 17, 'MALE', TRUE, 'church_002'),
('stu_004', 'Olivia Miller', 'class_002', 16, 'FEMALE', TRUE, 'church_002');

COMMIT;
