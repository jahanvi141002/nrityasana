import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Compass, TrendingUp, Video, MessageSquare, User, Bot, Wind } from 'lucide-react';
import { UserSession, Practice, LiveClass, ChatContact, ChatMessage, MediaItem, LiveNotification, ThemePreset, UserProfile, DisciplineType } from './types';
import {
  INITIAL_PRACTICES,
  INITIAL_CLASSES,
  INITIAL_CONTACTS,
  INITIAL_MESSAGES,
  INITIAL_MEDIA,
} from './data/seedData';
import { THEME_CONFIGS, INITIAL_NOTIFICATIONS } from './data/themeConfig';
import { playGentleChime, triggerHapticFeedback } from './utils/sound';
import { AuthScreen } from './components/AuthScreen';
import { HomeScreen } from './components/HomeScreen';
import { ExploreScreen } from './components/ExploreScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { LiveClassesScreen } from './components/LiveClassesScreen';
import { ChatScreen } from './components/ChatScreen';
import { MeScreen } from './components/MeScreen';
import { AIStudioScreen } from './components/AIStudioScreen';
import { ProfileModal } from './components/ProfileModal';
import { ActivePracticeModal } from './components/ActivePracticeModal';
import { TopHeader } from './components/TopHeader';
import { LogoThemeModal } from './components/LogoThemeModal';
import { LiveNotificationsDrawer } from './components/LiveNotificationsDrawer';
import { LiveNotificationToast } from './components/LiveNotificationToast';
import { DatabaseWorkbenchModal } from './components/DatabaseWorkbenchModal';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { QuickActionMenu } from './components/QuickActionMenu';
import { PranayamaBreathOverlay } from './components/PranayamaBreathOverlay';
import { testFirestoreConnection, db, auth, onAuthStateChanged, logoutUser } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

type TabType = 'today' | 'explore' | 'progress' | 'aiStudio' | 'live' | 'chat' | 'me';

const SIMULATED_LIVE_EVENTS = [
  {
    type: 'live_class' as const,
    title: '🔴 Odissi Live Workshop In Session',
    message: 'Guru Meera has started "Bhangi Postures & Expression". 18 students are currently practicing.',
    actionTab: 'live' as TabType,
    actionPayload: { classId: 'c-2' },
  },
  {
    type: 'chat' as const,
    title: '💬 Guru Meera replied to you',
    message: '"Wonderful progress! Soften your breath and let your wrists lead each mudra transition."',
    actionTab: 'chat' as TabType,
    actionPayload: { contactId: 'admin-1' },
  },
  {
    type: 'practice' as const,
    title: '🧘 Mindful Intention for You',
    message: 'Time for your 15-minute Surya Namaskar flow. Return to your breath and center your focus.',
    actionTab: 'today' as TabType,
    actionPayload: { practiceId: 'p-1' },
  },
  {
    type: 'milestone' as const,
    title: '✨ Sacred Consistency Unlocked',
    message: 'You have stayed connected to your practice rhythm this week. Small steps become a language.',
    actionTab: 'progress' as TabType,
  },
];

