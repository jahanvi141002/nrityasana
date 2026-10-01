import React, { useState } from 'react';
import {
  Sparkles,
  Sun,
  Flame,
  Sunset,
  Moon,
  Coffee,
  CheckCircle2,
  Clock,
  Heart,
  ChevronRight,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import {
  AYURVEDA_DOSHAS,
  DINACHARYA_ROUTINES,
  AYURVEDIC_ELIXIRS,
  DinacharyaStep,
} from '../data/ayurvedaData';
import { Practice } from '../types';

interface AyurvedaRoutinesViewProps {
  primaryColor?: string;
  onSelectPractice?: (practice: Practice) => void;
  practices?: Practice[];
}

export const AyurvedaRoutinesView: React.FC<AyurvedaRoutinesViewProps> = ({
  primaryColor = '#781D32',
  onSelectPractice,
  practices = [],
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'dinacharya' | 'dosha' | 'elixirs'>('dinacharya');
  const [selectedDosha, setSelectedDosha] = useState<'vata' | 'pitta' | 'kapha'>('vata');
  const [expandedRoutineId, setExpandedRoutineId] = useState<string>('dina-1');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('nrityasana_dinacharya_completed');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const toggleStepComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedSteps((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('nrityasana_dinacharya_completed', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const getStepIcon = (iconName: DinacharyaStep['icon']) => {
    switch (iconName) {
      case 'sun':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'flame':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'sunset':
        return <Sunset className="w-4 h-4 text-rose-500" />;
      case 'moon':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'coffee':
        return <Coffee className="w-4 h-4 text-amber-700" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#F59E38]" />;
    }
  };

  const handleLaunchPractice = (practiceId: string) => {
    if (!onSelectPractice) return;
    const found = practices.find((p) => p.id === practiceId);
    if (found) {
      onSelectPractice(found);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-r from-[#2B1621] via-[#1E1217] to-[#2B1621] text-white border border-[#482836] shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#F59E38] font-mono px-2 py-0.5 rounded-full bg-white/10">
              Vedic Wellness & Dinacharya
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-medium">
              Daily Living • Food • Rhythm
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
            Ayurvedic Daily Routines & Food Wisdom
          </h2>
          <p className="text-xs sm:text-sm text-[#E5D5DA] mt-1.5 leading-relaxed">
            Synchronize your dance stamina and yoga flow with circadian nature (Dinacharya), bio-energetic Dosha balancing (Vata, Pitta, Kapha), and sattvic culinary elixirs.
          </p>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-[#E25B88]/15 blur-2xl pointer-events-none" />
      </div>

      {/* Sub Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#EADBD5] shadow-2xs">
        <button
          onClick={() => setSelectedSubTab('dinacharya')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedSubTab === 'dinacharya'
              ? 'text-white shadow-xs'
              : 'text-[#7D6D73] hover:text-[#1F161A] hover:bg-black/5'
          }`}
          style={selectedSubTab === 'dinacharya' ? { backgroundColor: primaryColor } : undefined}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Dinacharya Schedule</span>
        </button>

        <button
          onClick={() => setSelectedSubTab('dosha')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedSubTab === 'dosha'
              ? 'text-white shadow-xs'
              : 'text-[#7D6D73] hover:text-[#1F161A] hover:bg-black/5'
          }`}
          style={selectedSubTab === 'dosha' ? { backgroundColor: primaryColor } : undefined}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Doshas & Food</span>
        </button>

        <button
          onClick={() => setSelectedSubTab('elixirs')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedSubTab === 'elixirs'
              ? 'text-white shadow-xs'
              : 'text-[#7D6D73] hover:text-[#1F161A] hover:bg-black/5'
          }`}
          style={selectedSubTab === 'elixirs' ? { backgroundColor: primaryColor } : undefined}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Sacred Elixirs</span>
        </button>
      </div>

      {/* TAB 1: DINACHARYA SCHEDULE */}
      {selectedSubTab === 'dinacharya' && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs text-[#7D6D73] px-1">
            <span className="font-semibold uppercase tracking-wider text-[#781D32]">
              Circadian Flow (Brahma Muhurta to Ratricharya)
            </span>
            <span>{Object.values(completedSteps).filter(Boolean).length} / {DINACHARYA_ROUTINES.length} Completed</span>
          </div>

          <div className="space-y-3">
            {DINACHARYA_ROUTINES.map((step) => {
              const isExpanded = expandedRoutineId === step.id;
              const isDone = !!completedSteps[step.id];

              return (
                <div
                  key={step.id}
                  onClick={() => setExpandedRoutineId(isExpanded ? '' : step.id)}
                  className={`rounded-[22px] transition-all duration-200 border cursor-pointer overflow-hidden ${
                    isExpanded
                      ? 'bg-white shadow-md border-[#781D32]/40'
                      : 'bg-white/80 hover:bg-white border-[#EADBD5] shadow-2xs'
                  }`}
                >
                  {/* Step Header */}
                  <div className="p-4 sm:p-4.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={(e) => toggleStepComplete(step.id, e)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition shrink-0 cursor-pointer ${
                          isDone
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-[#FAF3F0] text-[#8C7B82] border border-[#EADBD5] hover:border-emerald-500'
                        }`}
                        title={isDone ? 'Mark Incomplete' : 'Mark Completed'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF3F0] text-[#781D32] border border-[#EADBD5] font-mono flex items-center gap-1">
                            {getStepIcon(step.icon)}
                            {step.timeRange}
                          </span>
                          <span className="text-[10px] text-[#7D6D73] font-medium hidden xs:inline">
                            {step.timeSlot}
                          </span>
                        </div>
                        <h4 className={`font-serif font-bold text-sm sm:text-base mt-1 truncate ${
                          isDone ? 'line-through text-[#8C7B82]' : 'text-[#1F161A]'
                        }`}>
                          {step.title}
                        </h4>
                        <div className="text-[11px] text-[#781D32] font-medium italic truncate">
                          {step.sanskritName}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 text-[#8C7B82] transition-transform duration-200 shrink-0 ${
                      isExpanded ? 'rotate-90 text-[#781D32]' : ''
                    }`} />
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-1 border-t border-[#F2E6E2] space-y-3 bg-[#FAF3F0]/40">
                      <p className="text-xs text-[#5C4D53] leading-relaxed">
                        {step.description}
                      </p>

                      <div className="p-3 rounded-xl bg-white border border-[#EADBD5] text-xs space-y-1">
                        <span className="font-semibold text-[#059669] flex items-center gap-1 text-[11px] uppercase tracking-wider">
                          <Sparkles className="w-3 h-3" /> Core Ayurvedic Benefit:
                        </span>
                        <p className="text-[#3F3338]">{step.benefit}</p>
                      </div>

                      {/* Instructions */}
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#781D32] block mb-1.5">
                          How to Practice This Ritual:
                        </span>
                        <ul className="space-y-1.5">
                          {step.instructions.map((inst, i) => (
                            <li key={i} className="text-xs text-[#3F3338] flex items-start gap-2 bg-white p-2 rounded-xl border border-[#F2E6E2]">
                              <span className="w-4 h-4 rounded-full bg-[#781D32] text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span>{inst}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Associated Practice Launcher */}
                      {step.recommendedPracticeId && onSelectPractice && (
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleLaunchPractice(step.recommendedPracticeId!)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#781D32] hover:bg-[#601426] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                          >
                            <span>Launch Linked Practice Flow</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DOSHAS & FOOD ROUTINES */}
      {selectedSubTab === 'dosha' && (
        <div className="space-y-4">
          {/* Dosha Selector Pills */}
          <div className="grid grid-cols-3 gap-2">
            {(['vata', 'pitta', 'kapha'] as const).map((doshaKey) => {
              const d = AYURVEDA_DOSHAS[doshaKey];
              const isSelected = selectedDosha === doshaKey;
              return (
                <button
                  key={doshaKey}
                  onClick={() => setSelectedDosha(doshaKey)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white shadow-md border-[#781D32] ring-2 ring-[#781D32]/20'
                      : 'bg-white/80 hover:bg-white border-[#EADBD5]'
                  }`}
                >
                  <div className="text-xs sm:text-sm font-bold capitalize text-[#1F161A]">
                    {doshaKey}
                  </div>
                  <div className="text-[10px] text-[#7D6D73] mt-0.5 truncate">
                    {d.elements}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Dosha Details Card */}
          {(() => {
            const dosha = AYURVEDA_DOSHAS[selectedDosha];
            return (
              <div className="p-5 rounded-[24px] bg-white border border-[#EADBD5] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#F2E6E2] pb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#1F161A]">{dosha.name}</h3>
                    <p className="text-xs text-[#781D32] font-medium">{dosha.elements}</p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {dosha.qualities.map((q, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF3F0] text-[#781D32] border border-[#EADBD5] font-semibold">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-[#5C4D53] leading-relaxed">
                  {dosha.description}
                </p>

                {/* Food Routines Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">✓</span> Foods to Prioritize:
                    </span>
                    <ul className="text-xs text-emerald-950 space-y-1">
                      {dosha.recommendedFoods.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1.5">
                    <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
                      <span className="text-rose-600 font-bold">✕</span> Foods to Minimize:
                    </span>
                    <ul className="text-xs text-rose-950 space-y-1">
                      {dosha.foodsToLimit.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-600">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Dance & Movement Guidelines */}
                <div className="p-3.5 rounded-2xl bg-[#FAF3F0] border border-[#EADBD5] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#781D32] uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Movement & Rehearsal Advice:
                  </span>
                  <p className="text-xs text-[#3F3338] leading-relaxed">
                    {dosha.danceAndYogaAdvice}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: SACRED AYURVEDIC ELIXIRS */}
      {selectedSubTab === 'elixirs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AYURVEDIC_ELIXIRS.map((elixir) => (
            <div
              key={elixir.id}
              className="p-5 rounded-[24px] bg-white border border-[#EADBD5] shadow-2xs hover:shadow-xs transition space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF3F0] text-[#781D32] border border-[#EADBD5]">
                    {elixir.category}
                  </span>
                  <span className="text-[10px] text-[#7D6D73] font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {elixir.timeToMake}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-base text-[#1F161A]">{elixir.name}</h3>
                {elixir.sanskritName && (
                  <p className="text-[11px] text-[#781D32] font-medium italic mt-0.5">{elixir.sanskritName}</p>
                )}
                <p className="text-xs text-[#5C4D53] mt-2 leading-relaxed">
                  {elixir.description}
                </p>

                {/* Ingredients */}
                <div className="mt-3 p-3 rounded-xl bg-[#FAF3F0]/60 border border-[#EADBD5] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#781D32]">
                    Key Herbal Ingredients:
                  </span>
                  <ul className="text-xs text-[#3F3338] space-y-0.5">
                    {elixir.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#F59E38]">•</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Benefits */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium">
                <strong>Digestive & Dance Benefit: </strong>{elixir.benefits}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
