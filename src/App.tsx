import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Compass, TrendingUp, Video, MessageSquare, User } from 'lucide-react';
import { UserSession, Practice, LiveClass, ChatContact, ChatMessage, MediaItem, LiveNotification, ThemePreset } from './types';
import {
  INITIAL_PRACTICES,
  INITIAL_CLASSES,
  INITIAL_CONTACTS,
  INITIAL_MESSAGES,
  INITIAL_MEDIA,
} from './data/seedData';
import { THEME_CONFIGS, INITIAL_NOTIFICATIONS } from './data/themeConfig';
import { playGentleChime } from './utils/sound';
import { AuthScreen } from './components/AuthScreen';
import { HomeScreen } from './components/HomeScreen';
import { ExploreScreen } from './components/ExploreScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { LiveClassesScreen } from './components/LiveClassesScreen';
import { ChatScreen } from './components/ChatScreen';
import { MeScreen } from './components/MeScreen';
import { ProfileModal } from './components/ProfileModal';
import { ActivePracticeModal } from './components/ActivePracticeModal';
import { TopHeader } from './components/TopHeader';
import { LogoThemeModal } from './components/LogoThemeModal';
import { DatabaseModal } from './components/DatabaseModal';
import { LiveNotificationsDrawer } from './components/LiveNotificationsDrawer';
import { LiveNotificationToast } from './components/LiveNotificationToast';

type TabType = 'today' | 'explore' | 'progress' | 'live' | 'chat' | 'me';

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

  // Live Notifications State
  const [notifications, setNotifications] = useState<LiveNotification[]>(() => {
    try {
      const saved = localStorage.getItem('nrityasana_notifications');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
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
  const [practices] = useState<Practice[]>(() => {
    try {
      const saved = localStorage.getItem('nrityasana_practices');
      if (saved) return JSON.parse(saved);
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

  // UI Navigation & Modals
  const [currentTab, setCurrentTab] = useState<TabType>('today');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
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

  // Handlers for Logo & Theme
  const handleUpdateLogo = (url: string) => {
    setCustomLogoUrl(url);
    try {
      localStorage.setItem('nrityasana_custom_logo', url);
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  const handleResetLogo = () => {
    setCustomLogoUrl('/logo.jpg');
    try {
      localStorage.removeItem('nrityasana_custom_logo');
      window.dispatchEvent(new Event('storage'));
    } catch {}
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

  const handleLogout = () => {
    setSession(null);
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

    pushNotification({
      type: 'practice',
      title: 'Practice Memory Saved',
      message: `"${savedItem.name}" was added to your sacred reflection journal.`,
      actionTab: 'me',
    });
  };

  if (!session) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

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
        onOpenLogoTheme={() => setIsLogoThemeOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenDatabase={() => setIsDatabaseOpen(true)}
      />

      {/* Active Screen View */}
      <main className="flex-1">
        {currentTab === 'today' && (
          <HomeScreen
            session={session}
            practices={practices}
            onOpenProfile={() => setIsProfileOpen(true)}
            onSelectPractice={(p) => setActivePractice(p)}
            onExploreMore={() => setCurrentTab('explore')}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        )}
        {currentTab === 'explore' && (
          <ExploreScreen
            practices={practices}
            onSelectPractice={(p) => setActivePractice(p)}
          />
        )}
        {currentTab === 'progress' && <ProgressScreen />}
        {currentTab === 'live' && (
          <LiveClassesScreen
            session={session}
            classes={classes}
            onScheduleClass={handleScheduleClass}
            onJoinClass={handleJoinClass}
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
            onOpenProfile={() => setIsProfileOpen(true)}
            onAddMedia={handleAddMedia}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav
        id="bottom-navigation-bar"
        className="fixed bottom-0 inset-x-0 bg-[#FDF8F5]/92 backdrop-blur-lg border-t border-[#F2E6E2] z-40 py-2 px-2 shadow-xs"
      >
        <div className="max-w-md mx-auto grid grid-cols-6 gap-1">
          <button
            onClick={() => setCurrentTab('today')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer relative ${
              currentTab === 'today'
                ? 'font-bold'
                : 'text-[#94848A] hover:text-[#1F161A]'
            }`}
            style={currentTab === 'today' ? { color: primaryColor } : {}}
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Today</span>
            {currentTab === 'today' && (
              <span
                className="absolute -bottom-1 w-1 h-1 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('explore')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer relative ${
              currentTab === 'explore'
                ? 'font-bold'
                : 'text-[#94848A] hover:text-[#1F161A]'
            }`}
            style={currentTab === 'explore' ? { color: primaryColor } : {}}
          >
            <Compass className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Explore</span>
            {currentTab === 'explore' && (
              <span
                className="absolute -bottom-1 w-1 h-1 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('progress')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer relative ${
              currentTab === 'progress'
                ? 'font-bold'
                : 'text-[#94848A] hover:text-[#1F161A]'
            }`}
            style={currentTab === 'progress' ? { color: primaryColor } : {}}
          >
            <TrendingUp className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Progress</span>
            {currentTab === 'progress' && (
              <span
                className="absolute -bottom-1 w-1 h-1 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('live')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer relative ${
              currentTab === 'live'
                ? 'font-bold'
                : 'text-[#94848A] hover:text-[#1F161A]'
            }`}
            style={currentTab === 'live' ? { color: primaryColor } : {}}
          >
            <Video className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Live</span>
            {currentTab === 'live' && (
              <span
                className="absolute -bottom-1 w-1 h-1 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('chat')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer relative ${
              currentTab === 'chat'
                ? 'font-bold'
                : 'text-[#94848A] hover:text-[#1F161A]'
            }`}
            style={currentTab === 'chat' ? { color: primaryColor } : {}}
          >
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Chat</span>
            {currentTab === 'chat' && (
              <span
                className="absolute -bottom-1 w-1 h-1 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('me')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer relative ${
              currentTab === 'me'
                ? 'font-bold'
                : 'text-[#94848A] hover:text-[#1F161A]'
            }`}
            style={currentTab === 'me' ? { color: primaryColor } : {}}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Me</span>
            {currentTab === 'me' && (
              <span
                className="absolute -bottom-1 w-1 h-1 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
            )}
          </button>
        </div>
      </nav>

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

      {/* Logo & Theme Customizer Modal */}
      {isLogoThemeOpen && (
        <LogoThemeModal
          currentLogoUrl={customLogoUrl}
          currentTheme={themePreset}
          customColor={customColor}
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
          onClose={() => setIsProfileOpen(false)}
          onLogout={handleLogout}
          onUpdateAvatar={handleUpdateAvatar}
        />
      )}

      {/* MySQL & JDBC Database Workstation Modal */}
      <DatabaseModal
        isOpen={isDatabaseOpen}
        onClose={() => setIsDatabaseOpen(false)}
        primaryColor={primaryColor}
      />

      {/* Guided Active Practice Modal */}
      {activePractice && (
        <ActivePracticeModal
          practice={activePractice}
          onClose={() => setActivePractice(null)}
          onComplete={() => {
            setActivePractice(null);
            pushNotification({
              type: 'milestone',
              title: 'Practice Session Completed!',
              message: `Splendid! You completed "${activePractice.title}" (${activePractice.minutes} min). Your dedication nurtures the soul.`,
              actionTab: 'progress',
            });
            setCurrentTab('progress');
          }}
        />
      )}
    </div>
  );
}

export default App;
