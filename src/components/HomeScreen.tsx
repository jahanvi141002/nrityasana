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
} from 'lucide-react';
import { Practice, UserSession, DisciplineType } from '../types';

interface HomeScreenProps {
  session: UserSession;
  practices: Practice[];
  onOpenProfile: () => void;
  onSelectPractice: (practice: Practice) => void;
  onExploreMore: () => void;
  primaryColor?: string;
  secondaryColor?: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  session,
  practices,
  onOpenProfile: _onOpenProfile,
  onSelectPractice,
  onExploreMore,
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

        <div
          id="featured-practice-card"
          className="relative min-h-[220px] rounded-[28px] p-6 text-white overflow-hidden shadow-md flex flex-col justify-between transition-all"
          style={{ backgroundColor: primaryColor }}
        >
          {/* Decorative geometric ambient lights */}
          <div className="absolute -right-8 -top-12 w-48 h-48 rounded-full bg-white/15 blur-2xl pointer-events-none" />
          <div className="absolute right-6 bottom-0 w-36 h-36 rounded-full bg-black/15 blur-xl pointer-events-none" />

          {/* Tag */}
          <div className="relative z-10 flex items-center gap-2 flex-wrap">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold tracking-wider uppercase text-white border border-white/20 backdrop-blur-xs">
              {timeRecommendation ? timeRecommendation.period : 'RECOMMENDED FOR YOU'}
            </span>
            <span className="text-xs text-white/90 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5" style={{ color: secondaryColor }} />
              {timeRecommendation ? timeRecommendation.discipline : 'Movement & Prana'}
            </span>
          </div>

          {/* Title & Description */}
          <div className="relative z-10 mt-5">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {timeRecommendation ? timeRecommendation.focus : 'Ground & glow'}
            </h3>
            <p className="text-xs sm:text-sm text-white/85 mt-1 font-medium leading-relaxed">
              {timeRecommendation
                ? `${timeRecommendation.suggestedMinutes} min • ${timeRecommendation.description}`
                : '18 min • Vinyasa yoga & mudra coordination'}
            </p>

            {/* Suggested Meal Pairing */}
            {timeRecommendation?.suggestedMeal && (
              <div className="mt-3 p-2.5 rounded-xl bg-black/20 border border-white/15 backdrop-blur-xs flex items-center gap-2 text-xs text-white/90">
                <Utensils className="w-3.5 h-3.5 text-[#F6D4A7] shrink-0" />
                <span>
                  <strong className="text-[#F6D4A7]">Scheduled Nutrition: </strong>
                  {timeRecommendation.suggestedMeal}
                </span>
              </div>
            )}

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
                {isFeaturedActive ? 'Pause practice' : 'Start practice'}
              </button>
            </div>
          </div>
        </div>
      </div>

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
          {filteredPractices.map((practice) => (
            <div
              key={practice.id}
              onClick={() => onSelectPractice(practice)}
              className="p-4 rounded-[20px] bg-white/85 hover:bg-white border border-[#F2E6E2] flex items-center gap-3.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
            >
              <div
                className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 bg-[#FAF3F0] border border-[#F2E6E2] group-hover:border-[#781D32]/30 transition-colors"
              >
                {renderDisciplineIcon(practice.discipline, practice.icon)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#FAF3F0] text-[#781D32] border border-[#F2E6E2]">
                    {practice.discipline}
                  </span>
                  {practice.level && (
                    <span className="text-[10px] text-[#7D6D73] font-medium">
                      {practice.level}
                    </span>
                  )}
                </div>

                <h4 className="font-semibold text-sm text-[#1F161A] group-hover:text-[#781D32] transition-colors truncate mt-0.5">
                  {practice.title}
                </h4>
                <p className="text-xs text-[#7D6D73] mt-0.5 truncate">
                  {practice.category} • {practice.minutes} min • {practice.intensity || 'Moderate'}
                </p>
              </div>

              <button
                aria-label={`Open ${practice.title}`}
                className="p-2 text-[#94848A] group-hover:text-[#781D32] transition-transform group-hover:translate-x-0.5 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
