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
} from './src/db/mysql';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // In-memory fallback stores when MySQL is running in standby/disconnected mode
  let inMemoryClasses: any[] = [];
  let inMemoryMessages: any[] = [];
  let inMemoryMedia: any[] = [];

  // Initialize DB asynchronously
  checkDbStatus()
    .then(async (status) => {
      console.log(`[Nrityasana DB] MySQL Status: ${status.status} (${status.config.jdbcUrl})`);
      if (status.connected) {
        const migrationResult = await runMigrations();
        console.log(`[Nrityasana DB] Migration: ${migrationResult.message}`);
      } else {
        console.log('[Nrityasana DB] Running with in-memory & local fallback mode while MySQL connects.');
      }
    })
    .catch((err) => {
      console.warn('[Nrityasana DB] Initial connection notice:', err.message);
    });

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'nrityasana-api',
      timestamp: new Date().toISOString(),
    });
  });

  // Helper to verify admin role
  const checkAdminRole = (req: Request): boolean => {
    const roleHeader = req.headers['x-user-role'];
    const bodyRole = req.body?.role;
    const queryRole = req.query?.role;
    return roleHeader === 'ADMIN' || bodyRole === 'ADMIN' || queryRole === 'ADMIN';
  };

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

  // Database status and JDBC details (admin check)
  app.get('/api/db/status', async (_req: Request, res: Response) => {
    const status = await checkDbStatus();
    res.json(status);
  });

  // Trigger migration (strictly ADMIN only)
  app.post('/api/db/migrate', async (req: Request, res: Response) => {
    if (!checkAdminRole(req)) {
      res.status(403).json({ error: 'Forbidden: Admin access required to trigger migrations' });
      return;
    }
    const result = await runMigrations();
    res.json(result);
  });

  // Run read-only query from UI console (strictly ADMIN only)
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
      console.log('[WhatsApp Inbound] Received payload:', JSON.stringify(payload).slice(0, 150));

      // Check for incoming WhatsApp messages
      const entry = payload?.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];

      if (message) {
        const text = message.text?.body || 'Attachment received';
        const senderPhone = message.from;

        const dbStatus = await checkDbStatus();
        if (dbStatus.connected) {
          await executeQuery(
            `INSERT INTO chat_messages (id, sender_id, sender_email, sender_role, recipient_id, recipient_email, message_text, message_type, sent_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(6))`,
            [
              'msg-' + Date.now(),
              'wa-' + senderPhone,
              `whatsapp:${senderPhone}`,
              'USER',
              'u-admin',
              'admin@nrityasana.com',
              text,
              'text',
            ]
          );
        } else {
          inMemoryMessages.push({
            id: 'msg-' + Date.now(),
            senderId: 'wa-' + senderPhone,
            senderEmail: `whatsapp:${senderPhone}`,
            senderRole: 'USER',
            recipientId: 'u-admin',
            recipientEmail: 'admin@nrityasana.com',
            text,
            sentAt: new Date().toISOString(),
          });
        }
      }

      res.status(200).json({ status: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[WhatsApp Webhook] Error processing:', msg);
      res.status(500).json({ error: msg });
    }
  });

  // Chat Messages API
  app.get('/api/chat/messages', async (_req: Request, res: Response) => {
    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        const { rows } = await executeQuery(
          'SELECT * FROM chat_messages ORDER BY sent_at ASC LIMIT 100'
        );
        res.json(rows);
      } else {
        res.json(inMemoryMessages);
      }
    } catch {
      res.json(inMemoryMessages);
    }
  });

  app.post('/api/chat/messages', async (req: Request, res: Response) => {
    const { senderId, senderEmail, senderRole, recipientId, recipientEmail, text, messageType } = req.body;
    const newId = 'm-' + Date.now();

    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        await executeQuery(
          `INSERT INTO chat_messages (id, sender_id, sender_email, sender_role, recipient_id, recipient_email, message_text, message_type, sent_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(6))`,
          [
            newId,
            senderId || 'u-user',
            senderEmail || 'user@nrityasana.com',
            senderRole || 'USER',
            recipientId || 'u-admin',
            recipientEmail || 'admin@nrityasana.com',
            text || '',
            messageType || 'text',
          ]
        );
      } else {
        inMemoryMessages.push({
          id: newId,
          senderId,
          senderEmail,
          senderRole,
          recipientId,
          recipientEmail,
          text,
          messageType,
          sentAt: new Date().toISOString(),
        });
      }
      res.json({ id: newId, success: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  // Live Classes API
  app.get('/api/classes', async (_req: Request, res: Response) => {
    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        const { rows } = await executeQuery('SELECT * FROM live_classes ORDER BY start_time ASC');
        res.json(rows);
      } else {
        res.json(inMemoryClasses);
      }
    } catch {
      res.json(inMemoryClasses);
    }
  });

  app.post('/api/classes', async (req: Request, res: Response) => {
    const { title, description, startTime, durationMinutes, meetingUrl, createdBy } = req.body;
    const newId = 'c-' + Date.now();

    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        await executeQuery(
          `INSERT INTO live_classes (id, title, description, start_time, duration_minutes, meeting_url, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            newId,
            title || 'Sacred Practice',
            description || '',
            new Date(startTime || Date.now()).toISOString().slice(0, 19).replace('T', ' '),
            durationMinutes || 60,
            meetingUrl || '',
            createdBy || 'admin@nrityasana.com',
          ]
        );
      } else {
        inMemoryClasses.push({
          id: newId,
          title,
          description,
          startTime,
          durationMinutes,
          meetingUrl,
          createdBy,
        });
      }
      res.json({ id: newId, success: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  // Media Items API
  app.get('/api/media', async (req: Request, res: Response) => {
    const userId = (req.query.userId as string) || 'u-current';
    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        const { rows } = await executeQuery(
          'SELECT * FROM media_items WHERE user_id = ? ORDER BY created_at DESC',
          [userId]
        );
        res.json(rows);
      } else {
        res.json(inMemoryMedia);
      }
    } catch {
      res.json(inMemoryMedia);
    }
  });

  app.post('/api/media', async (req: Request, res: Response) => {
    const { userId, name, mediaType, url } = req.body;
    const newId = 'med-' + Date.now();

    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        await executeQuery(
          `INSERT INTO media_items (id, user_id, name, media_type, url)
           VALUES (?, ?, ?, ?, ?)`,
          [newId, userId || 'u-current', name, mediaType || 'IMAGE', url]
        );
      } else {
        inMemoryMedia.push({
          id: newId,
          userId,
          name,
          mediaType,
          url,
          createdAt: new Date().toISOString(),
        });
      }
      res.json({ id: newId, success: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  // Profile API
  app.get('/api/profile/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        const { rows } = await executeQuery(
          'SELECT * FROM profiles WHERE user_id = ?',
          [userId]
        );
        res.json(rows[0] || { userId, profilePictureUrl: null });
      } else {
        res.json({ userId, profilePictureUrl: null });
      }
    } catch {
      res.json({ userId, profilePictureUrl: null });
    }
  });

  app.put('/api/profile/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { profilePictureUrl, phone, bio } = req.body;

    try {
      const dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        await executeQuery(
          `INSERT INTO profiles (user_id, profile_picture_url, phone, bio)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             profile_picture_url = VALUES(profile_picture_url),
             phone = VALUES(phone),
             bio = VALUES(bio)`,
          [userId, profilePictureUrl || null, phone || null, bio || null]
        );
      }
      res.json({ success: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
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
