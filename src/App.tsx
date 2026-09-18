import { useState, useEffect } from 'react';
import { Sparkles, Compass, TrendingUp, Video, MessageSquare, User } from 'lucide-react';
import { UserSession, Practice, LiveClass, ChatContact, ChatMessage, MediaItem } from './types';
import {
  INITIAL_PRACTICES,
  INITIAL_CLASSES,
  INITIAL_CONTACTS,
  INITIAL_MESSAGES,
  INITIAL_MEDIA,
} from './data/seedData';
import { AuthScreen } from './components/AuthScreen';
import { HomeScreen } from './components/HomeScreen';
import { ExploreScreen } from './components/ExploreScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { LiveClassesScreen } from './components/LiveClassesScreen';
import { ChatScreen } from './components/ChatScreen';
import { MeScreen } from './components/MeScreen';
import { ProfileModal } from './components/ProfileModal';
import { ActivePracticeModal } from './components/ActivePracticeModal';

type TabType = 'today' | 'explore' | 'progress' | 'live' | 'chat' | 'me';

export function App() {
  // Session State
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('nrityasana_session');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Default logged in as demo student Ananya for immediate preview usability
    return {
      userId: 'u-current',
      email: 'ananya@nrityasana.com',
      role: 'USER',
      token: 'demo-token-123',
    };
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
  const [activePractice, setActivePractice] = useState<Practice | null>(null);

  // Persistence
  useEffect(() => {
    if (session) {
      localStorage.setItem('nrityasana_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('nrityasana_session');
    }
  }, [session]);

  useEffect(() => {
    localStorage.setItem('nrityasana_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('nrityasana_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('nrityasana_media', JSON.stringify(media));
  }, [media]);

  // Handlers
  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    // Add user to contacts if not present
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
  };

  const handleJoinClass = (classId: string) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === classId) {
          const willJoin = !c.joined;
          if (c.meetingUrl) {
            window.open(c.meetingUrl, '_blank');
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

  const handleSendMessage = (recipient: ChatContact, text: string) => {
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
    };
    setMessages((prev) => [...prev, newMsg]);

    // Simulated reply after 1.5s
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: 'reply-' + Date.now(),
        senderId: recipient.id,
        email: recipient.email,
        role: recipient.role,
        recipientId: session.userId,
        recipientEmail: session.email,
        text: getSimulatedReply(recipient.role, text),
        sentAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, replyMsg]);
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
  };

  if (!session) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F1E9] flex flex-col justify-between text-[#201C1A]">
      {/* Active Screen View */}
      <main className="flex-1">
        {currentTab === 'today' && (
          <HomeScreen
            session={session}
            practices={practices}
            onOpenProfile={() => setIsProfileOpen(true)}
            onSelectPractice={(p) => setActivePractice(p)}
            onExploreMore={() => setCurrentTab('explore')}
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
        className="fixed bottom-0 inset-x-0 bg-[#F7F1E9]/95 backdrop-blur-md border-t border-[#E8DFC8] z-40 py-1.5 px-2"
      >
        <div className="max-w-md mx-auto grid grid-cols-6 gap-1">
          <button
            onClick={() => setCurrentTab('today')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer ${
              currentTab === 'today'
                ? 'text-[#B8543F] font-semibold'
                : 'text-[#75685F] hover:text-[#201C1A]'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Today</span>
          </button>

          <button
            onClick={() => setCurrentTab('explore')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer ${
              currentTab === 'explore'
                ? 'text-[#B8543F] font-semibold'
                : 'text-[#75685F] hover:text-[#201C1A]'
            }`}
          >
            <Compass className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Explore</span>
          </button>

          <button
            onClick={() => setCurrentTab('progress')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer ${
              currentTab === 'progress'
                ? 'text-[#B8543F] font-semibold'
                : 'text-[#75685F] hover:text-[#201C1A]'
            }`}
          >
            <TrendingUp className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Progress</span>
          </button>

          <button
            onClick={() => setCurrentTab('live')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer ${
              currentTab === 'live'
                ? 'text-[#B8543F] font-semibold'
                : 'text-[#75685F] hover:text-[#201C1A]'
            }`}
          >
            <Video className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Live</span>
          </button>

          <button
            onClick={() => setCurrentTab('chat')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer ${
              currentTab === 'chat'
                ? 'text-[#B8543F] font-semibold'
                : 'text-[#75685F] hover:text-[#201C1A]'
            }`}
          >
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Chat</span>
          </button>

          <button
            onClick={() => setCurrentTab('me')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer ${
              currentTab === 'me'
                ? 'text-[#B8543F] font-semibold'
                : 'text-[#75685F] hover:text-[#201C1A]'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Me</span>
          </button>
        </div>
      </nav>

      {/* Profile Modal */}
      {isProfileOpen && (
        <ProfileModal
          session={session}
          onClose={() => setIsProfileOpen(false)}
          onLogout={handleLogout}
          onUpdateAvatar={handleUpdateAvatar}
        />
      )}

      {/* Guided Active Practice Modal */}
      {activePractice && (
        <ActivePracticeModal
          practice={activePractice}
          onClose={() => setActivePractice(null)}
          onComplete={() => {
            setActivePractice(null);
            // Switch to progress to show advancement
            setCurrentTab('progress');
          }}
        />
      )}
    </div>
  );
}
export default App;
