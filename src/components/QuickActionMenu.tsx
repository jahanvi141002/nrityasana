import React, { useState } from 'react';
import { Plus, X, Sparkles, Heart, Activity, Check, Clock } from 'lucide-react';
import { DisciplineType, UserSession, MoodLog } from '../types';
import { triggerHapticFeedback } from '../utils/sound';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface QuickActionMenuProps {
  session?: UserSession | null;
  primaryColor?: string;
  onPracticeLogged?: (title: string, discipline: string, minutes: number) => void;
  onMoodRecorded?: (moodLog: MoodLog) => void;
  onShowToast?: (title: string, message: string) => void;
  onOpenPranayama?: () => void;
}

const DISCIPLINE_OPTIONS: { id: DisciplineType; label: string; icon: string }[] = [
  { id: 'Yoga', label: 'Yoga Flow', icon: '🧘' },
  { id: 'Kathak', label: 'Kathak Dance', icon: '🦶' },
  { id: 'Semi-Classical', label: 'Semi-Classical', icon: '🌸' },
  { id: 'Zumba', label: 'Zumba Cardio', icon: '🔥' },
  { id: 'Bollywood', label: 'Bollywood Beat', icon: '💃' },
  { id: 'Meditation', label: 'Meditation / Pranayama', icon: '🕊️' },
];

const QUICK_PRESETS = [
  { title: 'Morning Surya Namaskar', discipline: 'Yoga' as DisciplineType, minutes: 12 },
  { title: 'Kathak Tatkar Speed Drills', discipline: 'Kathak' as DisciplineType, minutes: 15 },
  { title: 'Expressive Semi-Classical Mudras', discipline: 'Semi-Classical' as DisciplineType, minutes: 10 },
  { title: 'High-Energy Zumba Cardio', discipline: 'Zumba' as DisciplineType, minutes: 15 },
  { title: 'Nadi Shodhana Pranayama', discipline: 'Meditation' as DisciplineType, minutes: 8 },
  { title: 'Restorative Yin Yoga Stretch', discipline: 'Yoga' as DisciplineType, minutes: 20 },
];

const MOOD_OPTIONS = [
  { mood: 'Peaceful & Centered', emoji: '🕊️', bhav: 'Shanta Rasa', desc: 'Serene mental stillness, balanced prana' },
  { mood: 'Joyful & Blissful', emoji: '✨', bhav: 'Hasya / Ananda', desc: 'Radiant inner uplift and lightness' },
  { mood: 'Vibrant & Fierce', emoji: '🔥', bhav: 'Veera Rasa', desc: 'Driven, courageous, high stamina' },
  { mood: 'Devotional & Loving', emoji: '💖', bhav: 'Shringara / Bhakti', desc: 'Deep heart connection and beauty' },
  { mood: 'Grounded & Earthy', emoji: '🍃', bhav: 'Prithvi Sthiti', desc: 'Calm, rooted, gentle presence' },
  { mood: 'Fatigued / Needs Rest', emoji: '🌧️', bhav: 'Vishada / Shrama', desc: 'Gentle restorative healing needed' },
];

