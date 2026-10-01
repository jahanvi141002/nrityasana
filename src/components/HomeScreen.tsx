import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  ArrowRight,
  Footprints,
  Flower2,
  Sparkles,
  Flame,
  Music,
  Heart,
  Moon,
  Utensils,
  Compass,
  Eye,
  Activity,
  Sun,
  Clock,
} from 'lucide-react';
import { Practice, UserSession, DisciplineType } from '../types';
import { getPracticeAiVisualDemo } from '../utils/aiVisualDemos';
import { DailySankalpaCard } from './DailySankalpaCard';

interface HomeScreenProps {
  session: UserSession;
  practices: Practice[];
  onOpenProfile: () => void;
  onSelectPractice: (practice: Practice) => void;
  onExploreMore: () => void;
  onOpenAIStudio?: () => void;
  onOpenAyurvedaRoutines?: () => void;
  primaryColor?: string;
  secondaryColor?: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  session,
  practices,
  onOpenProfile: _onOpenProfile,
  onSelectPractice,
  onExploreMore,
  onOpenAIStudio,
  onOpenAyurvedaRoutines,
  primaryColor = '#B8543F',
  secondaryColor = '#F6D4A7',
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'All' | DisciplineType>('All');
  const [isFeaturedActive, setIsFeaturedActive] = useState(false);
  const [timeRecommendation, setTimeRecommendation] = useState<{
    period: string;
    focus: string;
    description: string;
    suggestedMinutes: number;
    discipline: string;
    suggestedMeal?: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/practices/recommended')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.recommendation) {
          setTimeRecommendation(data.recommendation);
        }
      })
      .catch(() => {});
  }, []);

  const userName = session.email ? session.email.split('@')[0] : 'Ananya';
  const capitalizedUserName = userName.charAt(0).toUpperCase() + userName.slice(1);

  const currentDateFormatted = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const featuredPractice = practices[0] || {
    id: 'p1',
    title: 'Surya Namaskar & Prana',
    discipline: 'Yoga',
    category: 'Vinyasa Flow',
    level: 'All Levels',
    minutes: 18,
    description: 'Awaken prana with classical Surya Namaskar and conscious mudra transitions.',
    icon: 'sunny',
  };

  const filteredPractices =
    selectedFilter === 'All'
      ? practices
      : practices.filter((p) => p.discipline.toLowerCase() === selectedFilter.toLowerCase());

  const renderDisciplineIcon = (discipline: string, icon?: string) => {
    const iconClass = 'w-5 h-5';
    if (icon === 'flame' || discipline === 'Zumba') {
      return <Flame className={`${iconClass} text-[#EA580C]`} />;
    }
    if (icon === 'music' || discipline === 'Bollywood') {
      return <Music className={`${iconClass} text-[#DB2777]`} />;
    }
    if (icon === 'heart' || discipline === 'Semi-Classical') {
      return <Heart className={`${iconClass} text-[#E11D48]`} />;
    }
    if (icon === 'moon' || discipline === 'Meditation') {
      return <Moon className={`${iconClass} text-[#7C3AED]`} />;
    }
    if (discipline === 'Yoga') {
      return <Flower2 className={`${iconClass} text-[#B86B14]`} />;
    }
    return <Footprints className={`${iconClass} text-[#B82B5A]`} />;
  };

  return (
    <div id="home-screen" className="pb-28 pt-4 px-4 sm:px-6 max-w-2xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#94848A]">{currentDateFormatted}</p>
        <h1 className="font-serif text-[30px] sm:text-[36px] font-bold text-[#1F161A] leading-[1.15] mt-1.5 tracking-tight">
          Come back to your rhythm,<br />
          {capitalizedUserName}.
        </h1>
        <p className="mt-1.5 text-[#6B5C62] text-sm sm:text-base">
          Yoga flows, classical dance, cardio beats, meditations & nutrition for mind and body.
        </p>
      </div>

      {/* Daily Sankalpa (Intention) - Philosophy Quote of the Day */}
      <DailySankalpaCard primaryColor={primaryColor} />

      {/* Featured Card with Dynamic Recommendation */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-xl font-bold text-[#1F161A]">Today's Focus</h2>
          <button
            onClick={onExploreMore}
            className="text-xs font-semibold hover:underline cursor-pointer transition-colors flex items-center gap-1"
            style={{ color: primaryColor }}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore all categories</span>
          </button>
        </div>

        {(() => {
          const featuredDemo = getPracticeAiVisualDemo(featuredPractice);
          return (
            <div
              id="featured-practice-card"
              className="relative min-h-[220px] rounded-[28px] p-5 sm:p-6 text-white overflow-hidden shadow-md flex flex-col md:flex-row items-stretch justify-between gap-5 transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              {/* Decorative geometric ambient lights */}
              <div className="absolute -right-8 -top-12 w-48 h-48 rounded-full bg-white/15 blur-2xl pointer-events-none" />
              <div className="absolute right-6 bottom-0 w-36 h-36 rounded-full bg-black/15 blur-xl pointer-events-none" />

              {/* Left Column: Details & Actions */}
              <div className="relative z-10 flex-1 flex flex-col justify-between">
                <div>
                  {/* Tag */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold tracking-wider uppercase text-white border border-white/20 backdrop-blur-xs">
                      {timeRecommendation ? timeRecommendation.period : 'RECOMMENDED FOR YOU'}
                    </span>
                    <span className="text-xs text-white/90 flex items-center gap-1 font-medium">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: secondaryColor }} />
                      {timeRecommendation ? timeRecommendation.discipline : 'Movement & Prana'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 text-emerald-300 font-mono font-semibold border border-emerald-400/30">
                      ✨ AI Posture Guide Active
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-4">
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {timeRecommendation ? timeRecommendation.focus : 'Ground & glow'}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/85 mt-1 font-medium leading-relaxed max-w-md">
                      {timeRecommendation
                        ? `${timeRecommendation.suggestedMinutes} min • ${timeRecommendation.description}`
                        : '18 min • Vinyasa yoga & mudra coordination'}
                    </p>

                    {/* Suggested Meal Pairing */}
                    {timeRecommendation?.suggestedMeal && (
                      <div className="mt-3 p-2.5 rounded-xl bg-black/20 border border-white/15 backdrop-blur-xs flex items-center gap-2 text-xs text-white/90 max-w-md">
                        <Utensils className="w-3.5 h-3.5 text-[#F6D4A7] shrink-0" />
                        <span>
                          <strong className="text-[#F6D4A7]">Scheduled Nutrition: </strong>
                          {timeRecommendation.suggestedMeal}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <button
                    id="featured-start-button"
                    onClick={() => {
                      setIsFeaturedActive(!isFeaturedActive);
                      onSelectPractice(featuredPractice);
                    }}
                    className="inline-flex items-center gap-2 py-2.5 px-5 rounded-full text-[#1F161A] font-semibold text-sm transition shadow-sm cursor-pointer hover:brightness-105 active:scale-98"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    {isFeaturedActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    {isFeaturedActive ? 'Pause practice' : 'Start with AI Visual Guide'}
                  </button>
                </div>
              </div>

              {/* Right Column: Visual Presentation Preview (Woman Demonstrator with AI Biometrics) */}
              <div
                onClick={() => onSelectPractice(featuredPractice)}
                className="relative z-10 w-full md:w-64 h-44 md:h-auto rounded-[20px] overflow-hidden bg-black/60 border border-white/20 shadow-lg group cursor-pointer shrink-0"
              >
                <img
                  src={featuredDemo.imageUrl}
                  alt={`${featuredDemo.demonstratorName} demonstrating ${featuredPractice.title}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                {/* AI Overlay Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/75 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-white/20 text-[9px] font-mono text-emerald-300 font-semibold">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>{featuredDemo.alignmentScore}% Match</span>
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <div className="text-[10px] text-[#F6D4A7] font-semibold flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>Demonstrated by {featuredDemo.demonstratorName}</span>
                  </div>
                  <div className="text-[11px] text-white font-medium truncate mt-0.5">
                    {featuredDemo.poseName}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* AI Studio Feature Card */}
      {onOpenAIStudio && (
        <div
          onClick={onOpenAIStudio}
          className="p-5 rounded-[24px] bg-gradient-to-r from-[#FAF3F0] via-[#FDF8F5] to-white border border-[#EADBDB] flex items-center justify-between gap-4 cursor-pointer hover:shadow-xs transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8C3A27]/10 text-[#8C3A27]">
                  Gemini & Lyria Studio
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  Live
                </span>
              </div>
              <h4 className="font-serif font-bold text-sm text-[#1F161A] mt-0.5 group-hover:text-[#8C3A27] transition-colors">
                AI Studio: Classical Voice, Music & Veo Motion
              </h4>
              <p className="text-xs text-[#6B5C62] line-clamp-1">
                Converse with Guru Radhika via Live API, generate Lyria music, search grounded dance knowledge, and animate postures.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-full text-white text-xs font-semibold shrink-0 shadow-xs group-hover:opacity-90 transition-opacity"
            style={{ backgroundColor: primaryColor }}
          >
            Enter Studio
          </button>
        </div>
      )}

      {/* Daily Dinacharya & Ayurveda Routine Card */}
      {onOpenAyurvedaRoutines && (
        <div
          onClick={onOpenAyurvedaRoutines}
          className="mb-8 p-5 rounded-[24px] bg-gradient-to-r from-[#FAF5F0] via-[#FCF8F5] to-white border border-[#EADBD5] flex items-center justify-between gap-4 cursor-pointer hover:shadow-xs transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#781D32] flex items-center justify-center shrink-0 shadow-xs text-white">
              <Sun className="w-6 h-6 text-[#F6D4A7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#781D32]/10 text-[#781D32] font-mono">
                  Daily Dinacharya & Ayurveda
                </span>
                <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  Circadian Rhythm
                </span>
              </div>
              <h4 className="font-serif font-bold text-sm text-[#1F161A] mt-0.5 group-hover:text-[#781D32] transition-colors">
                Ayurvedic Daily Routines & Food Plans
              </h4>
              <p className="text-xs text-[#6B5C62] line-clamp-1">
                Brahma Muhurta awakening, Abhyanga self-massage, Agni digestion peak, and Vata/Pitta/Kapha dosha food guides.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-full text-white text-xs font-semibold shrink-0 shadow-xs group-hover:opacity-90 transition-opacity flex items-center gap-1"
            style={{ backgroundColor: primaryColor }}
          >
            <span>View Routine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Made for your rhythm */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="font-serif text-xl font-bold text-[#1F161A]">
            Made for your rhythm
          </h2>
          <span className="text-xs text-[#7D6D73]">
            {filteredPractices.length} practices available
          </span>
        </div>

        {/* Discipline Filters Bar */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-2 no-scrollbar">
          {(['All', 'Yoga', 'Kathak', 'Bollywood', 'Semi-Classical', 'Zumba', 'Meditation'] as const).map((filter) => {
            const isSelected = selectedFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'text-white shadow-xs'
                    : 'bg-white/80 text-[#6B5C62] hover:bg-white border border-[#F2E6E2]'
                }`}
                style={isSelected ? { backgroundColor: primaryColor } : {}}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Practice Tiles */}
        <div className="space-y-3">
          {filteredPractices.map((practice) => {
            const demo = getPracticeAiVisualDemo(practice);
            return (
              <div
                key={practice.id}
                onClick={() => onSelectPractice(practice)}
                className="p-3.5 sm:p-4 rounded-[22px] bg-white/90 hover:bg-white border border-[#F2E6E2] hover:border-[#781D32]/30 flex items-center gap-3.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
              >
                {/* Visual Demonstrator Thumbnail */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[16px] overflow-hidden shrink-0 bg-black shadow-2xs border border-[#EADBD5]">
                  <img
                    src={demo.imageUrl}
                    alt={`${demo.demonstratorName} demonstrating ${practice.title}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-1 left-1 flex items-center gap-0.5 bg-black/80 px-1 py-0.2 rounded text-[8px] font-mono text-emerald-300">
                    <Activity className="w-2.5 h-2.5 text-emerald-400" />
                    <span>{demo.alignmentScore}%</span>
                  </div>
                  <div className="absolute top-1 right-1 p-0.5 rounded-md bg-black/60 backdrop-blur-xs">
                    {renderDisciplineIcon(practice.discipline, practice.icon)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#FAF3F0] text-[#781D32] border border-[#F2E6E2]">
                      {practice.discipline}
                    </span>
                    <span className="text-[10px] text-[#7D6D73] font-medium">
                      Demonstrated by {demo.demonstratorName}
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-[#1F161A] group-hover:text-[#781D32] transition-colors truncate mt-0.5">
                    {practice.title}
                  </h4>
                  <p className="text-xs text-[#7D6D73] mt-0.5 truncate">
                    {practice.category} • {practice.minutes} min • {practice.intensity || 'Moderate'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-semibold text-[#781D32] hidden sm:flex items-center gap-1 bg-[#FDF5F2] px-2.5 py-1 rounded-xl border border-[#F2E0D8]">
                    <Eye className="w-3 h-3" /> Watch Guide
                  </span>
                  <button
                    aria-label={`Open ${practice.title}`}
                    className="p-2 text-[#94848A] group-hover:text-[#781D32] transition-transform group-hover:translate-x-0.5 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
