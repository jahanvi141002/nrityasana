import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Wind,
  CheckCircle2,
  Minimize2,
} from 'lucide-react';
import { triggerHapticFeedback, playSingingBowlChime } from '../utils/sound';

export interface PranayamaBreathOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  primaryColor?: string;
  onCompleted?: (minutes: number) => void;
}

type PranayamaMode = 'sama-vritti' | 'nadi-shodhana' | 'deep-calm';

interface BreathPattern {
  id: PranayamaMode;
  name: string;
  sanskrit: string;
  description: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
}

const PATTERNS: Record<PranayamaMode, BreathPattern> = {
  'sama-vritti': {
    id: 'sama-vritti',
    name: 'Sama Vritti (Box Breath)',
    sanskrit: 'समवृत्ति प्राणायाम',
    description: 'Equal four-part breathing to stabilize nervous system & focus mind',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
  },
  'nadi-shodhana': {
    id: 'nadi-shodhana',
    name: 'Nadi Shodhana Rhythm',
    sanskrit: 'नाड़ी शोधन प्राणायाम',
    description: 'Harmonize Ida & Pingala energy channels for inner tranquility',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 2,
  },
  'deep-calm': {
    id: 'deep-calm',
    name: 'Deep Prana Relaxation',
    sanskrit: 'दीर्घ प्राणायाम',
    description: 'Prolonged exhalation to activate vagal nerve and dissolve tension',
    inhale: 4,
    holdIn: 2,
    exhale: 6,
    holdOut: 2,
  },
};

const TOTAL_SESSION_SECONDS = 60; // 1-minute guided breath pause

