import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ArrowRight,
  Sun,
  Footprints,
  Moon,
  Sparkles,
  Flame,
  Music,
  Heart,
  Utensils,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Filter,
  Leaf,
  Award,
  PlusCircle,
  X,
} from 'lucide-react';
import { Practice, DietMeal, DisciplineType, LevelType, TimeSlotType, UserSession } from '../types';
import { COMPREHENSIVE_DIET_PLANS } from '../data/categoriesData';

interface ExploreScreenProps {
  practices: Practice[];
  onSelectPractice: (practice: Practice) => void;
  session?: UserSession | null;
  onShowToast?: (title: string, message: string) => void;
}

type MainTab = 'All' | DisciplineType | 'Diet Plans';

const DISCIPLINE_TABS: { id: MainTab; label: string; icon: any }[] = [
  { id: 'All', label: 'All Practices', icon: Sparkles },
  { id: 'Yoga', label: 'Yoga & Flows', icon: Sun },
  { id: 'Kathak', label: 'Kathak Dance', icon: Footprints },
  { id: 'Bollywood', label: 'Bollywood', icon: Music },
  { id: 'Semi-Classical', label: 'Semi-Classical', icon: Heart },
  { id: 'Zumba', label: 'Zumba Fitness', icon: Flame },
  { id: 'Meditation', label: 'Meditation', icon: Moon },
  { id: 'Diet Plans', label: 'Diet Plans', icon: Utensils },
];

const TOPICS_BY_DISCIPLINE: Record<string, string[]> = {
  Yoga: [
    'All Flows',
    'Vinyasa Flow',
    'Hatha Yoga',
    'Ashtanga Yoga',
    'Yin & Restorative',
    'Power Yoga',
    'Kundalini Yoga',
    'Restorative Yoga',
  ],
  Kathak: [
    'All Topics',
    'Tatkar & Footwork',
    'Chakkars & Spins',
    'Teentaal & Rhythm',
    'Hastaks & Mudras',
    'Abhinaya & Bhav',
    'Thaat & Aamad',
    'Tukdas & Tihais',
    'Padant Recitation',
  ],
  Bollywood: [
    'All Styles',
    'Hooksteps & Grooves',
    'Commercial Bollywood',
    'Lyrical Bollywood',
    'Festive Folk Fusion',
    'Retro Classic',
    'Dance Party Cardio',
  ],
  'Semi-Classical': [
    'All Themes',
    'Fusion Fundamentals',
    'Abhinaya & Expression',
    'Contemporary Fusion',
    'Devotional Stuti',
    'Sufi Whirling',
  ],
  Zumba: [
    'All Beats',
    'Bolly-Zumba',
    'Latin Rhythms',
    'Low-Impact Tone',
    'HIIT Cardio Zumba',
  ],
  Meditation: [
    'All Methods',
    'Mindfulness',
    'Chakra Alignment',
    'Yoga Nidra',
    'Pranayama',
    'Nada Yoga',
    'Vipassana',
    'Stress Release',
  ],
};

