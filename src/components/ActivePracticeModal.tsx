import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sun,
  Footprints,
  Moon,
  Sparkles,
  Flame,
  Music,
  Heart,
  Utensils,
  Award,
} from 'lucide-react';
import { Practice } from '../types';

interface ActivePracticeModalProps {
  practice: Practice;
  onClose: () => void;
  onComplete: () => void;
}

export const ActivePracticeModal: React.FC<ActivePracticeModalProps> = ({ practice, onClose, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(practice.minutes * 60);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = practice.instructions && practice.instructions.length > 0 ? practice.instructions : [
    'Deep centering breath - ground your feet or sitting bones firmly.',
    'Align spine and soften shoulders downward away from the ears.',
    'Begin measured rhythmic movements synchronized with conscious inhalations and exhalations.',
    'Hold steady focus and notice subtle energetic shifts throughout the body.',
    'Release, ground, and conclude with peaceful gratitude.'
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, secondsLeft]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.round(((practice.minutes * 60 - secondsLeft) / (practice.minutes * 60)) * 100));

  const renderIcon = () => {
    switch (practice.icon) {
      case 'sunny':
        return <Sun className="w-7 h-7 text-[#F6D4A7]" />;
      case 'footprints':
        return <Footprints className="w-7 h-7 text-[#F6D4A7]" />;
      case 'moon':
        return <Moon className="w-7 h-7 text-[#F6D4A7]" />;
      case 'flame':
        return <Flame className="w-7 h-7 text-[#F59E38]" />;
      case 'music':
        return <Music className="w-7 h-7 text-[#F6D4A7]" />;
      case 'heart':
        return <Heart className="w-7 h-7 text-[#F472B6]" />;
      case 'utensils':
        return <Utensils className="w-7 h-7 text-[#A7F3D0]" />;
      default:
        return <Sparkles className="w-7 h-7 text-[#F6D4A7]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#1C1618] text-white w-full max-w-lg rounded-[28px] overflow-hidden shadow-2xl border border-[#3E2D33] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#781D32] flex items-center justify-center shadow-md border border-white/15 shrink-0">
              {renderIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold tracking-widest text-[#F59E38] uppercase">
                  {practice.discipline} • {practice.category}
                </span>
                {practice.level && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-medium">
                    {practice.level}
                  </span>
                )}
                {practice.intensity && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B82B5A]/30 text-[#F9D2DF] font-medium border border-[#B82B5A]/40">
                    {practice.intensity}
                  </span>
                )}
              </div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white mt-0.5">{practice.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timer & Visual Pulse */}
        <div className="p-6 text-center bg-gradient-to-b from-[#1F161A] to-[#2B1B22]">
          <div className="text-5xl font-mono font-bold tracking-wider text-[#F59E38] mb-2">
            {formatTime(secondsLeft)}
          </div>
          <p className="text-xs text-[#F9D2DF]">
            {isPlaying ? 'Session in motion' : secondsLeft === 0 ? 'Session completed' : 'Paused'}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden mt-5">
            <div
              className="bg-gradient-to-r from-[#E25B88] to-[#F59E38] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step Guide & Benefits */}
        <div className="p-5 sm:p-6 bg-[#161013] flex-1 overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-[#F9D2DF] mb-2.5">
              <span className="font-semibold uppercase tracking-wider text-[#F59E38]">
                Movement Step {currentStepIndex + 1} of {steps.length}
              </span>
              <div className="flex gap-1">
                <button
                  disabled={currentStepIndex === 0}
                  onClick={() => setCurrentStepIndex((prev) => prev - 1)}
                  className="p-1 rounded bg-[#2B1B22] disabled:opacity-30 hover:bg-[#3B2530] text-white cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentStepIndex === steps.length - 1}
                  onClick={() => setCurrentStepIndex((prev) => prev + 1)}
                  className="p-1 rounded bg-[#2B1B22] disabled:opacity-30 hover:bg-[#3B2530] text-white cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#23151B] border border-white/10 text-sm text-[#FAF3F0] leading-relaxed min-h-[75px] flex items-center shadow-inner">
              {steps[currentStepIndex]}
            </div>
          </div>

          {/* Benefits bullets */}
          {practice.benefits && practice.benefits.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A7F3D0] flex items-center gap-1.5 mb-2">
                <Award className="w-3.5 h-3.5" /> Key Practice Benefits
              </span>
              <ul className="space-y-1 text-xs text-[#E5D5DA] leading-relaxed">
                {practice.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#F59E38] font-bold">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-5 sm:p-6 border-t border-white/10 flex items-center justify-between gap-4 bg-[#1C1618]">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex-1 py-3 px-4 rounded-xl bg-[#781D32] hover:bg-[#641427] text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" /> Pause session
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Resume practice
              </>
            )}
          </button>

          <button
            onClick={onComplete}
            className="py-3 px-5 rounded-xl bg-gradient-to-r from-[#E25B88] to-[#B82B5A] hover:brightness-110 text-white font-medium text-sm flex items-center gap-2 transition cursor-pointer shadow-xs shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" /> Complete
          </button>
        </div>
      </div>
    </div>
  );
};
