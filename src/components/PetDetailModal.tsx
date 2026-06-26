import React from 'react';
import { X, Calendar, User, Phone, ClipboardCheck, Sparkles, Heart } from 'lucide-react';
import { Pet } from '../types';

interface PetDetailModalProps {
  pet: Pet | null;
  onClose: () => void;
  onAdopt: (pet: Pet) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  userLoggedIn: boolean;
  onOpenAuth: () => void;
}

export default function PetDetailModal({
  pet,
  onClose,
  onAdopt,
  isFavorite,
  onToggleFavorite,
  userLoggedIn,
  onOpenAuth
}: PetDetailModalProps) {
  if (!pet) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="pet_detail_modal_container">
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 bg-black/55 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Main Panel Box */}
        <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full text-gray-500 hover:text-gray-700 transition-all shadow-md focus:outline-none cursor-pointer"
            id="btn_close_detail_modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hero Pet Image */}
          <div className="relative w-full aspect-[16/9] bg-natural-bg">
            <img 
              src={pet.imageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600"} 
              alt={pet.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            
            {/* Title overlay */}
            <div className="absolute bottom-5 left-6 text-white">
              <div className="flex items-center space-x-2 mb-1.5 font-sans">
                <span className="bg-natural-primary text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                  {pet.species === 'Dog' ? '🐶 狗狗' : pet.species === 'Cat' ? '🐱 貓咪' : pet.species === 'Rabbit' ? '🐰 兔子' : pet.species === 'Bird' ? '🐦 鳥類' : '🐾 其他'}
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-medium px-2.5 py-1 rounded-lg border border-white/20">
                  {pet.status}
                </span>
              </div>
              <h2 className="text-3xl font-bold font-serif italic tracking-tight">{pet.name}</h2>
            </div>

            {/* Favorite button over hero */}
            <button
              onClick={(e) => onToggleFavorite(pet.id, e)}
              className={`absolute bottom-5 right-6 p-3 rounded-full backdrop-blur-sm transition-all border ${
                isFavorite 
                  ? 'bg-rose-500 border-rose-500 text-white shadow-lg' 
                  : 'bg-white/85 border-natural-border text-rose-600 hover:bg-rose-50'
              }`}
              id={`btn_detail_fav_${pet.id}`}
            >
              <Heart className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Details & Description Section */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Quick Specs Grid */}
            <div className="grid grid-cols-4 gap-2.5">
              <div className="bg-natural-bg p-3 rounded-2xl border border-natural-border/60 flex flex-col items-center">
                <span className="text-[10px] font-semibold text-natural-muted">學名 / 品種</span>
                <span className="text-xs font-bold text-natural-text mt-1 truncate max-w-full">{pet.breed}</span>
              </div>
              <div className="bg-natural-bg p-3 rounded-2xl border border-natural-border/60 flex flex-col items-center">
                <span className="text-[10px] font-semibold text-natural-muted">估計年齡</span>
                <span className="text-xs font-bold text-natural-text mt-1">{pet.age}</span>
              </div>
              <div className="bg-natural-bg p-3 rounded-2xl border border-natural-border/60 flex flex-col items-center">
                <span className="text-[10px] font-semibold text-natural-muted">性別</span>
                <span className="text-xs font-bold text-natural-text mt-1">{pet.gender}</span>
              </div>
              <div className="bg-natural-bg p-3 rounded-2xl border border-natural-border/60 flex flex-col items-center">
                <span className="text-[10px] font-semibold text-natural-muted">目前狀態</span>
                <span className="text-xs font-bold text-natural-primary mt-1">{pet.status}</span>
              </div>
            </div>

            {/* Personality section */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-natural-text flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>性格速寫</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {pet.personalityTags?.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="bg-[#f5f5f0] text-natural-text text-xs font-medium px-2.5 py-1 rounded-lg border border-natural-border/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-natural-secondary font-serif italic">詳細小故事</h4>
              <p className="text-natural-text/80 text-sm leading-relaxed whitespace-pre-line bg-natural-bg/40 p-4 rounded-2xl border border-natural-border/40">
                {pet.description}
              </p>
            </div>

            {/* Contact Host Information */}
            <div className="bg-natural-tan/10 p-4 rounded-2xl border border-natural-border flex items-start space-x-3">
              <Phone className="w-5 h-5 text-natural-primary flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-natural-secondary">送養聯絡窗口資訊</h5>
                <p className="text-xs text-natural-text/90 mt-0.5">{pet.contactInfo || "請先提出認養申請，我們的志工將為您安排實體接觸流程。"}</p>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="pt-4 border-t border-natural-border/40 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="w-full sm:w-1/3 bg-natural-bg hover:bg-natural-tan/10 text-natural-text text-sm font-semibold py-3 rounded-2xl border border-natural-border cursor-pointer active:scale-95 transition-all text-center"
              >
                返回列表
              </button>
              
              {userLoggedIn ? (
                <button
                  onClick={() => onAdopt(pet)}
                  disabled={pet.status === '已認養'}
                  className={`w-full sm:w-2/3 flex items-center justify-center space-x-2 text-white text-sm font-bold py-3 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer ${
                    pet.status === '已認養' 
                      ? 'bg-natural-muted cursor-not-allowed shadow-none' 
                      : 'bg-natural-primary hover:bg-natural-secondary hover:shadow-lg'
                  }`}
                  id="btn_submit_adoption_intent"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>{pet.status === '已認養' ? '此寶貝已被認養囉' : '立即提出認養審核申請'}</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="w-full sm:w-2/3 flex items-center justify-center space-x-2 bg-natural-primary hover:bg-natural-secondary text-white text-sm font-bold py-3 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer hover:shadow-lg"
                  id="btn_auth_first_adopt"
                >
                  <User className="w-4 h-4" />
                  <span>登入帳號後即可「申請認養」</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
