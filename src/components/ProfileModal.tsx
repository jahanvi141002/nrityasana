import React, { useRef } from 'react';
import { Camera, LogOut, X, ShieldCheck, User, Palette, Database } from 'lucide-react';
import { UserSession } from '../types';

interface ProfileModalProps {
  session: UserSession;
  onClose: () => void;
  onLogout: () => void;
  onUpdateAvatar: (url: string) => void;
  onOpenLogoTheme?: () => void;
  onOpenDatabase?: () => void;
  primaryColor?: string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  session,
  onClose,
  onLogout,
  onUpdateAvatar,
  onOpenLogoTheme,
  onOpenDatabase,
  primaryColor = '#781D32',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initial = session.email ? session.email.charAt(0).toUpperCase() : 'U';
  const isAdmin = session.role === 'ADMIN';

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      if (url) {
        onUpdateAvatar(url);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FDF8F5] max-w-md w-full rounded-[28px] overflow-hidden shadow-2xl border border-[#F2E6E2] p-6 sm:p-7 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F2E6E2]">
          <h2 className="font-serif text-2xl font-bold text-[#1F161A]">Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#6B5C62] hover:text-[#1F161A] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center my-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#781D32] flex items-center justify-center font-bold text-white text-4xl shadow-md overflow-hidden border-2 border-white ring-2 ring-[#781D32]/20">
              {session.profilePictureUrl ? (
                <img src={session.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Change picture"
              className="absolute bottom-0 right-0 p-2 rounded-full bg-[#781D32] text-white hover:bg-[#641427] shadow-md transition cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-bold text-[#1F161A] text-lg mt-3">
            {session.email.split('@')[0]}
          </h3>
          <span className="inline-flex items-center gap-1 text-xs text-[#7D6D73] mt-0.5">
            {session.role === 'ADMIN' ? (
              <span className="text-[#781D32] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Teacher
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Practice Member
              </span>
            )}
          </span>
        </div>

        {/* Account Details Card */}
        <div className="bg-white/90 rounded-2xl p-4 border border-[#F2E6E2] space-y-3 mb-6 shadow-2xs">
          <div>
            <span className="text-[11px] font-semibold text-[#7D6D73] uppercase tracking-wider block">
              Email Address
            </span>
            <p className="text-sm font-medium text-[#1F161A] mt-0.5 break-all">
              {session.email}
            </p>
          </div>

          <div className="border-t border-[#F2E6E2] pt-3">
            <span className="text-[11px] font-semibold text-[#7D6D73] uppercase tracking-wider block">
              Account Type
            </span>
            <p className="text-sm font-medium text-[#1F161A] mt-0.5">
              {session.role === 'ADMIN' ? 'Admin Teacher' : 'Practitioner Member'}
            </p>
          </div>

          <div className="border-t border-[#F2E6E2] pt-3">
            <span className="text-[11px] font-semibold text-[#7D6D73] uppercase tracking-wider block">
              Member ID
            </span>
            <p className="text-xs font-mono text-[#6B5C62] mt-0.5">
              {session.userId}
            </p>
          </div>
        </div>

        {/* Administrator Workstation Shortcuts - ADMIN ONLY */}
        {isAdmin && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FAF3F0] border border-[#F2E6E2] space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F161A]">
              <ShieldCheck className="w-4 h-4 text-[#781D32]" />
              Admin Controls
            </div>
            <p className="text-[11px] text-[#7D6D73]">
              Only administrators can edit brand identity or manage database operations.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {onOpenLogoTheme && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenLogoTheme();
                  }}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-white/80 border border-[#F2E6E2] text-xs font-semibold text-[#1F161A] flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  Logo & Theme
                </button>
              )}
              {onOpenDatabase && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenDatabase();
                  }}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-white/80 border border-[#F2E6E2] text-xs font-semibold text-[#1F161A] flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  MySQL / JDBC
                </button>
              )}
            </div>
          </div>
        )}

        {/* Log Out */}
        <button
          onClick={onLogout}
          className="w-full py-3 px-4 rounded-xl bg-[#FDEEF3] hover:bg-[#F9D2DF] border border-[#F9D2DF] text-[#781D32] font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </div>
  );
};
