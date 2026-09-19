import React, { useState, useRef, useEffect } from 'react';
import { Camera, LogOut, X, ShieldCheck, User, Palette, Save, CheckCircle2 } from 'lucide-react';
import { UserSession, UserProfile } from '../types';

interface ProfileModalProps {
  session: UserSession;
  userProfile?: UserProfile | null;
  onClose: () => void;
  onLogout: () => void;
  onUpdateAvatar: (url: string) => void;
  onUpdateProfile?: (data: Partial<UserProfile>) => void;
  onOpenLogoTheme?: () => void;
  primaryColor?: string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  session,
  userProfile,
  onClose,
  onLogout,
  onUpdateAvatar,
  onUpdateProfile,
  onOpenLogoTheme,
  primaryColor = '#781D32',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initial = session.email ? session.email.charAt(0).toUpperCase() : 'U';
  const isAdmin = session.role === 'ADMIN';

  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [danceStyle, setDanceStyle] = useState(userProfile?.danceStyle || 'Bharatanatyam');
  const [experienceLevel, setExperienceLevel] = useState(userProfile?.experienceLevel || 'Intermediate');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.phone) setPhone(userProfile.phone);
      if (userProfile.bio) setBio(userProfile.bio);
      if (userProfile.danceStyle) setDanceStyle(userProfile.danceStyle);
      if (userProfile.experienceLevel) setExperienceLevel(userProfile.experienceLevel);
    }
  }, [userProfile]);

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      phone: phone.trim(),
      bio: bio.trim(),
      danceStyle,
      experienceLevel,
    };

    if (onUpdateProfile) {
      onUpdateProfile(payload);
    }

    try {
      await fetch(`/api/profile/${session.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save profile to database:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FDF8F5] max-w-md w-full max-h-[90vh] overflow-y-auto rounded-[28px] shadow-2xl border border-[#F2E6E2] p-6 sm:p-7 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F2E6E2]">
          <h2 className="font-serif text-2xl font-bold text-[#1F161A]">Profile & Practice Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#6B5C62] hover:text-[#1F161A] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center my-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          <div className="relative">
            <div className="w-22 h-22 rounded-full bg-[#781D32] flex items-center justify-center font-bold text-white text-3xl shadow-md overflow-hidden border-2 border-white ring-2 ring-[#781D32]/20">
              {session.profilePictureUrl ? (
                <img src={session.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Change picture"
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#781D32] text-white hover:bg-[#641427] shadow-md transition cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <h3 className="font-bold text-[#1F161A] text-lg mt-2.5">
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

        {/* Editable Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-3.5 mb-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#7D6D73] uppercase tracking-wider mb-1">
                Primary Discipline
              </label>
              <select
                value={danceStyle}
                onChange={(e) => setDanceStyle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#EADBDA] text-[#1F161A] focus:outline-none focus:border-[#781D32]"
              >
                <option value="Bharatanatyam">Bharatanatyam</option>
                <option value="Kathak">Kathak</option>
                <option value="Odissi">Odissi</option>
                <option value="Kuchipudi">Kuchipudi</option>
                <option value="Classical Yoga">Classical Yoga</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#7D6D73] uppercase tracking-wider mb-1">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#EADBDA] text-[#1F161A] focus:outline-none focus:border-[#781D32]"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Acharya / Master">Acharya / Master</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7D6D73] uppercase tracking-wider mb-1">
              WhatsApp / Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#EADBDA] text-[#1F161A] focus:outline-none focus:border-[#781D32]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7D6D73] uppercase tracking-wider mb-1">
              Personal Movement Reflection & Bio
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="E.g., Devoting morning hours to Aramandi balance and mudra clarity."
              className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#EADBDA] text-[#1F161A] focus:outline-none focus:border-[#781D32] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-2.5 px-4 rounded-xl bg-[#781D32] hover:bg-[#641427] text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                Profile Updated in Database!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Profile Changes'}
              </>
            )}
          </button>
        </form>

        {/* Administrator Workstation Shortcuts - ADMIN ONLY */}
        {isAdmin && onOpenLogoTheme && (
          <div className="mb-5 p-3.5 rounded-2xl bg-[#FAF3F0] border border-[#F2E6E2] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F161A]">
              <ShieldCheck className="w-4 h-4 text-[#781D32]" />
              Admin Branding Controls
            </div>
            <p className="text-[11px] text-[#7D6D73]">
              Administrators can customize the brand logo and application theme colors.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenLogoTheme();
              }}
              className="w-full px-3 py-2 rounded-xl bg-white hover:bg-white/80 border border-[#F2E6E2] text-xs font-semibold text-[#1F161A] flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer"
            >
              <Palette className="w-4 h-4" style={{ color: primaryColor }} />
              Customize Logo & Theme
            </button>
          </div>
        )}

        {/* Log Out */}
        <button
          onClick={onLogout}
          className="w-full py-2.5 px-4 rounded-xl bg-[#FDEEF3] hover:bg-[#F9D2DF] border border-[#F9D2DF] text-[#781D32] font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </div>
  );
};
