export type DisciplineType =
  | 'Yoga'
  | 'Kathak'
  | 'Bollywood'
  | 'Semi-Classical'
  | 'Zumba'
  | 'Meditation'
  | 'Dance';

export type LevelType = 'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced';

export interface Practice {
  id: string;
  title: string;
  discipline: DisciplineType;
  category: string; // e.g., 'Vinyasa Flow', 'Tatkar', 'Hooksteps', 'Chakra', etc.
  level?: LevelType;
  topic?: string;
  minutes: number;
  description: string;
  icon?: 'sunny' | 'footprints' | 'moon' | 'sparkles' | 'flame' | 'music' | 'heart' | 'utensils';
  intensity?: 'Gentle' | 'Moderate' | 'High Energy' | 'Vigorous';
  instructions?: string[];
  benefits?: string[];
}

export type DietType = 'veg' | 'non-veg';

export type TimeSlotType =
  | 'early_morning'
  | 'breakfast'
  | 'mid_morning'
  | 'lunch'
  | 'snack'
  | 'dinner'
  | 'night_elixir';

export interface DietMeal {
  id: string;
  title: string;
  dietType: DietType;
  timeSlot: TimeSlotType;
  timeLabel: string; // e.g. "06:30 AM", "08:30 AM"
  targetGoal: 'Energy & Agility' | 'Lean Muscle & Stamina' | 'Detox & Lightness' | 'Deep Recovery';
  level: LevelType;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  description: string;
  ingredients: string[];
  preparationInstructions: string[];
  benefits: string;
  icon?: string;
}

export interface UserSession {
  userId: string;
  email: string;
  role: 'ADMIN' | 'USER';
  token: string;
  profilePictureUrl?: string;
}

export interface LiveClass {
  id: string;
  title: string;
  description: string;
  startTime: string; // ISO string
  durationMinutes: number;
  meetingUrl: string;
  participantCount: number;
  joined: boolean;
  createdBy?: string;
}

export interface ChatContact {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
  name?: string;
  phone?: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
  statusText?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  email: string;
  role: 'ADMIN' | 'USER';
  recipientId: string;
  recipientEmail: string;
  text: string;
  sentAt: string;
  type?: 'text' | 'voice' | 'image';
  status?: 'sent' | 'delivered' | 'read';
  voiceDuration?: number;
  mediaUrl?: string;
  fromWhatsApp?: boolean;
}

export interface MediaItem {
  id: string;
  userId: string;
  name: string;
  type: 'photo' | 'video';
  url: string;
  createdAt: string;
}

export type NotificationType = 'live_class' | 'chat' | 'practice' | 'milestone';

export interface LiveNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  actionTab?: 'today' | 'explore' | 'progress' | 'live' | 'chat' | 'me';
  actionPayload?: {
    classId?: string;
    contactId?: string;
    practiceId?: string;
  };
}

export type ThemePreset = 'terracotta' | 'burgundy' | 'lotus';

export interface ThemeColors {
  id: ThemePreset;
  name: string;
  primary: string;
  primaryHover: string;
  primaryLight: string;
  secondary: string;
  textDark: string;
  bgMain: string;
  borderSubtle: string;
  accentBadge: string;
}

export interface UserProfile {
  userId: string;
  email?: string;
  profilePictureUrl?: string;
  phone?: string;
  bio?: string;
  danceStyle?: string;
  experienceLevel?: string;
  updatedAt?: string;
}

export interface PracticeLog {
  id: string;
  userId: string;
  practiceId: string;
  title: string;
  discipline: string;
  minutesPracticed: number;
  completedAt: string;
}

export interface UserProgressData {
  userId: string;
  currentStreak: number;
  totalMinutes: number;
  completedSessions: number;
  weeklyGoal: number;
  completedDays: boolean[];
  logs: PracticeLog[];
}
