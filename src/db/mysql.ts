import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { COMPREHENSIVE_PRACTICES, COMPREHENSIVE_DIET_PLANS } from '../data/categoriesData';

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  jdbcUrl: string;
}

export interface DbStatus {
  connected: boolean;
  status: 'connected' | 'connecting' | 'standby' | 'error';
  config: {
    host: string;
    port: number;
    database: string;
    user: string;
    jdbcUrl: string;
  };
  tables: Array<{ name: string; rowCount: number }>;
  lastError?: string;
  lastChecked: string;
}

let activeConfigOverride: Partial<DbConfig> | null = null;
let pool: mysql.Pool | null = null;

// Parse configuration from environment variables or overrides
export function getDbConfig(): DbConfig {
  let host = activeConfigOverride?.host || process.env.MYSQL_HOST || 'localhost';
  let port = activeConfigOverride?.port || parseInt(process.env.MYSQL_PORT || '3306', 10);
  let user = activeConfigOverride?.user || process.env.MYSQL_USER || 'root';
  let password = activeConfigOverride?.password !== undefined 
    ? activeConfigOverride.password 
    : (process.env.MYSQL_PASSWORD !== undefined ? process.env.MYSQL_PASSWORD : '');
  let database = activeConfigOverride?.database || process.env.MYSQL_DATABASE || 'nrityasana';

  // Support JDBC URL or standard MySQL URL from env if no override is set
  if (!activeConfigOverride) {
    const rawUrl = process.env.MYSQL_URL || process.env.DATABASE_URL || '';
    if (rawUrl) {
      try {
        const cleanUrl = rawUrl.replace(/^jdbc:/, '');
        const parsed = new URL(cleanUrl);
        host = parsed.hostname || host;
        port = parsed.port ? parseInt(parsed.port, 10) : port;
        user = parsed.username || user;
        password = parsed.password || password;
        database = parsed.pathname.replace(/^\//, '') || database;
      } catch {}
    }
  }

  const jdbcUrl = `jdbc:mysql://${host}:${port}/${database}?createDatabaseIfNotExist=true&serverTimezone=UTC`;

  return { host, port, user, password, database, jdbcUrl };
}

// Update DB configuration at runtime and reset pool
export function updateDbConfig(newConfig: Partial<DbConfig>): DbConfig {
  activeConfigOverride = {
    ...getDbConfig(),
    ...newConfig,
  };
  if (pool) {
    try {
      pool.end();
    } catch {}
    pool = null;
  }
  return getDbConfig();
}

export function getPool(): mysql.Pool {
  if (!pool) {
    const config = getDbConfig();
    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 4000,
    });
  }
  return pool;
}

