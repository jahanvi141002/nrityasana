import mysql from 'mysql2/promise';

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

// Parse configuration from environment variables or defaults
export function getDbConfig(): DbConfig {
  let host = process.env.MYSQL_HOST || 'localhost';
  let port = parseInt(process.env.MYSQL_PORT || '3306', 10);
  let user = process.env.MYSQL_USER || 'nrityasana';
  let password = process.env.MYSQL_PASSWORD || 'nrityasana-dev-password';
  let database = process.env.MYSQL_DATABASE || 'nrityasana';

  // Support JDBC URL or standard MySQL URL
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
    } catch {
      // url parse fallback
    }
  }

  const jdbcUrl = `jdbc:mysql://${host}:${port}/${database}?createDatabaseIfNotExist=true&serverTimezone=UTC`;

  return { host, port, user, password, database, jdbcUrl };
}

let pool: mysql.Pool | null = null;

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
      connectTimeout: 5000,
    });
  }
  return pool;
}

// Test MySQL connection and return status
export async function checkDbStatus(): Promise<DbStatus> {
  const config = getDbConfig();
  const tables: Array<{ name: string; rowCount: number }> = [
    { name: 'users', rowCount: 0 },
    { name: 'chat_messages', rowCount: 0 },
    { name: 'live_classes', rowCount: 0 },
    { name: 'class_attendees', rowCount: 0 },
    { name: 'media_items', rowCount: 0 },
    { name: 'profiles', rowCount: 0 },
  ];

  try {
    const currentPool = getPool();
    const conn = await currentPool.getConnection();

    // Get row counts for tables
    for (const table of tables) {
      try {
        const [rows] = await conn.query<mysql.RowDataPacket[]>(
          `SELECT COUNT(*) as count FROM ${table.name}`
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

// Execute database migrations
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
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(36) PRIMARY KEY,
        sender_id VARCHAR(36) NOT NULL,
        sender_email VARCHAR(254) NOT NULL,
        sender_role VARCHAR(20) NOT NULL,
        recipient_id VARCHAR(36) NOT NULL,
        recipient_email VARCHAR(254) NOT NULL,
        message_text VARCHAR(1000) NOT NULL,
        message_type VARCHAR(20) NOT NULL DEFAULT 'text',
        sent_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX idx_chat_thread (sender_id, recipient_id, sent_at)
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS live_classes (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(120) NOT NULL,
        description VARCHAR(500),
        start_time DATETIME NOT NULL,
        duration_minutes INT NOT NULL,
        meeting_url VARCHAR(2048) NOT NULL,
        created_by VARCHAR(254) NOT NULL,
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
      CREATE TABLE IF NOT EXISTS profiles (
        user_id VARCHAR(100) PRIMARY KEY,
        profile_picture_url VARCHAR(2048),
        phone VARCHAR(30),
        bio VARCHAR(500),
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    conn.release();
    return { success: true, message: 'MySQL schema tables verified & created successfully' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Migration failed: ${msg}` };
  }
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
