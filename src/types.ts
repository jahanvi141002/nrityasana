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
}

export interface MediaItem {
  id: string;
  userId: string;
  name: string;
  type: 'photo' | 'video';
  url: string;
  createdAt: string;
}