// Test MySQL connection and return status with all 10 tables
export async function checkDbStatus(): Promise<DbStatus> {
  const config = getDbConfig();
  const tables: Array<{ name: string; rowCount: number }> = [
    { name: 'users', rowCount: 0 },
    { name: 'profiles', rowCount: 0 },
    { name: 'live_classes', rowCount: 0 },
    { name: 'class_attendees', rowCount: 0 },
    { name: 'chat_messages', rowCount: 0 },
    { name: 'media_items', rowCount: 0 },
    { name: 'practice_logs', rowCount: 0 },
    { name: 'user_progress', rowCount: 0 },
    { name: 'practices', rowCount: 0 },
    { name: 'diet_plans', rowCount: 0 },
  ];

  try {
    const currentPool = getPool();
    const conn = await currentPool.getConnection();

    // Get row counts for all tables
    for (const table of tables) {
      try {
        const [rows] = await conn.query<mysql.RowDataPacket[]>(
          `SELECT COUNT(*) as count FROM \`${table.name}\``
        );
        if (rows && rows[0]) {
          table.rowCount = Number(rows[0].count);
        }
      } catch {
        // Table might not exist yet
      }
    }

    conn.release();

    return {
      connected: true,
      status: 'connected',
      config: {
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        jdbcUrl: config.jdbcUrl,
      },
      tables,
      lastChecked: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    return {
      connected: false,
      status: 'standby',
      config: {
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        jdbcUrl: config.jdbcUrl,
      },
      tables,
      lastError: errorMsg,
      lastChecked: new Date().toISOString(),
    };
  }
}

// Seed all tables with comprehensive data into MySQL
export async function seedDatabase(): Promise<{ success: boolean; message: string; rowsInserted: Record<string, number> }> {
  const counts: Record<string, number> = {
    users: 0,
    profiles: 0,
    live_classes: 0,
    class_attendees: 0,
    chat_messages: 0,
    user_progress: 0,
    practice_logs: 0,
    media_items: 0,
    practices: 0,
    diet_plans: 0,
  };

  try {
    const currentPool = getPool();
    const conn = await currentPool.getConnection();

    // 1. Users
    await conn.query(`
      REPLACE INTO \`users\` (\`id\`, \`email\`, \`role\`, \`password_hash\`) VALUES
      ('u-admin', 'admin@nrityasana.com', 'ADMIN', '$2a$10$sampleAdminHash'),
      ('u-user', 'user@nrityasana.com', 'USER', '$2a$10$sampleUserHash'),
      ('u-teacher', 'teacher@nrityasana.com', 'ADMIN', '$2a$10$sampleTeacherHash'),
      ('u-student', 'student@nrityasana.com', 'USER', '$2a$10$sampleStudentHash');
    `);
    counts.users = 4;

    // 2. Profiles
    await conn.query(`
      REPLACE INTO \`profiles\` (\`user_id\`, \`email\`, \`profile_picture_url\`, \`phone\`, \`bio\`, \`dance_style\`, \`experience_level\`) VALUES
      ('u-admin', 'admin@nrityasana.com', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80', '+91 98765 43210', 'Senior Classical Kathak & Ashtanga Yoga Acharya. Dedicating movement to divine geometry.', 'Kathak & Yoga', 'Acharya / Master'),
      ('u-user', 'user@nrityasana.com', NULL, '+91 91234 56789', 'Devoted practitioner cultivating mindful posture, Mudra dexterity, and rhythmic grace.', 'Bharatanatyam & Yoga', 'Intermediate'),
      ('u-teacher', 'teacher@nrityasana.com', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80', '+91 98111 22334', 'Kathak exponent, Lucknow Gharana disciple, leading daily footwork and pirouette drills.', 'Kathak', 'Senior Guru');
    `);
    counts.profiles = 3;

    // 3. Live Classes
    await conn.query(`
      REPLACE INTO \`live_classes\` (\`id\`, \`title\`, \`description\`, \`start_time\`, \`duration_minutes\`, \`meeting_url\`, \`created_by\`, \`participant_count\`) VALUES
      ('c1', 'Kathak Tatkar & Chakkars Masterclass', 'Refining speed, rhythm (Kaala), spotting, and 9-turn bedam chakkars with Guru Radhika.', NOW() + INTERVAL 3 HOUR, 60, 'https://meet.google.com/nrityasana-live', 'admin@nrityasana.com', 18),
      ('c2', 'Vinyasa Flow & Pranayama Spine Mobility', 'Dynamic breath-to-movement flow, pelvic opening, and soothing Nadi Shodhana.', NOW() + INTERVAL 22 HOUR, 45, 'https://meet.google.com/nrityasana-flow', 'admin@nrityasana.com', 14),
      ('c3', 'Desi Bolly-Zumba High-Energy Cardio Party', 'High-energy sweat session fusing Latin salsa beats with Bollywood and Bhangra rhythms.', NOW() + INTERVAL 32 HOUR, 45, 'https://meet.google.com/nrityasana-zumba', 'admin@nrityasana.com', 26),
      ('c4', 'Semi-Classical Fusion & Thumri Abhinaya', 'Exploring lyrical interpretation, fluid contemporary spine lines, and delicate facial emoting.', NOW() + INTERVAL 48 HOUR, 60, 'https://meet.google.com/nrityasana-mudra', 'admin@nrityasana.com', 22);
    `);
    counts.live_classes = 4;

    // 4. Class Attendees
    await conn.query(`
      REPLACE INTO \`class_attendees\` (\`class_id\`, \`user_id\`) VALUES
      ('c1', 'u-user'),
      ('c2', 'u-user');
    `);
    counts.class_attendees = 2;

    // 5. Chat Messages
    await conn.query(`
      REPLACE INTO \`chat_messages\` (\`id\`, \`sender_id\`, \`sender_email\`, \`sender_role\`, \`recipient_id\`, \`recipient_email\`, \`message_text\`, \`message_type\`, \`sent_at\`) VALUES
      ('m1', 'u-admin', 'admin@nrityasana.com', 'ADMIN', 'u-user', 'user@nrityasana.com', 'Namaste! Welcome to Nrityasana. How did your morning Tatkar & Surya Namaskar flow feel today?', 'text', NOW(6) - INTERVAL 2 HOUR),
      ('m2', 'u-user', 'user@nrityasana.com', 'USER', 'u-admin', 'admin@nrityasana.com', 'The ankle stability exercises are helping a lot. My chakkars felt much more centered on the second tempo!', 'text', NOW(6) - INTERVAL 1 HOUR),
      ('m3', 'u-admin', 'admin@nrityasana.com', 'ADMIN', 'u-user', 'user@nrityasana.com', 'Keep the sternum lifted and fix your drishti eye level on the mirror corner for spotting balance.', 'text', NOW(6) - INTERVAL 30 MINUTE);
    `);
    counts.chat_messages = 3;

    // 6. User Progress
    await conn.query(`
      REPLACE INTO \`user_progress\` (\`user_id\`, \`current_streak\`, \`total_minutes\`, \`completed_sessions\`, \`weekly_goal\`, \`completed_days\`, \`last_practice_date\`) VALUES
      ('u-user', 5, 230, 15, 5, '1,1,1,1,0,1,0', CURDATE()),
      ('u-student', 3, 115, 8, 4, '1,1,1,0,0,0,0', CURDATE() - INTERVAL 1 DAY);
    `);
    counts.user_progress = 2;

    // 7. Practice Logs
    await conn.query(`
      REPLACE INTO \`practice_logs\` (\`id\`, \`user_id\`, \`practice_id\`, \`title\`, \`discipline\`, \`minutes_practiced\`, \`completed_at\`) VALUES
      ('log-1', 'u-user', 'k-tatkar-foundations', 'Tatkar Foundations: Ekgun & Dugun Speeds', 'Kathak', 18, NOW() - INTERVAL 1 DAY),
      ('log-2', 'u-user', 'y-surya-flow', 'Surya Namaskar Vinyasa Flow', 'Yoga', 18, NOW() - INTERVAL 2 DAY),
      ('log-3', 'u-user', 'm-vipassana', 'Breath Awareness & Anapana Mindfulness', 'Meditation', 15, NOW() - INTERVAL 3 DAY);
    `);
    counts.practice_logs = 3;

    // 8. Media Items
    await conn.query(`
      REPLACE INTO \`media_items\` (\`id\`, \`user_id\`, \`name\`, \`media_type\`, \`url\`, \`created_at\`) VALUES
      ('med-1', 'u-user', 'Aramandi and Ardhamandala Form Check', 'photo', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80', NOW() - INTERVAL 3 DAY),
      ('med-2', 'u-user', 'Hastak Hand Alignment Practice', 'photo', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80', NOW() - INTERVAL 1 DAY);
    `);
    counts.media_items = 2;

    // 9. All 40 Practices
    for (const p of COMPREHENSIVE_PRACTICES) {
      await conn.query(`
        REPLACE INTO \`practices\` (\`id\`, \`title\`, \`discipline\`, \`category\`, \`level\`, \`topic\`, \`minutes\`, \`description\`, \`icon\`, \`intensity\`, \`instructions\`, \`benefits\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `, [
        p.id,
        p.title,
        p.discipline,
        p.category,
        p.level || 'All Levels',
        p.topic || p.category,
        p.minutes,
        p.description,
        p.icon || 'sunny',
        p.intensity || 'Moderate',
        JSON.stringify(p.instructions || []),
        JSON.stringify(p.benefits || []),
      ]);
    }
    counts.practices = COMPREHENSIVE_PRACTICES.length;

    // 10. All 14 Diet Plans
    for (const d of COMPREHENSIVE_DIET_PLANS) {
      await conn.query(`
        REPLACE INTO \`diet_plans\` (\`id\`, \`title\`, \`diet_type\`, \`time_slot\`, \`time_label\`, \`target_goal\`, \`level\`, \`calories\`, \`protein_grams\`, \`carbs_grams\`, \`fat_grams\`, \`description\`, \`ingredients\`, \`preparation_instructions\`, \`benefits\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `, [
        d.id,
        d.title,
        d.dietType,
        d.timeSlot,
        d.timeLabel,
        d.targetGoal,
        d.level || 'All Levels',
        d.calories,
        d.proteinGrams,
        d.carbsGrams,
        d.fatGrams,
        d.description,
        JSON.stringify(d.ingredients || []),
        JSON.stringify(d.preparationInstructions || []),
        d.benefits || '',
      ]);
    }
        d.id,
        d.title,
        d.dietType,
        d.timeSlot,
        d.timeLabel,
        d.targetGoal,
        d.level || 'All Levels',
        d.calories,
        d.proteinGrams,
        d.carbsGrams,
        d.fatGrams,
        d.description,
        JSON.stringify(d.ingredients || []),
        JSON.stringify(d.preparationInstructions || []),
        d.benefits || '',
      ]);
    }
    counts.diet_plans = COMPREHENSIVE_DIET_PLANS.length;

    conn.release();
    return {
      success: true,
      message: 'All 10 tables seeded successfully with complete practice catalog and nutrition schedules!',
      rowsInserted: counts,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Seeding encountered error: ${msg}`,
      rowsInserted: counts,
    };
  }
}

// Execute database migrations and verify all 10 tables
export async function runMigrations(): Promise<{ success: boolean; message: string }> {
  try {
    const currentPool = getPool();
    const conn = await currentPool.getConnection();

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(254) NOT NULL UNIQUE,
        password_hash VARCHAR(255),
        role VARCHAR(20) NOT NULL DEFAULT 'USER',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        user_id VARCHAR(100) PRIMARY KEY,
        email VARCHAR(254),
        profile_picture_url VARCHAR(2048),
        phone VARCHAR(30),
        bio VARCHAR(500),
        dance_style VARCHAR(60) DEFAULT 'Bharatanatyam',
        experience_level VARCHAR(60) DEFAULT 'Intermediate',
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS live_classes (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(120) NOT NULL,
        description VARCHAR(500),
        start_time DATETIME NOT NULL,
        duration_minutes INT NOT NULL DEFAULT 45,
        meeting_url VARCHAR(2048) NOT NULL,
        created_by VARCHAR(254) NOT NULL,
        participant_count INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS class_attendees (
        class_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (class_id, user_id)
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(36) PRIMARY KEY,
        sender_id VARCHAR(36) NOT NULL,
        sender_email VARCHAR(254) NOT NULL,
        sender_role VARCHAR(20) NOT NULL DEFAULT 'USER',
        recipient_id VARCHAR(36) NOT NULL,
        recipient_email VARCHAR(254) NOT NULL,
        message_text VARCHAR(1000) NOT NULL,
        message_type VARCHAR(20) NOT NULL DEFAULT 'text',
        sent_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX idx_chat_thread (sender_id, recipient_id, sent_at)
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS media_items (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        media_type VARCHAR(20) NOT NULL,
        url VARCHAR(2048) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_media_user (user_id, created_at)
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS practice_logs (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        practice_id VARCHAR(50) NOT NULL,
        title VARCHAR(150) NOT NULL,
        discipline VARCHAR(50) NOT NULL,
        minutes_practiced INT NOT NULL DEFAULT 15,
        completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_practice_user (user_id, completed_at)
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        user_id VARCHAR(100) PRIMARY KEY,
        current_streak INT NOT NULL DEFAULT 3,
        total_minutes INT NOT NULL DEFAULT 185,
        completed_sessions INT NOT NULL DEFAULT 12,
        weekly_goal INT NOT NULL DEFAULT 5,
        completed_days VARCHAR(50) NOT NULL DEFAULT '1,1,1,0,0,0,0',
        last_practice_date DATE,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS practices (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        discipline VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        level VARCHAR(50) DEFAULT 'All Levels',
        topic VARCHAR(100),
        minutes INT NOT NULL DEFAULT 15,
        description TEXT NOT NULL,
        icon VARCHAR(50) DEFAULT 'sunny',
        intensity VARCHAR(50) DEFAULT 'Moderate',
        instructions JSON,
        benefits JSON,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_practices_discipline (discipline, level)
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS diet_plans (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        diet_type VARCHAR(20) NOT NULL,
        time_slot VARCHAR(50) NOT NULL,
        time_label VARCHAR(30) NOT NULL,
        target_goal VARCHAR(100) NOT NULL,
        level VARCHAR(50) DEFAULT 'All Levels',
        calories INT NOT NULL DEFAULT 200,
        protein_grams INT NOT NULL DEFAULT 10,
        carbs_grams INT NOT NULL DEFAULT 20,
        fat_grams INT NOT NULL DEFAULT 5,
        description TEXT NOT NULL,
        ingredients JSON,
        preparation_instructions JSON,
        benefits TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_diet_type_slot (diet_type, time_slot)
      );
    `);

    conn.release();

    // Auto-seed if tables are empty
    try {
      const [rows] = await currentPool.query<mysql.RowDataPacket[]>('SELECT COUNT(*) as c FROM practices');
      if (rows && rows[0] && Number(rows[0].c) === 0) {
        await seedDatabase();
      }
    } catch {}

    return { success: true, message: 'MySQL schema tables verified & created successfully' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Migration failed: ${msg}` };
  }
}

// Read or return complete schema SQL
export function getCompleteSchemaSql(): string {
  const schemaPath = path.join(process.cwd(), 'schema.sql');
  try {
    if (fs.existsSync(schemaPath)) {
      return fs.readFileSync(schemaPath, 'utf-8');
    }
  } catch {}
  return '-- Schema file not generated yet';
}

// Generic query executor with safety
export async function executeQuery<T = any>(
  sql: string,
  params: any[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  const currentPool = getPool();
  const [rows] = await currentPool.query<mysql.RowDataPacket[]>(sql, params);
  return {
    rows: (rows as unknown) as T[],
    rowCount: Array.isArray(rows) ? rows.length : 0,
  };
}
