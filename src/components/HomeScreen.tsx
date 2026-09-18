import React, { useState } from 'react';
import { Sparkles, Bell, Play, Pause, ArrowRight, Sun, Footprints, Flower2 } from 'lucide-react';
import { Practice, UserSession } from '../types';

interface HomeScreenProps {
  session: UserSession;
  practices: Practice[];
  onOpenProfile: () => void;
  onSelectPractice: (practice: Practice) => void;
  onExploreMore: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  session,
  practices,
  onOpenProfile,
  onSelectPractice,
  onExploreMore,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Yoga' | 'Dance'>('All');
  const [isFeaturedActive, setIsFeaturedActive] = useState(false);

  const initial = session.email ? session.email.charAt(0).toUpperCase() : 'A';
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
      return <Flower2 className="w-5 h-5 text-[#4C423A]" />;
    }
    return <Footprints className="w-5 h-5 text-[#4C423A]" />;
  };

  return (
    <div id="home-screen" className="pb-24 pt-6 px-4 sm:px-6 max-w-2xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#201C1A] rounded-[14px] flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-[#F6D4A7]" />
          </div>
          <span className="font-serif text-[22px] font-bold text-[#201C1A] tracking-tight">
            nrityasana
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            title="Notifications"
            className="p-2 text-[#5F554D] hover:text-[#201C1A] hover:bg-black/5 rounded-full transition cursor-pointer"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            id="home-profile-avatar-button"
            onClick={onOpenProfile}
            title="Profile"
            className="w-9 h-9 rounded-full bg-[#D9A28C] hover:ring-2 hover:ring-[#B8543F]/50 flex items-center justify-center font-bold text-[#4C2921] text-sm transition overflow-hidden shadow-xs cursor-pointer"
          >
            {session.profilePictureUrl ? (
              <img src={session.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </button>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="mb-7">
        <p className="text-sm font-medium text-[#75685F]">{currentDateFormatted}</p>
        <h1 className="font-serif text-[32px] sm:text-[38px] font-bold text-[#201C1A] leading-[1.1] mt-2 tracking-tight">
          Come back to your body,<br />
          {capitalizedUserName}.
        </h1>
        <p className="mt-2.5 text-[#5F554D] text-base">
          A little movement is still a practice.
        </p>
      </div>

      {/* Featured Card */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-xl font-bold text-[#201C1A]">Your practice</h2>
          <button
            onClick={onExploreMore}
            className="text-xs font-semibold text-[#B8543F] hover:underline cursor-pointer"
          >
            See all
          </button>
        </div>

        <div
          id="featured-practice-card"
          className="relative min-h-[220px] rounded-[28px] bg-[#B8543F] p-6 text-white overflow-hidden shadow-sm flex flex-col justify-between"
        >
          {/* Decorative geometric background rings */}
          <div className="absolute -right-8 -top-12 w-48 h-48 rounded-full border-[28px] border-[#F6D4A7]/25 pointer-events-none" />
          <Sun className="absolute right-6 bottom-3 w-28 h-28 text-[#F6D4A7]/20 pointer-events-none" />

          {/* Tag */}
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold tracking-wider uppercase text-white backdrop-blur-xs">
              RECOMMENDED FOR YOU
            </span>
          </div>

          {/* Title & Action */}
          <div className="relative z-10 mt-6">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Ground & glow
            </h3>
            <p className="text-sm text-[#F8D8C4] mt-1 font-medium">
              18 min • Gentle flow
            </p>

            <div className="mt-4 flex items-center gap-3">
              <button
                id="featured-start-button"
                onClick={() => {
                  setIsFeaturedActive(!isFeaturedActive);
                  onSelectPractice(featuredPractice);
                }}
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-full bg-[#F6D4A7] hover:bg-[#ebd0ab] text-[#51261E] font-semibold text-sm transition active:scale-98 shadow-sm cursor-pointer"
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
        <h2 className="font-serif text-xl font-bold text-[#201C1A] mb-3.5">
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
                    ? 'bg-[#B8543F] text-white shadow-xs'
                    : 'bg-white/70 text-[#5F554D] hover:bg-white border border-[#E4DACF]'
                }`}
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
              className="p-4 rounded-[20px] bg-white/75 hover:bg-white border border-[#E8DFC8]/60 flex items-center gap-3.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
            >
              <div
                className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 ${
                  practice.discipline === 'Yoga' ? 'bg-[#DCE2C8]' : 'bg-[#F1D4C0]'
                }`}
              >
                {renderDisciplineIcon(practice.discipline)}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-[#332B27] group-hover:text-[#B8543F] transition-colors truncate">
                  {practice.title}
                </h4>
                <p className="text-xs text-[#75685F] mt-0.5">
                  {practice.category} • {practice.minutes} min
                </p>
              </div>

              <button
                aria-label={`Open ${practice.title}`}
                className="p-2 text-[#75685F] group-hover:text-[#B8543F] transition-transform group-hover:translate-x-0.5 cursor-pointer"
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
