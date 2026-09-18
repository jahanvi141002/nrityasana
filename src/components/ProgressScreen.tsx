import React, { useState } from 'react';
import { Check, Trophy, CalendarCheck } from 'lucide-react';

export const ProgressScreen: React.FC = () => {
  const [completedDays, setCompletedDays] = useState<boolean[]>([true, true, true, false, false, false, false]);
  const [gentleGoal] = useState(5);

  const daysLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const fullDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const completedCount = completedDays.filter(Boolean).length;
  const progressRatio = Math.min(1, completedCount / gentleGoal);
  const remainingCount = Math.max(0, gentleGoal - completedCount);

  const toggleDay = (index: number) => {
    setCompletedDays((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <div id="progress-screen" className="pb-28 pt-8 px-4 sm:px-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F161A] tracking-tight">
          Your rhythm
        </h1>
        <p className="mt-1.5 text-[#6B5C62] text-sm sm:text-base">
          Small daily steps weave effortless movement.
        </p>
      </div>

      {/* Hero Stats Card */}
      <div className="mb-8 p-6 rounded-[26px] bg-gradient-to-br from-[#781D32] via-[#861F37] to-[#591223] text-white shadow-md border border-[#942E46] relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-[#E25B88]/20 blur-xl pointer-events-none" />
        
        <span className="text-[11px] font-bold text-[#F59E38] tracking-[1.4px] uppercase block">
          THIS WEEK
        </span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {completedCount} practices
          </span>
          <span className="text-xs text-[#F9D2DF]">
            Goal: {gentleGoal} sessions
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
