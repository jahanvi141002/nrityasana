import React, { useState, useEffect } from 'react';
import { X, Play, Pause, CheckCircle2, ChevronRight, ChevronLeft, Sun, Footprints, Moon, Sparkles } from 'lucide-react';
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

  const steps = practice.instructions || [
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
        return <Sun className="w-8 h-8 text-[#F6D4A7]" />;
      case 'footprints':
        return <Footprints className="w-8 h-8 text-[#F6D4A7]" />;
      case 'moon':
        return <Moon className="w-8 h-8 text-[#F6D4A7]" />;
      default:
        return <Sparkles className="w-8 h-8 text-[#F6D4A7]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#201C1A] text-white w-full max-w-lg rounded-[28px] overflow-hidden shadow-2xl border border-[#4C423A] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#332B27] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#B8543F] flex items-center justify-center shadow-md">
              {renderIcon()}
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#F6D4A7] uppercase">
                {practice.discipline} • {practice.category}
              </span>
              <h2 className="font-serif text-xl font-bold">{practice.title}</h2>
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
        <div className="p-8 text-center bg-gradient-to-b from-[#201C1A] to-[#2B2523]">
          <div className="text-5xl font-mono font-bold tracking-wider text-[#F6D4A7] mb-2">
            {formatTime(secondsLeft)}
          </div>
          <p className="text-xs text-[#C5B8AE]">
            {isPlaying ? 'Session in motion' : secondsLeft === 0 ? 'Session completed' : 'Paused'}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-[#4C423A] h-2 rounded-full overflow-hidden mt-6">
            <div
              className="bg-[#B8543F] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step Guide */}
        <div className="p-6 bg-[#1A1615] flex-1">
          <div className="flex items-center justify-between text-xs text-[#C5B8AE] mb-3">
            <span className="font-semibold uppercase tracking-wider text-[#F6D4A7]">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <div className="flex gap-1">
              <button
                disabled={currentStepIndex === 0}
                onClick={() => setCurrentStepIndex((prev) => prev - 1)}
                className="p-1 rounded bg-[#2B2523] disabled:opacity-30 hover:bg-[#3B3330] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentStepIndex === steps.length - 1}
                onClick={() => setCurrentStepIndex((prev) => prev + 1)}
                className="p-1 rounded bg-[#2B2523] disabled:opacity-30 hover:bg-[#3B3330] cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#27211F] border border-[#3A322F] text-sm text-[#F0EAE1] leading-relaxed min-h-[85px] flex items-center">
            {steps[currentStepIndex]}
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-t border-[#332B27] flex items-center justify-between gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex-1 py-3 px-4 rounded-xl bg-[#F6D4A7] hover:bg-[#EAC89B] text-[#51261E] font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
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
            className="py-3 px-5 rounded-xl bg-[#B8543F] hover:bg-[#A3432F] text-white font-medium text-sm flex items-center gap-2 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> Complete
          </button>
        </div>
      </div>
    </div>
  );
};
