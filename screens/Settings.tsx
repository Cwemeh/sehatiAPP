
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { User, Moon, Sun, Smartphone, Trash2, ArrowRight, Heart, Bell, Vibrate, HelpCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const clearHistory = useStore((state) => state.clearHistory);

  return (
    <div className="px-6 py-6 space-y-10 pb-32">
      <header>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Setelan</h2>
        <p className="text-slate-500 font-medium">Kustomisasi pengalaman SeHati Anda.</p>
      </header>

      <div className="space-y-8">
        {/* Profile */}
        <section className="bg-white dark:bg-slate-800 rounded-[32px] p-6 border-2 border-slate-50 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-rose-500 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-rose-100 dark:shadow-none">
              <User size={40} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Profil Anda</label>
              <input 
                type="text" 
                value={settings.name} 
                onChange={e => updateSettings({ name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white font-black text-xl focus:ring-2 focus:ring-rose-500 transition-all shadow-inner"
              />
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Dukungan</h3>
          <button 
            onClick={() => navigate('/help')}
            className="w-full p-6 bg-white dark:bg-slate-800 rounded-[32px] border-2 border-slate-50 dark:border-slate-800 flex items-center justify-between shadow-sm active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center">
                <HelpCircle size={24} />
              </div>
              <div className="text-left">
                <p className="font-black text-slate-900 dark:text-white">Pusat Bantuan</p>
                <p className="text-xs text-slate-500 font-bold">Panduan penggunaan SeHati</p>
              </div>
            </div>
            <ArrowRight size={20} className="text-slate-300" />
          </button>
        </section>

        {/* Notification Settings */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
            <Bell size={14} /> Suara & Notifikasi
          </h3>
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border-2 border-slate-50 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-50 dark:border-slate-800">
               <label className="block text-xs font-bold text-slate-400 uppercase mb-3 px-1">Tipe Suara</label>
               <div className="grid grid-cols-3 gap-2">
                 {(['silent', 'gentle', 'urgent'] as const).map(sound => (
                   <button
                    key={sound}
                    onClick={() => updateSettings({ notificationSound: sound })}
                    className={`py-3 rounded-2xl font-black text-[10px] uppercase tracking-wider border-2 transition-all ${
                      settings.notificationSound === sound 
                      ? 'bg-rose-500 border-rose-500 text-white shadow-lg' 
                      : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-400'
                    }`}
                   >
                     {sound === 'silent' ? 'Hening' : sound === 'gentle' ? 'Lembut' : 'Tegas'}
                   </button>
                 ))}
               </div>
            </div>
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
                  <Vibrate size={24} />
                </div>
                <div>
                  <p className="font-black text-slate-900 dark:text-white">Getaran Sistem</p>
                  <p className="text-xs text-slate-500 font-bold">Umpan balik haptik</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer scale-125 pr-2">
                <input 
                  type="checkbox" 
                  checked={settings.enableVibration} 
                  onChange={e => updateSettings({ enableVibration: e.target.checked })} 
                  className="sr-only peer" 
                />
                <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Theme & Display */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Visual & Tema</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => updateSettings({ isDarkMode: false })}
              className={`p-6 rounded-[32px] border-2 flex flex-col items-center gap-3 transition-all active:scale-95 ${!settings.isDarkMode ? 'bg-white border-rose-500 text-rose-500 shadow-xl shadow-rose-50' : 'bg-slate-100 border-transparent text-slate-400 dark:bg-slate-800 dark:text-slate-600'}`}>
              <Sun size={32} />
              <span className="font-black text-sm uppercase tracking-wider">Terang</span>
            </button>
            <button onClick={() => updateSettings({ isDarkMode: true })}
              className={`p-6 rounded-[32px] border-2 flex flex-col items-center gap-3 transition-all active:scale-95 ${settings.isDarkMode ? 'bg-slate-900 border-rose-500 text-rose-500 shadow-xl' : 'bg-slate-100 border-transparent text-slate-400 dark:bg-slate-800 dark:text-slate-600'}`}>
              <Moon size={32} />
              <span className="font-black text-sm uppercase tracking-wider">Gelap</span>
            </button>
          </div>
        </section>

        {/* Accessibility */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Aksesibilitas</h3>
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border-2 border-slate-50 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-6 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                  <Smartphone size={24} />
                </div>
                <div>
                  <p className="font-black text-slate-900 dark:text-white">Mode Lansia</p>
                  <p className="text-xs text-slate-500 font-bold">Ikon & teks ekstra besar</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer scale-125 pr-2">
                <input type="checkbox" checked={settings.isSeniorMode} onChange={e => updateSettings({ isSeniorMode: e.target.checked })} className="sr-only peer" />
                <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>
            <button onClick={() => { if(confirm('Hapus semua riwayat?')) clearHistory() }} className="w-full p-6 flex items-center justify-between hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center">
                  <Trash2 size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-900 dark:text-white">Reset Riwayat</p>
                  <p className="text-xs text-slate-500 font-bold">Hapus semua catatan lama</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-300" />
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-red-500 uppercase tracking-widest px-2">Zona Berbahaya</h3>
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border-2 border-red-500/20 overflow-hidden shadow-sm">
            <button 
              onClick={() => { if(confirm('Apakah Anda yakin ingin mereset aplikasi? Semua data akan hilang.')) useStore.getState().resetApp() }} 
              className="w-full p-6 flex items-center justify-between bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-400 rounded-2xl flex items-center justify-center">
                  <Trash2 size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black">Reset Aplikasi</p>
                  <p className="text-xs font-bold opacity-80">Mulai dari awal</p>
                </div>
              </div>
              <ArrowRight size={20} />
            </button>
          </div>
        </section>

        <section className="pt-4 text-center space-y-4">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
              <Heart size={14} className="text-rose-500 fill-current" />
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Dibuat Dengan Bangga v2.0</span>
           </div>
        </section>
      </div>
    </div>
  );
};
