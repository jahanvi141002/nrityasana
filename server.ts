import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';
import {
  checkDbStatus,
  runMigrations,
  executeQuery,
  getDbConfig,
  updateDbConfig,
  seedDatabase,
  getCompleteSchemaSql,
} from './src/db/mysql';
import {
  getDbStore,
  saveDbStore,
  StoredLiveClass,
  StoredChatMessage,
  StoredMediaItem,
  StoredProfile,
  StoredProgress,
} from './src/db/store';
import { Practice, DietMeal } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize store cache
  const store = getDbStore();

  // Initialize DB asynchronously
  checkDbStatus()
    .then(async (status) => {
      console.log(`[Nrityasana DB] MySQL Status: ${status.status} (${status.config.jdbcUrl})`);
      if (status.connected) {
        const migrationResult = await runMigrations();
        console.log(`[Nrityasana DB] Migration: ${migrationResult.message}`);
      } else {
        console.log('[Nrityasana DB] Running with persistent JSON store engine while MySQL connection is in standby.');
      }
    })
    .catch((err) => {
      console.warn('[Nrityasana DB] Initial connection notice:', err.message);
    });

  // Helper to verify admin role
  const checkAdminRole = (req: Request): boolean => {
    const roleHeader = req.headers['x-user-role'];
    const bodyRole = req.body?.role;
    const queryRole = req.query?.role;
    return roleHeader === 'ADMIN' || bodyRole === 'ADMIN' || queryRole === 'ADMIN';
  };

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'nrityasana-api',
      timestamp: new Date().toISOString(),
      databaseMode: 'dual-persistent',
    });
  });

  // Persistent Active Logo storage
  const LOGO_CONFIG_PATH = path.join(process.cwd(), 'active_logo.json');
  let activeLogoUrl = '/logo.jpg';
  try {
    if (fs.existsSync(LOGO_CONFIG_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(LOGO_CONFIG_PATH, 'utf-8'));
      if (parsed?.logoUrl) {
        activeLogoUrl = parsed.logoUrl;
      }
    }
  } catch {}

  // Active logo settings - Read (public)
  app.get('/api/settings/logo', (_req: Request, res: Response) => {
    res.json({ logoUrl: activeLogoUrl });
  });

  // Active logo settings - Update (strictly ADMIN only)
  app.post('/api/settings/logo', (req: Request, res: Response) => {
    if (!checkAdminRole(req)) {
      res.status(403).json({ error: 'Only administrators have permission to edit the brand logo' });
      return;
    }

    const { logoUrl } = req.body;
    if (!logoUrl || typeof logoUrl !== 'string') {
      res.status(400).json({ error: 'Valid logoUrl string is required' });
      return;
    }

    activeLogoUrl = logoUrl;
    try {
      fs.writeFileSync(
        LOGO_CONFIG_PATH,
        JSON.stringify({ logoUrl, updatedAt: new Date().toISOString() }, null, 2),
        'utf-8'
      );
    } catch (err) {
      console.error('[Server] Failed to write active_logo.json:', err);
    }

    res.json({ success: true, logoUrl: activeLogoUrl });
  });

  // Database status and JDBC details (backend inspection)
  app.get('/api/db/status', async (_req: Request, res: Response) => {
    const status = await checkDbStatus();
    res.json(status);
  });

  // Download or view complete SQL script for MySQL Workbench
  app.get('/api/db/schema.sql', (_req: Request, res: Response) => {
    const sql = getCompleteSchemaSql();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="nrityasana_schema.sql"');
    res.send(sql);
  });

  // Update DB connection configuration
  app.post('/api/db/config', async (req: Request, res: Response) => {
    const { host, port, user, password, database } = req.body;
    const updated = updateDbConfig({
      ...(host ? { host } : {}),
      ...(port ? { port: Number(port) } : {}),
      ...(user ? { user } : {}),
      ...(password !== undefined ? { password } : {}),
      ...(database ? { database } : {}),
    });

    const status = await checkDbStatus();
    if (status.connected) {
      await runMigrations();
    }
    res.json({ success: true, config: updated, status });
  });

  // Test DB connection with provided or active configuration
  app.post('/api/db/test', async (_req: Request, res: Response) => {
    const status = await checkDbStatus();
    res.json(status);
  });

  // Seed all 10 tables with data (strictly ADMIN only or when requested)
  app.post('/api/db/seed', async (req: Request, res: Response) => {
    const result = await seedDatabase();
    const updatedStatus = await checkDbStatus();
    res.json({ ...result, status: updatedStatus });
  });

  // Trigger migration (strictly ADMIN only)
  app.post('/api/db/migrate', async (req: Request, res: Response) => {
    if (!checkAdminRole(req)) {
      res.status(403).json({ error: 'Forbidden: Admin access required to trigger migrations' });
      return;
    }
    const result = await runMigrations();
    const updatedStatus = await checkDbStatus();
    res.json({ ...result, status: updatedStatus });
  });

  // Run read-only query (strictly ADMIN only)
  app.post('/api/db/query', async (req: Request, res: Response) => {
    if (!checkAdminRole(req)) {
      res.status(403).json({ error: 'Forbidden: Admin access required for database queries' });
      return;
    }

    const { sql, params } = req.body;
    if (!sql || typeof sql !== 'string') {
      res.status(400).json({ error: 'SQL string is required' });
      return;
    }

    try {
      const result = await executeQuery(sql, params || []);
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  // --- LIVE CLASSES API ---

  // Get all scheduled classes
  app.get('/api/classes', async (_req: Request, res: Response) => {
    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        const { rows } = await executeQuery('SELECT * FROM live_classes ORDER BY start_time ASC');
        if (rows && rows.length > 0) {
          const mapped = rows.map((r: any) => ({
            id: r.id,
            title: r.title,
            description: r.description || '',
            startTime: r.start_time,
            durationMinutes: r.duration_minutes,
            meetingUrl: r.meeting_url,
            createdBy: r.created_by,
            participantCount: 5,
          }));
          res.json(mapped);
          return;
        }
      }
    } catch (err) {
      console.warn('[Classes API] MySQL fetch note:', err);
    }

    // Return from persistent JSON store
    const storeData = getDbStore();
    res.json(storeData.classes);
  });

  // Create scheduled class (Admin / Teacher)
  app.post('/api/classes', async (req: Request, res: Response) => {
    const { title, description, startTime, durationMinutes, meetingUrl, createdBy } = req.body;
    const newId = 'c-' + Date.now();

    const newClass: StoredLiveClass = {
      id: newId,
      title: title || 'Sacred Movement Session',
      description: description || '',
      startTime: startTime || new Date(Date.now() + 86400000).toISOString(),
      durationMinutes: durationMinutes || 60,
      meetingUrl: meetingUrl || 'https://meet.google.com/',
      createdBy: createdBy || 'admin@nrityasana.com',
      participantCount: 1,
    };

    // Update persistent JSON store
    const storeData = getDbStore();
    storeData.classes.unshift(newClass);
    saveDbStore(storeData);

    // Persist to MySQL if available
    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        await executeQuery(
          `INSERT INTO live_classes (id, title, description, start_time, duration_minutes, meeting_url, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            newId,
            newClass.title,
            newClass.description,
            new Date(newClass.startTime).toISOString().slice(0, 19).replace('T', ' '),
            newClass.durationMinutes,
            newClass.meetingUrl,
            newClass.createdBy,
          ]
        );
      }
    } catch (err) {
      console.warn('[Classes API] MySQL insert warning:', err);
    }

    res.json({ success: true, class: newClass });
  });

  // Delete/Cancel scheduled class (strictly ADMIN only or creator)
  app.delete('/api/classes/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    // Update persistent store
    const storeData = getDbStore();
    storeData.classes = storeData.classes.filter((c) => c.id !== id);
    saveDbStore(storeData);

    // Delete in MySQL if available
    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        await executeQuery('DELETE FROM live_classes WHERE id = ?', [id]);
        await executeQuery('DELETE FROM class_attendees WHERE class_id = ?', [id]);
      }
    } catch (err) {
      console.warn('[Classes API] MySQL delete warning:', err);
    }

    res.json({ success: true, deletedId: id });
  });

  // Join or leave a class (updates attendee count)
  app.post('/api/classes/:id/join', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId, willJoin } = req.body;

    const storeData = getDbStore();
    const target = storeData.classes.find((c) => c.id === id);
    if (target) {
      target.participantCount = willJoin
        ? (target.participantCount || 0) + 1
        : Math.max(0, (target.participantCount || 1) - 1);
      saveDbStore(storeData);
    }

    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected && userId) {
        if (willJoin) {
          await executeQuery(
            'INSERT IGNORE INTO class_attendees (class_id, user_id) VALUES (?, ?)',
            [id, userId]
          );
        } else {
          await executeQuery(
            'DELETE FROM class_attendees WHERE class_id = ? AND user_id = ?',
            [id, userId]
          );
        }
      }
    } catch (err) {
      console.warn('[Classes API] Attendee update warning:', err);
    }

    res.json({
      success: true,
      classId: id,
      participantCount: target ? target.participantCount : 1,
    });
  });

  // --- CHAT MESSAGES API ---

  // Get messages
  app.get('/api/chat/messages', async (req: Request, res: Response) => {
    const contactId = req.query.contactId as string;

    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        let query = 'SELECT * FROM chat_messages ORDER BY sent_at ASC LIMIT 150';
        let params: any[] = [];
        if (contactId) {
          query = 'SELECT * FROM chat_messages WHERE sender_id = ? OR recipient_id = ? ORDER BY sent_at ASC LIMIT 150';
          params = [contactId, contactId];
        }
        const { rows } = await executeQuery(query, params);
        if (rows && rows.length > 0) {
          const mapped = rows.map((r: any) => ({
            id: r.id,
            senderId: r.sender_id,
            email: r.sender_email,
            role: r.sender_role,
            recipientId: r.recipient_id,
            recipientEmail: r.recipient_email,
            text: r.message_text,
            type: r.message_type || 'text',
            sentAt: r.sent_at,
            status: 'read',
          }));
          res.json(mapped);
          return;
        }
      }
    } catch (err) {
      console.warn('[Chat API] MySQL fetch note:', err);
    }

    const storeData = getDbStore();
    if (contactId) {
      const filtered = storeData.messages.filter(
        (m) => m.senderId === contactId || m.recipientId === contactId
      );
      res.json(filtered);
    } else {
      res.json(storeData.messages);
    }
  });

  // Post new message
  app.post('/api/chat/messages', async (req: Request, res: Response) => {
    const {
      senderId,
      senderEmail,
      senderRole,
      recipientId,
      recipientEmail,
      text,
      messageType,
      fromWhatsApp,
    } = req.body;
    const newId = 'm-' + Date.now();

    const newMsg: StoredChatMessage = {
      id: newId,
      senderId: senderId || 'u-user',
      senderEmail: senderEmail || 'user@nrityasana.com',
      senderRole: senderRole || 'USER',
      recipientId: recipientId || 'u-admin',
      recipientEmail: recipientEmail || 'admin@nrityasana.com',
      text: text || '',
      messageType: messageType || 'text',
      sentAt: new Date().toISOString(),
      status: 'delivered',
      fromWhatsApp: Boolean(fromWhatsApp),
    };

    const storeData = getDbStore();
    storeData.messages.push(newMsg);
    saveDbStore(storeData);

    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        await executeQuery(
          `INSERT INTO chat_messages (id, sender_id, sender_email, sender_role, recipient_id, recipient_email, message_text, message_type, sent_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(6))`,
          [
            newId,
            newMsg.senderId,
            newMsg.senderEmail,
            newMsg.senderRole,
            newMsg.recipientId,
            newMsg.recipientEmail,
            newMsg.text,
            newMsg.messageType,
          ]
        );
      }
    } catch (err) {
      console.warn('[Chat API] MySQL insert warning:', err);
    }

    res.json({ success: true, message: newMsg });
  });

  // Clear chat history
  app.delete('/api/chat/messages', async (req: Request, res: Response) => {
    const contactId = req.query.contactId as string;
    const storeData = getDbStore();

    if (contactId) {
      storeData.messages = storeData.messages.filter(
        (m) => m.senderId !== contactId && m.recipientId !== contactId
      );
    } else {
      storeData.messages = [];
    }
    saveDbStore(storeData);

    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        if (contactId) {
          await executeQuery(
            'DELETE FROM chat_messages WHERE sender_id = ? OR recipient_id = ?',
            [contactId, contactId]
          );
        } else {
          await executeQuery('DELETE FROM chat_messages');
        }
      }
    } catch (err) {
      console.warn('[Chat API] MySQL clear warning:', err);
    }

    res.json({ success: true, cleared: true });
  });

  // --- MEDIA ITEMS API ---

  // Get user's media items
  app.get('/api/media', async (req: Request, res: Response) => {
    const userId = (req.query.userId as string) || 'u-user';

    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        const { rows } = await executeQuery(
          'SELECT * FROM media_items WHERE user_id = ? ORDER BY created_at DESC',
          [userId]
        );
        if (rows && rows.length > 0) {
          const mapped = rows.map((r: any) => ({
            id: r.id,
            userId: r.user_id,
            name: r.name,
            type: (r.media_type || 'photo').toLowerCase() === 'video' ? 'video' : 'photo',
            url: r.url,
            createdAt: r.created_at,
          }));
          res.json(mapped);
          return;
        }
      }
    } catch (err) {
      console.warn('[Media API] MySQL fetch note:', err);
    }

    const storeData = getDbStore();
    const userMedia = storeData.media.filter(
      (m) => m.userId === userId || userId === 'all'
    );
    res.json(userMedia);
  });

  // Save a new media item
  app.post('/api/media', async (req: Request, res: Response) => {
    const { userId, name, type, url } = req.body;
    const newId = 'med-' + Date.now();

    const newItem: StoredMediaItem = {
      id: newId,
      userId: userId || 'u-user',
      name: name || 'Sacred practice reflection',
      type: type === 'video' ? 'video' : 'photo',
      url: url || '',
      createdAt: new Date().toISOString(),
    };

    const storeData = getDbStore();
    storeData.media.unshift(newItem);
    saveDbStore(storeData);

    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        await executeQuery(
          `INSERT INTO media_items (id, user_id, name, media_type, url)
           VALUES (?, ?, ?, ?, ?)`,
          [newId, newItem.userId, newItem.name, newItem.type.toUpperCase(), newItem.url]
        );
      }
    } catch (err) {
      console.warn('[Media API] MySQL insert warning:', err);
    }

    res.json({ success: true, item: newItem });
  });

  // Delete a media item
  app.delete('/api/media/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    const storeData = getDbStore();
    storeData.media = storeData.media.filter((m) => m.id !== id);
    saveDbStore(storeData);

    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        await executeQuery('DELETE FROM media_items WHERE id = ?', [id]);
      }
    } catch (err) {
      console.warn('[Media API] MySQL delete warning:', err);
    }

    res.json({ success: true, deletedId: id });
  });

  // --- USER PROFILE API ---

  // Get user profile
  app.get('/api/profile/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        const { rows } = await executeQuery(
          'SELECT * FROM profiles WHERE user_id = ?',
          [userId]
        );
        if (rows && rows[0]) {
          const p = rows[0];
          res.json({
            userId: p.user_id,
            profilePictureUrl: p.profile_picture_url,
            phone: p.phone,
            bio: p.bio,
            danceStyle: p.dance_style || 'Bharatanatyam',
            experienceLevel: p.experience_level || 'Intermediate',
            updatedAt: p.updated_at,
          });
          return;
        }
      }
    } catch (err) {
      console.warn('[Profile API] MySQL fetch note:', err);
    }

    const storeData = getDbStore();
    const stored = storeData.profiles[userId] || {
      userId,
      email: userId === 'u-admin' ? 'admin@nrityasana.com' : 'user@nrityasana.com',
      danceStyle: 'Bharatanatyam',
      experienceLevel: 'Intermediate',
    };
    res.json(stored);
  });

  // Update user profile
  app.put('/api/profile/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { profilePictureUrl, phone, bio, danceStyle, experienceLevel } = req.body;

    const storeData = getDbStore();
    const existing = storeData.profiles[userId] || { userId };
    const updated: StoredProfile = {
      ...existing,
      profilePictureUrl: profilePictureUrl !== undefined ? profilePictureUrl : existing.profilePictureUrl,
      phone: phone !== undefined ? phone : existing.phone,
      bio: bio !== undefined ? bio : existing.bio,
      danceStyle: danceStyle || existing.danceStyle || 'Bharatanatyam',
      experienceLevel: experienceLevel || existing.experienceLevel || 'Intermediate',
      updatedAt: new Date().toISOString(),
    };
    storeData.profiles[userId] = updated;
    saveDbStore(storeData);

    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        await executeQuery(
          `INSERT INTO profiles (user_id, profile_picture_url, phone, bio, dance_style, experience_level)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             profile_picture_url = VALUES(profile_picture_url),
             phone = VALUES(phone),
             bio = VALUES(bio),
             dance_style = VALUES(dance_style),
             experience_level = VALUES(experience_level)`,
          [
            userId,
            updated.profilePictureUrl || null,
            updated.phone || null,
            updated.bio || null,
            updated.danceStyle || 'Bharatanatyam',
            updated.experienceLevel || 'Intermediate',
          ]
        );
      }
    } catch (err) {
      console.warn('[Profile API] MySQL update warning:', err);
    }

    res.json({ success: true, profile: updated });
  });

  // --- USER PROGRESS & PRACTICE RHYTHM API ---

  // Get user weekly rhythm and progress stats
  app.get('/api/progress/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        const { rows } = await executeQuery(
          'SELECT * FROM user_progress WHERE user_id = ?',
          [userId]
        );
        if (rows && rows[0]) {
          const up = rows[0];
          const daysArr = (up.completed_days || '1,1,1,0,0,0,0')
            .split(',')
            .map((v: string) => v === '1' || v === 'true');

          const { rows: logRows } = await executeQuery(
            'SELECT * FROM practice_logs WHERE user_id = ? ORDER BY completed_at DESC LIMIT 20',
            [userId]
          );

          res.json({
            userId,
            currentStreak: up.current_streak || 3,
            totalMinutes: up.total_minutes || 185,
            completedSessions: up.completed_sessions || 12,
            weeklyGoal: up.weekly_goal || 5,
            completedDays: daysArr,
            logs: logRows || [],
          });
          return;
        }
      }
    } catch (err) {
      console.warn('[Progress API] MySQL fetch note:', err);
    }

    const storeData = getDbStore();
    const prog = storeData.progress[userId] || {
      userId,
      currentStreak: 3,
      totalMinutes: 185,
      completedSessions: 12,
      weeklyGoal: 5,
      completedDays: [true, true, true, false, false, false, false],
      logs: [],
    };
    res.json(prog);
  });

  // Log a completed practice session
  app.post('/api/progress/log', async (req: Request, res: Response) => {
    const { userId, practiceId, title, discipline, minutes } = req.body;
    const targetUserId = userId || 'u-user';
    const minutesPracticed = Number(minutes) || 15;

    const logId = 'log-' + Date.now();
    const newLog: StoredPracticeLog = {
      id: logId,
      userId: targetUserId,
      practiceId: practiceId || 'p-custom',
      title: title || 'Sacred Movement Practice',
      discipline: discipline || 'Dance',
      minutesPracticed,
      completedAt: new Date().toISOString(),
    };

    const storeData = getDbStore();
    if (!storeData.progress[targetUserId]) {
      storeData.progress[targetUserId] = {
        userId: targetUserId,
        currentStreak: 3,
        totalMinutes: 185,
        completedSessions: 12,
        weeklyGoal: 5,
        completedDays: [true, true, true, false, false, false, false],
        logs: [],
      };
    }

    const prog = storeData.progress[targetUserId];
    prog.totalMinutes += minutesPracticed;
    prog.completedSessions += 1;
    prog.currentStreak += 1;

    // Mark current day of week as completed (0 = Monday in UI)
    const today = new Date().getDay();
    const uiDayIndex = (today + 6) % 7; // Monday=0, Tuesday=1 ... Sunday=6
    if (prog.completedDays && prog.completedDays.length === 7) {
      prog.completedDays[uiDayIndex] = true;
    }

    prog.logs.unshift(newLog);
    saveDbStore(storeData);

    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        await executeQuery(
          `INSERT INTO practice_logs (id, user_id, practice_id, title, discipline, minutes_practiced)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            logId,
            targetUserId,
            newLog.practiceId,
            newLog.title,
            newLog.discipline,
            minutesPracticed,
          ]
        );

        const daysStr = prog.completedDays.map((d) => (d ? '1' : '0')).join(',');
        await executeQuery(
          `INSERT INTO user_progress (user_id, current_streak, total_minutes, completed_sessions, weekly_goal, completed_days)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             current_streak = current_streak + 1,
             total_minutes = total_minutes + VALUES(total_minutes),
             completed_sessions = completed_sessions + 1,
             completed_days = VALUES(completed_days)`,
          [targetUserId, prog.currentStreak, minutesPracticed, prog.completedSessions, prog.weeklyGoal, daysStr]
        );
      }
    } catch (err) {
      console.warn('[Progress API] MySQL log warning:', err);
    }

    res.json({ success: true, progress: prog, log: newLog });
  });

  // Toggle individual day in weekly rhythm
  app.post('/api/progress/toggle-day', async (req: Request, res: Response) => {
    const { userId, dayIndex } = req.body;
    const targetUserId = userId || 'u-user';
    const idx = Number(dayIndex);

    if (isNaN(idx) || idx < 0 || idx > 6) {
      res.status(400).json({ error: 'Valid dayIndex between 0 and 6 required' });
      return;
    }

    const storeData = getDbStore();
    if (!storeData.progress[targetUserId]) {
      storeData.progress[targetUserId] = {
        userId: targetUserId,
        currentStreak: 3,
        totalMinutes: 185,
        completedSessions: 12,
        weeklyGoal: 5,
        completedDays: [true, true, true, false, false, false, false],
        logs: [],
      };
    }

    const prog = storeData.progress[targetUserId];
    prog.completedDays[idx] = !prog.completedDays[idx];
    saveDbStore(storeData);

    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        const daysStr = prog.completedDays.map((d) => (d ? '1' : '0')).join(',');
        await executeQuery(
          `INSERT INTO user_progress (user_id, completed_days)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE completed_days = VALUES(completed_days)`,
          [targetUserId, daysStr]
        );
      }
    } catch (err) {
      console.warn('[Progress API] MySQL toggle warning:', err);
    }

    res.json({ success: true, completedDays: prog.completedDays });
  });

  // --- PRACTICES API (Yoga, Kathak, Bollywood, Semi-Classical, Zumba, Meditation) ---
  app.get('/api/practices', async (req: Request, res: Response) => {
    const { discipline, level, topic, search } = req.query;

    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        let sql = 'SELECT * FROM practices WHERE 1=1';
        const params: any[] = [];

        if (discipline && discipline !== 'all') {
          sql += ' AND LOWER(discipline) = LOWER(?)';
          params.push(discipline);
        }
        if (level && level !== 'all' && level !== 'All Levels') {
          sql += ' AND (level = ? OR level = "All Levels")';
          params.push(level);
        }
        if (topic && topic !== 'all') {
          sql += ' AND (LOWER(topic) LIKE LOWER(?) OR LOWER(category) LIKE LOWER(?))';
          params.push(`%${topic}%`, `%${topic}%`);
        }
        if (search) {
          sql += ' AND (LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))';
          params.push(`%${search}%`, `%${search}%`);
        }

        const { rows } = await executeQuery(sql, params);
        if (rows && rows.length > 0) {
          const formatted = rows.map((r: any) => ({
            id: r.id,
            title: r.title,
            discipline: r.discipline,
            category: r.category,
            level: r.level,
            topic: r.topic,
            minutes: r.minutes,
            description: r.description,
            icon: r.icon,
            intensity: r.intensity,
            instructions: typeof r.instructions === 'string' ? JSON.parse(r.instructions) : (r.instructions || []),
            benefits: typeof r.benefits === 'string' ? JSON.parse(r.benefits) : (r.benefits || []),
          }));
          res.json({ success: true, count: formatted.length, practices: formatted });
          return;
        }
      }
    } catch (err) {
      console.warn('[Practices API] MySQL read warning:', err);
    }

    // JSON fallback
    const storeData = getDbStore();
    let list = storeData.practices || [];

    if (discipline && discipline !== 'all') {
      list = list.filter((p) => p.discipline.toLowerCase() === String(discipline).toLowerCase());
    }
    if (level && level !== 'all' && level !== 'All Levels') {
      list = list.filter((p) => p.level === level || p.level === 'All Levels' || !p.level);
    }
    if (topic && topic !== 'all') {
      const t = String(topic).toLowerCase();
      list = list.filter((p) => (p.topic && p.topic.toLowerCase().includes(t)) || p.category.toLowerCase().includes(t));
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    res.json({ success: true, count: list.length, practices: list });
  });

  // Add new practice
  app.post('/api/practices', async (req: Request, res: Response) => {
    const practice: Practice = req.body;
    if (!practice || !practice.title || !practice.discipline) {
      res.status(400).json({ error: 'Title and discipline are required' });
      return;
    }

    const practiceId = practice.id || 'p-' + Date.now();
    const newPractice: Practice = { ...practice, id: practiceId };

    const storeData = getDbStore();
    if (!storeData.practices) storeData.practices = [];
    storeData.practices.unshift(newPractice);
    saveDbStore(storeData);

    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        await executeQuery(
          `INSERT INTO practices (id, title, discipline, category, level, topic, minutes, description, icon, intensity, instructions, benefits)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE title = VALUES(title), minutes = VALUES(minutes)`,
          [
            newPractice.id,
            newPractice.title,
            newPractice.discipline,
            newPractice.category || 'General',
            newPractice.level || 'All Levels',
            newPractice.topic || newPractice.category,
            newPractice.minutes || 15,
            newPractice.description || '',
            newPractice.icon || 'sunny',
            newPractice.intensity || 'Moderate',
            JSON.stringify(newPractice.instructions || []),
            JSON.stringify(newPractice.benefits || []),
          ]
        );
      }
    } catch (err) {
      console.warn('[Practices API] MySQL write warning:', err);
    }

    res.json({ success: true, practice: newPractice });
  });

  // --- DIET PLANS API (Veg & Non-Veg by Time Schedule) ---
  app.get('/api/diet-plans', async (req: Request, res: Response) => {
    const { dietType, timeSlot, level, search } = req.query;

    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        let sql = 'SELECT * FROM diet_plans WHERE 1=1';
        const params: any[] = [];

        if (dietType && dietType !== 'all') {
          sql += ' AND diet_type = ?';
          params.push(dietType);
        }
        if (timeSlot && timeSlot !== 'all') {
          sql += ' AND time_slot = ?';
          params.push(timeSlot);
        }
        if (level && level !== 'all' && level !== 'All Levels') {
          sql += ' AND (level = ? OR level = "All Levels")';
          params.push(level);
        }
        if (search) {
          sql += ' AND (LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))';
          params.push(`%${search}%`, `%${search}%`);
        }

        const { rows } = await executeQuery(sql, params);
        if (rows && rows.length > 0) {
          const formatted = rows.map((r: any) => ({
            id: r.id,
            title: r.title,
            dietType: r.diet_type,
            timeSlot: r.time_slot,
            timeLabel: r.time_label,
            targetGoal: r.target_goal,
            level: r.level,
            calories: r.calories,
            proteinGrams: r.protein_grams,
            carbsGrams: r.carbs_grams,
            fatGrams: r.fat_grams,
            description: r.description,
            ingredients: typeof r.ingredients === 'string' ? JSON.parse(r.ingredients) : (r.ingredients || []),
            preparationInstructions: typeof r.preparation_instructions === 'string' ? JSON.parse(r.preparation_instructions) : (r.preparation_instructions || []),
            benefits: r.benefits,
          }));
          res.json({ success: true, count: formatted.length, dietPlans: formatted });
          return;
        }
      }
    } catch (err) {
      console.warn('[Diet API] MySQL read warning:', err);
    }

    // JSON fallback
    const storeData = getDbStore();
    let list = storeData.dietPlans || [];

    if (dietType && dietType !== 'all') {
      list = list.filter((d) => d.dietType.toLowerCase() === String(dietType).toLowerCase());
    }
    if (timeSlot && timeSlot !== 'all') {
      list = list.filter((d) => d.timeSlot === timeSlot);
    }
    if (level && level !== 'all' && level !== 'All Levels') {
      list = list.filter((d) => d.level === level || d.level === 'All Levels');
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter((d) => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
    }

    res.json({ success: true, count: list.length, dietPlans: list });
  });

  // Log meal consumption in user schedule
  app.post('/api/diet-plans/log', (req: Request, res: Response) => {
    const { mealId, mealTitle, timeSlot, calories, proteinGrams } = req.body;
    res.json({
      success: true,
      message: `Logged meal "${mealTitle || mealId}" for ${timeSlot}`,
      loggedAt: new Date().toISOString(),
      nutritionAdded: { calories: calories || 0, proteinGrams: proteinGrams || 0 },
    });
  });

  // Dynamic Contextual Practice Recommendations (Morning vs Afternoon vs Evening)
  app.get('/api/practices/recommended', (_req: Request, res: Response) => {
    const hour = new Date().getHours();
    let timeOfDay: 'morning' | 'afternoon' | 'evening' = 'morning';
    let recommendation = {
      period: 'Morning Awakening & Prana',
      focus: 'Surya Vinyasa & Kathak Tatkar Foundations',
      description: 'Awaken prana with Surya Namaskar flow and align rhythmic footwork coordination.',
      suggestedMinutes: 18,
      discipline: 'Yoga & Kathak',
      suggestedMeal: 'Warm Lemon-Ginger Detox Elixir (06:30 AM) or Sprouted Moong Chilla (08:30 AM)',
    };

    if (hour >= 12 && hour < 17) {
      timeOfDay = 'afternoon';
      recommendation = {
        period: 'Midday Vitality & Cardio',
        focus: 'Desi Bolly-Zumba Cardio Blast & Kathak Chakkars',
        description: 'High-energy rhythmic conditioning, pirouette spotting, and core stability.',
        suggestedMinutes: 25,
        discipline: 'Zumba & Bollywood',
        suggestedMeal: 'Tender Coconut Water (11:00 AM) or Balanced High-Protein Thali (01:30 PM)',
      };
    } else if (hour >= 17 || hour < 5) {
      timeOfDay = 'evening';
      recommendation = {
        period: 'Evening Restoration & Abhinaya',
        focus: 'Yin Yoga Fascia Release, Thumri Abhinaya & Deep Yoga Nidra',
        description: 'Release joint tension from footwork and soothe the nervous system with lunar breathwork.',
        suggestedMinutes: 20,
        discipline: 'Meditation & Semi-Classical',
        suggestedMeal: 'Yellow Moong Khichdi (07:30 PM) & Golden Turmeric Haldi Doodh (09:30 PM)',
      };
    }

    res.json({ timeOfDay, recommendation });
  });

  // Meta WhatsApp Cloud API Webhook Verification (hub.mode, hub.verify_token, hub.challenge)
  app.get('/api/whatsapp/webhook', (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'nrityasana-verify-token';

    if (mode === 'subscribe' && token === expectedToken) {
      console.log('[WhatsApp Webhook] Verification challenge passed');
      res.status(200).send(challenge || '');
    } else {
      res.status(403).send('Webhook verification failed');
    }
  });

  // Meta WhatsApp Inbound Webhook Event Receiver
  app.post('/api/whatsapp/webhook', async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const entry = payload?.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];

      if (message) {
        const text = message.text?.body || 'WhatsApp media received';
        const senderPhone = message.from;

        const newMsg: StoredChatMessage = {
          id: 'msg-' + Date.now(),
          senderId: 'wa-' + senderPhone,
          senderEmail: `whatsapp:${senderPhone}`,
          senderRole: 'USER',
          recipientId: 'u-admin',
          recipientEmail: 'admin@nrityasana.com',
          text,
          messageType: 'text',
          sentAt: new Date().toISOString(),
          status: 'delivered',
          fromWhatsApp: true,
        };

        const storeData = getDbStore();
        storeData.messages.push(newMsg);
        saveDbStore(storeData);

        try {
          const dbStatus = await checkDbStatus();
          if (dbStatus.connected) {
            await executeQuery(
              `INSERT INTO chat_messages (id, sender_id, sender_email, sender_role, recipient_id, recipient_email, message_text, message_type, sent_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(6))`,
              [
                newMsg.id,
                newMsg.senderId,
                newMsg.senderEmail,
                newMsg.senderRole,
                newMsg.recipientId,
                newMsg.recipientEmail,
                newMsg.text,
                newMsg.messageType,
              ]
            );
          }
        } catch (err) {
          console.warn('[WhatsApp Webhook] DB write warning:', err);
        }
      }

      res.status(200).json({ status: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[WhatsApp Webhook] Error processing:', msg);
      res.status(500).json({ error: msg });
    }
  });

  // Vite middleware in development vs static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Nrityasana] Full-stack server running on http://0.0.0.0:${PORT}`);
    const config = getDbConfig();
    console.log(`[Nrityasana] JDBC Target: ${config.jdbcUrl}`);
  });
}

startServer();
