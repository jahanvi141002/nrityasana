import React, { useRef } from 'react';
import { Camera, LogOut, X, ShieldCheck, User } from 'lucide-react';
import { UserSession } from '../types';

interface ProfileModalProps {
  session: UserSession;
  onClose: () => void;
  onLogout: () => void;
  onUpdateAvatar: (url: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  session,
  onClose,
  onLogout,
  onUpdateAvatar,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initial = session.email ? session.email.charAt(0).toUpperCase() : 'U';

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
      <div className="bg-[#F7F1E9] max-w-md w-full rounded-[28px] overflow-hidden shadow-2xl border border-[#E8DFC8] p-6 sm:p-7 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DFC8]">
          <h2 className="font-serif text-2xl font-bold text-[#201C1A]">Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#5F554D] hover:text-[#201C1A] cursor-pointer"
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
            <div className="w-24 h-24 rounded-full bg-[#D9A28C] flex items-center justify-center font-bold text-[#4C2921] text-4xl shadow-md overflow-hidden border-2 border-white">
              {session.profilePictureUrl ? (
                <img src={session.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Change picture"
              className="absolute bottom-0 right-0 p-2 rounded-full bg-[#B8543F] text-white hover:bg-[#A3432F] shadow-md transition cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-bold text-[#201C1A] text-lg mt-3">
            {session.email.split('@')[0]}
          </h3>
          <span className="inline-flex items-center gap-1 text-xs text-[#75685F] mt-0.5">
            {session.role === 'ADMIN' ? (
              <span className="text-[#B8543F] font-semibold flex items-center gap-1">
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
        <div className="bg-white/80 rounded-2xl p-4 border border-[#E8DFC8] space-y-3 mb-6">
          <div>
            <span className="text-[11px] font-semibold text-[#75685F] uppercase tracking-wider block">
              Email Address
            </span>
            <p className="text-sm font-medium text-[#201C1A] mt-0.5 break-all">
              {session.email}
            </p>
          </div>

          <div className="border-t border-[#E8DFC8]/60 pt-3">
            <span className="text-[11px] font-semibold text-[#75685F] uppercase tracking-wider block">
              Account Type
            </span>
            <p className="text-sm font-medium text-[#201C1A] mt-0.5">
              {session.role === 'ADMIN' ? 'Admin' : 'Member'}
            </p>
          </div>

          <div className="border-t border-[#E8DFC8]/60 pt-3">
            <span className="text-[11px] font-semibold text-[#75685F] uppercase tracking-wider block">
              Member ID
            </span>
            <p className="text-xs font-mono text-[#5F554D] mt-0.5">
              {session.userId}
            </p>
          </div>
        </div>

        {/* Log Out */}
        <button
          onClick={onLogout}
          className="w-full py-3 px-4 rounded-xl bg-[#FDF2F0] hover:bg-[#FCE5E1] border border-[#F5C2BA] text-[#B8543F] font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </div>
  );
};
