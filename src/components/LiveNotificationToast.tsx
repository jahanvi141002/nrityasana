import React, { useEffect } from 'react';
import { X, Video, MessageSquare, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { LiveNotification } from '../types';

interface LiveNotificationToastProps {
  notification: LiveNotification | null;
  onClose: () => void;
  onAction: (notification: LiveNotification) => void;
  primaryColor?: string;
}

export const LiveNotificationToast: React.FC<LiveNotificationToastProps> = ({
  notification,
  onClose,
  onAction,
  primaryColor = '#781D32',
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 6500);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const renderIcon = () => {
    switch (notification.type) {
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

  return (
    <div className="fixed top-4 inset-x-4 max-w-md mx-auto z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="bg-[#1F161A] text-white p-4 rounded-2xl shadow-2xl border border-white/15 flex items-start gap-3.5 backdrop-blur-md">
        {/* Live indicator dot & icon */}
        <div className="relative shrink-0 mt-0.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
            style={{ backgroundColor: primaryColor }}
          >
            {renderIcon()}
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#F59E38]">
              {notification.type === 'live_class'
                ? 'Live Class Alert'
                : notification.type === 'chat'
                ? 'Guru & Community'
                : 'Practice Rhythm'}
            </span>
            <span className="text-[10px] text-white/50">• Just now</span>
          </div>

          <h4 className="text-sm font-semibold text-white mt-0.5 truncate">
            {notification.title}
          </h4>
          <p className="text-xs text-[#FAF3F0]/80 mt-0.5 line-clamp-2 leading-relaxed">
            {notification.message}
          </p>

          {/* Action button */}
          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={() => {
                onAction(notification);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-white transition hover:brightness-110 cursor-pointer shadow-2xs"
              style={{ backgroundColor: primaryColor }}
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={onClose}
              className="text-xs text-white/60 hover:text-white px-2 py-1 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
