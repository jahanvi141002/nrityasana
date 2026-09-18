import React, { useState } from 'react';
import { Search, ArrowRight, Flower2, Footprints } from 'lucide-react';
import { Practice } from '../types';

interface ExploreScreenProps {
  practices: Practice[];
  onSelectPractice: (practice: Practice) => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ practices, onSelectPractice }) => {
  const [filter, setFilter] = useState<'All' | 'Yoga' | 'Dance'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPractices = practices.filter((p) => {
    const matchesFilter = filter === 'All' || p.discipline === filter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div id="explore-screen" className="pb-24 pt-8 px-4 sm:px-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#201C1A] tracking-tight">
          Explore
        </h1>
        <p className="mt-2 text-[#5F554D] text-base">
          Find a practice that meets you where you are.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-5">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#75685F]">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by posture, rhythm, or intent..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/80 border border-[#E4DACF] text-sm text-[#201C1A] placeholder-[#75685F] focus:outline-none focus:border-[#B8543F] focus:ring-1 focus:ring-[#B8543F] shadow-2xs"
        />
      </div>

      {/* Discipline Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
        {(['All', 'Yoga', 'Dance'] as const).map((category) => {
          const isSelected = filter === category;
          return (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                isSelected
                  ? 'bg-[#B8543F] text-white shadow-xs'
                  : 'bg-white/70 text-[#5F554D] hover:bg-white border border-[#E4DACF]'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Practice Cards */}
      <div className="space-y-3.5">
        {filteredPractices.length === 0 ? (
          <div className="p-8 text-center bg-white/60 rounded-2xl border border-[#E8DFC8]">
            <p className="text-sm text-[#75685F]">No practices found matching your search.</p>
          </div>
        ) : (
          filteredPractices.map((practice) => (
            <div
              key={practice.id}
              onClick={() => onSelectPractice(practice)}
              className="p-4 sm:p-5 rounded-[22px] bg-white/80 hover:bg-white border border-[#E8DFC8]/70 transition-all shadow-2xs hover:shadow-sm cursor-pointer group"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 ${
                    practice.discipline === 'Yoga' ? 'bg-[#DCE2C8]' : 'bg-[#F1D4C0]'
                  }`}
                >
                  {practice.discipline === 'Yoga' ? (
                    <Flower2 className="w-5 h-5 text-[#4C423A]" />
                  ) : (
                    <Footprints className="w-5 h-5 text-[#4C423A]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif font-bold text-base text-[#201C1A] group-hover:text-[#B8543F] transition-colors">
                      {practice.title}
                    </h3>
                    <span className="text-xs font-semibold text-[#B8543F] shrink-0 bg-[#FBF0EC] px-2.5 py-0.5 rounded-full border border-[#F2D7D0]">
                      {practice.minutes} min
                    </span>
                  </div>

                  <p className="text-xs font-medium text-[#75685F] mt-0.5">
                    {practice.discipline} • {practice.category}
                  </p>

                  <p className="text-xs text-[#5F554D] mt-2 leading-relaxed line-clamp-2">
                    {practice.description}
                  </p>
                </div>

                <div className="self-center pl-2">
                  <button
                    aria-label={`Start ${practice.title}`}
                    className="w-8 h-8 rounded-full bg-[#F7F1E9] group-hover:bg-[#B8543F] group-hover:text-white text-[#75685F] flex items-center justify-center transition cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
