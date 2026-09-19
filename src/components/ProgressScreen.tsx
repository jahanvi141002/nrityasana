import React, { useState, useEffect } from 'react';
import { Check, Trophy, CalendarCheck, Flame, Clock, Sparkles } from 'lucide-react';
import { UserSession, PracticeLog } from '../types';

interface ProgressScreenProps {
  session: UserSession;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ session }) => {
  const [completedDays, setCompletedDays] = useState<boolean[]>([true, true, true, false, false, false, false]);
  const [gentleGoal, setGentleGoal] = useState(5);
  const [currentStreak, setCurrentStreak] = useState(4);
  const [totalMinutes, setTotalMinutes] = useState(215);
  const [completedSessions, setCompletedSessions] = useState(14);
  const [recentLogs, setRecentLogs] = useState<PracticeLog[]>([]);

  const daysLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const fullDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Load user progress from database API
  useEffect(() => {
    fetch(`/api/progress/${session.userId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (Array.isArray(data.completedDays)) {
            setCompletedDays(data.completedDays);
          }
          if (typeof data.currentStreak === 'number') setCurrentStreak(data.currentStreak);
          if (typeof data.totalMinutes === 'number') setTotalMinutes(data.totalMinutes);
          if (typeof data.completedSessions === 'number') setCompletedSessions(data.completedSessions);
          if (typeof data.weeklyGoal === 'number') setGentleGoal(data.weeklyGoal);
          if (Array.isArray(data.logs)) setRecentLogs(data.logs);
        }
      })
      .catch((err) => console.warn('Progress load notice:', err));
  }, [session.userId]);

  const completedCount = completedDays.filter(Boolean).length;
  const progressRatio = Math.min(1, completedCount / gentleGoal);
  const remainingCount = Math.max(0, gentleGoal - completedCount);

  const toggleDay = async (index: number) => {
    // Optimistic UI update
    setCompletedDays((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });

    try {
      const res = await fetch('/api/progress/toggle-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.userId, dayIndex: index }),
      });
      if (res.ok) {
        const result = await res.json();
        if (Array.isArray(result.completedDays)) {
          setCompletedDays(result.completedDays);
        }
      }
    } catch (err) {
      console.error('Failed to sync day toggle to DB:', err);
    }
  };

  const formatLogDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div id="progress-screen" className="pb-28 pt-8 px-4 sm:px-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F161A] tracking-tight">
          Your rhythm
        </h1>
        <p className="mt-1.5 text-[#6B5C62] text-sm sm:text-base">
          Small daily steps weave effortless movement and inner strength.
        </p>
      </div>

      {/* Hero Stats Card */}
      <div className="mb-6 p-6 rounded-[26px] bg-gradient-to-br from-[#781D32] via-[#861F37] to-[#591223] text-white shadow-md border border-[#942E46] relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-[#E25B88]/20 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#F59E38] tracking-[1.4px] uppercase block">
            THIS WEEK'S RHYTHM
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold text-white border border-white/20 backdrop-blur-xs">
            <Flame className="w-3.5 h-3.5 text-[#F59E38] fill-current" />
            {currentStreak} Day Streak
          </span>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <span className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {completedCount} of {gentleGoal}
          </span>
          <span className="text-xs text-[#F9D2DF]">
            {totalMinutes} min practiced total
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/25 h-2 rounded-full overflow-hidden mt-5">
          <div
            className="bg-gradient-to-r from-[#E25B88] to-[#F59E38] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.round(progressRatio * 100)}%` }}
          />
        </div>

        <p className="mt-3 text-xs text-[#F9D2DF] flex items-center gap-1.5">
          {remainingCount === 0 ? (
            <span className="text-[#F59E38] font-semibold flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> Gentle weekly goal achieved!
            </span>
          ) : (
            `${remainingCount} more to reach your weekly rhythm`
          )}
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3.5 mb-7">
        <div className="p-4 rounded-2xl bg-white/85 border border-[#F2E6E2] shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B5C62]">
            <Clock className="w-4 h-4 text-[#781D32]" />
            Total Time
          </div>
          <p className="font-serif text-2xl font-bold text-[#1F161A] mt-1.5">
            {totalMinutes} <span className="text-xs font-sans text-[#7D6D73] font-normal">mins</span>
          </p>
          <span className="text-[11px] text-[#7D6D73] mt-0.5 block">Across all yoga & dance</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/85 border border-[#F2E6E2] shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B5C62]">
            <Sparkles className="w-4 h-4 text-[#B86B14]" />
            Sessions Completed
          </div>
          <p className="font-serif text-2xl font-bold text-[#1F161A] mt-1.5">
            {completedSessions} <span className="text-xs font-sans text-[#7D6D73] font-normal">practices</span>
          </p>
          <span className="text-[11px] text-[#7D6D73] mt-0.5 block">Stored in sacred journal</span>
        </div>
      </div>

      {/* Consistency Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1F161A]">
            Consistency, not intensity
          </h2>
          <span className="text-xs text-[#7D6D73]">Tap to log day</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {daysLabels.map((label, index) => {
            const isDone = completedDays[index];
            return (
              <div key={index} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => toggleDay(index)}
                  title={`${fullDayNames[index]}: ${isDone ? 'Completed' : 'Not completed'}`}
                  className={`w-full h-14 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                    isDone
                      ? 'bg-[#781D32] text-white hover:bg-[#641427] ring-2 ring-[#781D32]/25'
                      : 'bg-[#F2E6E2] text-transparent hover:bg-[#EADBDA]'
                  }`}
                >
                  {isDone && <Check className="w-5 h-5 stroke-[2.5]" />}
                </button>
                <span className="text-xs text-[#7D6D73] mt-2 font-medium">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Practice Log History if present */}
      {recentLogs.length > 0 && (
        <div className="mb-8">
          <h2 className="font-serif text-xl font-bold text-[#1F161A] mb-3">
            Recent practice records
          </h2>
          <div className="space-y-2.5">
            {recentLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-white/80 border border-[#F2E6E2] flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-[#1F161A] text-sm">{log.title}</p>
                  <p className="text-[#7D6D73] mt-0.5">
                    {log.discipline} • {log.minutesPracticed} minutes
                  </p>
                </div>
                <span className="text-[11px] text-[#94848A]">
                  {formatLogDate(log.completedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gentle Reflection Box */}
      <div className="p-5 rounded-[22px] bg-white/85 border border-[#F2E6E2] flex items-start gap-3.5 shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-[#FEF5EA] border border-[#FCE6CA] flex items-center justify-center shrink-0 text-[#B86B14]">
          <CalendarCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-[#1F161A]">
            Mindful movement note
          </h3>
          <p className="text-xs text-[#6B5C62] mt-1 leading-relaxed">
            In Indian classical dance and yoga alike, true grace arrives through repetitive stillness. Even ten minutes of Aramandi or gentle Surya Namaskar strengthens neuromuscular memory.
          </p>
        </div>
      </div>
    </div>
  );
};
