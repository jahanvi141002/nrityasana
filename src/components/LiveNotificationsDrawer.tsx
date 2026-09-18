import React, { useState } from 'react';
import {
  X,
  Bell,
  Video,
  MessageSquare,
  Sparkles,
  TrendingUp,
  CheckCheck,
  Trash2,
  Volume2,
  VolumeX,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { LiveNotification, NotificationType } from '../types';

interface LiveNotificationsDrawerProps {
  notifications: LiveNotification[];
  isOpen: boolean;
  onClose: () => void;
  onSelectNotification: (notification: LiveNotification) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onTriggerTestNotification: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  liveStreamingEnabled: boolean;
  onToggleLiveStream: () => void;
  primaryColor?: string;
}

export const LiveNotificationsDrawer: React.FC<LiveNotificationsDrawerProps> = ({
  notifications,
  isOpen,
  onClose,
  onSelectNotification,
  onMarkAllAsRead,
  onClearAll,
  onTriggerTestNotification,
  soundEnabled,
  onToggleSound,
  liveStreamingEnabled,
  onToggleLiveStream,
  primaryColor = '#781D32',
}) => {
  const [filter, setFilter] = useState<'all' | NotificationType>('all');

  if (!isOpen) return null;

  const filteredList =
    filter === 'all'
      ? notifications
      : notifications.filter((item) => item.type === filter);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case 'live_class':
        return <Video className="w-4 h-4 text-white" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-white" />;
      case 'milestone':
        return <TrendingUp className="w-4 h-4 text-white" />;
      default:
        return <Sparkles className="w-4 h-4 text-white" />;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diff = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diff / (60 * 1000));
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FDF8F5] max-w-lg w-full rounded-[28px] overflow-hidden shadow-2xl border border-[#F2E6E2] flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#F2E6E2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white relative shadow-xs"
              style={{ backgroundColor: primaryColor }}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-bold text-[#1F161A]">Live Notifications</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live
                </span>
              </div>
              <p className="text-xs text-[#7D6D73]">Real-time class alerts, messages & practice flow</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
              className="p-2 rounded-full hover:bg-black/5 text-[#6B5C62] hover:text-[#1F161A] transition cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 text-[#6B5C62] hover:text-[#1F161A] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Simulation & Stream Control Bar */}
        <div className="px-5 py-3 bg-[#FAF3F0] border-b border-[#F2E6E2] flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleLiveStream}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                liveStreamingEnabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-black/10 text-[#6B5C62]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{liveStreamingEnabled ? 'Auto-alerts: ON' : 'Auto-alerts: OFF'}</span>
            </button>

            <button
              onClick={onTriggerTestNotification}
              className="px-2.5 py-1 rounded-lg border border-[#DDD3C7] bg-white text-[#1F161A] font-medium hover:bg-black/5 transition cursor-pointer"
            >
              + Send Live Alert Now
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] font-semibold text-[#781D32] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] text-[#7D6D73] hover:text-rose-600 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="px-5 py-2.5 flex items-center gap-1.5 overflow-x-auto border-b border-[#F2E6E2]/70">
          {[
            { id: 'all', label: 'All' },
            { id: 'live_class', label: 'Live Classes 🔴' },
            { id: 'chat', label: 'Messages 💬' },
            { id: 'practice', label: 'Practice 🧘' },
            { id: 'milestone', label: 'Milestones ✨' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filter === item.id
                  ? 'text-white shadow-2xs'
                  : 'bg-black/5 text-[#6B5C62] hover:bg-black/10'
              }`}
              style={filter === item.id ? { backgroundColor: primaryColor } : {}}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {filteredList.length === 0 ? (
            <div className="py-12 text-center text-[#7D6D73]">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold text-[#1F161A]">No notifications yet</p>
              <p className="text-xs mt-0.5">Live class alerts and teacher messages will appear here.</p>
              <button
                onClick={onTriggerTestNotification}
                className="mt-4 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-xs cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                Send a live test notification
              </button>
            </div>
          ) : (
            filteredList.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  onSelectNotification(notif);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 relative group ${
                  notif.read
                    ? 'bg-white/60 hover:bg-white border-[#F2E6E2]'
                    : 'bg-white border-[#E25B88]/40 shadow-xs ring-1 ring-[#781D32]/10'
                }`}
              >
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ backgroundColor: notif.read ? '#94848A' : primaryColor }}
                >
                  {renderIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#7D6D73]">
                      {notif.type === 'live_class'
                        ? 'Live Class'
                        : notif.type === 'chat'
                        ? 'Community'
                        : notif.type === 'milestone'
                        ? 'Milestone'
                        : 'Practice'}
                    </span>
                    <span className="text-[10px] text-[#94848A] whitespace-nowrap">
                      {formatRelativeTime(notif.timestamp)}
                    </span>
                  </div>

                  <h4 className={`text-xs sm:text-sm font-bold mt-0.5 ${notif.read ? 'text-[#1F161A]' : 'text-[#1F161A]'}`}>
                    {notif.title}
                  </h4>
                  <p className="text-xs text-[#6B5C62] mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#781D32] group-hover:underline">
                    <span>Open in {notif.actionTab || 'app'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>

                {/* Unread indicator badge */}
                {!notif.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-1" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F2E6E2] bg-white/70 flex items-center justify-between text-xs text-[#7D6D73]">
          <span>
            {unreadCount} unread alert{unreadCount === 1 ? '' : 's'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-white font-semibold text-xs transition cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
