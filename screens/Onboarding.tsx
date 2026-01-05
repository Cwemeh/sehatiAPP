
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Heart, ArrowRight, User, ShieldCheck, Cloud, RefreshCcw, ChevronLeft } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const completeOnboarding = useStore((state) => state.completeOnboarding);
  const restoreFromCloud = useStore((state) => state.restoreFromCloud);
  const isSyncing = useStore((state) => state.isSyncing);
  
  const [name, setName] = useState('');
  const [step, setStep] = useState(1); // 1: Welcome, 2: Name Input

  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      completeOnboarding(name.trim());
    }
  };

  const handleCloudRestore = async () => {
    await restoreFromCloud();
    // Jika data berhasil ditarik, Onboarding akan otomatis hilang karena state isOnboarded berubah di store
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="flex-1 flex flex-col p-8 z-10">
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-6 text-center">
              <div className="w-24 h-24 bg-rose-500 rounded-[32px] flex items-center justify-center text-white shadow-2xl mx-auto">
                <Heart size={48} fill="currentColor" />
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-[1.1]">
                  Selamat Datang di <span className="text-rose-500">SeHati.</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed px-4">
                  Sahabat pintar pengingat obat Anda.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <button onClick={() => setStep(2)} className="w-full py-5 bg-slate-900 dark:bg-rose-500 text-white rounded-3xl font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
                Mulai Sebagai Baru <ArrowRight size={22} />
              </button>
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest font-black text-slate-300 bg-white dark:bg-slate-900 px-4">Atau</div>
              </div>
              <button 
                onClick={handleCloudRestore} 
                disabled={isSyncing}
                className="w-full py-5 bg-blue-500 text-white rounded-3xl font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {isSyncing ? <RefreshCcw size={22} className="animate-spin" /> : <><Cloud size={22} /> Pulihkan dari Google</>}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
            <button onClick={() => setStep(1)} className="mt-8 p-2 w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
              <ChevronLeft size={20} />
            </button>
            <div className="pt-12 space-y-8 flex-1">
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Siapa Nama Anda?</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-snug">Agar SeHati bisa menyapa Anda setiap hari.</p>
              </div>
              <form onSubmit={handleSubmitName} className="space-y-6">
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors">
                    <User size={24} />
                  </div>
                  <input autoFocus type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama panggilan"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 focus:border-rose-500 focus:bg-white dark:focus:bg-slate-800 rounded-3xl py-6 pl-16 pr-6 text-xl font-bold text-slate-800 dark:text-white outline-none shadow-sm transition-all" />
                </div>
                
                <div className="flex items-start gap-3 p-5 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                  <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-800 dark:text-emerald-400 font-medium leading-snug">
                    Data Anda aman. Kami tidak membagikan informasi kesehatan Anda kepada siapa pun.
                  </p>
                </div>
              </form>
            </div>
            <div className="pb-8">
              <button onClick={handleSubmitName} disabled={!name.trim()} className="w-full py-5 bg-rose-500 text-white rounded-3xl font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-30">
                Selesai & Masuk <ArrowRight size={24} strokeWidth={3} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
