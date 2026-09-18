import { Practice, LiveClass, ChatContact, ChatMessage, MediaItem } from '../types';

export const INITIAL_PRACTICES: Practice[] = [
  {
    id: 'p1',
    title: 'Surya Namaskar',
    discipline: 'Yoga',
    category: 'Flow',
    minutes: 18,
    description: 'Build warmth, breath, and focus through the sacred sun salutation cycle.',
    icon: 'sunny',
    instructions: [
      'Pranamasana (Prayer Pose) - Stand tall with palms joined at heart center, grounding through all four corners of the feet.',
      'Hastauttanasana (Raised Arms Pose) - Inhale, lift arms overhead, arching gently through the thoracic spine.',
      'Hastapadasana (Standing Forward Bend) - Exhale, fold forward from the hips, keeping the spine lengthened.',
      'Ashwa Sanchalanasana (Equestrian Pose) - Step the right leg back, sink hips, lift chest and gaze softly upward.',
      'Dandasana (Plank Pose) - Bring left leg back, aligning shoulders over wrists in a steady line of energy.',
      'Ashtanga Namaskara - Lower knees, chest, and chin softly to the mat.',
      'Bhujangasana (Cobra Pose) - Inhale, slide forward into gentle heart opening, shoulders relaxed.',
      'Adho Mukha Svanasana (Downward Dog) - Exhale, tuck toes, lift hips up and back into a grounding stretch.'
    ]
  },
  {
    id: 'p2',
    title: 'Ankle & Aramandi',
    discipline: 'Dance',
    category: 'Technique',
    minutes: 12,
    description: 'Wake up the feet and find your classical demi-plié line for Bharatanatyam.',
    icon: 'footprints',
    instructions: [
      'Pada Bheda Warmup - Rotate ankles smoothly in clockwise and counter-clockwise circles.',
      'Heel & Toe Articulation - Lift onto balls of feet, press heels down, feeling the arch wakefulness.',
      'Aramandi Foundation - Turn feet outward to 180 degrees, keeping spine erect, knees pushed outward over toes.',
      'Muzhumandi Transition - Deepen from half-bend into full seated balance on the toes, maintaining spine alignment.',
      'Tatta Adavu Step 1 - Stamp right and left foot in aramandi posture with sharp rhythmic precision.'
    ]
  },
  {
    id: 'p3',
    title: 'Moonlit Cooldown',
    discipline: 'Yoga',
    category: 'Restore',
    minutes: 10,
    description: 'A soft landing for your evening to calm the nervous system.',
    icon: 'moon',
    instructions: [
      'Balasana (Child\'s Pose) - Rest forehead on the mat, arms resting beside the body.',
      'Supta Baddha Konasana - Lie on back, soles of feet together, knees opening like butterfly wings.',
      'Viparita Karani - Gentle legs-up-the-wall posture for lymphatic drainage and quiet contemplation.',
      'Savasana - Complete release of muscle tension, resting in stillness and breath awareness.'
    ]
  },
  {
    id: 'p4',
    title: 'Abhinaya Basics',
    discipline: 'Dance',
    category: 'Expression',
    minutes: 24,
    description: 'Let the eyes lead the story: Drishti Bheda, Hasta Mudras, and emotive storytelling.',
    icon: 'sparkles',
    instructions: [
      'Drishti Bheda (Eye Movements) - Sama, Alokita, Sachi, Pralokita, Nimilita, Ullokita, Anuvrutta, Avalokita.',
      'Griva Bheda (Neck Movements) - Sundari, Tiraschina, Prarivartita, Prakampita.',
      'Samyuta & Asamyuta Mudras - Pataka, Tripataka, Ardhapataka, Kartarimukha gestures.',
      'Navarasa Micro-Expressions - Exploring Shringara (love), Karuna (compassion), and Shanta (peace).'
    ]
  }
];

export const INITIAL_CLASSES: LiveClass[] = [
  {
    id: 'c1',
    title: 'Morning Bharatanatyam Adavu Immersion',
    description: 'Refining speed, rhythm (Kaala), and hand-eye coordination with Guru Radhika.',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(), // in 3 hours
    durationMinutes: 60,
    meetingUrl: 'https://meet.google.com/nrityasana-live',
    participantCount: 14,
    joined: false,
    createdBy: 'admin@nrityasana.com'
  },
  {
    id: 'c2',
    title: 'Pranayama & Spine Mobility Flow',
    description: 'Gentle opening sequence for breath control and spinal fluid movement.',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(), // tomorrow
    durationMinutes: 45,
    meetingUrl: 'https://meet.google.com/nrityasana-flow',
    participantCount: 8,
    joined: true,
    createdBy: 'admin@nrityasana.com'
  },
  {
    id: 'c3',
    title: 'Nritya & Mudra Masterclass',
    description: 'Exploring lyrical interpretation and padams with Senior Artist Vidya.',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // in 2 days
    durationMinutes: 90,
    meetingUrl: 'https://meet.google.com/nrityasana-mudra',
    participantCount: 22,
    joined: false,
    createdBy: 'admin@nrityasana.com'
  }
];

export const INITIAL_CONTACTS: ChatContact[] = [
  {
    id: 'u-admin',
    email: 'admin@nrityasana.com',
    role: 'ADMIN'
  },
  {
    id: 'u-priya',
    email: 'priya.sharma@nrityasana.com',
    role: 'USER'
  },
  {
    id: 'u-radhika',
    email: 'radhika.dance@nrityasana.com',
    role: 'ADMIN'
  },
  {
    id: 'u-vikram',
    email: 'vikram.yoga@nrityasana.com',
    role: 'USER'
  }
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    senderId: 'u-admin',
    email: 'admin@nrityasana.com',
    role: 'ADMIN',
    recipientId: 'u-current',
    recipientEmail: 'ananya@nrityasana.com',
    text: 'Namaste Ananya! Welcome to Nrityasana. How is your Aramandi posture feeling this week?',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  },
  {
    id: 'm2',
    senderId: 'u-current',
    email: 'ananya@nrityasana.com',
    role: 'USER',
    recipientId: 'u-admin',
    recipientEmail: 'admin@nrityasana.com',
    text: 'Namaste! The ankle warmups have been helping a lot with knee stabilization.',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    id: 'm3',
    senderId: 'u-admin',
    email: 'admin@nrityasana.com',
    role: 'ADMIN',
    recipientId: 'u-current',
    recipientEmail: 'ananya@nrityasana.com',
    text: 'Wonderful! Remember to keep the weight evenly distributed between balls of the feet and heels during turns.',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
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