export function App() {
  // Session State
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('nrityasana_session');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      userId: 'u-current',
      email: 'ananya@nrityasana.com',
      role: 'USER',
      token: 'demo-token-123',
    };
  });

  // Theme & Branding State
  const [themePreset, setThemePreset] = useState<ThemePreset>(() => {
    try {
      const saved = localStorage.getItem('nrityasana_theme');
      if (saved === 'terracotta' || saved === 'burgundy' || saved === 'lotus') return saved;
    } catch {}
    // Default to the authentic terracotta earth theme from the original repo
    return 'terracotta';
  });

  const [customColor, setCustomColor] = useState<string | undefined>(() => {
    try {
      return localStorage.getItem('nrityasana_custom_color') || undefined;
    } catch {
      return undefined;
    }
  });

  const [customLogoUrl, setCustomLogoUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('nrityasana_custom_logo');
      if (saved) return saved;
    } catch {}
    return '/logo.jpg';
  });

  const [isLogoThemeOpen, setIsLogoThemeOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // Live Notifications State
  const [notifications, setNotifications] = useState<LiveNotification[]>(() => {
    try {
      const saved = localStorage.getItem('nrityasana_notifications');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPranayamaOpen, setIsPranayamaOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<LiveNotification | null>(null);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nrityasana_notif_sound');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  const [liveStreamingEnabled, setLiveStreamingEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nrityasana_live_stream');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  // Data States
  const [practices, setPractices] = useState<Practice[]>(() => {
    try {
      const saved = localStorage.getItem('nrityasana_practices');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_PRACTICES.length) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_PRACTICES;
  });

  const [classes, setClasses] = useState<LiveClass[]>(() => {
    try {
      const saved = localStorage.getItem('nrityasana_classes');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CLASSES;
  });

  const [contacts, setContacts] = useState<ChatContact[]>(() => {
    try {
      const saved = localStorage.getItem('nrityasana_contacts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CONTACTS;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('nrityasana_messages');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MESSAGES;
  });

  const [media, setMedia] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('nrityasana_media');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MEDIA;
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // UI Navigation & Modals
  const [currentTab, setCurrentTab] = useState<TabType>('today');
  const [exploreInitialTab, setExploreInitialTab] = useState<'All' | DisciplineType | 'Diet Plans' | 'Ayurveda & Dinacharya'>('All');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activePractice, setActivePractice] = useState<Practice | null>(null);

  // Compute Active Theme Colors
  const activePalette = THEME_CONFIGS[themePreset] || THEME_CONFIGS.terracotta;
  const primaryColor = customColor || activePalette.primary;
  const secondaryColor = activePalette.secondary;

  // Persist State Changes
  useEffect(() => {
    if (session) {
      localStorage.setItem('nrityasana_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('nrityasana_session');
    }
  }, [session]);

  useEffect(() => {
    localStorage.setItem('nrityasana_theme', themePreset);
  }, [themePreset]);

  useEffect(() => {
    if (customColor) {
      localStorage.setItem('nrityasana_custom_color', customColor);
    } else {
      localStorage.removeItem('nrityasana_custom_color');
    }
  }, [customColor]);

  useEffect(() => {
    localStorage.setItem('nrityasana_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('nrityasana_notif_sound', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('nrityasana_live_stream', String(liveStreamingEnabled));
  }, [liveStreamingEnabled]);

  useEffect(() => {
    localStorage.setItem('nrityasana_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('nrityasana_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('nrityasana_media', JSON.stringify(media));
  }, [media]);

  // Test Firestore Connection on boot per Skill Guidelines
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Synchronize Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const isAdmin =
            firebaseUser.email === 'jahanvigoyal2002@gmail.com' ||
            firebaseUser.email === 'admin@nrityasana.com';
          const newSession: UserSession = {
            userId: firebaseUser.uid,
            email: firebaseUser.email || 'practitioner@nrityasana.com',
            role: isAdmin ? 'ADMIN' : 'USER',
            token,
            profilePictureUrl: firebaseUser.photoURL || undefined,
          };
          setSession(newSession);

          // Sync user profile to Firestore
          const profileRef = doc(db, 'users', firebaseUser.uid, 'profile', 'main');
          const profileSnap = await getDoc(profileRef);
          if (!profileSnap.exists()) {
            await setDoc(profileRef, {
              userId: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Practitioner',
              photoURL: firebaseUser.photoURL || '',
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.warn('Firestore profile sync notice:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Synchronize permanent brand logo and MySQL Database endpoints on startup
  useEffect(() => {
    fetch('/api/settings/logo')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.logoUrl) {
          setCustomLogoUrl(data.logoUrl);
          try {
            localStorage.setItem('nrityasana_custom_logo', data.logoUrl);
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Synchronize practices from backend database on startup
  useEffect(() => {
    fetch('/api/practices')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.practices && Array.isArray(data.practices) && data.practices.length > 0) {
          setPractices(data.practices);
          try {
            localStorage.setItem('nrityasana_practices', JSON.stringify(data.practices));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Synchronize with MySQL Database endpoints on startup
  useEffect(() => {
    fetch('/api/classes')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setClasses((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const merged = [...prev];
            data.forEach((c: any) => {
              if (!existingIds.has(c.id)) {
                merged.push({
                  id: c.id,
                  title: c.title,
                  description: c.description || '',
                  startTime: c.start_time || c.startTime,
                  durationMinutes: c.duration_minutes || c.durationMinutes || 60,
                  meetingUrl: c.meeting_url || c.meetingUrl,
                  createdBy: c.created_by || c.createdBy || 'Teacher',
                  participantCount: 1,
                  joined: false,
                });
              }
            });
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Synchronize User Media from Database
  useEffect(() => {
    if (!session?.userId) return;
    fetch(`/api/media?userId=${session.userId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMedia((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const merged = [...prev];
            data.forEach((item: any) => {
              if (!existingIds.has(item.id)) {
                merged.unshift(item);
              }
            });
            return merged;
          });
        }
      })
      .catch(() => {});
  }, [session?.userId]);

  // Synchronize User Profile from Database
  useEffect(() => {
    if (!session?.userId) return;
    fetch(`/api/profile/${session.userId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUserProfile(data);
        }
      })
      .catch(() => {});
  }, [session?.userId]);

  // Push a live notification with toast & optional chime
  const pushNotification = useCallback(
    (notifData: Omit<LiveNotification, 'id' | 'timestamp' | 'read'>) => {
      const newNotif: LiveNotification = {
        ...notifData,
        id: 'notif-' + Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setActiveToast(newNotif);

      if (soundEnabled) {
        playGentleChime();
      }
    },
    [soundEnabled]
  );

  // Manual trigger for testing live notifications
  const handleTriggerTestNotification = () => {
    const randomEvent =
      SIMULATED_LIVE_EVENTS[Math.floor(Math.random() * SIMULATED_LIVE_EVENTS.length)];
    pushNotification(randomEvent);
  };

  // Periodic simulated live notification stream (every 40 seconds)
  useEffect(() => {
    if (!liveStreamingEnabled || !session) return;

    const interval = setInterval(() => {
      const randomEvent =
        SIMULATED_LIVE_EVENTS[Math.floor(Math.random() * SIMULATED_LIVE_EVENTS.length)];
      pushNotification(randomEvent);
    }, 45000);

    return () => clearInterval(interval);
  }, [liveStreamingEnabled, session, pushNotification]);

  // Handlers for Notifications
  const handleSelectNotification = (notification: LiveNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
    if (notification.actionTab) {
      setCurrentTab(notification.actionTab);
    }
    setIsNotificationsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  // Handlers for Logo & Theme (Admin Only)
  const handleUpdateLogo = (url: string) => {
    if (session?.role !== 'ADMIN') return;
    setCustomLogoUrl(url);
    try {
      localStorage.setItem('nrityasana_custom_logo', url);
      window.dispatchEvent(new Event('storage'));
    } catch {}

    // Persist permanently to server so logo remains constant across sessions and users
    fetch('/api/settings/logo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'ADMIN',
      },
      body: JSON.stringify({ logoUrl: url, role: 'ADMIN' }),
    }).catch((err) => console.error('Failed to sync logo to server:', err));
  };

  const handleResetLogo = () => {
    if (session?.role !== 'ADMIN') return;
    setCustomLogoUrl('/logo.jpg');
    try {
      localStorage.removeItem('nrityasana_custom_logo');
      window.dispatchEvent(new Event('storage'));
    } catch {}

    fetch('/api/settings/logo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'ADMIN',
      },
      body: JSON.stringify({ logoUrl: '/logo.jpg', role: 'ADMIN' }),
    }).catch((err) => console.error('Failed to reset logo on server:', err));
  };

  const handleUpdateTheme = (preset: ThemePreset, customHex?: string) => {
    setThemePreset(preset);
    setCustomColor(customHex);
  };

  // User Handlers
  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    if (!contacts.some((c) => c.email === newSession.email)) {
      setContacts((prev) => [
        ...prev,
        { id: newSession.userId, email: newSession.email, role: newSession.role },
      ]);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {}
    setSession(null);
    localStorage.removeItem('nrityasana_session');
    setIsProfileOpen(false);
  };

  const handleUpdateAvatar = (url: string) => {
    if (!session) return;
    setSession({ ...session, profilePictureUrl: url });
  };

  const handleScheduleClass = (newClassData: Omit<LiveClass, 'id' | 'participantCount' | 'joined'>) => {
    const newClass: LiveClass = {
      ...newClassData,
      id: 'c-' + Date.now(),
      participantCount: 1,
      joined: true,
    };
    setClasses((prev) => [newClass, ...prev]);

    // Persist to MySQL Backend
    fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newClass.title,
        description: newClass.description,
        startTime: newClass.startTime,
        durationMinutes: newClass.durationMinutes,
        meetingUrl: newClass.meetingUrl,
        createdBy: session?.email || 'admin@nrityasana.com',
      }),
    }).catch(() => {});

    // Live alert on class scheduled
    pushNotification({
      type: 'live_class',
      title: 'Class Scheduled Successfully',
      message: `"${newClass.title}" is now on the live schedule for ${new Date(newClass.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      actionTab: 'live',
      actionPayload: { classId: newClass.id },
    });
  };

  const handleJoinClass = (classId: string) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === classId) {
          const willJoin = !c.joined;
          if (c.meetingUrl) {
            window.open(c.meetingUrl, '_blank');
          }
          if (willJoin) {
            pushNotification({
              type: 'live_class',
              title: 'Live Session Connected',
              message: `You entered "${c.title}". Prepare your mat and sacred posture.`,
              actionTab: 'live',
            });
          }
          return {
            ...c,
            joined: willJoin,
            participantCount: willJoin ? c.participantCount + 1 : Math.max(0, c.participantCount - 1),
          };
        }
        return c;
      })
    );
  };

  const handleDeleteClass = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
    fetch(`/api/classes/${classId}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  const handleSendMessage = (
    recipient: ChatContact,
    text: string,
    extra?: { type?: 'text' | 'voice' | 'image'; voiceDuration?: number; mediaUrl?: string }
  ) => {
    if (!session) return;
    const newMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      senderId: session.userId,
      email: session.email,
      role: session.role,
      recipientId: recipient.id,
      recipientEmail: recipient.email,
      text,
      sentAt: new Date().toISOString(),
      type: extra?.type || 'text',
      voiceDuration: extra?.voiceDuration,
      status: 'delivered',
    };
    setMessages((prev) => [...prev, newMsg]);

    // Persist to MySQL Backend
    fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: session.userId,
        senderEmail: session.email,
        senderRole: session.role,
        recipientId: recipient.id,
        recipientEmail: recipient.email,
        text,
        messageType: extra?.type || 'text',
      }),
    }).catch(() => {});

    // Simulated reply after 1.5s
    setTimeout(() => {
      // Mark user's message as read
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'read' } : m))
      );

      const replyText = getSimulatedReply(recipient.role, text);
      const replyMsg: ChatMessage = {
        id: 'reply-' + Date.now(),
        senderId: recipient.id,
        email: recipient.email,
        role: recipient.role,
        recipientId: session.userId,
        recipientEmail: session.email,
        text: replyText,
        sentAt: new Date().toISOString(),
        type: 'text',
        status: 'read',
        fromWhatsApp: true,
      };
      setMessages((prev) => [...prev, replyMsg]);

      // Push real-time notification
      pushNotification({
        type: 'chat',
        title: `WhatsApp message from ${recipient.name || recipient.email.split('@')[0]}`,
        message: `"${replyText.length > 70 ? replyText.slice(0, 70) + '...' : replyText}"`,
        actionTab: 'chat',
        actionPayload: { contactId: recipient.id },
      });
    }, 1500);
  };

  const getSimulatedReply = (role: string, userText: string) => {
    const lower = userText.toLowerCase();
    if (lower.includes('posture') || lower.includes('aramandi') || lower.includes('knee')) {
      return 'Remember to keep your heels aligned and maintain equal weight balance across both feet. Feel the ground beneath you.';
    }
    if (lower.includes('class') || lower.includes('live') || lower.includes('time')) {
      return 'The live session will begin promptly! You can use the meeting link directly in the Live tab.';
    }
    if (lower.includes('namaste') || lower.includes('hello')) {
      return 'Namaste! May your movement today bring peace and clarity.';
    }
    if (role === 'ADMIN') {
      return 'Thank you for sharing your practice thoughts. Keep up the dedication and smooth breath!';
    }
    return 'Thank you! Let us keep practicing and learning together.';
  };

  const handleAddMedia = (newItem: Omit<MediaItem, 'id' | 'createdAt'>) => {
    const savedItem: MediaItem = {
      ...newItem,
      id: 'med-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setMedia((prev) => [savedItem, ...prev]);

    // Persist to database
    fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: session?.userId || 'u-user',
        name: savedItem.name,
        type: savedItem.type,
        url: savedItem.url,
      }),
    }).catch(() => {});

    pushNotification({
      type: 'practice',
      title: 'Practice Memory Saved',
      message: `"${savedItem.name}" was added to your sacred reflection journal.`,
      actionTab: 'me',
    });
  };

  const handleDeleteMedia = (mediaId: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== mediaId));
    fetch(`/api/media/${mediaId}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  if (!session) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const isAdmin = session.role === 'ADMIN';

  const handleOpenLogoTheme = () => {
    if (isAdmin) {
      setIsLogoThemeOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] flex flex-col justify-between text-[#1F161A]">
      {/* Real-time Floating Toast Alert Banner */}
      <LiveNotificationToast
        notification={activeToast}
        onClose={() => setActiveToast(null)}
        onAction={handleSelectNotification}
        primaryColor={primaryColor}
      />

      {/* Unified Persistent Top Header */}
      <TopHeader
        session={session}
        unreadNotificationsCount={unreadNotificationsCount}
        customLogoUrl={customLogoUrl}
        primaryColor={primaryColor}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenLogoTheme={isAdmin ? handleOpenLogoTheme : undefined}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenDatabaseModal={() => setIsDbModalOpen(true)}
        onOpenInstallApp={() => setIsInstallModalOpen(true)}
      />

      {/* Active Screen View */}
      <main className="flex-1">
        {currentTab === 'today' && (
          <HomeScreen
            session={session}
            practices={practices}
            onOpenProfile={() => setIsProfileOpen(true)}
            onSelectPractice={(p) => setActivePractice(p)}
            onExploreMore={() => {
              setExploreInitialTab('All');
              setCurrentTab('explore');
            }}
            onOpenAIStudio={() => setCurrentTab('aiStudio')}
            onOpenAyurvedaRoutines={() => {
              setExploreInitialTab('Ayurveda & Dinacharya');
              setCurrentTab('explore');
            }}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        )}
        {currentTab === 'explore' && (
          <ExploreScreen
            practices={practices}
            onSelectPractice={(p) => setActivePractice(p)}
            session={session}
            initialTab={exploreInitialTab}
            onShowToast={(title, message) => {
              pushNotification({
                type: 'practice',
                title,
                message,
                actionTab: 'explore',
              });
            }}
          />
        )}
        {currentTab === 'progress' && <ProgressScreen session={session} />}
        {currentTab === 'aiStudio' && (
          <AIStudioScreen
            session={session}
            onSaveToPracticeLog={(title, discipline, minutes) => {
              if (session?.userId) {
                const logId = 'log-' + Date.now();
                setDoc(doc(db, 'users', session.userId, 'practice_logs', logId), {
                  id: logId,
                  userId: session.userId,
                  practiceId: 'ai-reflection',
                  title,
                  discipline,
                  minutesPracticed: minutes,
                  completedAt: new Date().toISOString(),
                }).catch(() => {});
              }
              pushNotification({
                type: 'milestone',
                title: 'Reflection Logged',
                message: `Saved "${title}" (${minutes} min) to your Sacred Rhythm.`,
                actionTab: 'progress',
              });
            }}
            onSaveMedia={(name, url, type) => {
              handleAddMedia({ name, url, type, userId: session?.userId || 'user' });
            }}
          />
        )}
        {currentTab === 'live' && (
          <LiveClassesScreen
            session={session}
            classes={classes}
            onScheduleClass={handleScheduleClass}
            onJoinClass={handleJoinClass}
            onDeleteClass={handleDeleteClass}
          />
        )}
        {currentTab === 'chat' && (
          <ChatScreen
            session={session}
            contacts={contacts}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        )}
        {currentTab === 'me' && (
          <MeScreen
            session={session}
            media={media}
            userProfile={userProfile}
            onOpenProfile={() => setIsProfileOpen(true)}
            onAddMedia={handleAddMedia}
            onDeleteMedia={handleDeleteMedia}
            onOpenDatabaseModal={() => setIsDbModalOpen(true)}
            onOpenInstallApp={() => setIsInstallModalOpen(true)}
          />
        )}
      </main>

      {/* Bottom Navigation Bar with Pronounced Active Pill & Subtle Glow */}
      <nav
        id="bottom-navigation-bar"
        className="fixed bottom-0 inset-x-0 bg-[#FDF8F5]/95 backdrop-blur-xl border-t border-[#EADBDB] z-40 py-1.5 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.04)] transition-colors duration-300 ease-out"
      >
        <div className="max-w-lg mx-auto grid grid-cols-7 gap-1 sm:gap-1.5">
          {[
            { id: 'today' as TabType, label: 'Today', icon: Sparkles },
            { id: 'explore' as TabType, label: 'Explore', icon: Compass },
            { id: 'progress' as TabType, label: 'Progress', icon: TrendingUp },
            { id: 'aiStudio' as TabType, label: 'AI Studio', icon: Bot },
            { id: 'live' as TabType, label: 'Live', icon: Video },
            { id: 'chat' as TabType, label: 'Chat', icon: MessageSquare },
            { id: 'me' as TabType, label: 'Me', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`bottom-nav-${tab.id}`}
                onClick={() => {
                  triggerHapticFeedback('selection');
                  setCurrentTab(tab.id);
                }}
                className={`group flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 rounded-2xl transition-all duration-200 ease-out cursor-pointer relative select-none active:scale-92 active:translate-y-0.5 active:brightness-95 ${
                  isActive
                    ? 'bg-white shadow-[0_4px_14px_-2px_rgba(0,0,0,0.08)] ring-1.5 ring-inset'
                    : 'text-[#8C7B82] hover:text-[#1F161A] hover:bg-black/[0.03]'
                }`}
                style={
                  isActive
                    ? {
                        color: primaryColor,
                        boxShadow: `0 4px 14px -2px ${primaryColor}26, 0 0 12px -1px ${primaryColor}20`,
                        borderColor: `${primaryColor}40`,
                      }
                    : undefined
                }
              >
                {/* Active Pill Glow Aura */}
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none opacity-20 blur-xs transition-opacity duration-300"
                    style={{ backgroundColor: primaryColor }}
                  />
                )}

                {/* Icon Container with Optional Subtle Tint on Active */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-7.5 rounded-xl flex items-center justify-center transition-all duration-300 transform ${
                    isActive ? 'scale-105' : 'group-hover:scale-105'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: `${primaryColor}14`,
                        }
                      : undefined
                  }
                >
                  <Icon
                    className={`w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform duration-300 ${
                      isActive ? 'animate-active-icon-pulse' : ''
                    }`}
                    style={isActive ? { color: primaryColor } : undefined}
                  />
                </div>

                {/* Tab Label */}
                <span
                  className={`text-[9px] sm:text-[10px] leading-tight transition-all duration-300 truncate mt-0.5 ${
                    isActive ? 'font-bold tracking-tight' : 'font-medium'
                  }`}
                  style={isActive ? { color: primaryColor } : undefined}
                >
                  {tab.label}
                </span>

                {/* Glowing Bottom Indicator Bar */}
                <div
                  className={`h-0.5 rounded-full transition-all duration-300 ease-out mt-0.5 ${
                    isActive ? 'w-4 opacity-100 scale-100' : 'w-0 opacity-0 scale-75'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: primaryColor,
                          boxShadow: `0 0 8px ${primaryColor}90`,
                        }
                      : undefined
                  }
                />
              </button>
            );
          })}
        </div>
      </nav>

      {/* Floating 'Pranayama' 1-Minute Breath-Timer Trigger on Bottom Navigation Bar */}
      <button
        id="floating-pranayama-button"
        type="button"
        onClick={() => {
          triggerHapticFeedback('selection');
          setIsPranayamaOpen(true);
        }}
        className="fixed bottom-19 left-3 sm:left-6 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-white/95 hover:bg-white text-[#1F161A] shadow-[0_6px_22px_rgba(0,0,0,0.12)] border border-[#EADBDB] hover:border-[#781D32]/40 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group"
        title="Start 1-minute guided breath pause without leaving screen"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-xs transition-transform duration-300 group-hover:rotate-12"
          style={{ backgroundColor: primaryColor }}
        >
          <Wind className="w-4 h-4 text-amber-200 animate-pulse" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-bold tracking-wider uppercase leading-none text-[#781D32] font-mono">
            प्राणायाम
          </span>
          <span className="text-[11px] font-bold text-[#1F161A] leading-tight">
            1-min Breath
          </span>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
      </button>

      {/* Floating Quick Action Button Menu (Log Quick Practice or Record Mood without changing screens) */}
      <QuickActionMenu
        session={session}
        primaryColor={primaryColor}
        onOpenPranayama={() => {
          triggerHapticFeedback('selection');
          setIsPranayamaOpen(true);
        }}
        onPracticeLogged={(title, discipline, minutes) => {
          pushNotification({
            type: 'practice',
            title: 'Quick Practice Logged! 🧘',
            message: `Recorded ${minutes}m of ${discipline} ("${title}") to your rhythm.`,
          });
        }}
        onMoodRecorded={(moodLog) => {
          pushNotification({
            type: 'milestone',
            title: `${moodLog.emoji} Mood & Bhav Recorded`,
            message: `Felt "${moodLog.mood}" (${moodLog.bhavRasa}) • Energy ${moodLog.energyLevel}/5.`,
          });
        }}
        onShowToast={(title, message) => {
          pushNotification({
            type: 'practice',
            title,
            message,
          });
        }}
      />

      {/* Live Notifications Drawer Panel */}
      <LiveNotificationsDrawer
        notifications={notifications}
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectNotification={handleSelectNotification}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAll}
        onTriggerTestNotification={handleTriggerTestNotification}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        liveStreamingEnabled={liveStreamingEnabled}
        onToggleLiveStream={() => setLiveStreamingEnabled((prev) => !prev)}
        primaryColor={primaryColor}
      />

      {/* Logo & Theme Customizer Modal - Strictly Admin Only */}
      {isLogoThemeOpen && (
        <LogoThemeModal
          currentLogoUrl={customLogoUrl}
          currentTheme={themePreset}
          customColor={customColor}
          isAdmin={isAdmin}
          onClose={() => setIsLogoThemeOpen(false)}
          onUpdateLogo={handleUpdateLogo}
          onUpdateTheme={handleUpdateTheme}
          onResetLogo={handleResetLogo}
        />
      )}

      {/* Profile Modal */}
      {isProfileOpen && (
        <ProfileModal
          session={session}
          userProfile={userProfile}
          onClose={() => setIsProfileOpen(false)}
          onLogout={handleLogout}
          onUpdateAvatar={handleUpdateAvatar}
          onUpdateProfile={(updated) => setUserProfile((prev) => (prev ? { ...prev, ...updated } : updated as UserProfile))}
          onOpenLogoTheme={isAdmin ? handleOpenLogoTheme : undefined}
          primaryColor={primaryColor}
        />
      )}

      {/* Guided Active Practice Modal */}
      {activePractice && (
        <ActivePracticeModal
          practice={activePractice}
          onClose={() => setActivePractice(null)}
          onComplete={() => {
            const completedPrac = activePractice;
            setActivePractice(null);

            // Record to Database Progress & Logs
            if (session?.userId && completedPrac) {
              fetch('/api/progress/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: session.userId,
                  practiceId: completedPrac.id,
                  title: completedPrac.title,
                  discipline: completedPrac.discipline,
                  minutes: completedPrac.minutes,
                }),
              }).catch(() => {});
            }

            pushNotification({
              type: 'milestone',
              title: 'Practice Session Completed & Logged!',
              message: `Splendid! You completed "${completedPrac.title}" (${completedPrac.minutes} min). Recorded to your sacred rhythm.`,
              actionTab: 'progress',
            });
            setCurrentTab('progress');
          }}
        />
      )}

      {/* MySQL 8.0 & Workbench Modal */}
      {session && (
        <DatabaseWorkbenchModal
          isOpen={isDbModalOpen}
          onClose={() => setIsDbModalOpen(false)}
          session={session}
          onShowToast={(title, message) => {
            pushNotification({
              type: 'milestone',
              title,
              message,
            });
          }}
        />
      )}

      {/* Cross-Platform PWA Install Prompt Banner & Modal */}
      <PwaInstallPrompt
        primaryColor={primaryColor}
        isOpenManual={isInstallModalOpen}
        onCloseManual={() => setIsInstallModalOpen(false)}
      />

      {/* Floating 1-min Pranayama Guided Breath-Timer Overlay */}
      <PranayamaBreathOverlay
        isOpen={isPranayamaOpen}
        onClose={() => setIsPranayamaOpen(false)}
        primaryColor={primaryColor}
        onCompleted={(minutes) => {
          if (session?.userId) {
            fetch('/api/progress/log', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: session.userId,
                practiceId: 'pranayama-quick',
                title: '1-min Guided Pranayama Pause',
                discipline: 'Meditation',
                minutes,
              }),
            }).catch(() => {});
          }

          pushNotification({
            type: 'practice',
            title: 'Pranayama Pause Completed! 🌬️',
            message: `${minutes}m of conscious Prana breathing recorded. Your nervous system is grounded.`,
          });
        }}
      />
    </div>
  );
}

export default App;
