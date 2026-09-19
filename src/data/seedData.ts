import { Practice, LiveClass, ChatContact, ChatMessage, MediaItem, DietMeal } from '../types';
import { COMPREHENSIVE_PRACTICES, COMPREHENSIVE_DIET_PLANS } from './categoriesData';

export const INITIAL_PRACTICES: Practice[] = COMPREHENSIVE_PRACTICES;
export const INITIAL_DIET_PLANS: DietMeal[] = COMPREHENSIVE_DIET_PLANS;

export const INITIAL_CLASSES: LiveClass[] = [
  {
    id: 'c1',
    title: 'Kathak Tatkar & Chakkars Masterclass',
    description: 'Refining speed, rhythm (Kaala), spotting, and 9-turn bedam chakkars with Guru Radhika.',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(), // in 3 hours
    durationMinutes: 60,
    meetingUrl: 'https://meet.google.com/nrityasana-live',
    participantCount: 18,
    joined: false,
    createdBy: 'admin@nrityasana.com'
  },
  {
    id: 'c2',
    title: 'Vinyasa Flow & Pranayama Spine Mobility',
    description: 'Dynamic breath-to-movement flow, pelvic opening, and soothing Nadi Shodhana.',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(), // tomorrow
    durationMinutes: 45,
    meetingUrl: 'https://meet.google.com/nrityasana-flow',
    participantCount: 14,
    joined: true,
    createdBy: 'admin@nrityasana.com'
  },
  {
    id: 'c3',
    title: 'Desi Bolly-Zumba High-Energy Cardio Party',
    description: 'High-energy sweat session fusing Latin salsa beats with Bollywood and Bhangra rhythms.',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 32).toISOString(),
    durationMinutes: 45,
    meetingUrl: 'https://meet.google.com/nrityasana-zumba',
    participantCount: 26,
    joined: false,
    createdBy: 'admin@nrityasana.com'
  },
  {
    id: 'c4',
    title: 'Semi-Classical Fusion & Thumri Abhinaya',
    description: 'Exploring lyrical interpretation, fluid contemporary spine lines, and delicate facial emoting.',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // in 2 days
    durationMinutes: 60,
    meetingUrl: 'https://meet.google.com/nrityasana-mudra',
    participantCount: 22,
    joined: false,
    createdBy: 'admin@nrityasana.com'
  }
];

export const INITIAL_CONTACTS: ChatContact[] = [
  {
    id: 'u-admin',
    email: 'guru.meera@nrityasana.com',
    role: 'ADMIN',
    name: 'Guru Meera',
    phone: '+919876543210',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    lastSeen: 'Online',
    statusText: 'Teaching Bharatanatyam & Odissi 🪷'
  },
  {
    id: 'u-radhika',
    email: 'radhika.dance@nrityasana.com',
    role: 'ADMIN',
    name: 'Acharya Radhika',
    phone: '+919823456789',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    lastSeen: 'Online',
    statusText: 'Pranayama & Spine Flow 🌿'
  },
  {
    id: 'u-priya',
    email: 'priya.sharma@nrityasana.com',
    role: 'USER',
    name: 'Priya Sharma',
    phone: '+919123456780',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isOnline: false,
    lastSeen: 'today at 10:45 AM',
    statusText: 'Practice makes devotion ✨'
  },
  {
    id: 'u-vikram',
    email: 'vikram.yoga@nrityasana.com',
    role: 'USER',
    name: 'Vikram Joshi',
    phone: '+919811122233',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isOnline: false,
    lastSeen: 'yesterday at 8:15 PM',
    statusText: 'Yoga practitioner | Mindful breath 🧘'
  }
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    senderId: 'u-admin',
    email: 'guru.meera@nrityasana.com',
    role: 'ADMIN',
    recipientId: 'u-current',
    recipientEmail: 'ananya@nrityasana.com',
    text: 'Namaste Ananya! Welcome to Nrityasana. How is your Aramandi posture feeling this week?',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    type: 'text',
    status: 'read'
  },
  {
    id: 'm2',
    senderId: 'u-current',
    email: 'ananya@nrityasana.com',
    role: 'USER',
    recipientId: 'u-admin',
    recipientEmail: 'guru.meera@nrityasana.com',
    text: 'Namaste Guru ji! The ankle warmups have been helping tremendously with knee stabilization during Surya Namaskar.',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    type: 'text',
    status: 'read'
  },
  {
    id: 'm3',
    senderId: 'u-admin',
    email: 'guru.meera@nrityasana.com',
    role: 'ADMIN',
    recipientId: 'u-current',
    recipientEmail: 'ananya@nrityasana.com',
    text: 'Wonderful! Listen to this gentle guidance for wrist mudras in your morning practice:',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    type: 'voice',
    voiceDuration: 14,
    status: 'read',
    fromWhatsApp: true
  }
];

export const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'med1',
    userId: 'u-current',
    name: 'morning-aramandi-practice.jpg',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'med2',
    userId: 'u-current',
    name: 'abhinaya-mudra-capture.jpg',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
  },
  {
    id: 'med3',
    userId: 'u-current',
    name: 'surya-namaskar-flow.mp4',
    type: 'video',
    url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString()
  }
];