export const PranayamaBreathOverlay: React.FC<PranayamaBreathOverlayProps> = ({
  isOpen,
  onClose,
  primaryColor = '#781D32',
  onCompleted,
}) => {
  const [selectedMode, setSelectedMode] = useState<PranayamaMode>('sama-vritti');
  const [isActive, setIsActive] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(TOTAL_SESSION_SECONDS);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [breathCyclesCount, setBreathCyclesCount] = useState(0);

  // Phase tracker
  const [currentPhase, setCurrentPhase] = useState<'Inhale' | 'Hold In' | 'Exhale' | 'Hold Out'>('Inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(PATTERNS['sama-vritti'].inhale);

  const pattern = PATTERNS[selectedMode];

  // Sound chime ref to avoid multi-firing
  const lastPhaseRef = useRef<string>('Inhale');

  // Reset when overlay opens
  useEffect(() => {
    if (isOpen) {
      setIsActive(true);
      setSecondsRemaining(TOTAL_SESSION_SECONDS);
      setIsCompleted(false);
      setBreathCyclesCount(0);
      setCurrentPhase('Inhale');
      setPhaseSecondsLeft(pattern.inhale);
      lastPhaseRef.current = 'Inhale';
      triggerHapticFeedback('selection');
      if (soundEnabled) {
        playSingingBowlChime();
      }
    }
  }, [isOpen, selectedMode]);

  // Main countdown & phase scheduler
  useEffect(() => {
    if (!isOpen || !isActive || isCompleted) return;

    const timer = setInterval(() => {
      // 1. Overall session countdown
      setSecondsRemaining((prevSec) => {
        if (prevSec <= 1) {
          setIsCompleted(true);
          setIsActive(false);
          triggerHapticFeedback('selection');
          if (soundEnabled) playSingingBowlChime();
          if (onCompleted) onCompleted(1);
          return 0;
        }
        return prevSec - 1;
      });

      // 2. Phase-level countdown
      setPhaseSecondsLeft((prevPhaseSec) => {
        if (prevPhaseSec <= 1) {
          // Transition to next phase
          let nextPhase: 'Inhale' | 'Hold In' | 'Exhale' | 'Hold Out' = 'Inhale';
          let nextDuration = pattern.inhale;

          if (currentPhase === 'Inhale') {
            nextPhase = pattern.holdIn > 0 ? 'Hold In' : 'Exhale';
            nextDuration = pattern.holdIn > 0 ? pattern.holdIn : pattern.exhale;
          } else if (currentPhase === 'Hold In') {
            nextPhase = 'Exhale';
            nextDuration = pattern.exhale;
          } else if (currentPhase === 'Exhale') {
            nextPhase = pattern.holdOut > 0 ? 'Hold Out' : 'Inhale';
            nextDuration = pattern.holdOut > 0 ? pattern.holdOut : pattern.inhale;
            if (pattern.holdOut <= 0) {
              setBreathCyclesCount((c) => c + 1);
            }
          } else if (currentPhase === 'Hold Out') {
            nextPhase = 'Inhale';
            nextDuration = pattern.inhale;
            setBreathCyclesCount((c) => c + 1);
          }

          setCurrentPhase(nextPhase);
          triggerHapticFeedback('light');
          if (soundEnabled && nextPhase !== lastPhaseRef.current) {
            playSingingBowlChime();
            lastPhaseRef.current = nextPhase;
          }

          return nextDuration;
        }
        return prevPhaseSec - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isActive, isCompleted, currentPhase, pattern, soundEnabled, onCompleted]);

  if (!isOpen) return null;

  // Determine animation scale factor based on phase
  let orbScale = 'scale-100';
  let phaseColor = 'text-[#F59E38]';
  let phaseInstruction = 'Deep conscious inhalation through both nostrils';
  let sanskritAction = 'पूरक (Pūraka)';

  if (currentPhase === 'Inhale') {
    orbScale = 'scale-125';
    phaseColor = 'text-[#F59E38]';
    phaseInstruction = 'Inhale Prana deeply into your belly and chest';
    sanskritAction = 'पूरक • Inhale';
  } else if (currentPhase === 'Hold In') {
    orbScale = 'scale-120';
    phaseColor = 'text-emerald-400';
    phaseInstruction = 'Retain prana gently with soft throat and relaxed eyes';
    sanskritAction = 'अन्तर कुम्भक • Retain Stillness';
  } else if (currentPhase === 'Exhale') {
    orbScale = 'scale-85';
    phaseColor = 'text-rose-300';
    phaseInstruction = 'Slow, complete exhalation; surrender all muscular tension';
    sanskritAction = 'रेचक • Exhale & Release';
  } else if (currentPhase === 'Hold Out') {
    orbScale = 'scale-80';
    phaseColor = 'text-amber-200';
    phaseInstruction = 'Rest in the peaceful stillness before the next breath';
    sanskritAction = 'बाह्य कुम्भक • Rest in Emptiness';
  }

  const secondsElapsed = TOTAL_SESSION_SECONDS - secondsRemaining;
  const progressPercent = Math.min(100, Math.round((secondsElapsed / TOTAL_SESSION_SECONDS) * 100));

  const handleRestart = () => {
    triggerHapticFeedback('selection');
    setSecondsRemaining(TOTAL_SESSION_SECONDS);
    setIsActive(true);
    setIsCompleted(false);
    setCurrentPhase('Inhale');
    setPhaseSecondsLeft(pattern.inhale);
    if (soundEnabled) playSingingBowlChime();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-lg bg-[#181115] text-white rounded-[32px] overflow-hidden border border-[#3E2D33] shadow-2xl flex flex-col my-auto transition-all"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 40px -10px rgba(120, 29, 50, 0.4)',
        }}
      >
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#781D32]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F59E38]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="relative z-10 px-5 pt-5 pb-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#781D32] to-[#B82B5A] flex items-center justify-center text-white shadow-md border border-white/15">
              <Wind className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#F59E38]">
                  प्राणायाम • PRANAYAMA
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-mono">
                  1 Min Guided Pause
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-white leading-tight">
                Mindful Breath Rhythm
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback('light');
                setSoundEnabled(!soundEnabled);
              }}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
              title={soundEnabled ? 'Mute singing bowl' : 'Enable singing bowl chime'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#F59E38]" /> : <VolumeX className="w-4 h-4 text-white/40" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
              title="Close breath overlay"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Technique Mode Selector */}
        <div className="relative z-10 px-5 pt-3">
          <div className="grid grid-cols-3 gap-1.5 bg-[#251A20] p-1 rounded-2xl border border-white/5">
            {(Object.keys(PATTERNS) as PranayamaMode[]).map((modeKey) => {
              const item = PATTERNS[modeKey];
              const isSelected = selectedMode === modeKey;
              return (
                <button
                  key={modeKey}
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback('selection');
                    setSelectedMode(modeKey);
                  }}
                  className={`py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#781D32] text-white font-bold shadow-xs'
                      : 'text-white/60 hover:text-white hover:bg-white/5 font-medium'
                  }`}
                >
                  <p className="text-[11px] truncate leading-tight">{item.name.split(' ')[0]}</p>
                  <p className="text-[9px] opacity-70 font-mono mt-0.5 truncate">{item.inhale}-{item.holdIn}-{item.exhale}</p>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-white/70 text-center mt-2 font-medium px-2 leading-relaxed">
            {pattern.description}
          </p>
        </div>

        {/* Central Visual Breath Circle & Animation */}
        <div className="relative z-10 py-6 sm:py-8 flex flex-col items-center justify-center">
          {/* Main Breathing Pulsing Halo & Orb */}
          <div className="relative w-56 h-56 flex items-center justify-center">
            {/* SVG Circular Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 select-none">
              <circle
                cx="112"
                cy="112"
                r="100"
                className="stroke-white/10"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="112"
                cy="112"
                r="100"
                stroke={primaryColor}
                strokeWidth="5"
                strokeDasharray={2 * Math.PI * 100}
                strokeDashoffset={2 * Math.PI * 100 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Glowing Expansion Rings */}
            <div
              className={`absolute inset-4 rounded-full border border-amber-300/30 transition-transform duration-1000 ease-in-out ${orbScale}`}
              style={{
                background: 'radial-gradient(circle, rgba(245, 158, 56, 0.12) 0%, rgba(120, 29, 50, 0.05) 70%, transparent 100%)',
              }}
            />

            {/* Inner Glowing Sacred Lotus / Core */}
            <div
              className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center p-3 text-center transition-all duration-1000 ease-in-out border border-white/20 shadow-2xl ${orbScale}`}
              style={{
                background: 'linear-gradient(135deg, rgba(120, 29, 50, 0.85) 0%, rgba(55, 18, 28, 0.95) 100%)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {isCompleted ? (
                <div className="flex flex-col items-center animate-in zoom-in-50 duration-300">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-1" />
                  <span className="text-xs font-bold text-white tracking-wide">Prana Settled</span>
                  <span className="text-[10px] text-emerald-300 font-mono mt-0.5">Shanti ✨</span>
                </div>
              ) : (
                <>
                  <span className={`text-xs font-bold uppercase tracking-wider ${phaseColor} leading-tight font-serif`}>
                    {sanskritAction}
                  </span>
                  <span className="font-mono text-3xl font-extrabold text-white my-0.5">
                    {phaseSecondsLeft}s
                  </span>
                  <span className="text-[10px] text-white/70 font-mono">
                    {Math.floor(secondsRemaining / 60)}:{String(secondsRemaining % 60).padStart(2, '0')} left
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Phase Guidance Instruction Text */}
          <div className="text-center mt-4 px-6 max-w-sm">
            <p className="text-sm font-medium text-white/90 leading-snug">
              {isCompleted ? 'Full 1-minute pranayama cycle completed. Carry this calm presence into your flow.' : phaseInstruction}
            </p>
            <div className="flex items-center justify-center gap-3 mt-2 text-xs text-white/60 font-mono">
              <span>Cycles completed: {breathCyclesCount}</span>
              <span>•</span>
              <span>Total: {TOTAL_SESSION_SECONDS - secondsRemaining}s / 60s</span>
            </div>
          </div>
        </div>

        {/* Footer Actions & Play Controls */}
        <div className="relative z-10 px-5 py-4 border-t border-white/10 bg-[#140D11] flex items-center justify-between">
          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-white/80 hover:text-white transition cursor-pointer"
            title="Restart 1-minute cycle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>

          {isCompleted ? (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg hover:opacity-95 transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Resume Your Screen</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback('selection');
                  setIsActive(!isActive);
                }}
                className="px-5 py-2.5 rounded-2xl font-bold text-xs text-white flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                {isActive ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Resume Breath</span>
                  </>
                )}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer text-xs font-medium"
            title="Minimize"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
