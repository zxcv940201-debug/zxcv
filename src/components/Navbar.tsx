import React, { useState } from 'react';
import { User, LogOut, LogIn, PlusCircle, Heart, FileText, Sparkles, Menu, X } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  user: FirebaseUser | null;
  activeTab: 'explore' | 'favorites' | 'applications';
  setActiveTab: (tab: 'explore' | 'favorites' | 'applications') => void;
  onOpenAuth: () => void;
  onOpenAddPet: () => void;
  onLogout: () => void;
}

export default function Navbar({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenAddPet,
  onLogout
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: 'explore' | 'favorites' | 'applications') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-natural-border sticky top-0 z-40 navbar-container" id="nav_container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3.5 cursor-pointer flex-shrink-0" onClick={() => handleTabClick('explore')} id="navbar_logo">
            <div className="w-10 h-10 bg-natural-primary rounded-full flex items-center justify-center text-white shadow-sm">
              <span className="text-lg">🐾</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-natural-secondary font-serif italic leading-none">
                萌寵之家
              </span>
              <span className="text-[10px] text-natural-muted font-sans font-medium mt-0.5">Pet Adoption</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6" id="desktop_tabs">
            <button
              onClick={() => handleTabClick('explore')}
              className={`flex items-center space-x-1.5 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'explore'
                  ? 'text-natural-secondary bg-natural-tan/40 border border-natural-border/60 shadow-sm'
                  : 'text-natural-muted hover:text-natural-primary hover:bg-natural-bg'
              }`}
              id="tab_explore"
            >
              <Sparkles className="w-4 h-4" />
              <span>探索萌寵</span>
            </button>

            <button
              onClick={() => handleTabClick('favorites')}
              className={`flex items-center space-x-1.5 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'favorites'
                  ? 'text-natural-secondary bg-natural-tan/40 border border-natural-border/60 shadow-sm'
                  : 'text-natural-muted hover:text-natural-primary hover:bg-natural-bg'
              }`}
              id="tab_favorites"
            >
              <Heart className="w-4 h-4" />
              <span>我的收藏</span>
            </button>

            <button
              onClick={() => handleTabClick('applications')}
              className={`flex items-center space-x-1.5 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'applications'
                  ? 'text-natural-secondary bg-natural-tan/40 border border-natural-border/60 shadow-sm'
                  : 'text-natural-muted hover:text-natural-primary hover:bg-natural-bg'
              }`}
              id="tab_applications"
            >
              <FileText className="w-4 h-4" />
              <span>代辦與申請</span>
            </button>

            {user && (
              <button
                onClick={onOpenAddPet}
                className="flex items-center space-x-1.5 py-2 px-3 rounded-xl text-sm font-medium text-natural-secondary bg-natural-bg hover:bg-natural-tan/20 transition-all border border-natural-border"
                id="btn_add_listing"
              >
                <PlusCircle className="w-4 h-4" />
                <span>我要送養</span>
              </button>
            )}
          </div>

          {/* Desktop User Status */}
          <div className="hidden md:flex items-center space-x-4" id="desktop_auth_zone">
            {user ? (
              <div className="flex items-center space-x-3 bg-natural-bg p-1.5 pl-3 pr-2.5 rounded-full border border-natural-border">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-natural-text max-w-[120px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                  <span className="text-[9px] text-natural-muted">已登入</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-natural-tan text-natural-secondary flex items-center justify-center font-bold text-sm border-2 border-white overflow-hidden">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-natural-muted hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                  title="登出"
                  id="btn_logout_desktop"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 bg-natural-primary hover:bg-natural-secondary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:shadow-md transition-all cursor-pointer active:scale-95"
                id="btn_login_desktop"
              >
                <LogIn className="w-4 h-4" />
                <span>登入 / 註冊</span>
              </button>
            )}
          </div>

          {/* Hamburger Menu Icon */}
          <div className="flex md:hidden" id="mobile_trigger">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-natural-bg border-b border-natural-border absolute top-16 left-0 w-full shadow-lg p-4 space-y-3 z-50 animate-in slide-in-from-top-4" id="mobile_menu">
          <button
            onClick={() => handleTabClick('explore')}
            className={`flex w-full items-center space-x-2.5 p-3 rounded-xl text-left text-sm font-semibold transition-all ${
              activeTab === 'explore' ? 'text-natural-secondary bg-natural-tan/40 border border-natural-border/60 shadow-sm' : 'text-natural-text hover:bg-white'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>探索萌寵</span>
          </button>

          <button
            onClick={() => handleTabClick('favorites')}
            className={`flex w-full items-center space-x-2.5 p-3 rounded-xl text-left text-sm font-semibold transition-all ${
              activeTab === 'favorites' ? 'text-natural-secondary bg-natural-tan/40 border border-natural-border/60 shadow-sm' : 'text-natural-text hover:bg-white'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span>我的收藏</span>
          </button>

          <button
            onClick={() => handleTabClick('applications')}
            className={`flex w-full items-center space-x-2.5 p-3 rounded-xl text-left text-sm font-semibold transition-all ${
              activeTab === 'applications' ? 'text-natural-secondary bg-natural-tan/40 border border-natural-border/60 shadow-sm' : 'text-natural-text hover:bg-white'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>代辦與申請</span>
          </button>

          {user && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAddPet();
              }}
              className="flex w-full items-center space-x-2.5 p-3 rounded-xl text-left text-sm font-semibold text-natural-secondary bg-natural-tan/20 border border-natural-border"
            >
              <PlusCircle className="w-5 h-5" />
              <span>我要送養</span>
            </button>
          )}

          <hr className="border-natural-border my-2" />

          {user ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 bg-white p-2.5 rounded-xl border border-natural-border">
                <div className="w-9 h-9 rounded-full bg-natural-tan text-natural-secondary flex items-center justify-center font-bold text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-natural-text truncate">{user.email}</span>
                  <span className="text-[10px] text-natural-muted">已登入</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center justify-center space-x-2 p-3 bg-rose-50 text-rose-600 text-sm font-semibold rounded-xl"
              >
                <LogOut className="w-5 h-5" />
                <span>登出</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="flex w-full items-center justify-center space-x-2 p-3 bg-natural-primary text-white text-sm font-semibold rounded-xl hover:bg-natural-secondary"
            >
              <LogIn className="w-5 h-5" />
              <span>登入 / 註冊</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
