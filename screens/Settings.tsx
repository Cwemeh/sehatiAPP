
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  User, Smartphone, Trash2, Heart, Bell, 
  ShieldCheck, Cloud, CloudOff, RefreshCcw, 
  Download, LogOut, CheckCircle2, AlertTriangle,
  Moon, Sun, AlertCircle, HelpCircle, Volume2
} from 'lucide-react';
import { NotificationSound } from '../types';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const settings = useStore((state) => state.settings);
  const medications = useStore((state) => state.medications);
  const isSyncing = useStore((state) => state.isSyncing);
  const updateSettings = useStore((state) => state.updateSettings);
  const clearHistory = useStore((state) => state.clearHistory);
  const connectCloud = useStore((state) => state.connectCloud);
  const restoreFromCloud = useStore((state) => state.restoreFromCloud);
  
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = () => {
    if (notifPermission === 'denied') {
      setShowPermissionGuide(true);
      return;
    }
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotifPermission(permission);
      });
    }
  };

  const handleCloudConnect = () => {
    connectCloud();
  };

  const handleManualRestore = async () => {
    if (!confirm(`Pulihkan data dari Google Drive? Data lokal Anda saat ini akan diperbarui.`)) return;
    await restoreFromCloud();
    alert('Data berhasil dipulihkan dari awan!');
  };

  const handleCloudDisconnect = () => {
    if (confirm('Putuskan koneksi? Anda tidak akan bisa melakukan sinkronisasi otomatis sampai terhubung kembali.')) {
      updateSettings({ isCloudSynced: false });
    }
  };

  const soundOptions: { id: NotificationSound; label: string; desc: string }[] = [
    { id: 'gentle', label: 'Lembut', desc: 'Nada halus untuk ketenangan.' },
    { id: 'urgent', label: 'Tegas', desc: 'Nada kuat untuk kepatuhan.' },
    { id: 'silent', label: 'Bisu', desc: 'Hanya notifikasi visual.' }
  ];

  return (
    <div className="px-6 py-6 space-y-10 pb-32 animate-in fade-in duration-500">
      
      {showPermissionGuide && (
        <div className="fixed inset-0 z-[110] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-800 rounded-[40px] p-8 space-y-6 max-w-xs text-center animate-in zoom-in duration-300 shadow-2xl">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight">Izin Diblokir</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Harap izinkan notifikasi di setelan browser Anda agar pengingat tetap berjalan.
              </p>
            </div>
            <button onClick={() => setShowPermissionGuide(false)} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-sm shadow-lg">SAYA MENGERTI</button>
          </div>
        </div>
      )}

      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Setelan</h2>
          <p className="text-slate-500 font-medium text-sm">Pusat kontrol SeHati.</p>
        </div>
        <button onClick={() => navigate('/help')} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400">
          <HelpCircle size={20} />
        </button>
      </header>

      <div className="space-y-8">
        <section className="bg-white dark:bg-slate-800 rounded-[32px] p-6 border-2 border-slate-50 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-rose-500 text-white rounded-[24px] flex items-center justify-center shadow-lg">
              <User size={32} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Nama Panggilan</label>
              <input 
                type="text" 
                value={settings.name} 
                onChange={e => updateSettings({ name: e.target.value })}
                className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white font-black text-xl focus:ring-0" 
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
            <Volume2 size={14} className="text-rose-500" /> Suara Notifikasi
          </h3>
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border-2 border-slate-50 dark:border-slate-800 overflow-hidden shadow-sm">
            {soundOptions.map((option, idx) => (
              <button 
                key={option.id}
                onClick={() => updateSettings({ notificationSound: option.id })}
                className={`w-full p-5 flex items-center justify-between transition-all ${idx !== soundOptions.length - 1 ? 'border-b border-slate-50 dark:border-slate-800' : ''} ${settings.notificationSound === option.id ? 'bg-rose-50/50 dark:bg-rose-500/5' : ''}`}
              >
                <div className="text-left">
                  <p className={`font-black text-sm ${settings.notificationSound === option.id ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{option.label}</p>
                  <p className="text-[10px] font-medium text-slate-400">{option.desc}</p>
                </div>
                {settings.notificationSound === option.id && <CheckCircle2 size={20} className="text-rose-500" />}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Cloud size={14} className="text-blue-500" /> Sinkronisasi Awan
            </h3>
            {isSyncing && (
              <div className="flex items-center gap-1.5 animate-pulse">
                <RefreshCcw size={10} className="text-blue-500 animate-spin" />
                <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Menyimpan...</span>
              </div>
            )}
          </div>
          
          <div className={`rounded-[40px] p-6 border-2 transition-all duration-500 ${
            settings.isCloudSynced 
            ? 'bg-blue-600 text-white border-blue-400 shadow-xl shadow-blue-100 dark:shadow-none' 
            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 shadow-sm'
          }`}>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  settings.isCloudSynced ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-500'
                }`}>
                  {settings.isCloudSynced ? <Cloud size={32} strokeWidth={2.5} /> : <CloudOff size={32} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-black truncate ${settings.isCloudSynced ? 'text-white text-lg' : 'text-slate-900 dark:text-white text-lg'}`}>
                    {settings.isCloudSynced ? settings.cloudSyncEmail : 'Belum Terhubung'}
                  </p>
                  <p className={`text-xs font-medium leading-tight ${settings.isCloudSynced ? 'text-blue-100' : 'text-slate-500'}`}>
                    {settings.isCloudSynced 
                      ? `Sinkron otomatis aktif • ${settings.lastSyncedAt ? new Date(settings.lastSyncedAt).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : 'Baru saja'}` 
                      : 'Aktifkan untuk menyimpan jadwal di Google Drive secara aman.'}
                  </p>
                </div>
              </div>

              {!settings.isCloudSynced ? (
                <button 
                  onClick={handleCloudConnect}
                  className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <ShieldCheck size={18} />
                  HUBUNGKAN GOOGLE DRIVE
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleManualRestore}
                    className="py-4 bg-white text-blue-600 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
                  >
                    <Download size={16} /> TARIK DATA
                  </button>
                  <button 
                    onClick={handleCloudDisconnect}
                    className="py-4 bg-white/20 hover:bg-white/30 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <LogOut size={16} /> PUTUSKAN
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Personalisasi</h3>
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border-2 border-slate-50 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-5 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-xl flex items-center justify-center">
                  {settings.isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <p className="font-black text-slate-900 dark:text-white text-sm">Mode Gelap</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.isDarkMode} onChange={e => updateSettings({ isDarkMode: e.target.checked })} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center"><Smartphone size={20} /></div>
                <p className="font-black text-slate-900 dark:text-white text-sm">Mode Lansia</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.isSeniorMode} onChange={e => updateSettings({ isSeniorMode: e.target.checked })} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>
          </div>
        </section>

        <section className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4">
           <button 
             onClick={() => { if(confirm('Hapus semua riwayat pengobatan?')) clearHistory() }} 
             className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400"
           >
              Kosongkan Riwayat Lokal
           </button>
           <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
            <Heart size={14} className="text-rose-500 fill-current" />
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">SeHati Resmi v2.5</span>
          </div>
        </section>
      </div>
    </div>
  );
};
