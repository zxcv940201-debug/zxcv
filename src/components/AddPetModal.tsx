import React, { useState } from 'react';
import { X, Plus, Sparkles, Image, Check } from 'lucide-react';

interface AddPetModalProps {
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export default function AddPetModal({
  onClose,
  onSubmitSuccess
}: AddPetModalProps) {
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('公');
  const [customTag, setCustomTag] = useState('');
  const [tags, setTags] = useState<string[]>(['親人']);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const PRESET_PERSONALITY_TAGS = ['活潑', '安靜', '撒嬌', '忠誠', '獨立', '黏人', '溫馴', '調皮', '慢熟'];

  const handleTogglePresetTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      if (tags.length >= 6) {
        setErrorMsg('性格標籤至多自選 6 個唷');
        return;
      }
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = customTag.trim();
      if (val) {
        if (tags.includes(val)) return;
        if (tags.length >= 6) {
          setErrorMsg('性格標籤至多自選 6 個唷');
          return;
        }
        setTags([...tags, val]);
        setCustomTag('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('請提供寵物名字');
      return;
    }
    if (!breed.trim()) {
      setErrorMsg('請填寫品種（如：米克斯、柯基）');
      return;
    }
    if (!age.trim()) {
      setErrorMsg('請填寫年齡（如：3個月、4歲）');
      return;
    }
    if (tags.length === 0) {
      setErrorMsg('請至少選取一個性格標籤');
      return;
    }

    // Default high-quality fallbacks based on species if image is empty
    let finalImageUrl = imageUrl.trim();
    if (!finalImageUrl) {
      if (species === 'Dog') {
        finalImageUrl = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600";
      } else if (species === 'Cat') {
        finalImageUrl = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600";
      } else if (species === 'Rabbit') {
        finalImageUrl = "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=600";
      } else {
        finalImageUrl = "https://images.unsplash.com/photo-1522850959074-b7c3d2524bc7?auto=format&fit=crop&q=80&w=600";
      }
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          species,
          breed: breed.trim(),
          age: age.trim(),
          gender,
          personalityTags: tags,
          imageUrl: finalImageUrl,
          description: description.trim() || '目前沒有詳細的故事背景描述。期待懂得他/她的主人帶回家！',
          contactInfo: contactInfo.trim() || '請聯繫平台義工專案組'
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || '刊登失败');
      }

      onSubmitSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || '連線伺服器異常');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="add_pet_modal">
      <div className="fixed inset-0 bg-black/55 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-natural-secondary px-6 py-4.5 text-white flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Plus className="w-5 h-5 bg-white/20 p-0.5 rounded-full" />
              <h2 className="text-base font-bold font-serif italic">填寫送養資訊 / 刊登萌寵</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
              id="btn_close_add_pet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-750 text-xs rounded-xl flex items-center space-x-2">
              <span>⚠️</span>
              <p className="font-semibold">{errorMsg}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans" id="form_add_pet">
            
