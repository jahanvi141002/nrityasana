-- =========================================================================
-- NRITYASANA COMPLETE MYSQL SCHEMA & DATA SCRIPT
-- Database Target: nrityasana (MySQL 8.0+)
-- Generated for MySQL Workbench / MySQL Server
-- =========================================================================

CREATE DATABASE IF NOT EXISTS `nrityasana` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `nrityasana`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------------------
-- 1. Table structure for table `users`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(254) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'USER',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 2. Table structure for table `profiles`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `profiles` (
  `user_id` VARCHAR(100) NOT NULL,
  `email` VARCHAR(254) DEFAULT NULL,
  `profile_picture_url` VARCHAR(2048) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `bio` VARCHAR(500) DEFAULT NULL,
  `dance_style` VARCHAR(60) DEFAULT 'Bharatanatyam',
  `experience_level` VARCHAR(60) DEFAULT 'Intermediate',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 3. Table structure for table `live_classes`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `live_classes` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(120) NOT NULL,
  `description` VARCHAR(500) DEFAULT NULL,
  `start_time` DATETIME NOT NULL,
  `duration_minutes` INT NOT NULL DEFAULT 45,
  `meeting_url` VARCHAR(2048) NOT NULL,
  `created_by` VARCHAR(254) NOT NULL,
  `participant_count` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 4. Table structure for table `class_attendees`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `class_attendees` (
  `class_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `joined_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`class_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 5. Table structure for table `chat_messages`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` VARCHAR(36) NOT NULL,
  `sender_id` VARCHAR(36) NOT NULL,
  `sender_email` VARCHAR(254) NOT NULL,
  `sender_role` VARCHAR(20) NOT NULL DEFAULT 'USER',
  `recipient_id` VARCHAR(36) NOT NULL,
  `recipient_email` VARCHAR(254) NOT NULL,
  `message_text` VARCHAR(1000) NOT NULL,
  `message_type` VARCHAR(20) NOT NULL DEFAULT 'text',
  `sent_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_chat_thread` (`sender_id`, `recipient_id`, `sent_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 6. Table structure for table `media_items`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `media_items` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `media_type` VARCHAR(20) NOT NULL,
  `url` VARCHAR(2048) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_media_user` (`user_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 7. Table structure for table `practice_logs`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `practice_logs` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(100) NOT NULL,
  `practice_id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `discipline` VARCHAR(50) NOT NULL,
  `minutes_practiced` INT NOT NULL DEFAULT 15,
  `completed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_practice_user` (`user_id`, `completed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 8. Table structure for table `user_progress`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_progress` (
  `user_id` VARCHAR(100) NOT NULL,
  `current_streak` INT NOT NULL DEFAULT 3,
  `total_minutes` INT NOT NULL DEFAULT 185,
  `completed_sessions` INT NOT NULL DEFAULT 12,
  `weekly_goal` INT NOT NULL DEFAULT 5,
  `completed_days` VARCHAR(50) NOT NULL DEFAULT '1,1,1,0,0,0,0',
  `last_practice_date` DATE DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 9. Table structure for table `practices`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `practices` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `discipline` VARCHAR(50) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `level` VARCHAR(50) DEFAULT 'All Levels',
  `topic` VARCHAR(100) DEFAULT NULL,
  `minutes` INT NOT NULL DEFAULT 15,
  `description` TEXT NOT NULL,
  `icon` VARCHAR(50) DEFAULT 'sunny',
  `intensity` VARCHAR(50) DEFAULT 'Moderate',
  `instructions` JSON DEFAULT NULL,
  `benefits` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_practices_discipline` (`discipline`, `level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 10. Table structure for table `diet_plans`
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `diet_plans` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `diet_type` VARCHAR(20) NOT NULL,
  `time_slot` VARCHAR(50) NOT NULL,
  `time_label` VARCHAR(30) NOT NULL,
  `target_goal` VARCHAR(100) NOT NULL,
  `level` VARCHAR(50) DEFAULT 'All Levels',
  `calories` INT NOT NULL DEFAULT 200,
  `protein_grams` INT NOT NULL DEFAULT 10,
  `carbs_grams` INT NOT NULL DEFAULT 20,
  `fat_grams` INT NOT NULL DEFAULT 5,
  `description` TEXT NOT NULL,
  `ingredients` JSON DEFAULT NULL,
  `preparation_instructions` JSON DEFAULT NULL,
  `benefits` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_diet_type_slot` (`diet_type`, `time_slot`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- SEED DATA INSERTIONS
-- =========================================================================

-- Seed Users
INSERT INTO `users` (`id`, `email`, `role`, `password_hash`) VALUES
('u-admin', 'admin@nrityasana.com', 'ADMIN', '$2a$10$e74Vp.sampleHashForAdminUser12345'),
('u-user', 'user@nrityasana.com', 'USER', '$2a$10$e74Vp.sampleHashForStandardUser123'),
('u-teacher', 'teacher@nrityasana.com', 'ADMIN', '$2a$10$e74Vp.sampleHashForTeacherUser123'),
('u-student', 'student@nrityasana.com', 'USER', '$2a$10$e74Vp.sampleHashForStudentUser123')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Seed Profiles
INSERT INTO `profiles` (`user_id`, `email`, `profile_picture_url`, `phone`, `bio`, `dance_style`, `experience_level`) VALUES
('u-admin', 'admin@nrityasana.com', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80', '+91 98765 43210', 'Senior Classical Kathak & Ashtanga Yoga Acharya. Dedicating sacred movement to divine geometry.', 'Kathak & Yoga', 'Acharya / Master'),
('u-user', 'user@nrityasana.com', NULL, '+91 91234 56789', 'Devoted practitioner cultivating mindful posture, Mudra dexterity, and rhythmic grace.', 'Bharatanatyam & Yoga', 'Intermediate'),
('u-teacher', 'teacher@nrityasana.com', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80', '+91 98111 22334', 'Kathak exponent, disciple of Lucknow Gharana, conducting daily footwork and pirouette classes.', 'Kathak', 'Senior Guru')
ON DUPLICATE KEY UPDATE `bio` = VALUES(`bio`), `phone` = VALUES(`phone`);

-- Seed Live Classes
INSERT INTO `live_classes` (`id`, `title`, `description`, `start_time`, `duration_minutes`, `meeting_url`, `created_by`, `participant_count`) VALUES
('c1', 'Kathak Tatkar & Chakkars Masterclass', 'Refining speed, rhythm (Kaala), spotting, and 9-turn bedam chakkars with Guru Radhika.', NOW() + INTERVAL 3 HOUR, 60, 'https://meet.google.com/nrityasana-live', 'admin@nrityasana.com', 18),
('c2', 'Vinyasa Flow & Pranayama Spine Mobility', 'Dynamic breath-to-movement flow, pelvic opening, and soothing Nadi Shodhana.', NOW() + INTERVAL 22 HOUR, 45, 'https://meet.google.com/nrityasana-flow', 'admin@nrityasana.com', 14),
('c3', 'Desi Bolly-Zumba High-Energy Cardio Party', 'High-energy sweat session fusing Latin salsa beats with Bollywood and Bhangra rhythms.', NOW() + INTERVAL 32 HOUR, 45, 'https://meet.google.com/nrityasana-zumba', 'admin@nrityasana.com', 26),
('c4', 'Semi-Classical Fusion & Thumri Abhinaya', 'Exploring lyrical interpretation, fluid contemporary spine lines, and delicate facial emoting.', NOW() + INTERVAL 48 HOUR, 60, 'https://meet.google.com/nrityasana-mudra', 'admin@nrityasana.com', 22)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`);

-- Seed Class Attendees
INSERT INTO `class_attendees` (`class_id`, `user_id`) VALUES
('c1', 'u-user'),
('c2', 'u-user')
ON DUPLICATE KEY UPDATE `class_id` = VALUES(`class_id`);

-- Seed Chat Messages
INSERT INTO `chat_messages` (`id`, `sender_id`, `sender_email`, `sender_role`, `recipient_id`, `recipient_email`, `message_text`, `message_type`, `sent_at`) VALUES
('m1', 'u-admin', 'admin@nrityasana.com', 'ADMIN', 'u-user', 'user@nrityasana.com', 'Namaste! Welcome to Nrityasana. How did your morning Tatkar & Surya Namaskar flow feel today?', 'text', NOW(6) - INTERVAL 2 HOUR),
('m2', 'u-user', 'user@nrityasana.com', 'USER', 'u-admin', 'admin@nrityasana.com', 'The ankle stability exercises are helping a lot. My chakkars felt much more centered on the second tempo!', 'text', NOW(6) - INTERVAL 1 HOUR),
('m3', 'u-admin', 'admin@nrityasana.com', 'ADMIN', 'u-user', 'user@nrityasana.com', 'Keep the sternum lifted and fix your drishti eye level on the mirror corner for spotting balance.', 'text', NOW(6) - INTERVAL 30 MINUTE)
ON DUPLICATE KEY UPDATE `message_text` = VALUES(`message_text`);

-- Seed User Progress
INSERT INTO `user_progress` (`user_id`, `current_streak`, `total_minutes`, `completed_sessions`, `weekly_goal`, `completed_days`, `last_practice_date`) VALUES
('u-user', 5, 230, 15, 5, '1,1,1,1,0,1,0', CURDATE()),
('u-student', 3, 115, 8, 4, '1,1,1,0,0,0,0', CURDATE() - INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE `total_minutes` = VALUES(`total_minutes`), `current_streak` = VALUES(`current_streak`);

-- Seed Practice Logs
INSERT INTO `practice_logs` (`id`, `user_id`, `practice_id`, `title`, `discipline`, `minutes_practiced`, `completed_at`) VALUES
('log-1', 'u-user', 'k-tatkar-foundations', 'Tatkar Foundations: Ekgun & Dugun Speeds', 'Kathak', 18, NOW() - INTERVAL 1 DAY),
('log-2', 'u-user', 'y-surya-flow', 'Surya Namaskar Vinyasa Flow', 'Yoga', 18, NOW() - INTERVAL 2 DAY),
('log-3', 'u-user', 'm-vipassana', 'Breath Awareness & Anapana Mindfulness', 'Meditation', 15, NOW() - INTERVAL 3 DAY)
ON DUPLICATE KEY UPDATE `minutes_practiced` = VALUES(`minutes_practiced`);

-- Seed Media Items
INSERT INTO `media_items` (`id`, `user_id`, `name`, `media_type`, `url`, `created_at`) VALUES
('med-1', 'u-user', 'Aramandi and Ardhamandala Form Check', 'photo', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80', NOW() - INTERVAL 3 DAY),
('med-2', 'u-user', 'Hastak Hand Alignment Practice', 'photo', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80', NOW() - INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- -------------------------------------------------------------------------
-- 9. Seed All 40 Disciplined Practices (Yoga, Kathak, Bollywood, Semi-Classical, Zumba, Meditation)
-- -------------------------------------------------------------------------
INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('y-surya-flow', 'Surya Namaskar Vinyasa Flow', 'Yoga', 'Vinyasa Flow', 'Beginner', 'Vinyasa Flow', 18, 'Awaken body warmth, breath-to-movement synchronization, and spinal mobility through the traditional 12-asana sun salutation sequence.', 'sunny', 'Moderate', '[\"Pranamasana (Prayer Pose) - Stand grounded, hands at Anjali mudra, breathing evenly into the abdomen.\",\"Hastauttanasana (Raised Arms) - Inhale, sweep arms overhead with gentle thoracic arch.\",\"Padahastasana (Forward Fold) - Exhale, hinge from the hips, relaxing the crown of the head.\",\"Ashwa Sanchalanasana (Equestrian) - Step right leg back into low lunge, lifting sternum.\",\"Dandasana & Ashtanga Namaskara - Step to plank, then gently lower knees, chest, and chin.\",\"Bhujangasana (Cobra Pose) - Inhale into heart opening, drawing shoulder blades together.\",\"Adho Mukha Svanasana (Downward Dog) - Exhale, press through knuckles, lengthening spine and hamstrings.\",\"Step forward smoothly and rise to prayer, completing 5 gentle cycles with full breath awareness.\"]', '[\"Stimulates arterial circulation and digestive fire (Agni)\",\"Improves hamstring flexibility and hip flexor range of motion\",\"Harmonizes autonomic nervous system before dance rehearsal\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('y-hatha-foundations', 'Hatha Alignment & Asana Hold', 'Yoga', 'Hatha Yoga', 'Beginner', 'Hatha Alignment', 22, 'Static posture holds focusing on joint biomechanics, pelvic neutrality, and steady diaphragmatic breathing.', 'sunny', 'Gentle', '[\"Tadasana (Mountain Pose) - Engage arches of feet, neutral pelvis, crown reaching towards sky.\",\"Vrikshasana (Tree Pose) - Place sole on calf or inner thigh, steadying gaze on a singular drishti point.\",\"Trikonasana (Triangle Pose) - Extend side body, keeping shoulders stacked and ribcage open.\",\"Virabhadrasana II (Warrior 2) - Sink into deep hip flexion while gazing over front fingertips with calm resolve.\",\"Setu Bandhasana (Bridge Pose) - Lift hips steadily, clasping hands under back to expand chest.\"]', '[\"Establishes strong proprioception and ground stability\",\"Builds isometric strength in stabilizer muscles\",\"Corrects postural asymmetries from asymmetrical dance stances\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('y-dynamic-vinyasa', 'Dynamic Core & Hip Vinyasa Flow', 'Yoga', 'Vinyasa Flow', 'Intermediate', 'Dynamic Flow', 30, 'A fluid sequence integrating warrior transitions, core stability, and deep external hip rotation essential for classical dance turnouts.', 'flame', 'High Energy', '[\"Three-Legged Dog to Knee-to-Nose - Flow with breath, engaging transverse abdominis.\",\"High Crescent Lunge to Skandasana - Transition laterally, warming adductors and ankles.\",\"Utkata Konasana (Goddess Pose) - Hold deep wide-stance squat with lion breath exhalation.\",\"Eka Pada Rajakapotasana (Pigeon Pose) - Release deep gluteal and piriformis tension.\",\"Navasana (Boat Pose) - Build core endurance with 3 sets of 30-second holds.\"]', '[\"Enhances stamina and core bracing for swift pirouettes\",\"Increases turnout range in Bharatanatyam Aramandi & Kathak Chakkars\",\"Burns calories while preserving muscular fluidity\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('y-ashtanga-primary', 'Ashtanga Primary Standing & Seated Flow', 'Yoga', 'Ashtanga Yoga', 'Advanced', 'Ashtanga Primary', 40, 'Traditional Mysore-style dynamic discipline with internal heat, Ujjayi pranayama, and Mula and Uddiyana bandhas.', 'flame', 'Vigorous', '[\"Surya Namaskar A & B - 5 rounds each with continuous Ujjayi ocean breath.\",\"Padangusthasana & Pada Hastasana - Deep hamstring decompressive forward folds.\",\"Utthita Parsvakonasana & Parivrtta Variation - Revolved side angles demanding high balance.\",\"Marichyasana A & C - Deep spinal twist with arm bind, purifying internal organs.\",\"Chakrasana (Full Wheel Pose) - 3 cycles of full thoracic backbend pushing evenly through palms and soles.\"]', '[\"Develops athletic resilience and unbreakable concentration\",\"Deeply detoxifies visceral tissues through internal tapas heat\",\"Cultivates disciplined kinetic chain awareness\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('y-yin-restorative', 'Yin Yoga Deep Fascia & Hip Release', 'Yoga', 'Yin & Restorative', 'All Levels', 'Yin Yoga', 25, 'Long, passive 3-to-5 minute floor holds targeting dense connective tissues, ligaments, and the joint capsules of hips and lower back.', 'moon', 'Gentle', '[\"Butterfly Pose (Baddha Konasana) - Fold passively forward with rounded spine for 4 minutes.\",\"Dragon Pose (Low Lunge Hold) - Release tight psoas and hip flexors for 3 minutes per side.\",\"Sleeping Swan - Passive prone hip opener surrender over bolster or mat.\",\"Sphinx & Seal Pose - Gentle sustained lumbar compression stimulating kidneys and urinary bladder meridians.\",\"Supported Savasana - 5 minutes of total neuromuscular silence.\"]', '[\"Hydrates collagen matrix and restores fascial glide after intense dance\",\"Down-regulates sympathetic nervous system and lowers cortisol\",\"Improves joint lubrication and prevents chronic knee and hip strain\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('y-power-balances', 'Power Yoga Arm Balances & Inversions', 'Yoga', 'Power Yoga', 'Advanced', 'Arm Balances', 35, 'High-intensity athletic yoga focused on wrist conditioning, scapular protraction, Bakasana (Crow), and forearm balances.', 'flame', 'Vigorous', '[\"Wrist & Scapular Warmup - Hollow-body planks, dolphin pose shoulder press.\",\"Bakasana (Crow Pose) - Knees on triceps, leaning weight forward, lifting toes with core suction.\",\"Parsva Bakasana (Side Crow) - Rotational balance testing oblique strength.\",\"Pincha Mayurasana prep - Forearm balance against wall with hollow-body ribcage integration.\",\"Cooldown: Balasana and gentle wrist counter-stretches.\"]', '[\"Substantially increases shoulder girdle and wrist stability\",\"Overcomes fear of inversion and builds mental fearlessness\",\"Sharpens upper body deceleration control for contemporary choreography\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('y-kundalini-spine', 'Kundalini Kriya & Spinal Flexibility Flow', 'Yoga', 'Kundalini Yoga', 'Intermediate', 'Spine & Kriya', 25, 'Spinal flexes, Sufi grinds, Breath of Fire, and energetic bandha locks to stimulate cerebro-spinal fluid circulation.', 'sparkles', 'Moderate', '[\"Adi Mantra Chanting - Ong Namo Guru Dev Namo.\",\"Spinal Flexes (Camel Rides) - Inhale chest forward, exhale round spine in easy pose (3 min).\",\"Sufi Grinds - Deep circular pelvic and ribcage rotations massaging the lower chakras.\",\"Breath of Fire in Ego Eradicator - Arms at 60 degrees, thumbs up, rapid diaphragmatic breath for 2 min.\",\"Root Lock (Mula Bandha) hold, visualizing golden nectar rising up Sushumna nadi.\"]', '[\"Unlocks thoracic spine and neck mobility\",\"Rapidly clears mental lethargy and activates dormant vital force\",\"Deepens rhythmic endurance for complex dance footwork\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('y-evening-moon', 'Chandra Namaskar (Moonlit Restorative Flow)', 'Yoga', 'Restorative Yoga', 'All Levels', 'Evening Restorative', 15, 'A cooling, side-to-side sequence honoring lunar energy to release mental chatter, soothe adrenal glands, and prepare for restful sleep.', 'moon', 'Gentle', '[\"Anjali Mudra centering - Inhale cooling lunar breath through curled tongue (Sheetali).\",\"Side Crescent Stretches - Expanding lateral ribcage and intercostal spaces.\",\"Goddess Pose with Gyan Mudra - Slow deep sway into pelvic floor softness.\",\"Viparita Karani (Legs Up The Wall) - Inversion allowing venous blood to return to heart.\",\"Savasana with whole-body mental progressive relaxation scan.\"]', '[\"Triggers parasympathetic rest-and-digest state\",\"Alleviates restless leg syndrome and lower back stiffness\",\"Fosters emotional serenity and peaceful slumber\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('k-tatkar-foundations', 'Tatkar Foundations: Ekgun & Dugun Speeds', 'Kathak', 'Tatkar & Footwork', 'Beginner', 'Tatkar & Footwork', 18, 'Master the fundamental Kathak footwork syllables \"Ta Thei Thei Tat, Aa Thei Thei Tat\" in single and double rhythmic tempo.', 'footprints', 'Moderate', '[\"Arambh Stance - Spine upright, chest lifted, arms bent at chest in basic Kathak posture.\",\"Weight Transfer - Shift center of gravity cleanly between right and left metatarsals.\",\"Ekgun Cycle - 1 stamp per beat in 16-beat Teentaal rhythm (Ta Thei Thei Tat, Aa Thei Thei Tat).\",\"Dugun Acceleration - 2 stamps per beat with crisp, clean heel strikes without bouncing the torso.\",\"Sam Landing - Conclude precisely on the first beat (Sam) with sharp composure.\"]', '[\"Builds micro-rhythmic foot coordination and ankle bone density\",\"Conditions lower leg muscles without causing knee torque\",\"Instills intuitive understanding of Laya (rhythm)\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('k-tatkar-advanced', 'Rapid Chaugun & Athgun Tatkar Variations', 'Kathak', 'Tatkar & Footwork', 'Advanced', 'Tatkar & Footwork', 25, 'High-speed footwork drills executing 4 and 8 strikes per beat, incorporating directional travel and rhythmic polyrhythms.', 'footprints', 'Vigorous', '[\"Padant Recitation warmup - Chant the Teentaal bols with taali and khaali precision.\",\"Chaugun Speed (4 footfalls per beat) - Focus on minimal foot elevation from the floor.\",\"Athgun Burst (8 footfalls per beat) - Micro-articulation of soles, maintaining stable shoulders.\",\"Cross-directional travel - Maintaining Chaugun while executing diagonal forward and backward shifts.\",\"Damdar Tihai finale - Three identical rhythmic statements concluding on the Sam.\"]', '[\"Develops professional stage-level speed and rhythmic clarity\",\"Builds calf endurance and cardiovascular fitness\",\"Cultivates extraordinary neuromuscular reaction speed\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('k-chakkar-spotting', 'Chakkar Spotting & 5-Turn Rotations', 'Kathak', 'Chakkars & Spins', 'Beginner', 'Chakkars & Spins', 20, 'Learn the biomechanics of spotting, heel-pivot axis, and seamless 5-turn pirouette sequences without dizziness.', 'sparkles', 'Moderate', '[\"Spotting Drill - Choose a focal point at eye level, whipping the head swiftly as the body turns.\",\"Heel-Toe Pivot Drill - Lift left heel, pivot on ball of right foot with steady torso cylinder.\",\"Single Spin to Sam - Turn 360 degrees and halt instantly in poised Thaat.\",\"Continuous 5-Turn Chakkar - Link five rotations, using arm sweep to maintain rotational torque.\",\"Controlled Stillness - Freeze completely on the final Sam without any wobble.\"]', '[\"Eliminates dizziness through vestibulo-ocular reflex training\",\"Strengthens deep spinal stabilizers and core rotational control\",\"Creates dazzling visual symmetry on stage\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('k-chakkar-bedam', 'Swift 9-Turn Bedam Chakkars & Poised Sama', 'Kathak', 'Chakkars & Spins', 'Advanced', 'Chakkars & Spins', 22, 'Continuous uninterrupted spinning at lightning speed culminating in an abrupt, statuesque freeze on beat one.', 'flame', 'Vigorous', '[\"Core cylinder engagement - Tighten transverse abdominis and knit ribs inwards.\",\"Arm pathway alignment - Right arm leads in semi-circle, left arm snaps into chest.\",\"9-Turn Bedam Sequence - Rapid turns with zero pause between cycles.\",\"Instantaneous deceleration - Decelerate using foot friction and abdominal lock on Sam.\",\"Gaze stabilization - Instant eye contact with the audience upon completion.\"]', '[\"Develops world-class pirouette mastery and spatial orientation\",\"Enhances balance and inner ear equilibrium\",\"Generates audience excitement and artistic awe\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('k-teentaal-rhythm', 'Teentaal 16-Beat Structure & Theka Clapping', 'Kathak', 'Teentaal & Rhythm', 'Beginner', 'Teentaal & Rhythm', 15, 'Understand the mathematical skeleton of Indian classical rhythm: 4 vibhags of 4 beats each, Taali at 1, 5, 13 and Khaali at 9.', 'music', 'Gentle', '[\"Clap on beat 1 (Sam / Taali 1): \\\"Dha\\\".\",\"Wave on beat 2, 3, 4: \\\"Dhin Dhin Dha\\\".\",\"Clap on beat 5 (Taali 2): \\\"Dha Dhin Dhin Dha\\\".\",\"Wave back of hand on beat 9 (Khaali): \\\"Dha Tin Tin Ta\\\".\",\"Clap on beat 13 (Taali 3): \\\"Ta Dhin Dhin Dha\\\", resolving powerfully back to Sam.\"]', '[\"Forms the non-negotiable foundation for all classical choreography\",\"Sharpens analytical thinking and mathematical rhythm calculation\",\"Enables effortless synchronization with tabla accompanists\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('k-hastaks-mudras', 'Classical Hastaks & Hand-Eye Coordination', 'Kathak', 'Hastaks & Mudras', 'All Levels', 'Hastaks & Mudras', 20, 'Refine the 12 core Kathak arm extensions (Hastaks) paired with Pataka, Tripataka, and Alapadma hand mudras and focused eye drishti.', 'sparkles', 'Moderate', '[\"Urdhva Hastak - Sweep arm upwards from center to sky, eyes tracing the tips of fingers.\",\"Madhya Hastak - Lateral arm extension along the shoulder horizontal plane.\",\"Adho Hastak - Downward diagonal arm path with wrist flex and release.\",\"Wrist Circles (Chakradhar Hastak) - Inward and outward rotational wrist dexterity.\",\"Drishti Bheda pairing - Sama, Alokita, and Sachi eye glances synchronized with wrist flips.\"]', '[\"Increases wrist and forearm dexterity for intricate mudra storytelling\",\"Improves upper body lines, shoulder placement, and posture\",\"Cultivates magnetic stage presence through expressive eyes\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('k-abhinaya-bhav', 'Expressive Abhinaya & Navarasa Storytelling', 'Kathak', 'Abhinaya & Bhav', 'Intermediate', 'Abhinaya & Bhav', 26, 'Delve into facial emoting, Nayika Bheda (heroine archetypes), and poetic interpretation of Thumri and Bhajan compositions.', 'heart', 'Gentle', '[\"Eye movement warmups - Eyebrow flutters, pupil circles, and micro-expressions.\",\"Exploring Shringara Rasa (Love & Longing) - Soft gazes, shy turns of the chin, gentle sighs.\",\"Depicting Karuna Rasa (Pathos & Compassion) - Heavy lids, tender hand reaches, still posture.\",\"Thumri Lyrical Acting - Interpreting the pangs of separation through subtle eye glances.\",\"Transitioning between emotions seamlessly without melodramatic overacting.\"]', '[\"Transforms technical dancing into moving, transcendent art\",\"Expands emotional intelligence and empathy\",\"Captivates audiences through nuanced, authentic micro-expressions\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('k-thaat-aamad', 'Courtly Thaat Poise & Graceful Aamad Entrance', 'Kathak', 'Thaat & Aamad', 'Intermediate', 'Thaat & Aamad', 22, 'Immerse in the regal stillness of Thaat and the rhythmic elegance of Aamad (Persian for \"arrival\"), characterizing the Lucknow and Jaipur gharanas.', 'sparkles', 'Moderate', '[\"Thaat Stance - Left arm bent overhead, right arm stretched forward, delicate wrist tilts.\",\"Micro-glances and neck movements (Sundari Griva) in slow tempo Vilambit laya.\",\"Kasak-Masak - Subtle breathing movements through the torso and ribcage.\",\"Aamad Entry - Rhythmic walk sequence starting off-beat and landing on Sam.\",\"Salami Gesture - Respectful royal court greeting to Guru, musicians, and audience.\"]', '[\"Teaches the supreme art of stillness between dynamic movements\",\"Enhances royal stage carriage and dignified poise\",\"Polishes transitions between musical phrases\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('k-tukdas-tihais', 'Crisp Tukdas, Paran & Damdar Tihais', 'Kathak', 'Tukdas & Tihais', 'Advanced', 'Tukdas & Tihais', 25, 'Complex rhythmic compositions featuring pakhawaj bols, explosive foot strikes, and 3-fold mathematical Tihais with dramatic pauses.', 'flame', 'Vigorous', '[\"Pakhawaj Paran bols: \\\"Dha Dha Dhit Dhit Dha\\\", executing heavy heel strikes.\",\"Sudden tempo change from Madhyam to Drut speed in 8-measure intervals.\",\"Damdar Tihai calculation - Three identical patterns with 1-beat silence (Dam) in between.\",\"Bedam Tihai calculation - Three continuous patterns with zero silence landing precisely on Sam.\",\"Concluding flourish with synchronized head snap and mudra freeze.\"]', '[\"Mastery of intricate rhythmic architecture and mathematical timing\",\"Demonstrates authoritative command over live percussion\",\"Thrilling climax material for solo concerts\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('k-padant-recitation', 'Padant: Vocal Bols Recitation & Clapping', 'Kathak', 'Padant Recitation', 'All Levels', 'Padant Recitation', 15, 'Reciting rhythmic poetry with clear diction, modulated voice, and simultaneous hand clapping before dancing the composition.', 'music', 'Gentle', '[\"Diaphragmatic breath support for crisp vocal projection.\",\"Pronouncing hard and soft consonants: \\\"Dha, Dhin, Ta, Tit, Kat, Gadi, Gana\\\".\",\"Maintaining steady clapping in hands while speaking syncopated subdivisions.\",\"Modulating volume and pitch to reflect the mood and tempo of the bols.\",\"Reciting complex Tihais at double speed without stumbling.\"]', '[\"Deepens intellectual comprehension of rhythm before physical execution\",\"Fosters vocal confidence and stage communication skills\",\"Builds essential artistic discipline respected across the tradition\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('b-hooksteps-grooves', 'Bollywood Signature Hooksteps & Grooves', 'Bollywood', 'Hooksteps & Grooves', 'Beginner', 'Hooksteps', 20, 'Catchy, iconic hooksteps from Bollywood chartbusters combining energetic hip swivels, playful shoulder shakes, and facial smiles.', 'music', 'Moderate', '[\"Bouncing Hip Isolation - Step right, pop right hip with bounce on the beat.\",\"Shoulder Shimmer & Shimmy - Rapid alternating shoulder isolations with open palms.\",\"Thumka Technique - Side pelvic snap with heel lift and flirtatious eyebrow raise.\",\"Signature Chorus Combination - Linking 4 iconic 8-counts into a dynamic routine.\",\"Expressive ending pose with charismatic Bollywood flair.\"]', '[\"Instantly boosts mood and releases joyful endorphins\",\"Loosens stiff hips and lubricates pelvic joints\",\"Perfect party and wedding dance floor readiness\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('b-commercial-high-energy', 'High-Energy Commercial Bollywood Dance', 'Bollywood', 'Commercial Bollywood', 'Intermediate', 'High-Energy', 25, 'High-octane urban Bollywood fusion featuring sharp musicality, rapid level changes, jumps, and clean directional formations.', 'flame', 'High Energy', '[\"Cardio Warmup - High knees, torso circles, and rhythmic bounce steps.\",\"Fast-paced 8-Count Part 1 - Chest pop, slide step, turn, and grounded knee drop.\",\"Fast-paced 8-Count Part 2 - Arm glides with syncopated bass hit accents.\",\"Full Routine Drill - Running the chorus at 100\% stage energy 3 times.\",\"Breathing cooldown and quad/hamstring stretches.\"]', '[\"Burns high calories while dancing to energetic beats\",\"Improves cardiovascular endurance and stamina\",\"Sharpens contemporary musicality and body coordination\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('b-lyrical-emotional', 'Lyrical Bollywood Emotional Expression', 'Bollywood', 'Lyrical Bollywood', 'Intermediate', 'Lyrical Bollywood', 30, 'Expressive contemporary-infused choreography to soulful melodies, weaving graceful floorwork, fluid arm extensions, and emotive lyrics.', 'heart', 'Moderate', '[\"Fluid Spine Warmup - Undulations, side body sweeps, and tender arm ripples.\",\"Section 1: Verse Interpretation - Walking lines, gentle pirouette into soft chest opening.\",\"Section 2: Lyrical Crescendo - Dynamic leap into grounded descent with sweep turn.\",\"Facial storytelling: Expressing joy, longing, and poetic romance through the eyes.\",\"Final gentle deceleration into serene stillness.\"]', '[\"Enhances lyrical fluidity and emotional self-expression\",\"Strengthens core through seamless floorwork transitions\",\"Builds artistic sensitivity and aesthetic grace\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('b-garba-bhangra-festive', 'Festive Dhol, Garba & Bhangra-Bollywood Fusion', 'Bollywood', 'Festive Folk Fusion', 'All Levels', 'Festive Folk', 25, 'Celebrate Indian festivals with high-stepping Bhangra hops, traditional Gujarati 3-Taali Garba swirls, and infectious dhol beats.', 'flame', 'High Energy', '[\"Garba 3-Taali Basics - Step right, clap, step left, clap, spin with third clap.\",\"Bhangra Single & Double Dhamal - High knees, kicking forward with celebratory arm pumps.\",\"Balle Balle Shoulder Bounce - Synchronized bounce on balls of feet with wide smiles.\",\"Circular Group Formation - Festive traveling dance simulation building to a crescendo.\",\"Exultant final freeze with hands raised high.\"]', '[\"Full-body cardiovascular workout targeting calves and glutes\",\"Deep communal joy and cultural celebratory connection\",\"Relieves stress through euphoric high-vibration music\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('b-retro-classic', 'Retro Classic Bollywood & Golden Era Charm', 'Bollywood', 'Retro Classic', 'Beginner', 'Retro Bollywood', 20, 'Channel the timeless elegance, coquettish glances, and iconic moves of 70s and 80s cinema legends with playful vintage charm.', 'sparkles', 'Gentle', '[\"Classic Vintage Walk - Graceful toe-heel steps with gentle skirt sway.\",\"Playful Wink & Eyebrow Flirt - Emulating retro silver screen divas.\",\"Twist & Shimmy - 1960s twist on balls of feet with hand rolls.\",\"Classic Rain Song Arm Waves - Delicate finger ripples and upward gazes.\",\"Charming vintage ending tableau.\"]', '[\"Cultivates vintage cinematic charisma and feminine grace\",\"Gentle on the joints while refining hand-eye precision\",\"Nostalgic fun and expressive relaxation\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('b-dance-party-burn', 'Fast-Paced Bollywood Dance Party Burn', 'Bollywood', 'Dance Party Cardio', 'Advanced', 'Dance Party', 35, 'Non-stop club-remix medley combining continuous footwork, power squats, jump turns, and high-energy chorus drops for maximum calorie burn.', 'flame', 'Vigorous', '[\"Continuous BPM Ramp-up - 120 to 135 BPM transition.\",\"Power Squat Bollywood Drops - Hitting the beat with deep thigh engagement.\",\"Jump Spin Transitions - 180-degree mid-air turns landing in rhythm.\",\"Non-stop 4-track dance medley without pausing.\",\"Breath normalization and restorative hamstring cooldown.\"]', '[\"Burns up to 350-400 calories per session\",\"Builds explosive leg power and anaerobic capacity\",\"Unleashes pure euphoria and unstoppable dance confidence\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('sc-fundamentals', 'Semi-Classical Fusion Fundamentals & Arm Waves', 'Semi-Classical', 'Fusion Fundamentals', 'Beginner', 'Semi-Classical Basics', 20, 'Learn the core posture of semi-classical dance: soft bent knees, classical Hasta mudras, elongated spine, and liquid arm undulations.', 'sparkles', 'Gentle', '[\"Ardhamandala-Lite Stance - Comfortable half-bend without extreme outward foot rotation.\",\"Mayura & Hamsasya Mudra transitions - Transforming peacock into swan gesture.\",\"Continuous Ripple Arm Wave - Initiating movement from the back of the shoulder through wrist to fingertips.\",\"Diagonal Floor Walk - Smooth, silent gliding steps keeping torso level.\",\"Final Salutation Mudra bringing hands to Anjali at heart.\"]', '[\"Combines the beauty of classical dance with contemporary comfort\",\"Improves upper body fluidity and relieves thoracic stiffness\",\"Accessible for beginners desiring classical aesthetics\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('sc-thumri-ghazal', 'Thumri & Ghazal Semi-Classical Abhinaya', 'Semi-Classical', 'Abhinaya & Expression', 'Intermediate', 'Thumri & Ghazal', 25, 'Delicate, emotive choreography set to Urdu ghazals and Hindustani thumris, exploring themes of longing, poetic imagery, and subtle grace.', 'heart', 'Moderate', '[\"Sitting Floor Choreo - Interpreting poetic couplets while seated in Sukhasana.\",\"Hand gestures depicting the nightingale, crescent moon, and fragrant breeze.\",\"Subtle shifts of gaze (Drishti) and nuanced sighs.\",\"Graceful rise from floor into spinning arabesque.\",\"Poised concluding gaze looking into the distance.\"]', '[\"Elevates expressive maturity and poetic musical sensitivity\",\"Builds hip flexibility and core control in ground-to-standing transitions\",\"Creates deeply touching, memorable artistic performances\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('sc-contemporary-lines', 'Contemporary Semi-Classical Fluid Spine Lines', 'Semi-Classical', 'Contemporary Fusion', 'Advanced', 'Contemporary Fusion', 30, 'High-level choreography blending classical Kathak and Odissi mudras with contemporary floor slides, backbends, and dynamic extensions.', 'flame', 'High Energy', '[\"Spinal Roll-downs into deep plie with classical Alapadma mudras.\",\"Side sweep into contemporary attitude turn with focused spotting.\",\"Floor slide transition recovering into graceful high arch backbend.\",\"Fast syncopated jati footwork mixed with modern arm releases.\",\"Stunning final pose balancing on one leg in Natarajasana variation.\"]', '[\"Mastery of innovative, cutting-edge fusion choreography\",\"Increases spine flexibility, balance, and athletic agility\",\"Ideal for stage auditions and contemporary dance festivals\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('sc-devotional-stuti', 'Devotional Stuti & Shiv Tandav Flow', 'Semi-Classical', 'Devotional Stuti', 'Intermediate', 'Devotional Choreo', 25, 'Powerful, grounding choreography depicting Lord Shiva’s cosmic dance, featuring vigorous stamps, Trishul mudras, and calm meditative stillness.', 'sparkles', 'Moderate', '[\"Damru & Trishul Mudra formation with upright warrior stance.\",\"Firm rhythmic stamps depicting the rhythm of the cosmos.\",\"Broad circular leaps landing in serene meditative posture.\",\"Chanting \\\"Om Namah Shivaya\\\" synchronized with arm offerings.\",\"Transition from intense Tandav power into calm Lasya peace.\"]', '[\"Builds deep inner confidence, strength, and grounding\",\"Strengthens quadriceps, glutes, and shoulder posture\",\"Provides profound spiritual elevation and mental clarity\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('sc-sufi-swirls', 'Sufi Semi-Classical Whirling & Circular Extensions', 'Semi-Classical', 'Sufi Whirling', 'All Levels', 'Sufi Whirling', 22, 'Experience the mystical ecstasy of Sufi whirling: right palm facing upward to receive divine grace, left palm turned downward to earth.', 'sparkles', 'Gentle', '[\"Right Palm to Heaven, Left Palm to Earth arm placement.\",\"Footwork: Left foot acts as anchor axis, right foot paddles smoothly in circles.\",\"Continuous slow clockwise rotation, surrendering ego to the music.\",\"Gradual acceleration into effortless, trance-like floating sensation.\",\"Slow, gentle deceleration and deep bow of gratitude to the earth.\"]', '[\"Transcendent meditative state of inner peace and detachment\",\"Enhances inner ear balance and spatial equilibrium\",\"Releases emotional heaviness and restores spiritual connection\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('z-bolly-cardio', 'Desi Bolly-Zumba Cardio Blast', 'Zumba', 'Bolly-Zumba', 'All Levels', 'Bolly-Zumba', 25, 'Infectious dance fitness fusing energetic Indian rhythms with Latin aerobic intervals for a fun, sweat-drenched, high-calorie burn.', 'flame', 'High Energy', '[\"Warmup Groove - Lateral step-touches with rolling wrists and shoulder shrugs.\",\"Track 1 (Bhangra Hop Cardio) - High knees with overhead hand pumps.\",\"Track 2 (Bolly-Cumbia Fusion) - Hip sways with syncopated arm reaches.\",\"Track 3 (High-BPM Finale) - Continuous fast feet with joyful vocal cheers.\",\"Cool-down stretch for hamstrings, calves, and lower back.\"]', '[\"Burns 250-350 calories per 25-minute session\",\"Improves cardiovascular heart health and lung capacity\",\"So much fun you forget you are exercising\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('z-latin-salsa', 'Latin Salsa, Merengue & Reggaeton Beats', 'Zumba', 'Latin Rhythms', 'Beginner', 'Latin Beats', 30, 'Master the four core Zumba rhythms: Salsa 2-step, fast Merengue march, rolling Cumbia hip circle, and grounded Reggaeton bounce.', 'music', 'Moderate', '[\"Merengue March - Rapid 1-2 march pumping arms with hip sway.\",\"Salsa Side-to-Side - Quick-quick-slow step rhythm with ribcage isolation.\",\"Cumbia Sugar Cane - Diagonal step-heel dig with circular arm stirring motion.\",\"Reggaeton Destroza - Wide-leg bounce with chest pop and grounded bass hits.\",\"Gentle cool-down salsa walk.\"]', '[\"Unlocks natural pelvic and hip rhythm\",\"Tones thighs, calves, and oblique abdominal muscles\",\"Easy to follow for complete fitness beginners\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('z-low-impact-tone', 'Low-Impact Tone & Sculpt Dance Fitness', 'Zumba', 'Low-Impact Tone', 'Beginner', 'Low-Impact', 20, 'Joint-friendly dance workout with zero jumping, emphasizing deep muscle activation, arm sculpting, and steady fat-burning tempo.', 'heart', 'Gentle', '[\"Grounded Step-Touch - Stepping wide without bouncing to protect knees.\",\"Overhead Reach & Pull - Engaging latissimus dorsi and shoulders with every step.\",\"Pelvic Curl & Squeeze - Toning glutes and pelvic floor through rhythmic beats.\",\"Isometric Squat Pulses - Holding mid-squat while pulsing arms to the rhythm.\",\"Full body lymphatic drainage cooldown.\"]', '[\"Completely safe for sensitive knees, ankles, and back\",\"Sustained fat-oxidation without spike in joint inflammation\",\"Ideal for active recovery days or postpartum/mature practitioners\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('z-hiit-surges', 'HIIT Zumba Cardio Surges & Core Toning', 'Zumba', 'HIIT Cardio Zumba', 'Advanced', 'HIIT Zumba', 35, 'High-intensity interval dance training: 45 seconds of explosive dance sprints alternated with 15 seconds of active rhythmic recovery.', 'flame', 'Vigorous', '[\"Dynamic dynamic warmup targeting core and hip flexors.\",\"Interval 1: Jump Squat Turn to Reggaeton Bass Drop (45s sprint, 15s recovery).\",\"Interval 2: Speed Skater Plyometrics with Bollywood arm whips.\",\"Interval 3: Standing Mountain Climbers to fast Merengue drums.\",\"Core finisher on mat: Bicycle crunches and Russian twists to Latin beats.\"]', '[\"Boosts post-exercise oxygen consumption (EPOC) burning calories for hours\",\"Maximizes VO2 max and anaerobic stamina\",\"Shreds abdominal definition and strengthens stabilizing joints\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('m-anapana-breath', 'Mindful Breath Awareness (Anapana)', 'Meditation', 'Mindfulness', 'Beginner', 'Mindfulness & Breath', 10, 'Cultivate sharp, unwandering attention by observing natural inhalation and exhalation at the rim of the nostrils without controlling it.', 'moon', 'Gentle', '[\"Find an erect, relaxed sitting posture with spine naturally straight.\",\"Close eyes gently, relaxing temples, jaw, and tongue.\",\"Bring undivided attention to the triangular area below nostrils and above upper lip.\",\"Observe the natural touch of air: cool on entry, warm on exit.\",\"When thoughts arise, notice them without judgment and gently return to the breath.\"]', '[\"Stabilizes restless mind and calms acute anxiety\",\"Develops one-pointed concentration (Dharana)\",\"Effortless daily 10-minute mental reset\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('m-chakra-alignment', '7-Chakra Alignment & Pranic Visualization', 'Meditation', 'Chakra Alignment', 'All Levels', 'Chakra Alignment', 20, 'Journey from the root chakra (Mooladhara) to the crown (Sahasrara), vibrating Bija mantras and visualizing radiant luminous centers.', 'sparkles', 'Gentle', '[\"Root (Mooladhara): Red glow at pelvic floor, chant \\\"LAM\\\" - Feeling grounded security.\",\"Sacral (Svadhisthana): Warm orange at lower belly, chant \\\"VAM\\\" - Creative flow.\",\"Solar Plexus (Manipura): Radiant yellow at navel, chant \\\"RAM\\\" - Courage and will.\",\"Heart (Anahata): Emerald green at heart center, chant \\\"YAM\\\" - Compassion and love.\",\"Throat, Third Eye, and Crown: Ascending light connecting individual with universal consciousness.\"]', '[\"Harmonizes endocrine glands and emotional stability\",\"Clears energetic blocks that manifest as physical tension in dance\",\"Leaves the practitioner radiant, peaceful, and centered\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('m-yoga-nidra', 'Deep Yoga Nidra for Somatic Rest & Healing', 'Meditation', 'Yoga Nidra', 'All Levels', 'Yoga Nidra', 30, 'Conscious psychic sleep lying in Savasana. Systematically rotates awareness through all 61 energy points of the physical body.', 'moon', 'Gentle', '[\"Sankalpa: State your sacred heartfelt intention three times with conviction.\",\"Rotation of Consciousness: Moving awareness rapidly from right thumb to left toe.\",\"Breath Awareness: Reverse counting from 27 down to 1 with each breath.\",\"Opposite Sensations: Experiencing intense heaviness followed by weightless lightness.\",\"Awakening gently with profound rejuvenation equivalent to 3 hours of sleep.\"]', '[\"Reduces systemic muscular inflammation and nervous fatigue\",\"Repairs deep cellular tissue and balances hormones\",\"Enhances creative neuroplasticity and memory retention\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('m-pranayama-mastery', 'Pranayama Mastery: Nadi Shodhana & Sheetali', 'Meditation', 'Pranayama', 'Intermediate', 'Pranayama Breathwork', 15, 'Alternate nostril breathing with Vishuddha mudra paired with cooling Sheetali to purify Ida and Pingala nadis and balance brain hemispheres.', 'sunny', 'Gentle', '[\"Adopt Nasagra Mudra with right hand, resting left hand in Chin Mudra on knee.\",\"Close right nostril with thumb, inhale steadily through left nostril for 4 counts.\",\"Close both nostrils with ring finger and thumb, retaining breath gently for 4 counts.\",\"Release thumb, exhale smoothly through right nostril for 8 counts.\",\"Repeat on the opposite side for 10 serene cycles.\"]', '[\"Equalizes left and right brain hemisphere activity\",\"Lowers heart rate and balances blood pressure\",\"Prepares the mind for profound meditative absorption\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('m-nada-yoga-sound', 'Nada Yoga & Sacred Om Harmonic Resonance', 'Meditation', 'Nada Yoga', 'All Levels', 'Sound Meditation', 15, 'Internal sound meditation utilizing sustained A-U-M chanting, humming Bhramari pranayama, and listening to the silent unstruck sound (Anahata Nada).', 'music', 'Gentle', '[\"A sound: Resonate \\\"Ahhh\\\" deep in lower abdomen and pelvis for 5 breaths.\",\"U sound: Resonate \\\"Ooo\\\" within the heart and chest cavity for 5 breaths.\",\"M sound: Resonate \\\"Mmm\\\" throughout the skull and sinuses for 5 breaths.\",\"Merge all three into three unified long Om vibrations.\",\"Rest in the ringing silence that follows the sound.\"]', '[\"Releases nitric oxide in nasal passages boosting immune function\",\"Calms agitated nervous pathways and promotes cellular tranquility\",\"Deepens artistic resonance and vocal resonance for dance recitations\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('m-vipassana-insight', 'Vipassana Insight & Body Scanning', 'Meditation', 'Vipassana', 'Advanced', 'Vipassana Insight', 25, 'Systematic objective observation of sensations (Vedana) across the entire body from crown to toes, training the mind in equanimity (Upekkha).', 'moon', 'Gentle', '[\"Establish motionless cross-legged sitting posture.\",\"Scan attention like a soft laser from scalp to forehead, eyes, cheeks, and neck.\",\"Notice sensations: tingling, warmth, pulse, numbness, or pressure.\",\"Observe without craving pleasant sensations or averting unpleasant ones.\",\"Maintain awareness of Anicca (impermanence) — everything arises and passes away.\"]', '[\"Frees the mind from habitual reactive stress patterns\",\"Builds supreme mental resilience under high-pressure performance conditions\",\"Cultivates authentic equanimity and deep wisdom\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

INSERT INTO `practices` (`id`, `title`, `discipline`, `category`, `level`, `topic`, `minutes`, `description`, `icon`, `intensity`, `instructions`, `benefits`) VALUES
('m-pre-performance-calm', 'Pre-Performance Grounding & Nervous System Reset', 'Meditation', 'Stress Release', 'All Levels', 'Stress Release', 12, 'Quick backstage or pre-rehearsal somatic centering practice to transform stage fright adrenaline into focused artistic radiance.', 'heart', 'Gentle', '[\"Physiological Sigh: Double inhale through the nose, followed by a long sighing exhale.\",\"Grounding 5-4-3-2-1: Acknowledge 5 sights, 4 physical touch points, 3 sounds, 2 scents, 1 breath.\",\"Drop shoulders, unclamp jaw, and visualize roots extending from feet deep into the earth.\",\"Anchor word: Silently chant \\\"I am grounded, I am ready, I am the dance\\\".\",\"Step forward onto the stage or mat with serene confidence.\"]', '[\"Cuts cortisol spikes within 3 minutes\",\"Converts trembling anxiety into laser-focused performance energy\",\"Prevents hyperventilation and stabilizes fine motor control\"]')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `instructions` = VALUES(`instructions`), `benefits` = VALUES(`benefits`);

-- -------------------------------------------------------------------------
-- 10. Seed All 14 Scheduled Movement & Dance Diet Plans (Veg & Non-Veg 06:30 AM to 09:30 PM)
-- -------------------------------------------------------------------------
INSERT INTO `diet_plans` (`id`, `title`, `diet_type`, `time_slot`, `time_label`, `target_goal`, `level`, `calories`, `protein_grams`, `carbs_grams`, `fat_grams`, `description`, `ingredients`, `preparation_instructions`, `benefits`) VALUES
('d-0630-veg', 'Warm Lemon-Ginger Elixir with Soaked Almonds & Chia', 'veg', 'early_morning', '06:30 AM', 'Detox & Lightness', 'All Levels', 95, 3, 7, 6, 'Alkalizing morning tonic to kickstart digestion, gently cleanse the liver, and deliver omega-3s and vitamin E before morning yoga or dance practice.', '[\"1 glass warm spring or filtered water (not boiling)\",\"1/2 freshly squeezed organic lemon\",\"1/2 inch crushed fresh ginger root\",\"1 tsp raw organic wild honey (optional)\",\"5 Mamra almonds (soaked overnight & peeled)\",\"1 tsp soaked chia seeds\"]', '[\"Warm water to lukewarm temperature. Squeeze fresh lemon juice and stir in crushed ginger.\",\"Allow to steep for 2 minutes and add soaked chia seeds and raw honey if desired.\",\"Sip slowly while sitting in Sukhasana, chewing the peeled soaked almonds deliberately.\"]', 'Awakens digestive fire (Jatharagni) without taxing the gut, flushes nocturnal toxins, and lubricates joint cartilage for morning stretching.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `ingredients` = VALUES(`ingredients`), `preparation_instructions` = VALUES(`preparation_instructions`);

INSERT INTO `diet_plans` (`id`, `title`, `diet_type`, `time_slot`, `time_label`, `target_goal`, `level`, `calories`, `protein_grams`, `carbs_grams`, `fat_grams`, `description`, `ingredients`, `preparation_instructions`, `benefits`) VALUES
('d-0630-nonveg', 'Warm Lemon Electrolyte Water with Bone Broth Shot & Walnuts', 'non-veg', 'early_morning', '06:30 AM', 'Lean Muscle & Stamina', 'All Levels', 120, 9, 3, 8, 'High-collagen restorative morning tonic supplying glycine, trace minerals, and essential fatty acids for joint resilience and connective tissue protection.', '[\"1 glass warm water with pinch of pink Himalayan rock salt & lemon juice\",\"60ml slow-simmered organic chicken or beef bone broth warm shot\",\"4 halves soaked Kashmiri walnuts\",\"1/2 tsp cold-pressed A2 cow ghee or virgin coconut oil\"]', '[\"Drink the warm lemon Himalayan salt water first to rehydrate intracellular pathways.\",\"Sip the warm seasoned bone broth shot.\",\"Consume the soaked walnuts slowly for cognitive clarity and healthy fats.\"]', 'Glycine and collagen peptides accelerate tendon and ligament repair after high-impact footwork and deep yoga postures.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `ingredients` = VALUES(`ingredients`), `preparation_instructions` = VALUES(`preparation_instructions`);

INSERT INTO `diet_plans` (`id`, `title`, `diet_type`, `time_slot`, `time_label`, `target_goal`, `level`, `calories`, `protein_grams`, `carbs_grams`, `fat_grams`, `description`, `ingredients`, `preparation_instructions`, `benefits`) VALUES
('d-0830-veg', 'Sprouted Moong & Oats Besan Chilla with Mint Chutney', 'veg', 'breakfast', '08:30 AM', 'Energy & Agility', 'All Levels', 340, 18, 46, 8, 'Savory protein-packed Indian crepes made with blended sprouted green gram, stone-ground oats, and chickpea flour topped with fresh greens and mint relish.', '[\"1/2 cup sprouted green moong dal (lightly blended)\",\"1/4 cup rolled oats flour & 2 tbsp gram flour (besan)\",\"Grated ginger, chopped green chillies, coriander leaves, pinch of hing (asafoetida)\",\"1 tsp cold-pressed sesame or mustard oil for cooking\",\"Homemade mint-coriander raw chutney (no sugar)\",\"Small cup of steamed mixed vegetable sprouts on the side\"]', '[\"Whisk batter with water to pouring consistency, seasoning with cumin, turmeric, and pink salt.\",\"Heat cast-iron tawa, spread a ladle of batter thinly into a golden crisp crepe.\",\"Flip once cooked, serving hot with fresh mint chutney and steamed sprouts.\"]', 'Complex low-glycemic carbohydrates provide 4 hours of steady stamina without sugar crashes; high plant protein repairs micro-tears in muscles.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `ingredients` = VALUES(`ingredients`), `preparation_instructions` = VALUES(`preparation_instructions`);

INSERT INTO `diet_plans` (`id`, `title`, `diet_type`, `time_slot`, `time_label`, `target_goal`, `level`, `calories`, `protein_grams`, `carbs_grams`, `fat_grams`, `description`, `ingredients`, `preparation_instructions`, `benefits`) VALUES
('d-0830-nonveg', 'Desi Masala Egg Bhurji on Sourdough with Sauteed Spinach', 'non-veg', 'breakfast', '08:30 AM', 'Lean Muscle & Stamina', 'All Levels', 385, 26, 32, 15, 'Pasture-raised eggs scrambled with fresh onions, vine tomatoes, turmeric, and cumin served alongside artisanal fermented sourdough and baby spinach.', '[\"3 free-range eggs (2 whole eggs + 1 egg white)\",\"1 slice artisan whole wheat sourdough toast (dry toasted)\",\"1 cup organic baby spinach sauteed in 1/2 tsp A2 ghee with garlic\",\"Finely diced red onion, tomato, green chilli, and fresh cilantro\",\"Turmeric, freshly ground black pepper, and rock salt\"]', '[\"Whisk eggs with turmeric and a splash of water for fluffiness.\",\"Sauté onions, tomatoes, and chillies in a light pan until aromatic; pour in eggs and scramble gently.\",\"Quickly wilt spinach in the same pan, plating over toasted sourdough.\"]', 'Complete amino acid profile supports muscle protein synthesis and neurotransmitter production for razor-sharp memory and choreography retention.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `ingredients` = VALUES(`ingredients`), `preparation_instructions` = VALUES(`preparation_instructions`);

INSERT INTO `diet_plans` (`id`, `title`, `diet_type`, `time_slot`, `time_label`, `target_goal`, `level`, `calories`, `protein_grams`, `carbs_grams`, `fat_grams`, `description`, `ingredients`, `preparation_instructions`, `benefits`) VALUES
('d-1100-veg', 'Fresh Tender Coconut Water with Spiced Roasted Makhana', 'veg', 'mid_morning', '11:00 AM', 'Energy & Agility', 'All Levels', 155, 5, 24, 4, 'Natural isotonic electrolyte rehydration paired with calcium-rich roasted lotus seeds (foxnuts) spiced with chaat masala and black pepper.', '[\"1 freshly chopped tender coconut water (approx. 250ml)\",\"1 bowl roasted phool makhana (foxnuts)\",\"1/2 tsp A2 cow ghee with pinch of black pepper, turmeric, and rock salt\",\"1 tbsp raw pumpkin seeds & sunflower seeds\"]', '[\"Drink the coconut water directly for potassium and magnesium electrolyte replenishment.\",\"Slow roast makhana in cast iron pan with ghee and spices until delightfully crunchy.\",\"Toss with raw pumpkin seeds for zinc support.\"]', 'Replenishes potassium lost through sweat in vigorous dance rehearsals; prevents calf cramps and hydrates spinal discs.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `ingredients` = VALUES(`ingredients`), `preparation_instructions` = VALUES(`preparation_instructions`);

INSERT INTO `diet_plans` (`id`, `title`, `diet_type`, `time_slot`, `time_label`, `target_goal`, `level`, `calories`, `protein_grams`, `carbs_grams`, `fat_grams`, `description`, `ingredients`, `preparation_instructions`, `benefits`) VALUES
('d-1100-nonveg', 'Coconut Water with Soft-Boiled Egg Whites & Kashmiri Walnuts', 'non-veg', 'mid_morning', '11:00 AM', 'Lean Muscle & Stamina', 'All Levels', 175, 14, 12, 7, 'Quick, highly bioavailable protein burst paired with nature’s electrolyte fluid to maintain optimal energy between morning and afternoon practice.', '[\"1 glass fresh coconut water\",\"2 soft-boiled organic egg whites dusted with black pepper & chaat masala\",\"3 Kashmiri walnut halves\",\"Few fresh mint leaves\"]', '[\"Boil eggs for 6 minutes, shock in ice water, peel, and slice whites.\",\"Dust with black pepper and Himalayan pink salt.\",\"Consume alongside fresh chilled coconut water.\"]', 'Pure albumin protein with zero saturated fat gives sustained mid-day satiety without inducing digestive sluggishness or heaviness.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `ingredients` = VALUES(`ingredients`), `preparation_instructions` = VALUES(`preparation_instructions`);

INSERT INTO `diet_plans` (`id`, `title`, `diet_type`, `time_slot`, `time_label`, `target_goal`, `level`, `calories`, `protein_grams`, `carbs_grams`, `fat_grams`, `description`, `ingredients`, `preparation_instructions`, `benefits`) VALUES
('d-1330-veg', 'Sattvic Rainbow Thali: Multigrain Phulka, Dal, Paneer Bhurji & Curd', 'veg', 'lunch', '01:30 PM', 'Energy & Agility', 'All Levels', 520, 26, 65, 16, 'Complete Ayurvedic balanced plate providing all 6 tastes (Shad Rasa): sweet, sour, salty, bitter, pungent, and astringent for holistic nourishment.', '[\"2 soft multigrain phulkas (wheat, ragi, and jowar blend)\",\"1 bowl yellow moong & masoor dal tempered with cumin, hing & tomatoes\",\"100g low-fat fresh paneer bhurji or palak paneer with bell peppers\",\"1 bowl raw rainbow salad (beetroot, cucumber, grated carrot, lemon juice)\",\"1/2 bowl homemade probiotic set curd with roasted cumin\"]', '[\"Cook dal until soft and silky, tempering with minimal cold-pressed oil and fresh aromatics.\",\"Sauté diced vegetables and crumbled paneer quickly to retain crunch.\",\"Enjoy mindfully without screens, chewing each bite 20 times.\"]', 'Supplies high fiber, sustained carbohydrate reserves, natural probiotics for gut microbiome health, and essential calcium for bone density.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `ingredients` = VALUES(`ingredients`), `preparation_instructions` = VALUES(`preparation_instructions`);

INSERT INTO `diet_plans` (`id`, `title`, `diet_type`, `time_slot`, `time_label`, `target_goal`, `level`, `calories`, `protein_grams`, `carbs_grams`, `fat_grams`, `description`, `ingredients`, `preparation_instructions`, `benefits`) VALUES
('d-1330-nonveg', 'Brown Basmati Rice, Herb-Grilled Chicken or Fish Curry & Cucumber Raita', 'non-veg', 'lunch', '01:30 PM', 'Lean Muscle & Stamina', 'All Levels', 540, 38, 58, 14, 'Lean high-protein power lunch designed for dancers and yogis demanding deep muscular endurance, fast repair, and sustained vitality.', '[\"1 bowl steamed aged brown basmati rice or quinoa\",\"140g grilled lemon-herb chicken breast or Rohu/Salmon fish curry cooked in light coconut milk\",\"1 cup steamed French beans, carrots, and bottle gourd (lauki)\",\"1 bowl fresh cucumber-mint raita prepared with cultured yogurt\",\"Lemon wedge and fresh coriander sprigs\"]', '[\"Marinate chicken or fish with lemon, garlic, turmeric, coriander powder, and grill on griddle.\",\"Plate with aromatic brown rice and a cooling cucumber raita.\",\"Finish with warm water sip 30 minutes after the meal.\"]', 'High biological value protein promotes lean muscle mass and structural strength without bloating or weighing down the body.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `ingredients` = VALUES(`ingredients`), `preparation_instructions` = VALUES(`preparation_instructions`);

INSERT INTO `diet_plans` (`id`, `title`, `diet_type`, `time_slot`, `time_label`, `target_goal`, `level`, `calories`, `protein_grams`, `carbs_grams`, `fat_grams`, `description`, `ingredients`, `preparation_instructions`, `benefits`) VALUES
('d-1700-veg', 'Steamed Sprouted Kala Chana Chaat with Tulsi Green Tea', 'veg', 'snack', '05:00 PM', 'Energy & Agility', 'All Levels', 195, 10, 32, 3, 'Light, tangy, energizing snack rich in iron, zinc, and bio-available B-vitamins to power evening dance and yoga classes.', '[\"1 cup lightly steamed sprouted brown chickpeas (kala chana)\",\"Diced cucumber, tomatoes, raw mango (in season), and fresh pomegranate pearls\",\"Pinch of roasted cumin powder, black salt, and freshly squeezed lemon juice\",\"1 cup warm organic Tulsi ginger green tea\"]', '[\"Toss steamed sprouted chana with vegetables, pomegranate, and spices in a wooden bowl.\",\"Brew fresh Tulsi green tea and enjoy 60-90 minutes prior to your evening movement session.\"]', 'Iron and folate support red blood cell hemoglobin oxygenation, preventing breathlessness during intense fast-paced dance footwork.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `ingredients` = VALUES(`ingredients`), `preparation_instructions` = VALUES(`preparation_instructions`);

INSERT INTO `diet_plans` (`id`, `title`, `diet_type`, `time_slot`, `time_label`, `target_goal`, `level`, `calories`, `protein_grams`, `carbs_grams`, `fat_grams`, `description`, `ingredients`, `preparation_instructions`, `benefits`) VALUES
('d-1700-nonveg', 'Boiled Egg Chaat with Chia Flax Crunch & Herbal Ashwagandha Tea', 'non-veg', 'snack', '05:00 PM', 'Lean Muscle & Stamina', 'All Levels', 215, 14, 14, 10, 'Clean protein snack providing sustained stamina, amino acids, and adaptogenic tea to modulate physical stress and boost focus.', '[\"2 hard-boiled eggs, quartered\",\"Finely diced bell peppers, shallots, and fresh coriander\",\"1 tsp toasted flaxseeds and chia seeds for crunch\",\"Drizzle of lemon juice and sprinkle of chaat masala\",\"1 cup warm Ashwagandha & chamomile herbal infusion\"]', '[\"Arrange egg quarters on a plate, topping with diced vegetables and toasted seed blend.\",\"Sip the calming adaptogenic tea to center mental focus before practice.\"]', 'Combines fast-acting and sustained protein release; adaptogens buffer adrenal fatigue and physical exertion.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `ingredients` = VALUES(`ingredients`), `preparation_instructions` = VALUES(`preparation_instructions`);

INSERT INTO `diet_plans` (`id`, `title`, `diet_type`, `time_slot`, `time_label`, `target_goal`, `level`, `calories`, `protein_grams`, `carbs_grams`, `fat_grams`, `description`, `ingredients`, `preparation_instructions`, `benefits`) VALUES
('d-1930-veg', 'Yellow Moong & Quinoa Khichdi with Steamed Zucchini & Ghee', 'veg', 'dinner', '07:30 PM', 'Deep Recovery', 'All Levels', 360, 15, 56, 8, 'The supreme Ayurvedic restorative bowl. Extremely easy to digest, gut-soothing, and anti-inflammatory to allow peaceful sleep.', '[\"1/3 cup split yellow moong dal (washed & soaked)\",\"1/3 cup washed organic quinoa (or aged basmati rice)\",\"1/2 cup diced zucchini, carrots, and baby peas\",\"Tempering: 1 tsp A2 cow ghee, cumin seeds, grated ginger, pinch of asafoetida & turmeric\",\"3 cups water cooked in pressure cooker or heavy bottom pot until creamy\"]', '[\"Temper spices in warm ghee until fragrant; stir in grains, lentils, and chopped vegetables.\",\"Simmer until grains melt together into a soft comforting porridge.\",\"Garnish with fresh coriander and serve warm at least 2.5 hours before bedtime.\"]', 'Zero burden on the digestive system during nighttime sleep; allows cellular detoxification and deep muscle repair while sleeping.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `ingredients` = VALUES(`ingredients`), `preparation_instructions` = VALUES(`preparation_instructions`);

INSERT INTO `diet_plans` (`id`, `title`, `diet_type`, `time_slot`, `time_label`, `target_goal`, `level`, `calories`, `protein_grams`, `carbs_grams`, `fat_grams`, `description`, `ingredients`, `preparation_instructions`, `benefits`) VALUES
('d-1930-nonveg', 'Warm Shredded Chicken Shorba with Steamed Greens & Sweet Potato Mash', 'non-veg', 'dinner', '07:30 PM', 'Deep Recovery', 'All Levels', 375, 34, 36, 8, 'Soul-warming, easily assimilable spiced broth soup loaded with tender shredded chicken, digestive herbs, and a small side of potassium-rich sweet potato.', '[\"120g shredded poached chicken breast in rich aromatic clear broth\",\"Broth brewed with ginger, garlic, cloves, cinnamon stick, and green cardamom\",\"1 cup steamed broccoli florets and bok choy or spinach\",\"1/2 cup roasted sweet potato mash with pinch of cinnamon and sea salt\",\"Fresh lemon juice and cracked black pepper\"]', '[\"Simmer chicken in aromatic spiced stock until fork-tender; shred into bite-sized pieces.\",\"Ladle piping-hot shorba into a wide bowl with fresh steamed greens on the side.\",\"Enjoy with sweet potato mash for gentle nighttime glycogen replenishment.\"]', 'High protein with minimal fat prevents nighttime acid reflux; tryptophan from chicken naturally promotes melatonin production for restorative sleep.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `ingredients` = VALUES(`ingredients`), `preparation_instructions` = VALUES(`preparation_instructions`);

INSERT INTO `diet_plans` (`id`, `title`, `diet_type`, `time_slot`, `time_label`, `target_goal`, `level`, `calories`, `protein_grams`, `carbs_grams`, `fat_grams`, `description`, `ingredients`, `preparation_instructions`, `benefits`) VALUES
('d-2130-veg', 'Golden Turmeric Milk (Haldi Doodh) with Nutmeg & Ashwagandha', 'veg', 'night_elixir', '09:30 PM', 'Deep Recovery', 'All Levels', 125, 5, 10, 7, 'Sacred Ayurvedic nighttime nectar. Curcumin, freshly grated nutmeg, and adaptogenic herbs soothe muscle inflammation and induce deep, dreamless sleep.', '[\"1 cup warm A2 cow milk (or unsweetened creamy almond milk)\",\"1/2 tsp organic ground lakadong turmeric (high curcumin)\",\"A pinch of freshly ground black pepper (enhances curcumin absorption by 2000\%)\",\"A pinch of freshly grated nutmeg (natural sedative)\",\"1/2 tsp Ashwagandha root powder\",\"1/2 tsp pure raw honey or date syrup (stirred in once warm, not boiling)\"]', '[\"Gently heat milk in a stainless steel saucepan with turmeric, black pepper, and Ashwagandha.\",\"Whisk until frothy and aromatic; pour into your favorite ceramic mug.\",\"Grate a touch of fresh nutmeg on top and sip slowly 30 minutes before sleep.\"]', 'Powerful systemic anti-inflammatory targeting dancers’ knees, ankles, and yogis’ wrists; nutmeg calms the central nervous system for deep REM and deep sleep.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `ingredients` = VALUES(`ingredients`), `preparation_instructions` = VALUES(`preparation_instructions`);

INSERT INTO `diet_plans` (`id`, `title`, `diet_type`, `time_slot`, `time_label`, `target_goal`, `level`, `calories`, `protein_grams`, `carbs_grams`, `fat_grams`, `description`, `ingredients`, `preparation_instructions`, `benefits`) VALUES
('d-2130-nonveg', 'Almond Spiced Collagen Elixir with Cardamom & Saffron', 'non-veg', 'night_elixir', '09:30 PM', 'Deep Recovery', 'All Levels', 130, 10, 5, 6, 'Dairy-free, ultra-soothing nighttime elixir fortified with hydrolyzed collagen peptides, Kashmiri saffron, and green cardamom for overnight joint regeneration.', '[\"1 cup warm unsweetened almond milk\",\"1 scoop (10g) pure hydrolyzed collagen peptides (types I & III)\",\"3-4 strands of Kashmiri saffron (Kesar) steeped in warm water\",\"1 crushed green cardamom pod\",\"Pinch of cinnamon and nutmeg\",\"1/2 tsp pure maple syrup or stevia (optional)\"]', '[\"Steep saffron in 1 tbsp warm water until deep crimson-gold.\",\"Whisk warm almond milk with collagen peptides until completely dissolved and silky.\",\"Stir in saffron infusion, cardamom, and nutmeg. Sip in bed in comfortable darkness.\"]', 'Collagen peptides cross the intestinal wall into articular cartilage while you sleep, reducing morning joint stiffness and speeding up micro-tear repair.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `ingredients` = VALUES(`ingredients`), `preparation_instructions` = VALUES(`preparation_instructions`);

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================================
-- NRITYASANA SETUP COMPLETE: ALL 10 TABLES AND 60+ DATA ROWS POPULATED
-- =========================================================================
