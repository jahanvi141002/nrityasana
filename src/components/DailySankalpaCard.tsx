import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Check,
  BookOpen,
  Heart,
  Feather,
  Copy,
  Flower2,
  Volume2,
} from 'lucide-react';
import { SankalpaQuote } from '../types';
import { getDailySankalpa, getRandomSankalpa } from '../utils/sankalpaQuotes';
import { triggerHapticFeedback, playSingingBowlChime } from '../utils/sound';

interface DailySankalpaCardProps {
  primaryColor?: string;
  onSetIntention?: (sankalpa: SankalpaQuote) => void;
}

export const DailySankalpaCard: React.FC<DailySankalpaCardProps> = ({
  primaryColor = '#781D32',
  onSetIntention,
}) => {
  const [sankalpa, setSankalpa] = useState<SankalpaQuote>(() => getDailySankalpa());
  const [isLoading, setIsLoading] = useState(false);
  const [isCommitted, setIsCommitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showOriginalSanskrit, setShowOriginalSanskrit] = useState(true);

  // Check if today's sankalpa was already committed in this session / localStorage
  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const savedCommitment = localStorage.getItem(`nrityasana_sankalpa_${todayStr}`);
      if (savedCommitment) {
        setIsCommitted(true);
      }
    } catch {}
  }, []);

  // Fetch daily sankalpa from API on initial mount
  useEffect(() => {
    let isMounted = true;
    fetch('/api/sankalpa/daily')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.sankalpa) {
          setSankalpa(data.sankalpa);
        }
      })
      .catch(() => {
        // Fallback already populated via getDailySankalpa()
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Shuffle / Draw another philosophical quote
  const handleShuffleQuote = async () => {
    triggerHapticFeedback('selection');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/sankalpa/random?exclude=${encodeURIComponent(sankalpa.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.sankalpa) {
          setSankalpa(data.sankalpa);
          setIsCommitted(false);
          setIsLoading(false);
          return;
        }
      }
    } catch {}

    // Fallback offline shuffle
    const nextSankalpa = getRandomSankalpa(sankalpa.id);
    setSankalpa(nextSankalpa);
    setIsCommitted(false);
    setIsLoading(false);
  };

  // Commit / Seal Sankalpa for the day
  const handleCommitSankalpa = () => {
    triggerHapticFeedback('selection');
    playSingingBowlChime();
    setIsCommitted(true);

    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem(`nrityasana_sankalpa_${todayStr}`, JSON.stringify(sankalpa));
    } catch {}

    if (onSetIntention) {
      onSetIntention(sankalpa);
    }
  };

  // Copy quote to clipboard
  const handleCopy = () => {
    triggerHapticFeedback('light');
    const textToCopy = `"${sankalpa.quote}" — ${sankalpa.authorOrText} (${sankalpa.source})\n\nToday's Sadhana: ${sankalpa.reflectionPrompt}\nVia Nrityasana (Yoga & Classical Dance)`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Play peaceful bell
  const handlePlayBell = () => {
    triggerHapticFeedback('light');
    playSingingBowlChime();
  };

  return (
    <div
      id="daily-sankalpa-card"
      className="relative rounded-[28px] p-5 sm:p-6 mb-7 border overflow-hidden shadow-sm transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, #FAF3F0 0%, #FFFDFB 50%, #F5ECE8 100%)',
        borderColor: isCommitted ? '#E8C5AF' : '#EADBDB',
        boxShadow: isCommitted ? '0 10px 30px -10px rgba(120, 29, 50, 0.15)' : undefined,
      }}
    >
      {/* Decorative Traditional Indian Mandala / Yantra Watermark SVG */}
      <div className="absolute -right-8 -top-8 w-44 h-44 text-[#781D32]/5 pointer-events-none select-none">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full animate-[spin_120s_linear_infinite]">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" />
          <polygon points="50,15 79,65 21,65" fill="none" stroke="currentColor" strokeWidth="1" />
          <polygon points="50,85 79,35 21,35" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="50" r="4" fill="currentColor" />
        </svg>
      </div>

      {/* Top Header Row */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Badge */}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-2xs"
            style={{
              backgroundColor: `${primaryColor}15`,
              color: primaryColor,
              border: `1px solid ${primaryColor}30`,
            }}
          >
            <Sparkles className="w-3 h-3 text-[#F59E38]" />
            <span>दैनिक सङ्कल्प • Daily Sankalpa</span>
          </span>

          {/* Theme Pill */}
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 text-[#6B5C62] border border-[#EADBDB]">
            {sankalpa.theme === 'Dance' && '🦶 Classical Natya'}
            {sankalpa.theme === 'Yoga' && '🧘 Yoga Darshana'}
            {sankalpa.theme === 'Prana' && '🌬️ Prana & Breath'}
            {sankalpa.theme === 'Bhakti' && '💖 Bhakti & Grace'}
            {sankalpa.theme === 'Mindfulness' && '🕊️ Dhyana Stillness'}
          </span>
        </div>

        {/* Action icons (Shuffle & Bell) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePlayBell}
            className="p-1.5 rounded-xl hover:bg-black/5 text-[#7D6D73] hover:text-[#1F161A] transition cursor-pointer"
            title="Mindful singing bowl chime"
          >
            <Volume2 className="w-4 h-4 text-[#F59E38]" />
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleShuffleQuote}
            className="p-1.5 rounded-xl hover:bg-black/5 text-[#7D6D73] hover:text-[#1F161A] transition cursor-pointer disabled:opacity-50"
            title="Draw another philosophy intention"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#781D32]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Philosophy Quote Body */}
      <div className="relative z-10 space-y-3">
        {/* Sanskrit Original & Transliteration (if available) */}
        {sankalpa.sanskritOriginal && (
          <div className="bg-white/70 backdrop-blur-xs rounded-2xl p-3 sm:p-3.5 border border-[#EADBDB]/80 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-[#8C7B82] uppercase tracking-wider font-semibold font-mono">
              <span className="flex items-center gap-1 text-[#781D32]">
                <Feather className="w-3 h-3 text-[#F59E38]" /> Mūla Shloka
              </span>
              <button
                type="button"
                onClick={() => setShowOriginalSanskrit(!showOriginalSanskrit)}
                className="hover:text-[#781D32] transition underline cursor-pointer"
              >
                {showOriginalSanskrit ? 'Hide Devanagari' : 'Show Devanagari'}
              </button>
            </div>

            {showOriginalSanskrit && (
              <p className="font-serif text-sm sm:text-base text-[#2E1822] font-semibold leading-relaxed whitespace-pre-line tracking-wide">
                {sankalpa.sanskritOriginal}
              </p>
            )}

            {sankalpa.transliteration && (
              <p className="text-[11px] text-[#6B5C62] italic font-serif leading-snug">
                {sankalpa.transliteration}
              </p>
            )}
          </div>
        )}

        {/* English Translation & Wisdom */}
        <div className="relative pl-3 border-l-2" style={{ borderColor: primaryColor }}>
          <blockquote className="font-serif text-[15px] sm:text-[17px] font-bold text-[#1F161A] leading-snug italic tracking-tight">
            “{sankalpa.quote}”
          </blockquote>

          {/* Attribution & Text Source */}
          <div className="mt-1.5 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="font-medium text-[#781D32] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#F59E38]" />
              <span className="font-semibold">{sankalpa.authorOrText}</span>
              <span className="text-[#8C7B82] font-normal">• {sankalpa.source}</span>
            </span>

            {sankalpa.mudraOrAsanaFocus && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF3F0] text-[#781D32] border border-[#EADBDB] font-semibold flex items-center gap-1">
                <Flower2 className="w-3 h-3 text-[#E11D48]" />
                {sankalpa.mudraOrAsanaFocus}
              </span>
            )}
          </div>
        </div>

        {/* Today's Contemplation / Sadhana Guidance */}
        <div className="bg-[#FAF6F4] rounded-2xl p-3 border border-[#EADBDB] flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-white text-[#781D32] shadow-2xs flex items-center justify-center shrink-0 border border-[#EADBDB] mt-0.5">
            <Heart className="w-3.5 h-3.5 text-[#E11D48]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#781D32] block font-mono">
              Today's Sadhana Reflection
            </span>
            <p className="text-xs text-[#4F3E46] leading-relaxed mt-0.5">
              {sankalpa.reflectionPrompt}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Controls: Commit Intention & Share */}
      <div className="relative z-10 mt-4 pt-3 border-t border-[#EADBDB] flex items-center justify-between flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs font-semibold text-[#6B5C62] hover:text-[#1F161A] flex items-center gap-1.5 py-1 px-2.5 rounded-xl hover:bg-black/5 transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#7D6D73]" />
              <span>Share Quote</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleCommitSankalpa}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 shadow-xs cursor-pointer ${
            isCommitted
              ? 'bg-emerald-700 text-white shadow-emerald-700/20'
              : 'text-white hover:opacity-95 active:scale-95'
          }`}
          style={!isCommitted ? { backgroundColor: primaryColor } : undefined}
        >
          {isCommitted ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Sankalpa Sealed for Today ✨</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#F59E38]" />
              <span>Seal Today's Intention</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
