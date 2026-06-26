import React from 'react';
import { Search, Sparkles, Filter, X } from 'lucide-react';

interface PetFilterProps {
  selectedSpecies: string;
  setSelectedSpecies: (species: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const COMMON_TAGS = ['親人', '活潑', '安靜', '撒嬌', '忠誠', '獨立', '黏人', '溫馴', '好歌喉'];

export default function PetFilter({
  selectedSpecies,
  setSelectedSpecies,
  selectedTag,
  setSelectedTag,
  searchQuery,
  setSearchQuery
}: PetFilterProps) {

  const speciesOptions = [
    { value: 'all', label: '全部寵物', emoji: '🐾' },
    { value: 'dog', label: '狗狗專區', emoji: '🐶' },
    { value: 'cat', label: '貓咪專區', emoji: '🐱' },
    { value: 'rabbit', label: '兔子專區', emoji: '🐰' },
    { value: 'bird', label: '鳥類專區', emoji: '🐦' }
  ];

  const handleClearFilters = () => {
    setSelectedSpecies('all');
    setSelectedTag('all');
    setSearchQuery('');
  };

  const isFiltered = selectedSpecies !== 'all' || selectedTag !== 'all' || searchQuery !== '';

  return (
    <div className="bg-white rounded-2xl border border-natural-border p-5 shadow-sm space-y-5" id="pet_filter_panel">
      {/* Search and Species Quick Tabs */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search Field */}
        <div className="relative flex-grow max-w-lg">
          <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-natural-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋品種、姓名、性格特色..."
            className="w-full bg-natural-bg border border-natural-border rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder-natural-muted focus:outline-none focus:border-natural-primary focus:bg-white transition-all text-natural-text"
            id="input_search_query"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-natural-muted hover:text-natural-text"
              id="btn_clear_search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Clear Filters indicator */}
        {isFiltered && (
          <button
            onClick={handleClearFilters}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1.5 self-end lg:self-center transition-colors px-3 py-2 bg-rose-50 rounded-xl cursor-pointer border border-rose-100"
            id="btn_reset_filters"
          >
            <span>重設篩選條件</span>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Species Quick Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-natural-muted flex items-center space-x-1 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" />
          <span>分類探索</span>
        </label>
        <div className="flex flex-wrap gap-2" id="species_tabs">
          {speciesOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedSpecies(opt.value)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border ${
                selectedSpecies === opt.value
                  ? 'bg-natural-primary border-natural-primary text-white shadow-sm'
                  : 'bg-white border-natural-border text-natural-text hover:border-natural-primary/60 hover:text-natural-primary'
              }`}
              id={`tab_spec_${opt.value}`}
            >
              <span>{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Personality tag filters */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-natural-muted flex items-center space-x-1 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>性格標籤篩選</span>
        </label>
        <div className="flex flex-wrap gap-1.5" id="tag_filters">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
              selectedTag === 'all'
                ? 'bg-natural-secondary text-white border border-natural-secondary'
                : 'bg-[#f5f5f0] text-natural-text border border-natural-border/60 hover:bg-natural-tan/10'
            }`}
            id="tag_filter_all"
          >
            全部性格
          </button>
          {COMMON_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                selectedTag === tag
                  ? 'bg-natural-secondary text-white border border-natural-secondary'
                  : 'bg-[#f5f5f0] text-natural-text border border-natural-border/60 hover:bg-natural-tan/10'
              }`}
              id={`tag_filter_${tag}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
