
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Pill, Settings, PlusCircle, History, Bell, Check, Timer, RefreshCcw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Medication } from '../types';
import { MED_FORMS } from '../constants';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const settings = useStore((state) => state.settings);
  const medications = useStore((state) => state.medications);
  const takenSchedules = useStore((state) => state.takenSchedules);
  const snoozedAlerts = useStore((state) => state.snoozedAlerts);
  const isSyncing = useStore((state) => state.isSyncing);
  const markAsTaken = useStore((state) => state.markAsTaken);
  const snoozeAlert = useStore((state) => state.snoozeAlert);
  
  const [activeAlert, setActiveAlert] = useState<{ medId: string; time: string; name: string; image?: string; verb: string; dosage: string } | null>(null);
  const lastNotifiedRef = useRef<Record<string, number>>({});
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const handleSWMessage = (event: MessageEvent) => {
      const { type, medId, time } = event.data;
      if (type === 'MED_TAKEN_FROM_SW') {
        markAsTaken(medId, time);
        stopAlarmSound();
        setActiveAlert(null);
      } else if (type === 'MED_SNOOZE_FROM_SW') {
        const med = medications.find(m => m.id === medId);
        if (med) snoozeAlert(medId, med.name, time);
        stopAlarmSound();
        setActiveAlert(null);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleSWMessage);
    }
  }, [markAsTaken, snoozeAlert, medications]);

  const stopAlarmSound = () => {
    if (alarmIntervalRef.current) { clearInterval(alarmIntervalRef.current); alarmIntervalRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close().catch(() => {}); audioContextRef.current = null; }
  };

  const startAlarmSound = () => {
    if (settings.notificationSound === 'silent') return;
    stopAlarmSound();
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = () => {
        if (!audioContextRef.current) return;
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();
        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);
        
        if (settings.notificationSound === 'gentle') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, audioContextRef.current.currentTime);
          gain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
          gain.gain.linearRampToValueAtTime(0.2, audioContextRef.current.currentTime + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 1.2);
          osc.start(); osc.stop(audioContextRef.current.currentTime + 1.3);
        } else {
          osc.type = 'square';
          osc.frequency.setValueAtTime(880, audioContextRef.current.currentTime);
          gain.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
          osc.start(); osc.stop(audioContextRef.current.currentTime + 0.4);
        }
      };
      playTone();
      alarmIntervalRef.current = window.setInterval(playTone, 2000);
    } catch (e) {
      console.warn('Audio blocked by browser policy');
    }
  };

  const triggerSystemNotification = async (med: Medication, time: string) => {
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      const reg = await navigator.serviceWorker.ready;
      reg.active?.postMessage({ 
        type: 'SHOW_NOTIFICATION', 
        medId: med.id, 
        medName: med.name, 
        time,
        image: med.image,
        dosage: med.dosage
      });
    }
    
    if (settings.enableVibration && 'vibrate' in navigator) {
      navigator.vibrate([500, 200, 500]);
    }
    
    if (!document.hidden) startAlarmSound();
  };

  useEffect(() => {
    const checker = setInterval(() => {
      const now = new Date();
      const nowTs = now.getTime();
      const nowStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      const todayStr = now.toISOString().split('T')[0];
      const currentDay = now.getDay();

      medications.forEach(med => {
        let isToday = false;
        if (med.frequencyType === 'daily') isToday = true;
        else if (med.frequencyType === 'specific_days') isToday = med.daysOfWeek?.includes(currentDay) || false;
        else if (med.frequencyType === 'interval' && med.intervalDays) {
          const start = new Date(med.startDate); start.setHours(0,0,0,0);
          const current = new Date(); current.setHours(0,0,0,0);
          const diff = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          isToday = diff >= 0 && diff % med.intervalDays === 0;
        }

        if (isToday) {
          med.schedules.forEach(time => {
            if (time === nowStr) {
              const alreadyTaken = takenSchedules.some(s => s.date === todayStr && s.medicationId === med.id && s.time === time);
              const key = `${med.id}-${time}-${todayStr}`;
              if (!alreadyTaken && lastNotifiedRef.current[key] !== 1) {
                const verb = MED_FORMS.find(f => f.id === med.formType)?.verb || 'Minum';
                setActiveAlert({ medId: med.id, time, name: med.name, image: med.image, verb, dosage: med.dosage });
                triggerSystemNotification(med, time);
                lastNotifiedRef.current[key] = 1;
              }
            }
          });
        }
      });

      snoozedAlerts.forEach(snooze => {
        if (nowTs >= snooze.remindAt) {
          const med = medications.find(m => m.id === snooze.medId);
          if (med) {
            const verb = MED_FORMS.find(f => f.id === med.formType)?.verb || 'Minum';
            setActiveAlert({ medId: snooze.medId, time: snooze.time, name: snooze.medName, image: med.image, verb, dosage: med.dosage });
            triggerSystemNotification(med, snooze.time);
          }
        }
      });
    }, 15000);
    return () => { clearInterval(checker); stopAlarmSound(); };
  }, [medications, takenSchedules, snoozedAlerts, settings]);

  return (
    <div className="min-h-screen flex flex-col mx-auto max-w-md bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 shadow-xl transition-colors duration-300 relative">
      
      {activeAlert && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-lg flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-800 w-full rounded-[40px] overflow-hidden flex flex-col animate-in zoom-in duration-300 shadow-2xl">
            {activeAlert.image && (
              <div className="w-full aspect-square relative">
                 <img src={activeAlert.image} className="w-full h-full object-cover" alt="Obat" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                 <div className="absolute bottom-6 left-8">
                    <span className={`text-white font-black ${settings.isSeniorMode ? 'text-2xl' : 'text-xl'}`}>Waktunya {activeAlert.verb}!</span>
                 </div>
              </div>
            )}
            <div className="p-8 text-center space-y-6">
              {!activeAlert.image && (
                 <div className="mx-auto w-20 h-20 bg-rose-500 text-white rounded-3xl flex items-center justify-center shadow-xl animate-bounce">
                    <Bell size={settings.isSeniorMode ? 40 : 32} />
                 </div>
              )}
              <div className="space-y-1">
                <h2 className={`font-black text-slate-800 dark:text-white leading-tight ${settings.isSeniorMode ? 'text-3xl' : 'text-2xl'}`}>{activeAlert.name}</h2>
                <p className={`text-slate-500 dark:text-slate-400 font-bold ${settings.isSeniorMode ? 'text-xl' : 'text-base'}`}>{activeAlert.dosage} • Pukul {activeAlert.time}</p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => { markAsTaken(activeAlert.medId, activeAlert.time); stopAlarmSound(); setActiveAlert(null); }}
                  className={`w-full bg-emerald-500 text-white rounded-[32px] font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 ${settings.isSeniorMode ? 'py-6 text-xl' : 'py-4 text-lg'}`}
                >
                  <Check size={settings.isSeniorMode ? 32 : 24} strokeWidth={4} /> SUDAH DIMINUM
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => { snoozeAlert(activeAlert.medId, activeAlert.name, activeAlert.time); stopAlarmSound(); setActiveAlert(null); }}
                    className={`bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all ${settings.isSeniorMode ? 'py-4 text-base' : 'py-3 text-sm'}`}
                  >
                    <Timer size={settings.isSeniorMode ? 20 : 18} /> TUNDA
                  </button>
                  <button onClick={() => { stopAlarmSound(); setActiveAlert(null); }} className={`bg-slate-50 dark:bg-slate-900/50 text-slate-400 font-black rounded-2xl ${settings.isSeniorMode ? 'py-4 text-base' : 'py-3 text-sm'}`}>ABAIKAN</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className={`sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 ${settings.isSeniorMode ? 'py-6' : 'py-5'}`}>
        <div className="flex items-center gap-4">
          <div className={`bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg ${settings.isSeniorMode ? 'w-12 h-12' : 'w-11 h-11'}`}>
            <Pill size={settings.isSeniorMode ? 32 : 26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`font-black text-slate-900 dark:text-white leading-none ${settings.isSeniorMode ? 'text-2xl' : 'text-xl'}`}>SeHati</h1>
              {isSyncing && <RefreshCcw size={14} className="text-blue-500 animate-spin" />}
              {settings.isCloudSynced && !isSyncing && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
            </div>
            <p className={`text-slate-500 font-bold uppercase tracking-widest ${settings.isSeniorMode ? 'text-[10px] mt-0.5' : 'text-[9px]'}`}>Pusat Sehat</p>
          </div>
        </div>
        <Link to="/add" className={`bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 active:scale-95 transition-all ${settings.isSeniorMode ? 'w-12 h-12' : 'w-10 h-10'}`}>
          <PlusCircle size={settings.isSeniorMode ? 28 : 24} />
        </Link>
      </header>
      
      <main className={`flex-1 overflow-y-auto ${settings.isSeniorMode ? 'pb-32' : 'pb-28'}`}>{children}</main>
      
      <nav className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 flex justify-around px-2 z-50 ${settings.isSeniorMode ? 'py-5 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]' : 'py-4'}`}>
        {[
          { icon: <Home size={settings.isSeniorMode ? 28 : 24} />, label: 'Beranda', path: '/' },
          { icon: <Pill size={settings.isSeniorMode ? 28 : 24} />, label: 'Obat', path: '/medications' },
          { icon: <History size={settings.isSeniorMode ? 28 : 24} />, label: 'Riwayat', path: '/history' },
          { icon: <Settings size={settings.isSeniorMode ? 28 : 24} />, label: 'Setelan', path: '/settings' },
        ].map((item) => (
          <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1 transition-all duration-300 ${location.pathname === item.path ? 'text-rose-500' : 'text-slate-400'}`}>
            <div className={`${location.pathname === item.path ? 'bg-rose-50 dark:bg-rose-500/10 p-2.5 rounded-2xl' : 'p-2.5'}`}>{item.icon}</div>
            <span className={`font-black uppercase tracking-widest ${settings.isSeniorMode ? 'text-[10px]' : 'text-[9px]'}`}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};