const TIME_SLOT_OPTIONS: { id: TimeSlotType | 'all'; label: string; time: string }[] = [
  { id: 'all', label: 'All Day Schedule', time: 'Full Day' },
  { id: 'early_morning', label: 'Early Morning Detox', time: '06:30 AM' },
  { id: 'breakfast', label: 'Energizing Breakfast', time: '08:30 AM' },
  { id: 'mid_morning', label: 'Mid-Morning Prana Fuel', time: '11:00 AM' },
  { id: 'lunch', label: 'Nourishing Lunch', time: '01:30 PM' },
  { id: 'snack', label: 'Pre-Practice / Snack', time: '05:00 PM' },
  { id: 'dinner', label: 'Light Dinner', time: '07:30 PM' },
  { id: 'night_elixir', label: 'Bedtime Recovery Elixir', time: '09:30 PM' },
];

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  practices: initialPractices,
  onSelectPractice,
  session,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<MainTab>('All');
  const [activeTopic, setActiveTopic] = useState<string>('All');
  const [levelFilter, setLevelFilter] = useState<LevelType | 'All Levels'>('All Levels');
  const [searchQuery, setSearchQuery] = useState('');

  // Diet filter states
  const [dietTypeFilter, setDietTypeFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotType | 'all'>('all');
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
  const [loggedMeals, setLoggedMeals] = useState<Record<string, boolean>>({});

  // Practices & Diet state from API with props fallback
  const [practicesList, setPracticesList] = useState<Practice[]>(initialPractices);
  const [dietPlansList, setDietPlansList] = useState<DietMeal[]>(COMPREHENSIVE_DIET_PLANS);

  // Admin New Practice Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDiscipline, setNewDiscipline] = useState<DisciplineType>('Yoga');
  const [newCategory, setNewCategory] = useState('Vinyasa Flow');
  const [newMinutes, setNewMinutes] = useState(20);
  const [newDescription, setNewDescription] = useState('');
  const [newLevel, setNewLevel] = useState<LevelType>('All Levels');

  // Load from API on mount
  useEffect(() => {
    fetchPractices();
    fetchDietPlans();
  }, []);

  const fetchPractices = async () => {
    try {
      const res = await fetch('/api/practices');
      if (res.ok) {
        const data = await res.json();
        if (data.practices && data.practices.length > 0) {
          setPracticesList(data.practices);
        }
      }
    } catch {
      // fallback
    }
  };

  const fetchDietPlans = async () => {
    try {
      const res = await fetch('/api/diet-plans');
      if (res.ok) {
        const data = await res.json();
        if (data.dietPlans && data.dietPlans.length > 0) {
          setDietPlansList(data.dietPlans);
        }
      }
    } catch {
      // fallback
    }
  };

  // Reset sub-topic when main discipline tab changes
  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab);
    setActiveTopic('All');
  };

  // Filtered Practices
  const filteredPractices = useMemo(() => {
    return practicesList.filter((p) => {
      // Main tab filter
      if (activeTab !== 'All' && activeTab !== 'Diet Plans') {
        if (p.discipline.toLowerCase() !== activeTab.toLowerCase()) return false;
      }

      // Level filter
      if (levelFilter !== 'All Levels') {
        if (p.level && p.level !== 'All Levels' && p.level !== levelFilter) return false;
      }

      // Topic filter
      if (activeTopic !== 'All' && !activeTopic.startsWith('All ')) {
        const top = activeTopic.toLowerCase();
        const matchesCategory = p.category && p.category.toLowerCase().includes(top);
        const matchesTopic = p.topic && p.topic.toLowerCase().includes(top);
        if (!matchesCategory && !matchesTopic) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchTopic = p.topic?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat && !matchTopic) return false;
      }

      return true;
    });
  }, [practicesList, activeTab, levelFilter, activeTopic, searchQuery]);

  // Filtered Diet Plans
  const filteredDietPlans = useMemo(() => {
    return dietPlansList.filter((d) => {
      // Diet type filter
      if (dietTypeFilter !== 'all' && d.dietType !== dietTypeFilter) return false;

      // Time slot filter
      if (selectedTimeSlot !== 'all' && d.timeSlot !== selectedTimeSlot) return false;

      // Level / Goal filter
      if (levelFilter !== 'All Levels' && d.level !== 'All Levels' && d.level !== levelFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = d.title.toLowerCase().includes(q);
        const matchDesc = d.description.toLowerCase().includes(q);
        const matchGoal = d.targetGoal.toLowerCase().includes(q);
        const matchBenefits = d.benefits.toLowerCase().includes(q);
        const matchIng = d.ingredients.some((i) => i.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchGoal && !matchBenefits && !matchIng) return false;
      }

      return true;
    });
  }, [dietPlansList, dietTypeFilter, selectedTimeSlot, levelFilter, searchQuery]);

  // Handle logging a diet meal to daily schedule
  const handleLogMeal = async (meal: DietMeal) => {
    setLoggedMeals((prev) => ({ ...prev, [meal.id]: true }));
    try {
      await fetch('/api/diet-plans/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealId: meal.id,
          mealTitle: meal.title,
          timeSlot: meal.timeLabel,
          calories: meal.calories,
          proteinGrams: meal.proteinGrams,
        }),
      });
    } catch {
      // offline handled
    }

    if (onShowToast) {
      onShowToast(
        'Meal Logged',
        `Added "${meal.title}" to your ${meal.timeLabel} schedule (+${meal.calories} kcal, +${meal.proteinGrams}g protein).`
      );
    }
  };

  // Render discipline card icon
  const renderPracticeIcon = (practice: Practice) => {
    const iconClass = 'w-5 h-5';
    switch (practice.icon) {
      case 'sunny':
        return <Sun className={`${iconClass} text-[#D97706]`} />;
      case 'footprints':
        return <Footprints className={`${iconClass} text-[#B82B5A]`} />;
      case 'moon':
        return <Moon className={`${iconClass} text-[#7C3AED]`} />;
      case 'flame':
        return <Flame className={`${iconClass} text-[#EA580C]`} />;
      case 'music':
        return <Music className={`${iconClass} text-[#DB2777]`} />;
      case 'heart':
        return <Heart className={`${iconClass} text-[#E11D48]`} />;
      case 'utensils':
        return <Utensils className={`${iconClass} text-[#059669]`} />;
      default:
        return <Sparkles className={`${iconClass} text-[#B82B5A]`} />;
    }
  };

  // Discipline accent color
  const getDisciplineBadgeClass = (discipline: DisciplineType) => {
    switch (discipline) {
      case 'Yoga':
        return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
      case 'Kathak':
        return 'bg-[#FCE7F3] text-[#9D174D] border-[#FBCFE8]';
      case 'Bollywood':
        return 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]';
      case 'Semi-Classical':
        return 'bg-[#FFE4E6] text-[#BE123C] border-[#FECDD3]';
      case 'Zumba':
        return 'bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA]';
      case 'Meditation':
        return 'bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]';
      default:
        return 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]';
    }
  };

  // Sub-topics available for current tab
  const currentSubtopics = activeTab !== 'All' && activeTab !== 'Diet Plans'
    ? TOPICS_BY_DISCIPLINE[activeTab] || []
    : [];

  return (
    <div id="explore-screen" className="pb-32 pt-6 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Header with Title and Admin Action */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F161A] tracking-tight flex items-center gap-2">
            Explore Sanctuary
          </h1>
          <p className="mt-1 text-[#6B5C62] text-xs sm:text-sm">
            All types of Yoga, Kathak, Bollywood, Semi-Classical, Zumba, Meditations & Scheduled Diet Plans.
          </p>
        </div>

        {session?.role === 'ADMIN' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#781D32] hover:bg-[#601426] text-white text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Content</span>
          </button>
        )}
      </div>

      {/* Main Discipline & Diet Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {DISCIPLINE_TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
                isSelected
                  ? 'bg-[#781D32] text-white border-[#781D32] shadow-xs'
                  : 'bg-white/90 text-[#6B5C62] hover:bg-white border-[#EADBD5] hover:text-[#1F161A]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#781D32]'}`} />
              <span>{tab.label}</span>
              {tab.id === 'Diet Plans' && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#E6F4EA] text-[#137333]'
                }`}>
                  Veg & Non-Veg
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-topic / Flow Pills (When a specific movement discipline is selected) */}
      {currentSubtopics.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 no-scrollbar bg-[#F9F3F0] p-2 rounded-2xl border border-[#EFE4E0]">
          <span className="text-[11px] font-bold text-[#8A767D] uppercase tracking-wider pl-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Topics:
          </span>
          {currentSubtopics.map((topic) => {
            const isSelected = activeTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => setActiveTopic(topic)}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#1F161A] text-white shadow-xs'
                    : 'bg-white/80 text-[#6B5C62] hover:bg-white border border-[#EAE0DC]'
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>
      )}

      {/* Search and Level Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#94848A]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'Diet Plans'
                ? 'Search meal, nutrients, ingredients, or time...'
                : 'Search postures, flows, mudras, or rhythms...'
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/95 border border-[#EADBD5] text-sm text-[#1F161A] placeholder-[#94848A] focus:outline-none focus:border-[#781D32] focus:ring-1 focus:ring-[#781D32] shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94848A] hover:text-[#1F161A]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Level Selector Pills */}
        <div className="flex items-center gap-1 bg-white/90 p-1 rounded-2xl border border-[#EADBD5] shrink-0 overflow-x-auto">
          {(['All Levels', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => {
            const isSelected = levelFilter === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#781D32] text-white font-semibold shadow-xs'
                    : 'text-[#6B5C62] hover:text-[#1F161A] hover:bg-[#FAF3F0]'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* DIET PLANS VIEW (Veg & Non-Veg with Time Schedule) */}
      {/* ====================================================================== */}
      {activeTab === 'Diet Plans' ? (
        <div className="space-y-4">
          {/* Veg vs Non-Veg Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF3F0] p-3 rounded-2xl border border-[#EADBD5]">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setDietTypeFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  dietTypeFilter === 'all'
                    ? 'bg-[#781D32] text-white shadow-xs'
                    : 'bg-white text-[#6B5C62] hover:bg-white/80 border border-[#EADBD5]'
                }`}
              >
                All Meals ({dietPlansList.length})
              </button>
              <button
                onClick={() => setDietTypeFilter('veg')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  dietTypeFilter === 'veg'
                    ? 'bg-[#166534] text-white shadow-xs'
                    : 'bg-white text-[#166534] hover:bg-[#F0FDF4] border border-[#BBF7D0]'
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
                <span>🌱 Pure Vegetarian</span>
              </button>
              <button
                onClick={() => setDietTypeFilter('non-veg')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  dietTypeFilter === 'non-veg'
                    ? 'bg-[#9A3412] text-white shadow-xs'
                    : 'bg-white text-[#9A3412] hover:bg-[#FFF7ED] border border-[#FED7AA]'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>🍗 Non-Vegetarian</span>
              </button>
            </div>

            <span className="text-[11px] font-medium text-[#7D6D73]">
              Showing {filteredDietPlans.length} scheduled meals
            </span>
          </div>

          {/* Time Schedule Timeline Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {TIME_SLOT_OPTIONS.map((slot) => {
              const isSelected = selectedTimeSlot === slot.id;
              return (
                <button
                  key={slot.id}
                  onClick={() => setSelectedTimeSlot(slot.id)}
                  className={`flex flex-col items-start px-3.5 py-2 rounded-2xl text-xs whitespace-nowrap transition cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-[#1F161A] text-white border-[#1F161A] shadow-xs'
                      : 'bg-white/90 text-[#6B5C62] hover:bg-white border-[#EADBD5]'
                  }`}
                >
                  <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-[#F59E38]' : 'text-[#781D32]'}`}>
                    {slot.time}
                  </span>
                  <span className="font-semibold">{slot.label}</span>
                </button>
              );
            })}
          </div>

          {/* Diet Meal Cards Grid */}
          <div className="space-y-4">
            {filteredDietPlans.length === 0 ? (
              <div className="p-8 text-center bg-white/70 rounded-2xl border border-[#EADBD5]">
                <p className="text-sm text-[#7D6D73]">No diet plans match your current schedule or dietary filter.</p>
              </div>
            ) : (
              filteredDietPlans.map((meal) => {
                const isExpanded = expandedMealId === meal.id;
                const isLogged = loggedMeals[meal.id];

                return (
                  <div
                    key={meal.id}
                    className="p-5 rounded-[24px] bg-white/90 hover:bg-white border border-[#EADBD5] transition-all duration-200 shadow-2xs hover:shadow-xs"
                  >
                    {/* Header: Time, Diet Type, Goal Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs font-mono font-bold text-[#781D32] bg-[#FDEEF3] px-2.5 py-0.5 rounded-full border border-[#F9D2DF]">
                          <Clock className="w-3 h-3" />
                          {meal.timeLabel}
                        </span>

                        <span
                          className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            meal.dietType === 'veg'
                              ? 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
                              : 'bg-[#FFF7ED] text-[#9A3412] border-[#FED7AA]'
                          }`}
                        >
                          {meal.dietType === 'veg' ? <Leaf className="w-3 h-3" /> : <Utensils className="w-3 h-3" />}
                          {meal.dietType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                        </span>

                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FAF3F0] text-[#6B5C62] border border-[#EADBD5]">
                          {meal.targetGoal}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-sm font-bold text-[#1F161A] bg-[#FEF3C7] text-[#92400E] px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
                          {meal.calories} kcal
                        </span>
                      </div>
                    </div>

                    {/* Meal Title & Description */}
                    <h3 className="font-serif font-bold text-base text-[#1F161A] mb-1">
                      {meal.title}
                    </h3>
                    <p className="text-xs text-[#6B5C62] leading-relaxed mb-3">
                      {meal.description}
                    </p>

                    {/* Macro Nutrients Row */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#FAF3F0] rounded-xl border border-[#EADBD5] mb-3 text-center">
                      <div>
                        <span className="text-[10px] text-[#7D6D73] uppercase tracking-wider block">Protein</span>
                        <span className="font-mono font-bold text-xs text-[#1F161A]">{meal.proteinGrams}g</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7D6D73] uppercase tracking-wider block">Complex Carbs</span>
                        <span className="font-mono font-bold text-xs text-[#1F161A]">{meal.carbsGrams}g</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7D6D73] uppercase tracking-wider block">Healthy Fats</span>
                        <span className="font-mono font-bold text-xs text-[#1F161A]">{meal.fatGrams}g</span>
                      </div>
                    </div>

                    {/* Benefits Highlight */}
                    <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] mb-3 flex items-start gap-2">
                      <Award className="w-4 h-4 shrink-0 mt-0.5 text-[#15803D]" />
                      <div>
                        <span className="font-bold">Dancer & Yogi Benefit: </span>
                        <span>{meal.benefits}</span>
                      </div>
                    </div>

                    {/* Expandable Recipe & Ingredients Drawer */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-[#EADBD5] space-y-3">
                        <div>
                          <h4 className="text-xs font-bold text-[#1F161A] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-[#781D32]" /> Key Ingredients:
                          </h4>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-[#4A3C42]">
                            {meal.ingredients.map((ing, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-[#781D32] font-bold">•</span>
                                <span>{ing}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-[#1F161A] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#781D32]" /> Preparation Guide:
                          </h4>
                          <ol className="space-y-1 text-xs text-[#4A3C42] list-decimal list-inside">
                            {meal.preparationInstructions.map((step, idx) => (
                              <li key={idx} className="leading-relaxed">
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons: Toggle Details & Log Meal */}
                    <div className="flex items-center justify-between gap-3 pt-2 mt-1 border-t border-[#F2E6E2]">
                      <button
                        onClick={() => setExpandedMealId(isExpanded ? null : meal.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-[#781D32] hover:text-[#5B1223] transition cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Recipe & Steps' : 'View Ingredients & Prep'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleLogMeal(meal)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs ${
                          isLogged
                            ? 'bg-[#166534] text-white'
                            : 'bg-[#781D32] hover:bg-[#601426] text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isLogged ? 'Logged to Schedule' : 'Log to Today'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* ====================================================================== */
        /* PRACTICES VIEW (Yoga, Kathak, Bollywood, Semi-Classical, Zumba, Meditation) */
        /* ====================================================================== */
        <div className="space-y-3.5">
          {filteredPractices.length === 0 ? (
            <div className="p-8 text-center bg-white/70 rounded-2xl border border-[#EADBD5]">
              <p className="text-sm text-[#7D6D73]">No practices found matching your search and filter criteria.</p>
            </div>
          ) : (
            filteredPractices.map((practice) => {
              const badgeClass = getDisciplineBadgeClass(practice.discipline);

              return (
                <div
                  key={practice.id}
                  onClick={() => onSelectPractice(practice)}
                  className="p-4 sm:p-5 rounded-[22px] bg-white/90 hover:bg-white border border-[#EADBD5] transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer group"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Practice Icon */}
                    <div className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 bg-[#FAF3F0] border border-[#EADBD5] group-hover:border-[#781D32]/30 transition-colors">
                      {renderPracticeIcon(practice)}
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                            {practice.discipline}
                          </span>
                          <span className="text-[11px] font-semibold text-[#7D6D73]">
                            {practice.category}
                          </span>
                          {practice.level && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF3F0] text-[#6B5C62] border border-[#EADBD5] font-medium">
                              {practice.level}
                            </span>
                          )}
                          {practice.intensity && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-medium">
                              {practice.intensity}
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-semibold text-[#781D32] shrink-0 bg-[#FDEEF3] px-2.5 py-0.5 rounded-full border border-[#F9D2DF]">
                          {practice.minutes} min
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-base text-[#1F161A] group-hover:text-[#781D32] transition-colors mt-1">
                        {practice.title}
                      </h3>

                      <p className="text-xs text-[#6B5C62] mt-1.5 leading-relaxed line-clamp-2">
                        {practice.description}
                      </p>

                      {/* Benefits preview if present */}
                      {practice.benefits && practice.benefits.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-[#059669] flex-wrap">
                          <span className="font-semibold flex items-center gap-1">
                            <Award className="w-3 h-3" /> {practice.benefits[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Start arrow button */}
                    <div className="self-center pl-1">
                      <button
                        aria-label={`Start ${practice.title}`}
                        className="w-9 h-9 rounded-full bg-[#FAF3F0] group-hover:bg-[#781D32] group-hover:text-white text-[#94848A] flex items-center justify-center transition cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Admin Quick Add Content Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white text-[#1F161A] w-full max-w-lg rounded-[28px] p-6 shadow-2xl border border-[#EADBD5] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-[#F2E6E2] pb-3">
              <h2 className="font-serif text-xl font-bold text-[#1F161A]">Add New Content</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#FAF3F0] text-[#94848A] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1F161A] uppercase tracking-wider mb-1">
                  Discipline Category
                </label>
                <select
                  value={newDiscipline}
                  onChange={(e) => setNewDiscipline(e.target.value as DisciplineType)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF3F0] border border-[#EADBD5] text-sm text-[#1F161A] focus:outline-none focus:border-[#781D32]"
                >
                  <option value="Yoga">Yoga</option>
                  <option value="Kathak">Kathak</option>
                  <option value="Bollywood">Bollywood</option>
                  <option value="Semi-Classical">Semi-Classical</option>
                  <option value="Zumba">Zumba</option>
                  <option value="Meditation">Meditation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F161A] uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Morning Vinyasa Flow or Kathak Chakkars"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF3F0] border border-[#EADBD5] text-sm text-[#1F161A] focus:outline-none focus:border-[#781D32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F161A] uppercase tracking-wider mb-1">
                  Sub-Topic or Flow Focus
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Vinyasa Flow, Tatkar Footwork, Bolly-Cardio, Abhinaya"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF3F0] border border-[#EADBD5] text-sm text-[#1F161A] focus:outline-none focus:border-[#781D32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F161A] uppercase tracking-wider mb-1">
                    Level
                  </label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as LevelType)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF3F0] border border-[#EADBD5] text-sm text-[#1F161A] focus:outline-none focus:border-[#781D32]"
                  >
                    <option value="All Levels">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F161A] uppercase tracking-wider mb-1">
                    Minutes
                  </label>
                  <input
                    type="number"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Number(e.target.value))}
                    min={5}
                    max={120}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF3F0] border border-[#EADBD5] text-sm text-[#1F161A] focus:outline-none focus:border-[#781D32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F161A] uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe posture alignment, focus, or rhythmic intent..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF3F0] border border-[#EADBD5] text-sm text-[#1F161A] focus:outline-none focus:border-[#781D32]"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#F2E6E2]">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#EADBD5] text-sm font-semibold text-[#6B5C62] hover:bg-[#FAF3F0] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!newTitle.trim()) return;
                    const createdPractice: Practice = {
                      id: 'p-' + Date.now(),
                      title: newTitle,
                      discipline: newDiscipline,
                      category: newCategory,
                      level: newLevel,
                      minutes: newMinutes,
                      description: newDescription || 'Focused daily practice.',
                      icon: newDiscipline === 'Yoga' ? 'sunny' : newDiscipline === 'Zumba' ? 'flame' : 'footprints',
                      intensity: 'Moderate',
                      instructions: [
                        'Warm up and align your posture.',
                        'Execute rhythmic combinations with breath awareness.',
                        'Cool down with calm gratitude.'
                      ],
                      benefits: ['Builds endurance and flexibility']
                    };

                    setPracticesList((prev) => [createdPractice, ...prev]);
                    setIsAddModalOpen(false);

                    try {
                      await fetch('/api/practices', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(createdPractice)
                      });
                    } catch {}

                    if (onShowToast) {
                      onShowToast('Practice Created', `Added "${createdPractice.title}" to ${createdPractice.discipline}`);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#781D32] hover:bg-[#601426] text-white text-sm font-semibold transition cursor-pointer shadow-xs"
                >
                  Publish Practice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
