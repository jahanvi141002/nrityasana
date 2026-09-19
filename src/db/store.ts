import fs from 'fs';
import path from 'path';
import { Practice, DietMeal } from '../types';
import { COMPREHENSIVE_PRACTICES, COMPREHENSIVE_DIET_PLANS } from '../data/categoriesData';

export interface StoredLiveClass {
  id: string;
  title: string;
  description: string;
  startTime: string;
  durationMinutes: number;
  meetingUrl: string;
  createdBy: string;
  participantCount: number;
}

export interface StoredChatMessage {
  id: string;
  senderId: string;
  senderEmail: string;
  senderRole: string;
  recipientId: string;
  recipientEmail: string;
  text: string;
  messageType: string;
  sentAt: string;
  status?: string;
  fromWhatsApp?: boolean;
}

export interface StoredMediaItem {
  id: string;
  userId: string;
  name: string;
  type: 'photo' | 'video';
  url: string;
  createdAt: string;
}

export interface StoredProfile {
  userId: string;
  email?: string;
  profilePictureUrl?: string;
  phone?: string;
  bio?: string;
  danceStyle?: string;
  experienceLevel?: string;
  updatedAt?: string;
}

export interface StoredPracticeLog {
  id: string;
  userId: string;
  practiceId: string;
  title: string;
  discipline: string;
  minutesPracticed: number;
  completedAt: string;
}

export interface StoredProgress {
  userId: string;
  currentStreak: number;
  totalMinutes: number;
  completedSessions: number;
  weeklyGoal: number;
  completedDays: boolean[];
  logs: StoredPracticeLog[];
}

export interface DbStoreData {
  classes: StoredLiveClass[];
  messages: StoredChatMessage[];
  media: StoredMediaItem[];
  profiles: Record<string, StoredProfile>;
  progress: Record<string, StoredProgress>;
  practices: Practice[];
  dietPlans: DietMeal[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_STORE_FILE = path.join(DATA_DIR, 'nrityasana_db.json');

function getDefaultStoreData(): DbStoreData {
  const tomorrow = new Date(Date.now() + 1000 * 60 * 60 * 20);
  tomorrow.setMinutes(0);
  const dayAfter = new Date(Date.now() + 1000 * 60 * 60 * 48);
  dayAfter.setMinutes(30);

  return {
    classes: [
      {
        id: 'c-aramandi-foundation',
        title: 'Kathak Tatkar & Chakkars Masterclass',
        description: 'Core footwork conditioning, 9-turn bedam chakkars, and Teentaal rhythm synchronization.',
        startTime: tomorrow.toISOString(),
        durationMinutes: 45,
        meetingUrl: 'https://meet.google.com/nri-tyas-ana',
        createdBy: 'teacher@nrityasana.com',
        participantCount: 18,
      },
      {
        id: 'c-hastha-mudra-flow',
        title: 'Vinyasa Flow & Pranayama Spine Mobility',
        description: 'Guided mudra geometry synchronizing single-hand gestures with classical Surya Namaskar transitions.',
        startTime: dayAfter.toISOString(),
        durationMinutes: 60,
        meetingUrl: 'https://meet.google.com/nri-mudr-flw',
        createdBy: 'admin@nrityasana.com',
        participantCount: 14,
      },
    ],
    practices: COMPREHENSIVE_PRACTICES,
    dietPlans: COMPREHENSIVE_DIET_PLANS,
    messages: [
      {
        id: 'm-welcome-1',
        senderId: 'u-admin',
        senderEmail: 'admin@nrityasana.com',
        senderRole: 'ADMIN',
        recipientId: 'u-user',
        recipientEmail: 'user@nrityasana.com',
        text: 'Namaste! Welcome to Nrityasana. How is your morning Aramandi practice feeling today?',
        messageType: 'text',
        sentAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'read',
      },
    ],
    media: [
      {
        id: 'med-sample-1',
        userId: 'u-user',
        name: 'Morning Aramandi posture alignment',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    profiles: {
      'u-admin': {
        userId: 'u-admin',
        email: 'admin@nrityasana.com',
        profilePictureUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
        phone: '+91 98765 43210',
        bio: 'Senior Classical Bharatanatyam & Ashtanga Yoga Acharya. Dedicating movement to divine geometry.',
        danceStyle: 'Bharatanatyam',
        experienceLevel: 'Acharya / Master',
      },
      'u-user': {
        userId: 'u-user',
        email: 'user@nrityasana.com',
        phone: '+91 91234 56789',
        bio: 'Devoted practitioner cultivating mindful posture, Mudra dexterity, and rhythmic grace.',
        danceStyle: 'Bharatanatyam & Yoga',
        experienceLevel: 'Intermediate',
      },
    },
    progress: {
      'u-user': {
        userId: 'u-user',
        currentStreak: 4,
        totalMinutes: 215,
        completedSessions: 14,
        weeklyGoal: 5,
        completedDays: [true, true, true, true, false, false, false],
        logs: [
          {
            id: 'log-1',
            userId: 'u-user',
            practiceId: 'p-aramandi',
            title: 'Aramandi Deep Centering',
            discipline: 'Dance',
            minutesPracticed: 15,
            completedAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
      },
    },
  };
}

let cacheStore: DbStoreData | null = null;

export function getDbStore(): DbStoreData {
  if (cacheStore) return cacheStore;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_STORE_FILE)) {
      const raw = fs.readFileSync(DB_STORE_FILE, 'utf-8');
      cacheStore = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[DbStore] Notice reading store file, initializing defaults:', err);
  }

  if (!cacheStore) {
    cacheStore = getDefaultStoreData();
    saveDbStore(cacheStore);
  }

  // Ensure mandatory collections exist
  if (!cacheStore.classes) cacheStore.classes = [];
  if (!cacheStore.messages) cacheStore.messages = [];
  if (!cacheStore.media) cacheStore.media = [];
  if (!cacheStore.profiles) cacheStore.profiles = {};
  if (!cacheStore.progress) cacheStore.progress = {};
  if (!cacheStore.practices || cacheStore.practices.length === 0) {
    cacheStore.practices = COMPREHENSIVE_PRACTICES;
    saveDbStore(cacheStore);
  }
  if (!cacheStore.dietPlans || cacheStore.dietPlans.length === 0) {
    cacheStore.dietPlans = COMPREHENSIVE_DIET_PLANS;
    saveDbStore(cacheStore);
  }

  return cacheStore;
}

export function saveDbStore(data?: DbStoreData): void {
  const toSave = data || cacheStore;
  if (!toSave) return;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_STORE_FILE, JSON.stringify(toSave, null, 2), 'utf-8');
    cacheStore = toSave;
  } catch (err) {
    console.error('[DbStore] Error saving store file:', err);
  }
}