export const QuickActionMenu: React.FC<QuickActionMenuProps> = ({
  session,
  primaryColor = '#781D32',
  onPracticeLogged,
  onMoodRecorded,
  onShowToast,
  onOpenPranayama,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'practice' | 'mood' | null>(null);

  // Quick Practice Form State
  const [practiceTitle, setPracticeTitle] = useState('Mindful Movement Flow');
  const [practiceDiscipline, setPracticeDiscipline] = useState<DisciplineType>('Yoga');
  const [practiceMinutes, setPracticeMinutes] = useState(15);
  const [practiceNote, setPracticeNote] = useState('');
  const [isSavingPractice, setIsSavingPractice] = useState(false);

  // Record Mood Form State
  const [selectedMood, setSelectedMood] = useState(MOOD_OPTIONS[0]);
  const [energyLevel, setEnergyLevel] = useState(4);
  const [moodNote, setMoodNote] = useState('');
  const [isSavingMood, setIsSavingMood] = useState(false);

  const toggleMenu = () => {
    triggerHapticFeedback('selection');
    setIsOpen((prev) => !prev);
  };

  const openPracticeModal = () => {
    triggerHapticFeedback('light');
    setIsOpen(false);
    setActiveModal('practice');
  };

  const openMoodModal = () => {
    triggerHapticFeedback('light');
    setIsOpen(false);
    setActiveModal('mood');
  };

  const handleSelectPreset = (preset: typeof QUICK_PRESETS[0]) => {
    triggerHapticFeedback('light');
    setPracticeTitle(preset.title);
    setPracticeDiscipline(preset.discipline);
    setPracticeMinutes(preset.minutes);
  };

  // Submit Quick Practice without screen change
  const handleSubmitPractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceTitle.trim()) return;
    setIsSavingPractice(true);
    triggerHapticFeedback('selection');

    const logId = 'log-' + Date.now();
    const userId = session?.userId || 'guest-user';

    try {
      // 1. Save to Firestore
      if (session?.userId) {
        await setDoc(doc(db, 'users', userId, 'practice_logs', logId), {
          id: logId,
          userId,
          practiceId: 'quick-log-' + Date.now(),
          title: practiceTitle,
          discipline: practiceDiscipline,
          minutesPracticed: Number(practiceMinutes),
          notes: practiceNote.trim() || undefined,
          completedAt: new Date().toISOString(),
        });
      }

      // 2. Save via API for sync
      fetch('/api/progress/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          practiceId: 'quick-log-' + Date.now(),
          title: practiceTitle,
          discipline: practiceDiscipline,
          minutes: Number(practiceMinutes),
        }),
      }).catch(() => {});

      if (onPracticeLogged) {
        onPracticeLogged(practiceTitle, practiceDiscipline, Number(practiceMinutes));
      }

      if (onShowToast) {
        onShowToast(
          'Quick Practice Logged! 🧘',
          `Added ${practiceMinutes}m of ${practiceDiscipline} ("${practiceTitle}") to your sacred rhythm.`
        );
      }

      setActiveModal(null);
      setPracticeTitle('Mindful Movement Flow');
      setPracticeNote('');
    } catch {
      if (onShowToast) {
        onShowToast('Practice Saved', `Recorded ${practiceMinutes}m ${practiceDiscipline} locally.`);
      }
      setActiveModal(null);
    } finally {
      setIsSavingPractice(false);
    }
  };

  // Submit Record Mood without screen change
  const handleSubmitMood = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMood(true);
    triggerHapticFeedback('selection');

    const moodId = 'mood-' + Date.now();
    const userId = session?.userId || 'guest-user';
    const nowIso = new Date().toISOString();

    const moodLog: MoodLog = {
      id: moodId,
      userId,
      mood: selectedMood.mood,
      emoji: selectedMood.emoji,
      energyLevel,
      notes: moodNote.trim() || undefined,
      bhavRasa: selectedMood.bhav,
      recordedAt: nowIso,
    };

    try {
      // Save to Firestore
      if (session?.userId) {
        await setDoc(doc(db, 'users', userId, 'mood_logs', moodId), moodLog);
      }

      // Save to local storage for instant offline access
      try {
        const existing = JSON.parse(localStorage.getItem('nrityasana_mood_logs') || '[]');
        localStorage.setItem('nrityasana_mood_logs', JSON.stringify([moodLog, ...existing]));
      } catch {}

      if (onMoodRecorded) {
        onMoodRecorded(moodLog);
      }

      if (onShowToast) {
        onShowToast(
          `${selectedMood.emoji} Mood & Bhav Recorded`,
          `Felt "${selectedMood.mood}" (${selectedMood.bhav}) with Energy ${energyLevel}/5.`
        );
      }

      setActiveModal(null);
      setMoodNote('');
    } catch {
      if (onShowToast) {
        onShowToast('Mood Saved', `Logged ${selectedMood.mood} to your journal.`);
      }
      setActiveModal(null);
    } finally {
      setIsSavingMood(false);
    }
  };

  return (
    <>
      {/* Floating Speed-Dial Menu Items (Expands above bottom navigation) */}
      <div className="fixed bottom-19 right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-none">
        {isOpen && (
          <div className="flex flex-col items-end gap-2.5 mb-1.5 pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-200">
            {/* Action 1: Quick Practice */}
            <div className="flex items-center gap-2.5">
              <span className="bg-[#1F161A]/90 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md border border-white/10 backdrop-blur-md">
                Log Quick Practice
              </span>
              <button
                type="button"
                onClick={openPracticeModal}
                title="Log Quick Practice"
                className="w-12 h-12 rounded-2xl bg-white text-[#781D32] hover:bg-[#FAF3F0] border border-[#EADBDB] shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                style={{ borderColor: `${primaryColor}40` }}
              >
                <span className="text-xl">🧘</span>
              </button>
            </div>

            {/* Action 2: Record Mood */}
            <div className="flex items-center gap-2.5">
              <span className="bg-[#1F161A]/90 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md border border-white/10 backdrop-blur-md">
                Record Mood & Bhav
              </span>
              <button
                type="button"
                onClick={openMoodModal}
                title="Record Mood & Energy"
                className="w-12 h-12 rounded-2xl bg-white text-[#E11D48] hover:bg-[#FAF3F0] border border-[#EADBDB] shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                style={{ borderColor: `${primaryColor}40` }}
              >
                <span className="text-xl">🌸</span>
              </button>
            </div>

            {/* Action 3: 1-min Pranayama Pause */}
            {onOpenPranayama && (
              <div className="flex items-center gap-2.5">
                <span className="bg-[#1F161A]/90 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md border border-white/10 backdrop-blur-md">
                  1-min Pranayama Pause
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenPranayama();
                  }}
                  title="1-minute Pranayama Guided Breath"
                  className="w-12 h-12 rounded-2xl bg-white text-[#781D32] hover:bg-[#FAF3F0] border border-[#EADBDB] shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                  style={{ borderColor: `${primaryColor}40` }}
                >
                  <span className="text-xl">🌬️</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Master Floating Quick Action Button */}
        <button
          id="floating-quick-action-button"
          type="button"
          onClick={toggleMenu}
          title={isOpen ? 'Close Quick Action Menu' : 'Open Quick Action Menu'}
          className="pointer-events-auto w-13 h-13 rounded-2xl text-white shadow-[0_8px_25px_rgba(120,29,50,0.35)] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-92 cursor-pointer relative group border-2 border-white/30"
          style={{ backgroundColor: primaryColor }}
        >
          {/* Subtle Glow Ring */}
          <span
            className="absolute inset-0 rounded-2xl opacity-40 blur-xs transition-opacity"
            style={{ backgroundColor: primaryColor }}
          />

          {/* Icon with rotation */}
          <div className={`relative z-10 transition-transform duration-200 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>

          {/* Tooltip Badge on Hover when closed */}
          {!isOpen && (
            <span className="absolute -top-8 right-0 bg-[#1F161A] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xs pointer-events-none">
              Quick Action
            </span>
          )}
        </button>
      </div>

      {/* Backdrop for open speed dial */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/25 backdrop-blur-[1px] animate-in fade-in duration-200"
        />
      )}

      {/* MODAL 1: QUICK PRACTICE LOG (Without changing screen) */}
      {activeModal === 'practice' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF6F3] w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl border border-[#EADBDB] flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-[#EADBDB] flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl text-white flex items-center justify-center shadow-xs text-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  🧘
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1F161A]">Log Quick Practice</h3>
                  <p className="text-xs text-[#7D6D73]">Record session instantly without leaving this view</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-xl bg-black/5 hover:bg-black/10 text-[#6B5C62] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitPractice} className="p-5 overflow-y-auto space-y-4">
              {/* Presets Chips */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#781D32] block mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#F59E38]" /> Quick Routine Presets
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2 rounded-xl text-left border text-xs transition cursor-pointer ${
                        practiceTitle === preset.title
                          ? 'bg-[#781D32] text-white border-[#781D32] font-semibold shadow-2xs'
                          : 'bg-white hover:bg-[#FAF3F0] text-[#1F161A] border-[#EADBDB]'
                      }`}
                    >
                      <div className="truncate font-medium">{preset.title}</div>
                      <div className={`text-[10px] ${practiceTitle === preset.title ? 'text-white/80' : 'text-[#8C7B82]'}`}>
                        {preset.discipline} • {preset.minutes} min
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7D6D73] block mb-1">
                  Practice Name
                </label>
                <input
                  type="text"
                  required
                  value={practiceTitle}
                  onChange={(e) => setPracticeTitle(e.target.value)}
                  placeholder="e.g. 15-min Surya Namaskar & Tatkar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EADBDB] text-xs font-semibold text-[#1F161A] focus:outline-none focus:ring-2 focus:ring-[#781D32]"
                />
              </div>

              {/* Discipline Select */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7D6D73] block mb-1.5">
                  Discipline
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {DISCIPLINE_OPTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        triggerHapticFeedback('light');
                        setPracticeDiscipline(item.id);
                      }}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                        practiceDiscipline === item.id
                          ? 'bg-white border-[#781D32] shadow-xs text-[#781D32] font-bold ring-1.5 ring-[#781D32]'
                          : 'bg-white/70 hover:bg-white border-[#EADBDB] text-[#6B5C62]'
                      }`}
                    >
                      <div className="text-sm">{item.icon}</div>
                      <div className="text-[10px] mt-0.5 truncate">{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Minutes Duration */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#7D6D73] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#781D32]" /> Duration
                  </label>
                  <span className="font-mono text-xs font-bold text-[#781D32] bg-[#FAF3F0] px-2 py-0.5 rounded-full border border-[#EADBDB]">
                    {practiceMinutes} minutes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[5, 10, 15, 20, 30, 45].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        triggerHapticFeedback('light');
                        setPracticeMinutes(m);
                      }}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                        practiceMinutes === m
                          ? 'bg-[#781D32] text-white shadow-2xs'
                          : 'bg-white hover:bg-[#FAF3F0] text-[#6B5C62] border border-[#EADBDB]'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7D6D73] block mb-1">
                  Mindful Reflection / Sensation (Optional)
                </label>
                <textarea
                  value={practiceNote}
                  onChange={(e) => setPracticeNote(e.target.value)}
                  placeholder="How did your alignment, mudras, or breath feel today?"
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#EADBDB] text-xs text-[#1F161A] focus:outline-none focus:ring-2 focus:ring-[#781D32] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#EADBDB]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B5C62] hover:bg-black/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPractice}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSavingPractice ? 'Recording...' : 'Log Practice Now'}
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD MOOD & BHAV (Without changing screen) */}
      {activeModal === 'mood' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF6F3] w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl border border-[#EADBDB] flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-[#EADBDB] flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl text-white flex items-center justify-center shadow-xs text-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  🌸
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1F161A]">Record Mood & Bhav</h3>
                  <p className="text-xs text-[#7D6D73]">Tune into your prana, feelings, and inner landscape</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-xl bg-black/5 hover:bg-black/10 text-[#6B5C62] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitMood} className="p-5 overflow-y-auto space-y-4">
              {/* Mood Options Grid */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#781D32] block mb-2 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-[#E11D48]" /> How is your spirit feeling right now?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MOOD_OPTIONS.map((item, idx) => {
                    const isSelected = selectedMood.mood === item.mood;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          triggerHapticFeedback('light');
                          setSelectedMood(item);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white border-[#781D32] shadow-sm ring-1.5 ring-[#781D32]'
                            : 'bg-white/80 hover:bg-white border-[#EADBDB]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item.emoji}</span>
                          <span className={`text-xs font-bold ${isSelected ? 'text-[#781D32]' : 'text-[#1F161A]'}`}>
                            {item.mood}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#781D32] font-semibold mt-1 font-mono">
                          {item.bhav}
                        </div>
                        <div className="text-[10px] text-[#8C7B82] mt-0.5 line-clamp-1">
                          {item.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Energy Level Slider */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#EADBDB] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1F161A] flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" /> Prana Energy Level
                  </span>
                  <span className="font-mono font-bold text-[#781D32] bg-[#FAF3F0] px-2 py-0.5 rounded-full border border-[#EADBDB]">
                    Level {energyLevel} / 5
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        triggerHapticFeedback('light');
                        setEnergyLevel(lvl);
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex flex-col items-center gap-0.5 ${
                        energyLevel === lvl
                          ? 'bg-[#781D32] text-white shadow-xs'
                          : 'bg-[#FAF3F0] hover:bg-[#F2E6E2] text-[#6B5C62]'
                      }`}
                    >
                      <span className="text-sm">{lvl <= 2 ? '🌱' : lvl <= 4 ? '✨' : '🔥'}</span>
                      <span className="font-mono text-[10px]">{lvl}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mindful Journal Note */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7D6D73] block mb-1">
                  Gratitude or Mindful Note (Optional)
                </label>
                <textarea
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  placeholder="A word of gratitude, rhythm observation, or sacred intention..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#EADBDB] text-xs text-[#1F161A] focus:outline-none focus:ring-2 focus:ring-[#781D32] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#EADBDB]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B5C62] hover:bg-black/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingMood}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSavingMood ? 'Saving...' : 'Record Mood Now'}
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
