import React, { useState } from 'react';
import { Play, Pause, ArrowRight, Footprints, Flower2, Sparkles } from 'lucide-react';
import { Practice, UserSession } from '../types';

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
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Yoga' | 'Dance'>('All');
  const [isFeaturedActive, setIsFeaturedActive] = useState(false);

  const userName = session.email ? session.email.split('@')[0] : 'Ananya';
  const capitalizedUserName = userName.charAt(0).toUpperCase() + userName.slice(1);

  const currentDateFormatted = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const featuredPractice = practices[0] || {
    id: 'p1',
    title: 'Surya Namaskar',
    discipline: 'Yoga',
    category: 'Flow',
    minutes: 18,
    description: 'Build warmth, breath, and focus.',
    icon: 'sunny',
  };

  const filteredPractices = selectedFilter === 'All'
    ? practices
    : practices.filter((p) => p.discipline === selectedFilter);

  const renderDisciplineIcon = (discipline: string) => {
    if (discipline === 'Yoga') {
      return <Flower2 className="w-5 h-5 text-[#B86B14]" />;
    }
    return <Footprints className="w-5 h-5 text-[#B82B5A]" />;
  };

  return (
    <div id="home-screen" className="pb-28 pt-4 px-4 sm:px-6 max-w-2xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#94848A]">{currentDateFormatted}</p>
        <h1 className="font-serif text-[30px] sm:text-[36px] font-bold text-[#1F161A] leading-[1.15] mt-1.5 tracking-tight">
          Come back to your body,<br />
          {capitalizedUserName}.
        </h1>
        <p className="mt-1.5 text-[#6B5C62] text-sm sm:text-base">
          A little movement is still a sacred practice.
        </p>
      </div>

      {/* Featured Card */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-xl font-bold text-[#1F161A]">Your practice</h2>
          <button
            onClick={onExploreMore}
            className="text-xs font-semibold hover:underline cursor-pointer transition-colors"
            style={{ color: primaryColor }}
          >
            See all
          </button>
        </div>

        <div
          id="featured-practice-card"
          className="relative min-h-[210px] rounded-[28px] p-6 text-white overflow-hidden shadow-md flex flex-col justify-between transition-all"
          style={{ backgroundColor: primaryColor }}
        >
          {/* Decorative geometric glowing ambient lights */}
          <div className="absolute -right-8 -top-12 w-48 h-48 rounded-full bg-white/15 blur-2xl pointer-events-none" />
          <div className="absolute right-6 bottom-0 w-36 h-36 rounded-full bg-black/15 blur-xl pointer-events-none" />

          {/* Tag */}
          <div className="relative z-10 flex items-center gap-2">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold tracking-wider uppercase text-white border border-white/20 backdrop-blur-xs">
              RECOMMENDED FOR YOU
            </span>
            <span className="text-xs text-white/90 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5" style={{ color: secondaryColor }} /> Morning Harmony
            </span>
          </div>

          {/* Title & Action */}
          <div className="relative z-10 mt-6">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Ground & glow
            </h3>
            <p className="text-sm text-white/85 mt-1 font-medium">
              18 min • Gentle yoga flow & mudra breathwork
            </p>

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
        <h2 className="font-serif text-xl font-bold text-[#1F161A] mb-3.5">
          Made for your rhythm
        </h2>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-2 no-scrollbar">
          {(['All', 'Yoga', 'Dance'] as const).map((filter) => {
            const isSelected = selectedFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
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
                className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 ${
                  practice.discipline === 'Yoga' ? 'bg-[#FEF5EA] border border-[#FCE6CA]' : 'bg-[#FDEEF3] border border-[#F9D2DF]'
                }`}
              >
                {renderDisciplineIcon(practice.discipline)}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-[#1F161A] group-hover:text-[#781D32] transition-colors truncate">
                  {practice.title}
                </h4>
                <p className="text-xs text-[#7D6D73] mt-0.5">
                  {practice.category} • {practice.minutes} min
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
