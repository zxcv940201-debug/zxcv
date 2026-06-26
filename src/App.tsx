import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, FileText, Sparkles, MapPin, Search, Calendar, Phone, Plus, ClipboardCopy, Info } from 'lucide-react';
import { auth } from './lib/firebase';
import { Pet, Application } from './types';

// Importing Custom Sub-components
import Navbar from './components/Navbar';
import PetCard from './components/PetCard';
import PetFilter from './components/PetFilter';
import PetDetailModal from './components/PetDetailModal';
import AdoptionFormModal from './components/AdoptionFormModal';
import AddPetModal from './components/AddPetModal';
import AuthModal from './components/AuthModal';

export default function App() {
  // Authentication states
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Application data lists
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  // Page layout toggles
  const [activeTab, setActiveTab2] = useState<'explore' | 'favorites' | 'applications'>('explore');
  
  // Custom filter conditions
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active modal parameters
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [isAdoptionFormOpen, setIsAdoptionFormOpen] = useState(false);

  // Elegant Toast management
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  // 1. Observe Authentication Status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingUser(false);
      if (firebaseUser) {
        showToast(`歡迎回來！已登入為 ${firebaseUser.email?.split('@')[0]}`, 'success');
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Pets dynamically from Backend Express API
  const fetchPets = async () => {
    setLoadingPets(true);
    try {
      const url = new URL('/api/pets', window.location.origin);
      if (selectedSpecies !== 'all') url.searchParams.append('species', selectedSpecies);
      if (selectedTag !== 'all') url.searchParams.append('tag', selectedTag);
      if (searchQuery) url.searchParams.append('search', searchQuery);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('無法取得寵物列表');
      
      const data = await res.json();
      setPets(data);
    } catch (err: any) {
      console.error(err);
      showToast('載入寵物資訊失敗，請檢查伺服器或重新整理。', 'error');
    } finally {
      setLoadingPets(false);
    }
  };

  // Re-fetch pets when filters change
  useEffect(() => {
    fetchPets();
  }, [selectedSpecies, selectedTag, searchQuery]);

  // 3. Fetch Favorites from backend
  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    try {
      const res = await fetch(`/api/favorites?userId=${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        // data will be array of favorite nodes like [{userId, petId}]
        setFavorites(data.map((fav: any) => fav.petId));
      }
    } catch (err) {
      console.error("Could not fetch favorites:", err);
    }
  };

  // 4. Fetch Applications list from backend
  const fetchApplications = async () => {
    if (!user) {
      setApplications([]);
      return;
    }
    try {
      const res = await fetch(`/api/applications?userId=${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Could not fetch applications:", err);
    }
  };

  // Reload personal lists on auth state modification
  useEffect(() => {
    if (user) {
      fetchFavorites();
      fetchApplications();
    } else {
      setFavorites([]);
      setApplications([]);
    }
  }, [user]);

  // 5. Handle Toggling Favorites (Authenticated only, otherwise triggers Login)
  const handleToggleFavorite = async (petId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Avoid card click details bubble
    
    if (!user) {
      showToast('請先登入帳號以使用「收藏功能」唷！', 'info');
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, petId })
      });
      
      if (!res.ok) throw new Error('操作失敗');
      
      const result = await res.json();
      if (result.action === 'added') {
        setFavorites(prev => [...prev, petId]);
        showToast('已將心儀寶貝加入收藏清單 💖', 'success');
      } else {
        setFavorites(prev => prev.filter(id => id !== petId));
        showToast('已將寶貝從收藏中移除', 'info');
      }
    } catch (err) {
      showToast('網路忙碌中，請稍後重試。', 'error');
    }
  };

  // 6. Logout operation
  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast('已安全登出系統。下次再來看毛孩唷！', 'success');
      setActiveTab2('explore');
    } catch (err) {
      showToast('登出發生未知問題', 'error');
    }
  };

  // Favorite pets selection computation filtering
  const favoritedPetsList = pets.filter(p => favorites.includes(p.id));

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text flex flex-col font-sans selection:bg-natural-primary selection:text-white" id="main_app_wrapper">
      
      {/* Visual Header & Navbar */}
      <Navbar 
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab2}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAddPet={() => setIsAddPetModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Floating Instant Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className={`fixed top-18 right-4 sm:right-6 z-50 flex items-center space-x-2.5 px-4.5 py-3 rounded-2xl shadow-xl text-xs font-bold text-white tracking-wide border select-none ${
              toastType === 'success' ? 'bg-natural-primary border-natural-primary' : 
              toastType === 'info' ? 'bg-natural-secondary border-natural-border' : 'bg-rose-650 border-rose-500'
            }`}
            id="toast_alert"
          >
            <span>{toastType === 'success' ? '✨' : toastType === 'info' ? '💡' : '⚠️'}</span>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Welcome Banner */}
      <section className="bg-natural-secondary text-[#faf7f2] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden shrink-0 shadow-inner rounded-b-[2rem]" id="hero_section">
        {/* Abstract design elements to eliminate slop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl transform translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-natural-primary/10 rounded-full blur-xl"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="text-center md:text-left space-y-3.5">
            <div className="inline-flex items-center space-x-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide text-natural-tan border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>給一個溫暖避風港 • 領養代替購買</span>
            </div>
            <h1 className="text-3xl sm:text-4.5xl font-bold font-serif italic tracking-tight leading-tight">
              萌寵尋家園 • 即時認養媒合平台
            </h1>
            <p className="text-sm text-natural-tan/90 max-w-xl leading-relaxed">
              本平台資料庫直接串接 Firestore，為您提供最即時的毛孩認養資訊。所有認養申請皆由專業義工審件，給毛孩一個可以安心依賴的家。
            </p>
          </div>

          {/* Core Interactive Statistics Card */}
          <div className="w-full md:w-auto bg-white/10 backdrop-blur-md border border-white/10 p-5.5 rounded-3xl grid grid-cols-3 gap-6 text-center select-none shadow-lg">
            <div>
              <div className="text-2xl font-extrabold text-white">1,248+</div>
              <div className="text-[10px] text-natural-tan font-bold mt-0.5">成功尋家</div>
            </div>
            <div className="border-x border-white/10 px-4">
              <div className="text-2xl font-extrabold text-[#e9e0d5]">{pets.length || '...'}</div>
              <div className="text-[10px] text-natural-tan font-bold mt-0.5">線上待領</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#d7ccc8]">{applications.length}</div>
              <div className="text-[10px] text-natural-tan font-bold mt-0.5">我的申請案</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Core Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" id="main_content_container">
        
        {/* Protected Routing Guard Visuals for Secondary sections */}
        {activeTab === 'favorites' && !user && (
          <div className="bg-white rounded-3xl border border-natural-border p-12 text-center max-w-md mx-auto space-y-6 shadow-sm animate-in zoom-in-95" id="favorites_login_guard">
            <div className="w-16 h-16 bg-natural-tan/10 rounded-full flex items-center justify-center text-3xl mx-auto border border-natural-border">💝</div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-natural-secondary font-serif italic">「我的收藏」為受保護版塊</h2>
              <p className="text-xs text-natural-text leading-relaxed">您必須登入愛心帳號，才可儲存、查看並管理您所中意的毛孩列表唷！</p>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full bg-natural-primary hover:bg-natural-secondary text-white text-xs font-bold py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer hover:shadow-lg"
              id="btn_favorites_guard_auth"
            >
              登入 / 註冊 啟用收藏庫
            </button>
          </div>
        )}

        {activeTab === 'applications' && !user && (
          <div className="bg-white rounded-3xl border border-natural-border p-12 text-center max-w-md mx-auto space-y-6 shadow-sm animate-in zoom-in-95" id="applications_login_guard">
            <div className="w-16 h-16 bg-natural-tan/10 rounded-full flex items-center justify-center text-3xl mx-auto border border-natural-border">📋</div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-natural-secondary font-serif italic">「認養代辦與申請」需登入使用</h2>
              <p className="text-xs text-natural-text leading-relaxed">登入後能完整查閱您提出的認養審查問卷狀態、合約進度，或建立您自己的送養資訊。</p>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full bg-natural-primary hover:bg-natural-secondary text-white text-xs font-bold py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer hover:shadow-lg"
              id="btn_applications_guard_auth"
            >
              一鍵登入 查看申請案進度
            </button>
          </div>
        )}

        {/* TAB 1: Explore Pet Feed */}
        {activeTab === 'explore' && (
          <div className="space-y-6 animate-in fade-in duration-200" id="explore_tab_view">
            {/* Filter controls widget */}
            <PetFilter 
              selectedSpecies={selectedSpecies}
              setSelectedSpecies={setSelectedSpecies}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            {/* Pets Feed Grid */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-xs font-bold text-natural-secondary uppercase tracking-widest flex items-center space-x-1 font-serif italic">
                  <span>🐾</span>
                  <span>即時動態萌物餵養列表 ({pets.length} 隻適合您)</span>
                </h2>
                {user && (
                  <button 
                    onClick={() => setIsAddPetModalOpen(true)}
                    className="text-xs text-natural-primary font-bold hover:text-natural-secondary hover:underline flex items-center space-x-1"
                    id="btn_inline_add_pet"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>刊登新送養資訊</span>
                  </button>
                )}
              </div>

              {loadingPets ? (
                // Loading Grid placeholders
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                  {[1, 2, 3, 4].map((id) => (
                    <div key={id} className="bg-white border border-natural-border/70 rounded-2xl h-80 animate-pulse flex flex-col overflow-hidden">
                      <div className="bg-natural-bg aspect-[4/3] w-full"></div>
                      <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="h-5 bg-natural-bg rounded-lg w-1/2"></div>
                          <div className="h-4 bg-natural-bg rounded-lg w-3/4"></div>
                        </div>
                        <div className="h-7 bg-natural-bg rounded-lg w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : pets.length === 0 ? (
                // Empty search result screen
                <div className="bg-white border border-natural-border/80 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4" id="explore_empty_state">
                  <div className="text-4xl">🥱</div>
                  <h3 className="text-base font-bold text-natural-secondary font-serif italic">找不到符合條件的萌寵</h3>
                  <p className="text-xs text-natural-text leading-normal">
                    要不要試試清除篩選條件，或是換個搜尋字詞看看其他同樣可愛的寶貝呢？
                  </p>
                  <button
                    onClick={() => {
                      setSelectedSpecies('all');
                      setSelectedTag('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-natural-bg text-natural-secondary border border-natural-border text-xs font-semibold rounded-xl hover:bg-natural-tan/10 transition-colors"
                  >
                    顯示全部寵物
                  </button>
                </div>
              ) : (
                // Grid of real results
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2" id="explore_pets_grid">
                  {pets.map((pet) => (
                    <PetCard 
                      key={pet.id}
                      pet={pet}
                      isFavorite={favorites.includes(pet.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onViewDetails={setSelectedPet}
                      userLoggedIn={!!user}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Favorites Panel (Authenticated verification) */}
        {activeTab === 'favorites' && user && (
          <div className="space-y-6 animate-in fade-in duration-200" id="favorites_tab_view">
            <h2 className="text-base font-bold text-natural-secondary flex items-center space-x-1.5 font-serif italic">
              <span className="text-rose-500">💖</span>
              <span>我心儀的收藏清單 ({favoritedPetsList.length} 個毛孩)</span>
            </h2>

            {favoritedPetsList.length === 0 ? (
              <div className="bg-white border border-natural-border rounded-3xl p-12 text-center max-w-sm mx-auto space-y-4 shadow-sm" id="favorites_empty_state">
                <div className="text-4xl text-natural-primary">🛋️</div>
                <h3 className="text-base font-bold text-natural-secondary font-serif italic">暫無收藏任何寵物</h3>
                <p className="text-xs text-natural-text leading-normal">
                  您在探索好物時，點選卡片右上角的小愛心，喜歡的毛孩就會出現在這裡囉！
                </p>
                <button
                  onClick={() => setActiveTab2('explore')}
                  className="px-4 py-2.5 bg-natural-primary hover:bg-natural-secondary text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all"
                >
                  去探索看看吧
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="favorites_pets_grid">
                {favoritedPetsList.map((pet) => (
                  <PetCard 
                    key={pet.id}
                    pet={pet}
                    isFavorite={true}
                    onToggleFavorite={handleToggleFavorite}
                    onViewDetails={setSelectedPet}
                    userLoggedIn={!!user}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: My Applications Panel (Authenticated verification) */}
        {activeTab === 'applications' && user && (
          <div className="space-y-6 animate-in fade-in duration-200" id="applications_tab_view">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-natural-secondary flex items-center space-x-1.5 font-serif italic">
                  <span className="text-natural-primary">📋</span>
                  <span>我的認養申請進度追蹤 ({applications.length} 筆案件)</span>
                </h2>
                <p className="text-xs text-natural-muted mt-1">
                  每筆認養書送出後即啟動審查程序，大約需要 3-5 個志工工作天，請密切留意電話與郵件聯絡。
                </p>
              </div>
              <button
                onClick={() => setIsAddPetModalOpen(true)}
                className="flex items-center space-x-1 bg-natural-primary hover:bg-natural-secondary text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer self-start sm:self-center"
                id="btn_create_listing_app"
              >
                <Plus className="w-4 h-4" />
                <span>我要進行送養刊登</span>
              </button>
            </div>

            {applications.length === 0 ? (
              <div className="bg-white border border-natural-border rounded-3xl p-12 text-center max-w-sm mx-auto space-y-4 shadow-sm" id="apps_empty_state">
                <div className="text-4xl text-natural-primary">🕊️</div>
                <h3 className="text-base font-bold text-natural-secondary font-serif italic">尚未提交任何認養申請</h3>
                <p className="text-xs text-natural-text leading-normal">
                  您目前沒有審核中的申請書。如果有看中合適自己起居作息的毛孩子，請立即點下「申請認養」送出表單！
                </p>
                <button
                  onClick={() => setActiveTab2('explore')}
                  className="px-4 py-2.5 bg-natural-primary hover:bg-natural-secondary text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all"
                >
                  前往萌寵區挑選
                </button>
              </div>
            ) : (
              // Applications Timeline / Table list
              <div className="bg-white border border-natural-border rounded-3xl overflow-hidden shadow-sm space-y-0" id="applications_list_panel">
                <div className="bg-[#f5f5f0] px-6 py-4.5 border-b border-natural-border">
                  <h3 className="text-xs font-bold text-natural-secondary uppercase tracking-widest font-serif italic">目前審查清單 (Firebase 即時連線存取)</h3>
                </div>
                <div className="divide-y divide-natural-border/50">
                  {applications.map((app) => (
                    <div key={app.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-6" id={`application_row_${app.id}`}>
                      {/* Left: Pet description & adopter details */}
                      <div className="flex items-center space-x-4 w-full md:w-2/3">
                        <img 
                          src={app.petImageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=150"} 
                          alt={app.petName}
                          className="w-16 h-16 object-cover rounded-2xl border border-natural-border"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-natural-secondary font-serif">對象：{app.petName}</h4>
                            <span className="text-[10px] bg-natural-tan/30 text-natural-secondary px-2 py-0.5 rounded-md border border-natural-primary/20 text-center font-semibold">
                              {app.experience}
                            </span>
                          </div>
                          <p className="text-xs text-natural-muted">申請單編號: <span className="font-mono">{app.id}</span></p>
                          <div className="text-[11px] text-natural-text mt-1 flex flex-wrap gap-x-4">
                            <span>聯絡電話: {app.phone}</span>
                            <span>工作職業: {app.occupation || '未提供'}</span>
                            <span>送出日期: {new Date(app.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Step Status display */}
                      <div className="flex flex-col items-center md:items-end space-y-2 w-full md:w-1/3 select-none">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-natural-primary animate-ping"></span>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                            app.status === '已送出' ? 'bg-natural-tan/35 text-natural-secondary border-natural-border' :
                            app.status === '審核中' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            app.status === '已批准' ? 'bg-natural-primary/10 text-natural-secondary border-natural-primary/20' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-natural-muted leading-tight text-center md:text-right">
                          {app.status === '已送出' ? '我們已收到您的申請書，即將指派義工一對一審閱。' :
                           app.status === '審核中' ? '義工目前正在進行書面過濾，或即將與您撥打電話訪談。' :
                           app.status === '已批准' ? '恭喜您通過認養審查！我們將於三日內派專人協助簽署合約。' :
                           '感謝您的愛心，經評估本次可能暫時不合適，請保持聯絡！'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Aesthetic Footer */}
      <footer className="bg-natural-secondary text-[#faf7f2] py-10 px-4 text-center mt-12 shrink-0 select-none border-t border-natural-border">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="text-xs font-semibold text-natural-tan font-serif italic">🐾 萌寵尋家園 • 領養代替購買，愛他/她就不要輕易棄養他/她</p>
          <p className="text-[10px] text-natural-tan/80 font-mono">
            Full-Stack Project running on Cloud Run sandbox with Firebase Authentication & Google Firestore Service.
          </p>
        </div>
      </footer>

      {/* --- FLOATING OVERLAYS CONTROL ANCHORS --- */}
      
      {/* 1. Auth Login/Register Modal */}
      {isAuthModalOpen && (
        <AuthModal 
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            // Refresh states
            fetchFavorites();
            fetchApplications();
          }}
        />
      )}

      {/* 2. Add Pet Listing Modal */}
      {isAddPetModalOpen && (
        <AddPetModal 
          onClose={() => setIsAddPetModalOpen(false)}
          onSubmitSuccess={() => {
            setIsAddPetModalOpen(false);
            showToast('新毛孩送養資訊已成功上架！感謝您的愛心！', 'success');
            // Re-fetch explore feed
            fetchPets();
            setActiveTab2('explore');
          }}
        />
      )}

      {/* 3. Pet Detail Modal */}
      {selectedPet && (
        <PetDetailModal 
          pet={selectedPet}
          onClose={() => setSelectedPet(null)}
          isFavorite={favorites.includes(selectedPet.id)}
          onToggleFavorite={handleToggleFavorite}
          userLoggedIn={!!user}
          onOpenAuth={() => {
            setSelectedPet(null);
            setIsAuthModalOpen(true);
          }}
          onAdopt={(pet) => {
            setSelectedPet(null); // Close details
            setIsAdoptionFormOpen(true); // Open adoption wizard formulation
          }}
        />
      )}

      {/* 4. Adoption Application Form Modal */}
      {isAdoptionFormOpen && selectedPet && (
        <AdoptionFormModal 
          pet={selectedPet}
          user={user}
          onClose={() => setIsAdoptionFormOpen(false)}
          onSubmitSuccess={() => {
            setIsAdoptionFormOpen(false);
            setSelectedPet(null);
            showToast('已成功為您送出認養申請！請静待義工審查通知 💌', 'success');
            fetchApplications();
            fetchPets(); // Refresh statuses on screen
            setActiveTab2('applications');
          }}
        />
      )}

    </div>
  );
}
