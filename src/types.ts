export interface Practice {
  id: string;
  title: string;
  discipline: 'Yoga' | 'Dance';
  category: 'Flow' | 'Technique' | 'Restore' | 'Expression';
  minutes: number;
  description: string;
  icon: 'sunny' | 'footprints' | 'moon' | 'sparkles';
  instructions?: string[];
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