            {/* Row: Name and Species */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-natural-text">名字 <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="如：可樂、小奶油..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-natural-bg border border-natural-border focus:bg-white focus:border-natural-primary text-xs rounded-xl py-2.5 px-3.5 outline-none transition-all text-natural-text"
                  id="input_add_pet_name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-natural-text">種類分類 <span className="text-rose-500">*</span></label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="w-full bg-natural-bg border border-natural-border focus:bg-white focus:border-natural-primary text-xs rounded-xl py-2.5 px-3 mb-1.5 outline-none transition-all text-natural-text"
                >
                  <option value="Dog">🐶 狗狗 (Dog)</option>
                  <option value="Cat">🐱 貓咪 (Cat)</option>
                  <option value="Rabbit">🐰 兔子 (Rabbit)</option>
                  <option value="Bird">🐦 鳥類 (Bird)</option>
                </select>
              </div>
            </div>

            {/* Row: Breed and Age and Gender */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-natural-text">品種 <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="如：柯基 / 米克斯"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="w-full bg-natural-bg border border-natural-border focus:bg-white focus:border-natural-primary text-xs rounded-xl py-2.5 px-3 outline-none transition-all"
                  id="input_add_pet_breed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-natural-text">年齡估計 <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="如：3個月 / 1歲"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-natural-bg border border-natural-border focus:bg-white focus:border-natural-primary text-xs rounded-xl py-2.5 px-3 outline-none transition-all"
                  id="input_add_pet_age"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-natural-text">性別 <span className="text-rose-500">*</span></label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-natural-bg border border-natural-border focus:bg-white focus:border-natural-primary text-xs rounded-xl py-2.5 px-2 outline-none transition-all"
                >
                  <option value="公">公 (Male)</option>
                  <option value="母">母 (Female)</option>
                </select>
              </div>
            </div>

            {/* Tags Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-natural-text flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-natural-primary" />
                <span>性格標籤選取 (已選 {tags.length} / 6 個) <span className="text-rose-500">*</span></span>
              </label>
              
              {/* Preset buttons */}
              <div className="flex flex-wrap gap-1.5" id="presets_container">
                {PRESET_PERSONALITY_TAGS.map((tag) => {
                  const isSelected = tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTogglePresetTag(tag)}
                      className={`px-3 py-1 text-[10px] rounded-lg font-medium transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-natural-tan/40 text-natural-secondary border border-natural-primary' 
                          : 'bg-[#f5f5f0] text-natural-text border border-natural-border/60 hover:bg-natural-tan/10'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Custom search-tag input */}
              <input
                type="text"
                placeholder="或按 Enter 新增自訂性格標籤..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={handleAddCustomTag}
                className="w-full bg-natural-bg border border-natural-border focus:bg-white focus:border-natural-primary text-[11px] rounded-xl py-2 px-3 outline-none transition-all mt-1"
                id="input_add_pet_custom_tag"
              />
            </div>

            {/* Image Url */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-natural-text flex items-center space-x-1">
                <Image className="w-3.5 h-3.5 text-natural-muted" />
                <span>圖片網址 (選填)</span>
              </label>
              <input
                type="url"
                placeholder="請輸入 Unsplash、imgur 圖片連結（若留空將依種類自動分配插圖）"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-natural-bg border border-natural-border focus:bg-white focus:border-natural-primary text-xs rounded-xl py-2.5 px-3.5 outline-none transition-all"
                id="input_add_pet_image"
              />
            </div>

            {/* Description Stories */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-natural-text">毛孩小故事 / 背景情況描述</label>
              <textarea
                rows={3}
                placeholder="形容一下他/她的習慣、目前健康狀況，或者怎麼被救援來到這裡的暖心小故事..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-natural-bg border border-natural-border focus:bg-white focus:border-natural-primary text-xs rounded-xl py-2 px-3 outline-none transition-all resize-none h-18 text-natural-text"
                id="textarea_add_pet_desc"
              ></textarea>
            </div>

            {/* Contact Host Info */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-natural-text">送養窗口聯絡電話 <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                placeholder="例如：0912-345-678 王先生、02-23456789 萌寵中心"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full bg-natural-bg border border-natural-border focus:bg-white focus:border-natural-primary text-xs rounded-xl py-2.5 px-3.5 outline-none transition-all"
                id="input_add_pet_contact"
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-3 border-t border-natural-border/40">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 bg-natural-bg hover:bg-natural-tan/10 text-xs font-bold text-natural-text rounded-xl border border-natural-border text-center cursor-pointer transition-all"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`flex-grow py-2.5 bg-natural-primary hover:bg-natural-secondary text-xs text-white font-bold rounded-xl shadow-md cursor-pointer text-center active:scale-95 transition-all ${
                  submitting ? 'bg-natural-muted cursor-not-allowed shadow-none' : ''
                }`}
                id="btn_submit_add_pet_listing"
              >
                {submitting ? '正在為毛孩尋家刊登中...' : '確認完成並正式刊登送養'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
