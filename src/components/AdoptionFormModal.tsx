import React, { useState } from 'react';
import { X, Check, Heart, Award, Sparkles, Send } from 'lucide-react';
import { Pet } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface AdoptionFormModalProps {
  pet: Pet | null;
  user: FirebaseUser | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export default function AdoptionFormModal({
  pet,
  user,
  onClose,
  onSubmitSuccess
}: AdoptionFormModalProps) {
  if (!pet || !user) return null;

  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [phone, setPhone] = useState('');
  const [occupation, setOccupation] = useState('');
  const [experience, setExperience] = useState('新手');
  const [reason, setReason] = useState('');
  const [hasAgreement, setHasAgreement] = useState(false);

  const handleNextStep = () => {
    if (step === 1) {
      if (!phone.trim()) {
        setErrorMsg('請填寫方便聯絡的電話號碼');
        return;
      }
      if (!phone.match(/^09\d{8}$/)) {
        setErrorMsg('請填寫正確的手機格式 (e.g. 0912345678)');
        return;
      }
      setErrorMsg('');
      setStep(2);
    } else if (step === 2) {
      if (!reason.trim() || reason.trim().length < 15) {
        setErrorMsg('認養動機與環境描述至少需填寫 15 個字');
        return;
      }
      setErrorMsg('');
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAgreement) {
      setErrorMsg('請確認您已點選同意「愛心認養切結聲明」');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId: pet.id,
          petName: pet.name,
          petImageUrl: pet.imageUrl,
          userId: user.uid,
          userName: user.email?.split('@')[0] || '愛心認養人',
          userEmail: user.email,
          phone,
          occupation,
          experience,
          reason,
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '申請發送失敗');
      }

      // Success
      onSubmitSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || '連線伺服器出錯，請稍後再試。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="adoption_form_modal">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose}></div>

      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Box Contain */}
        <div className="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-250">
          
          {/* Header Title */}
          <div className="bg-natural-secondary px-6 py-5 text-white flex justify-between items-center">
            <div className="flex items-center space-x-2.5">
              <span className="text-xl">🐾</span>
              <div>
                <h2 className="text-lg font-bold font-serif italic">送出認養申請審核書</h2>
                <p className="text-[10px] text-natural-tan">申請對象：{pet.name} ({pet.breed})</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
              id="btn_close_adoption_wizard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress bar */}
          <div className="bg-natural-bg border-b border-natural-border px-6 py-3 flex items-center justify-between text-xs text-natural-muted font-medium">
            <div className="flex items-center space-x-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-natural-primary text-white font-bold' : 'bg-natural-tan text-natural-text'}`}>1</span>
              <span className={step >= 1 ? 'text-natural-secondary font-bold' : ''}>基本資料</span>
            </div>
            <div className="h-[1px] bg-natural-border flex-grow mx-4"></div>
            <div className="flex items-center space-x-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-natural-primary text-white font-bold' : 'bg-natural-tan text-natural-text'}`}>2</span>
              <span className={step >= 2 ? 'text-natural-secondary font-bold' : ''}>飼養經驗與動機</span>
            </div>
            <div className="h-[1px] bg-natural-border flex-grow mx-4"></div>
            <div className="flex items-center space-x-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-natural-primary text-white font-bold' : 'bg-natural-tan text-natural-text'}`}>3</span>
              <span className={step >= 3 ? 'text-natural-secondary font-bold' : ''}>切結聲明</span>
            </div>
          </div>

          {/* Warning banner if there's any */}
          {errorMsg && (
            <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <span className="text-sm">⚠️</span>
              <p className="font-medium">{errorMsg}</p>
            </div>
          )}

          {/* Body content based on step */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5" id="form_adoption_wizard">
            
            {/* STEP 1: Basic Adopter Info */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-150 font-sans">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-natural-text">申請帳號 (Email)</label>
                  <input
                    type="text"
                    value={user.email || ''}
                    disabled
                    className="w-full bg-natural-bg border border-natural-border rounded-xl py-2.5 px-3.5 text-xs text-natural-muted cursor-not-allowed font-mono"
                  />
                  <p className="text-[10px] text-natural-muted">目前為認養安全認證系統登入之主信箱。</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-natural-text">行動電話 <span className="text-rose-500">*</span></label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="請填寫 10 碼台灣手機號碼 (例如 0912345678)"
                    className="w-full bg-white border border-natural-border rounded-xl py-2.5 px-3.5 text-xs text-natural-text placeholder-natural-muted focus:outline-none focus:border-natural-primary"
                    id="input_adopt_phone"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-natural-text">個人職業 (選填)</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="例如：科技業工程師、自由業、學生..."
                    className="w-full bg-white border border-natural-border rounded-xl py-2.5 px-3.5 text-xs text-natural-text placeholder-natural-muted focus:outline-none focus:border-natural-primary"
                    id="input_adopt_occupation"
                  />
                  <p className="text-[10px] text-natural-muted">適度提供職業背景有助於送養中心評估作息與活動流向。</p>
                </div>
              </div>
            )}

            {/* STEP 2: Animal Experience & Motives */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-150 font-sans">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-natural-text">您的寵物飼養習慣 / 經驗 <span className="text-rose-500">*</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    {['新手', '有養過狗/貓', '養寵十冬以上'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setExperience(opt)}
                        className={`py-2 px-3 text-xs rounded-xl border text-center font-semibold transition-all ${
                          experience === opt
                            ? 'bg-natural-tan/40 border-natural-primary text-natural-secondary font-bold'
                            : 'bg-white border-natural-border text-natural-text hover:bg-natural-bg'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-natural-text">
                    認養動機與您能提供給毛孩的環境說明 <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="請對我們講述您想帶萌寵回家的動機、您的家庭成員支持度、家中是否有人全天照顧，以及能提供怎樣的安全活動環境（至少 15 字，謝謝您）..."
                    className="w-full bg-white border border-natural-border rounded-xl py-2.5 px-3.5 text-xs text-natural-text placeholder-natural-muted focus:outline-none focus:border-natural-primary resize-none h-32 leading-relaxed"
                    id="textarea_adopt_reason"
                  ></textarea>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-natural-primary font-medium">✨ 填寫越豐富，成功審核機率越高！</span>
                    <span className={reason.length >= 15 ? 'text-natural-muted' : 'text-rose-500 font-bold'}>
                      已填寫 {reason.length} / 15 字
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Declaration of Adoption Promise */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-150 font-sans">
                <div className="bg-[#f5f5f0] p-4 rounded-2xl border border-natural-border flex flex-col space-y-2 text-xs leading-relaxed text-natural-secondary">
                  <h4 className="font-bold flex items-center space-x-1">
                    <Award className="w-4 h-4 text-natural-primary" />
                    <span>愛心認養承諾書</span>
                  </h4>
                  <ul className="list-decimal list-inside space-y-1.5 text-natural-text font-medium text-[11px]">
                    <li>承諾妥善照顧動物，絕不任意棄養或轉贈。</li>
                    <li>依法為愛犬/貓辦理登記、定期注射疫苗與施行結紮。</li>
                    <li>不長期籠養或栓綁，提供充足無害之飼料和乾淨飲水。</li>
                    <li>願配合平台之線上關懷（如回傳日常照片等）。</li>
                  </ul>
                </div>

                <label className="flex items-start space-x-2.5 p-3 rounded-xl bg-natural-bg/50 border border-natural-border/60 cursor-pointer hover:bg-[#f5f5f0] transition-colors">
                  <input
                    type="checkbox"
                    checked={hasAgreement}
                    onChange={(e) => setHasAgreement(e.target.checked)}
                    className="mt-0.5 rounded border-natural-border text-natural-primary focus:ring-natural-primary w-4 h-4"
                  />
                  <div className="text-[11px] font-semibold text-natural-text leading-tight">
                    我已詳細閱讀上述條款，並承諾我符合認養資格，願意對生命負責，同意以上切結聲明。
                  </div>
                </label>
              </div>
            )}

            {/* Stepper Controllers */}
            <div className="pt-4 border-t border-natural-border/40 flex space-x-3 font-sans">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/3 py-2.5 bg-natural-bg hover:bg-natural-tan/10 border border-natural-border rounded-xl text-xs font-semibold text-natural-text cursor-pointer active:scale-95 transition-all text-center"
                >
                  上一步
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className={`py-2.5 text-xs text-white font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer text-center ${
                    step === 1 ? 'w-full' : 'flex-grow'
                  } bg-natural-primary hover:bg-natural-secondary`}
                >
                  繼續下一步
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || !hasAgreement}
                  className={`flex-grow flex items-center justify-center space-x-1.5 py-2.5 text-xs text-white font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer ${
                    submitting || !hasAgreement
                      ? 'bg-natural-muted shadow-none cursor-not-allowed'
                      : 'bg-natural-primary hover:bg-natural-secondary hover:shadow-lg'
                  }`}
                  id="btn_finalize_application"
                >
                  {submitting ? (
                    <span>正在傳送申請書中...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>送出申請，等候好消息！</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
