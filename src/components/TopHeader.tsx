import React from 'react';
import { Bell, Palette, Database } from 'lucide-react';
import { UserSession } from '../types';
import { Logo } from './Logo';

interface TopHeaderProps {
  session: UserSession;
  unreadNotificationsCount: number;
  customLogoUrl?: string;
  primaryColor?: string;
  onOpenNotifications: () => void;
  onOpenLogoTheme?: () => void;
  onOpenProfile: () => void;
  onOpenDatabaseModal?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  session,
  unreadNotificationsCount,
  customLogoUrl,
  primaryColor = '#781D32',
  onOpenNotifications,
  onOpenLogoTheme,
  onOpenProfile,
  onOpenDatabaseModal,
}) => {
  const initial = session.email ? session.email.charAt(0).toUpperCase() : 'A';
  const isAdmin = session?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-[#FDF8F5]/90 backdrop-blur-md border-b border-[#F2E6E2]/70 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Logo and Brand - Only clickable for Admin */}
        <Logo
          variant="horizontal"
          size="md"
          customLogoUrl={customLogoUrl}
          onClick={isAdmin ? onOpenLogoTheme : undefined}
          showSubtitle={true}
        />

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Database Workbench Modal Button */}
          {onOpenDatabaseModal && (
            <button
              id="header-database-workbench-button"
              onClick={onOpenDatabaseModal}
              title="MySQL 8.0 & Workbench Integration"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF3F0] border border-[#F2E6E2] text-xs font-semibold text-[#1F161A] shadow-2xs transition hover:scale-102 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-[#781D32]" />
              <span className="hidden sm:inline">MySQL 8.0</span>
            </button>
          )}

          {/* Logo & Theme Customizer Button - Strictly ADMIN ONLY */}
          {isAdmin && onOpenLogoTheme && (
            <button
              id="header-admin-logo-theme-button"
              onClick={onOpenLogoTheme}
              title="Set Logo & Change Theme (Admin Only)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF3F0] border border-[#F2E6E2] text-xs font-semibold text-[#1F161A] shadow-2xs transition hover:scale-102 cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span className="hidden sm:inline">Theme & Logo</span>
            </button>
          )}

          {/* Live Notifications Bell with Live Pulse */}
          <button
            onClick={onOpenNotifications}
            title="Live Notifications"
            className="relative p-2 text-[#6B5C62] hover:text-[#1F161A] hover:bg-black/5 rounded-full transition cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            
            {unreadNotificationsCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-white text-[10px] font-bold items-center justify-center border-2 border-[#FDF8F5]">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </button>

          {/* Profile Avatar Button */}
          <button
            id="header-profile-avatar-button"
            onClick={onOpenProfile}
            title="User Profile"
            className="w-9 h-9 rounded-full bg-[#FAF3F0] border-2 flex items-center justify-center font-bold text-xs transition overflow-hidden shadow-2xs hover:scale-105 cursor-pointer"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            {session.profilePictureUrl ? (
              <img
                src={session.profilePictureUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              initial
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
