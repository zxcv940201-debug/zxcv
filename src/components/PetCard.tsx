import React from 'react';
import { Heart, SearchCode, Calendar, Info, ShieldAlert } from 'lucide-react';
import { Pet } from '../types';

interface PetCardProps {
  key?: string | number;
  pet: Pet;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onViewDetails: (pet: Pet) => void;
  userLoggedIn: boolean;
}

export default function PetCard({
  pet,
  isFavorite,
  onToggleFavorite,
  onViewDetails,
  userLoggedIn
}: PetCardProps) {
  // Determine species emoji
  const getSpeciesEmoji = (species: string) => {
    switch (species.toLowerCase()) {
      case 'dog': return '🐶';
      case 'cat': return '🐱';
      case 'rabbit': return '🐰';
      case 'bird': return '🐦';
      default: return '🐾';
    }
  };

  const statusTheme = () => {
    switch (pet.status) {
      case '待認養':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case '審核中':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case '已認養':
        return 'bg-gray-100 text-gray-500 border-gray-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  return (
    <div 
      className="group bg-white rounded-2xl overflow-hidden border border-natural-border/60 hover:border-natural-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full cursor-pointer relative"
      onClick={() => onViewDetails(pet)}
      id={`pet_card_${pet.id}`}
    >
      {/* Pet Image with Header Overlays */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-natural-bg">
        <img 
          src={pet.imageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400"} 
          alt={pet.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback image if source URL breaks
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400";
          }}
        />
        
        {/* Semi-transparent Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60"></div>
        
        {/* Status Badge */}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm ${statusTheme()}`}>
          {pet.status}
        </span>

        {/* Favorite Heart Trigger */}
        <button
          onClick={(e) => onToggleFavorite(pet.id, e)}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all border shadow-sm ${
            isFavorite 
              ? 'bg-rose-50 border-rose-200/50 text-rose-600 scale-110' 
              : 'bg-white/80 border-natural-border text-natural-muted hover:text-rose-600 hover:bg-white hover:scale-105'
          }`}
          title={isFavorite ? "取消收藏" : "加入收藏"}
          id={`btn_fav_${pet.id}`}
        >
          <Heart className="w-4.5 h-4.5 fill-current" />
        </button>

        {/* Species Emoji tag */}
        <span className="absolute bottom-3 right-3 text-xs bg-white/95 px-2.5 py-1 rounded-xl shadow-sm border border-natural-border text-natural-text font-medium">
          {getSpeciesEmoji(pet.species)} {pet.breed}
        </span>
      </div>

      {/* Content */}
      <div className="p-4.5 flex-grow flex flex-col justify-between" id="pet_card_body">
        <div>
          {/* Title / Breed */}
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-lg font-bold text-natural-secondary font-serif italic group-hover:text-natural-primary transition-colors">
              {pet.name}
            </h3>
            <span className="text-xs text-natural-muted font-mono">
              {pet.gender} • {pet.age}
            </span>
          </div>

          {/* Core Info Summary */}
          <p className="text-natural-text/80 text-xs line-clamp-2 mb-4 leading-relaxed">
            {pet.description}
          </p>
        </div>

        <div>
          {/* Personality Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {pet.personalityTags?.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="text-[10px] bg-[#f5f5f0] text-natural-text font-medium px-2 py-0.5 rounded-full border border-natural-tan/60"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Action Details Trigger CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-natural-border/40">
            <span className="text-[10px] text-natural-muted flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>刊登於 {pet.createdAt ? new Date(pet.createdAt).toLocaleDateString() : "近期"}</span>
            </span>
            <span className="text-xs text-natural-primary font-semibold group-hover:underline flex items-center space-x-0.5">
              <span>查看詳情</span>
              <Info className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
