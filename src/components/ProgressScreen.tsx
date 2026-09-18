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
    <div id="progress-screen" className="pb-24 pt-8 px-4 sm:px-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#201C1A] tracking-tight">
          Your rhythm
        </h1>
        <p className="mt-2 text-[#5F554D] text-base">
          Small steps become a language.
        </p>
      </div>

      {/* Hero Stats Card */}
      <div className="mb-8 p-6 rounded-[26px] bg-[#201C1A] text-white shadow-sm border border-[#332B27]">
        <span className="text-[11px] font-bold text-[#F6D4A7] tracking-[1.4px] uppercase block">
          THIS WEEK
        </span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {completedCount} practices
          </span>
          <span className="text-xs text-[#C5B8AE]">
            Goal: {gentleGoal} sessions
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#4C423A]/50 h-2 rounded-full overflow-hidden mt-5">
          <div
            className="bg-[#F6D4A7] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.round(progressRatio * 100)}%` }}
          />
        </div>

        <p className="mt-3 text-xs text-[#C5B8AE] flex items-center gap-1.5">
          {remainingCount === 0 ? (
            <span className="text-[#F6D4A7] font-semibold flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> Gentle weekly goal achieved!
            </span>
          ) : (
            `${remainingCount} more to reach your gentle goal`
          )}
        </p>
      </div>

      {/* Consistency Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#201C1A]">
            Consistency, not intensity
          </h2>
          <span className="text-xs text-[#75685F]">Tap to log day</span>
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
                      ? 'bg-[#B8543F] text-white hover:bg-[#A3432F] ring-2 ring-[#B8543F]/20'
                      : 'bg-[#E5DCD2] text-transparent hover:bg-[#DDD3C7]'
                  }`}
                >
                  {isDone && <Check className="w-5 h-5 stroke-[2.5]" />}
                </button>
                <span className="text-xs text-[#75685F] mt-2 font-medium">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gentle Reflection Box */}
      <div className="p-5 rounded-[22px] bg-white/70 border border-[#E8DFC8] flex items-start gap-3.5 shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-[#F6D4A7]/60 flex items-center justify-center shrink-0 text-[#51261E]">
          <CalendarCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-[#201C1A]">
            Mindful movement note
          </h3>
          <p className="text-xs text-[#5F554D] mt-1 leading-relaxed">
            In Indian classical dance and yoga alike, true grace arrives through repetitive stillness. Even ten minutes of Aramandi or gentle Surya Namaskar strengthens neuromuscular memory.
          </p>
        </div>
      </div>
    </div>
  );
};
