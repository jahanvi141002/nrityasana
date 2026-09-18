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
    <div id="explore-screen" className="pb-28 pt-8 px-4 sm:px-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F161A] tracking-tight">
          Explore
        </h1>
        <p className="mt-1.5 text-[#6B5C62] text-sm sm:text-base">
          Find a practice that meets you where you are today.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-5">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#94848A]">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by posture, rhythm, or intent..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/90 border border-[#F2E6E2] text-sm text-[#1F161A] placeholder-[#94848A] focus:outline-none focus:border-[#781D32] focus:ring-1 focus:ring-[#781D32] shadow-2xs transition-all"
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
                  ? 'bg-[#781D32] text-white shadow-xs'
                  : 'bg-white/80 text-[#6B5C62] hover:bg-white border border-[#F2E6E2]'
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
          <div className="p-8 text-center bg-white/70 rounded-2xl border border-[#F2E6E2]">
            <p className="text-sm text-[#7D6D73]">No practices found matching your search.</p>
          </div>
        ) : (
          filteredPractices.map((practice) => (
            <div
              key={practice.id}
              onClick={() => onSelectPractice(practice)}
              className="p-4 sm:p-5 rounded-[22px] bg-white/85 hover:bg-white border border-[#F2E6E2] transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 ${
                    practice.discipline === 'Yoga'
                      ? 'bg-[#FEF5EA] border border-[#FCE6CA]'
                      : 'bg-[#FDEEF3] border border-[#F9D2DF]'
                  }`}
                >
                  {practice.discipline === 'Yoga' ? (
                    <Flower2 className="w-5 h-5 text-[#B86B14]" />
                  ) : (
                    <Footprints className="w-5 h-5 text-[#B82B5A]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif font-bold text-base text-[#1F161A] group-hover:text-[#781D32] transition-colors">
                      {practice.title}
                    </h3>
                    <span className="text-xs font-semibold text-[#781D32] shrink-0 bg-[#FDEEF3] px-2.5 py-0.5 rounded-full border border-[#F9D2DF]">
                      {practice.minutes} min
                    </span>
                  </div>

                  <p className="text-xs font-medium text-[#7D6D73] mt-0.5">
                    {practice.discipline} • {practice.category}
                  </p>

                  <p className="text-xs text-[#6B5C62] mt-2 leading-relaxed line-clamp-2">
                    {practice.description}
                  </p>
                </div>

                <div className="self-center pl-2">
                  <button
                    aria-label={`Start ${practice.title}`}
                    className="w-8 h-8 rounded-full bg-[#FAF3F0] group-hover:bg-[#781D32] group-hover:text-white text-[#94848A] flex items-center justify-center transition cursor-pointer"
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
