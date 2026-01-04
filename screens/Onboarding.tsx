
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Heart, ArrowRight, User, ShieldCheck } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const completeOnboarding = useStore((state) => state.completeOnboarding);
  const [name, setName] = useState('');
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      completeOnboarding(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="flex-1 flex flex-col p-8 z-10">
        {step === 1 ? (
          <div className="flex-1 flex flex-col justify-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-rose-500 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-rose-200 dark:shadow-none">
                <Heart size={40} fill="currentColor" />
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-[1.1]">
                  Sehat itu<br/><span className="text-rose-500">Pilihan Hati.</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                  Kelola jadwal obat Anda dengan cara yang paling manusiawi dan mudah.
                </p>
              </div>
            </div>
            <button onClick={() => setStep(2)} className="w-full py-5 bg-slate-900 dark:bg-rose-500 text-white rounded-3xl font-bold text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
              Ayo Mulai <ArrowRight size={22} />
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="pt-12 space-y-8 flex-1">
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Kenalan Yuk!</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Nama Anda akan muncul di sapaan harian.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors">
                    <User size={24} />
                  </div>
                  <input autoFocus type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama panggilan Anda"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 focus:border-rose-500 focus:bg-white dark:focus:bg-slate-800 rounded-3xl py-6 pl-16 pr-6 text-xl font-bold text-slate-800 dark:text-white outline-none shadow-sm transition-all" />
                </div>
                <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                  <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-800 dark:text-emerald-400 font-medium leading-snug">
                    Data Anda disimpan aman di memori ponsel ini dan tidak akan pernah dikirim ke server manapun.
                  </p>
                </div>
              </form>
            </div>
            <div className="pb-8">
              <button onClick={handleSubmit} disabled={!name.trim()} className="w-full py-5 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-100 disabled:text-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-700 text-white rounded-3xl font-bold text-xl shadow-2xl shadow-rose-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-3">
                Selesai <ArrowRight size={24} strokeWidth={3} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
