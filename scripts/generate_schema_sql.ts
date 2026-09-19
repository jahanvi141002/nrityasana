import fs from 'fs';
import path from 'path';
import mysql from 'mysql2';
import { COMPREHENSIVE_PRACTICES, COMPREHENSIVE_DIET_PLANS } from '../src/data/categoriesData';
import { INITIAL_CLASSES, INITIAL_CONTACTS } from '../src/data/seedData';

function escapeSql(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  return mysql.escape(val);
}

export function generateFullSql(): string {
  const parts: string[] = [];

  parts.push(`-- =========================================================================
-- NRITYASANA COMPLETE MYSQL SCHEMA & DATA SCRIPT
-- Database Target: nrityasana (MySQL 8.0+)
-- Generated for MySQL Workbench / MySQL Server
-- =========================================================================

CREATE DATABASE IF NOT EXISTS \`nrityasana\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`nrityasana\`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------------------
-- 1. Table structure for table \`users\`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` VARCHAR(36) NOT NULL,
  \`email\` VARCHAR(254) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) DEFAULT NULL,
  \`role\` VARCHAR(20) NOT NULL DEFAULT 'USER',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 2. Table structure for table \`profiles\`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`profiles\` (
  \`user_id\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(254) DEFAULT NULL,
  \`profile_picture_url\` VARCHAR(2048) DEFAULT NULL,
  \`phone\` VARCHAR(30) DEFAULT NULL,
  \`bio\` VARCHAR(500) DEFAULT NULL,
  \`dance_style\` VARCHAR(60) DEFAULT 'Bharatanatyam',
  \`experience_level\` VARCHAR(60) DEFAULT 'Intermediate',
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`user_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 3. Table structure for table \`live_classes\`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`live_classes\` (
  \`id\` VARCHAR(36) NOT NULL,
  \`title\` VARCHAR(120) NOT NULL,
  \`description\` VARCHAR(500) DEFAULT NULL,
  \`start_time\` DATETIME NOT NULL,
  \`duration_minutes\` INT NOT NULL DEFAULT 45,
  \`meeting_url\` VARCHAR(2048) NOT NULL,
  \`created_by\` VARCHAR(254) NOT NULL,
  \`participant_count\` INT NOT NULL DEFAULT 1,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 4. Table structure for table \`class_attendees\`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`class_attendees\` (
  \`class_id\` VARCHAR(36) NOT NULL,
  \`user_id\` VARCHAR(36) NOT NULL,
  \`joined_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`class_id\`, \`user_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 5. Table structure for table \`chat_messages\`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`chat_messages\` (
  \`id\` VARCHAR(36) NOT NULL,
  \`sender_id\` VARCHAR(36) NOT NULL,
  \`sender_email\` VARCHAR(254) NOT NULL,
  \`sender_role\` VARCHAR(20) NOT NULL DEFAULT 'USER',
  \`recipient_id\` VARCHAR(36) NOT NULL,
  \`recipient_email\` VARCHAR(254) NOT NULL,
  \`message_text\` VARCHAR(1000) NOT NULL,
  \`message_type\` VARCHAR(20) NOT NULL DEFAULT 'text',
  \`sent_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (\`id\`),
  KEY \`idx_chat_thread\` (\`sender_id\`, \`recipient_id\`, \`sent_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 6. Table structure for table \`media_items\`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`media_items\` (
  \`id\` VARCHAR(36) NOT NULL,
  \`user_id\` VARCHAR(100) NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`media_type\` VARCHAR(20) NOT NULL,
  \`url\` VARCHAR(2048) NOT NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_media_user\` (\`user_id\`, \`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 7. Table structure for table \`practice_logs\`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`practice_logs\` (
  \`id\` VARCHAR(36) NOT NULL,
  \`user_id\` VARCHAR(100) NOT NULL,
  \`practice_id\` VARCHAR(50) NOT NULL,
  \`title\` VARCHAR(150) NOT NULL,
  \`discipline\` VARCHAR(50) NOT NULL,
  \`minutes_practiced\` INT NOT NULL DEFAULT 15,
  \`completed_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_practice_user\` (\`user_id\`, \`completed_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 8. Table structure for table \`user_progress\`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`user_progress\` (
  \`user_id\` VARCHAR(100) NOT NULL,
  \`current_streak\` INT NOT NULL DEFAULT 3,
  \`total_minutes\` INT NOT NULL DEFAULT 185,
  \`completed_sessions\` INT NOT NULL DEFAULT 12,
  \`weekly_goal\` INT NOT NULL DEFAULT 5,
  \`completed_days\` VARCHAR(50) NOT NULL DEFAULT '1,1,1,0,0,0,0',
  \`last_practice_date\` DATE DEFAULT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`user_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 9. Table structure for table \`practices\`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`practices\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`title\` VARCHAR(150) NOT NULL,
  \`discipline\` VARCHAR(50) NOT NULL,
  \`category\` VARCHAR(100) NOT NULL,
  \`level\` VARCHAR(50) DEFAULT 'All Levels',
  \`topic\` VARCHAR(100) DEFAULT NULL,
  \`minutes\` INT NOT NULL DEFAULT 15,
  \`description\` TEXT NOT NULL,
  \`icon\` VARCHAR(50) DEFAULT 'sunny',
  \`intensity\` VARCHAR(50) DEFAULT 'Moderate',
  \`instructions\` JSON DEFAULT NULL,
  \`benefits\` JSON DEFAULT NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_practices_discipline\` (\`discipline\`, \`level\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 10. Table structure for table \`diet_plans\`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`diet_plans\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`title\` VARCHAR(150) NOT NULL,
  \`diet_type\` VARCHAR(20) NOT NULL,
  \`time_slot\` VARCHAR(50) NOT NULL,
  \`time_label\` VARCHAR(30) NOT NULL,
  \`target_goal\` VARCHAR(100) NOT NULL,
  \`level\` VARCHAR(50) DEFAULT 'All Levels',
  \`calories\` INT NOT NULL DEFAULT 200,
  \`protein_grams\` INT NOT NULL DEFAULT 10,
  \`carbs_grams\` INT NOT NULL DEFAULT 20,
  \`fat_grams\` INT NOT NULL DEFAULT 5,
  \`description\` TEXT NOT NULL,
  \`ingredients\` JSON DEFAULT NULL,
  \`preparation_instructions\` JSON DEFAULT NULL,
  \`benefits\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_diet_type_slot\` (\`diet_type\`, \`time_slot\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- SEED DATA INSERTIONS
-- =========================================================================
`);

  // 1. Seed Users
  parts.push(`-- Seed Users
REPLACE INTO \`users\` (\`id\`, \`email\`, \`role\`, \`password_hash\`) VALUES
('u-admin', 'admin@nrityasana.com', 'ADMIN', '$2a$10$e74Vp.sampleHashForAdminUser12345'),
('u-user', 'user@nrityasana.com', 'USER', '$2a$10$e74Vp.sampleHashForStandardUser123'),
('u-teacher', 'teacher@nrityasana.com', 'ADMIN', '$2a$10$e74Vp.sampleHashForTeacherUser123'),
('u-student', 'student@nrityasana.com', 'USER', '$2a$10$e74Vp.sampleHashForStudentUser123');
`);

  // 2. Seed Profiles
  parts.push(`-- Seed Profiles
REPLACE INTO \`profiles\` (\`user_id\`, \`email\`, \`profile_picture_url\`, \`phone\`, \`bio\`, \`dance_style\`, \`experience_level\`) VALUES
('u-admin', 'admin@nrityasana.com', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80', '+91 98765 43210', 'Senior Classical Kathak & Ashtanga Yoga Acharya. Dedicating sacred movement to divine geometry.', 'Kathak & Yoga', 'Acharya / Master'),
('u-user', 'user@nrityasana.com', NULL, '+91 91234 56789', 'Devoted practitioner cultivating mindful posture, Mudra dexterity, and rhythmic grace.', 'Bharatanatyam & Yoga', 'Intermediate'),
('u-teacher', 'teacher@nrityasana.com', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80', '+91 98111 22334', 'Kathak exponent, disciple of Lucknow Gharana, conducting daily footwork and pirouette classes.', 'Kathak', 'Senior Guru');
`);

  // 3. Seed Live Classes
  parts.push(`-- Seed Live Classes
REPLACE INTO \`live_classes\` (\`id\`, \`title\`, \`description\`, \`start_time\`, \`duration_minutes\`, \`meeting_url\`, \`created_by\`, \`participant_count\`) VALUES
('c1', 'Kathak Tatkar & Chakkars Masterclass', 'Refining speed, rhythm (Kaala), spotting, and 9-turn bedam chakkars with Guru Radhika.', NOW() + INTERVAL 3 HOUR, 60, 'https://meet.google.com/nrityasana-live', 'admin@nrityasana.com', 18),
('c2', 'Vinyasa Flow & Pranayama Spine Mobility', 'Dynamic breath-to-movement flow, pelvic opening, and soothing Nadi Shodhana.', NOW() + INTERVAL 22 HOUR, 45, 'https://meet.google.com/nrityasana-flow', 'admin@nrityasana.com', 14),
('c3', 'Desi Bolly-Zumba High-Energy Cardio Party', 'High-energy sweat session fusing Latin salsa beats with Bollywood and Bhangra rhythms.', NOW() + INTERVAL 32 HOUR, 45, 'https://meet.google.com/nrityasana-zumba', 'admin@nrityasana.com', 26),
('c4', 'Semi-Classical Fusion & Thumri Abhinaya', 'Exploring lyrical interpretation, fluid contemporary spine lines, and delicate facial emoting.', NOW() + INTERVAL 48 HOUR, 60, 'https://meet.google.com/nrityasana-mudra', 'admin@nrityasana.com', 22);
`);

  // 4. Seed Class Attendees
  parts.push(`-- Seed Class Attendees
REPLACE INTO \`class_attendees\` (\`class_id\`, \`user_id\`) VALUES
('c1', 'u-user'),
('c2', 'u-user');
`);

  // 5. Seed Chat Messages
  parts.push(`-- Seed Chat Messages
REPLACE INTO \`chat_messages\` (\`id\`, \`sender_id\`, \`sender_email\`, \`sender_role\`, \`recipient_id\`, \`recipient_email\`, \`message_text\`, \`message_type\`, \`sent_at\`) VALUES
('m1', 'u-admin', 'admin@nrityasana.com', 'ADMIN', 'u-user', 'user@nrityasana.com', 'Namaste! Welcome to Nrityasana. How did your morning Tatkar & Surya Namaskar flow feel today?', 'text', NOW(6) - INTERVAL 2 HOUR),
('m2', 'u-user', 'user@nrityasana.com', 'USER', 'u-admin', 'admin@nrityasana.com', 'The ankle stability exercises are helping a lot. My chakkars felt much more centered on the second tempo!', 'text', NOW(6) - INTERVAL 1 HOUR),
('m3', 'u-admin', 'admin@nrityasana.com', 'ADMIN', 'u-user', 'user@nrityasana.com', 'Keep the sternum lifted and fix your drishti eye level on the mirror corner for spotting balance.', 'text', NOW(6) - INTERVAL 30 MINUTE);
`);

  // 6. Seed User Progress
  parts.push(`-- Seed User Progress
REPLACE INTO \`user_progress\` (\`user_id\`, \`current_streak\`, \`total_minutes\`, \`completed_sessions\`, \`weekly_goal\`, \`completed_days\`, \`last_practice_date\`) VALUES
('u-user', 5, 230, 15, 5, '1,1,1,1,0,1,0', CURDATE()),
('u-student', 3, 115, 8, 4, '1,1,1,0,0,0,0', CURDATE() - INTERVAL 1 DAY);
`);

  // 7. Seed Practice Logs
  parts.push(`-- Seed Practice Logs
REPLACE INTO \`practice_logs\` (\`id\`, \`user_id\`, \`practice_id\`, \`title\`, \`discipline\`, \`minutes_practiced\`, \`completed_at\`) VALUES
('log-1', 'u-user', 'k-tatkar-foundations', 'Tatkar Foundations: Ekgun & Dugun Speeds', 'Kathak', 18, NOW() - INTERVAL 1 DAY),
('log-2', 'u-user', 'y-surya-flow', 'Surya Namaskar Vinyasa Flow', 'Yoga', 18, NOW() - INTERVAL 2 DAY),
('log-3', 'u-user', 'm-vipassana', 'Breath Awareness & Anapana Mindfulness', 'Meditation', 15, NOW() - INTERVAL 3 DAY);
`);

  // 8. Seed Media Items
  parts.push(`-- Seed Media Items
REPLACE INTO \`media_items\` (\`id\`, \`user_id\`, \`name\`, \`media_type\`, \`url\`, \`created_at\`) VALUES
('med-1', 'u-user', 'Aramandi and Ardhamandala Form Check', 'photo', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80', NOW() - INTERVAL 3 DAY),
('med-2', 'u-user', 'Hastak Hand Alignment Practice', 'photo', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80', NOW() - INTERVAL 1 DAY);
`);

  // 9. Seed Practices (All 40 practices)
  parts.push(`-- -------------------------------------------------------------------------
-- 9. Seed All 40 Disciplined Practices (Yoga, Kathak, Bollywood, Semi-Classical, Zumba, Meditation)
-- -------------------------------------------------------------------------`);

  for (const p of COMPREHENSIVE_PRACTICES) {
    const instructionsJson = JSON.stringify(p.instructions || []);
    const benefitsJson = JSON.stringify(p.benefits || []);
    parts.push(`REPLACE INTO \`practices\` (\`id\`, \`title\`, \`discipline\`, \`category\`, \`level\`, \`topic\`, \`minutes\`, \`description\`, \`icon\`, \`intensity\`, \`instructions\`, \`benefits\`) VALUES
(${escapeSql(p.id)}, ${escapeSql(p.title)}, ${escapeSql(p.discipline)}, ${escapeSql(p.category)}, ${escapeSql(p.level || 'All Levels')}, ${escapeSql(p.topic || p.category)}, ${p.minutes}, ${escapeSql(p.description)}, ${escapeSql(p.icon || 'sunny')}, ${escapeSql(p.intensity || 'Moderate')}, ${escapeSql(instructionsJson)}, ${escapeSql(benefitsJson)});
`);
  }

  // 10. Seed Diet Plans (All 14 scheduled diet plans)
  parts.push(`-- -------------------------------------------------------------------------
-- 10. Seed All 14 Scheduled Movement & Dance Diet Plans (Veg & Non-Veg 06:30 AM to 09:30 PM)
-- -------------------------------------------------------------------------`);

  for (const d of COMPREHENSIVE_DIET_PLANS) {
    const ingredientsJson = JSON.stringify(d.ingredients || []);
    const prepJson = JSON.stringify(d.preparationInstructions || []);
    parts.push(`REPLACE INTO \`diet_plans\` (\`id\`, \`title\`, \`diet_type\`, \`time_slot\`, \`time_label\`, \`target_goal\`, \`level\`, \`calories\`, \`protein_grams\`, \`carbs_grams\`, \`fat_grams\`, \`description\`, \`ingredients\`, \`preparation_instructions\`, \`benefits\`) VALUES
(${escapeSql(d.id)}, ${escapeSql(d.title)}, ${escapeSql(d.dietType)}, ${escapeSql(d.timeSlot)}, ${escapeSql(d.timeLabel)}, ${escapeSql(d.targetGoal)}, ${escapeSql(d.level || 'All Levels')}, ${d.calories}, ${d.proteinGrams}, ${d.carbsGrams}, ${d.fatGrams}, ${escapeSql(d.description)}, ${escapeSql(ingredientsJson)}, ${escapeSql(prepJson)}, ${escapeSql(d.benefits)});
`);
  }

  parts.push(`SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================================
-- NRITYASANA SETUP COMPLETE: ALL 10 TABLES AND 60+ DATA ROWS POPULATED
-- =========================================================================
`);

  return parts.join('\n');
}

// Generate schema.sql at project root
const sql = generateFullSql();
fs.writeFileSync(path.join(process.cwd(), 'schema.sql'), sql, 'utf-8');
console.log('Successfully wrote schema.sql at root! Size:', sql.length, 'bytes');
