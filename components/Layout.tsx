
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Pill, Settings, PlusCircle, History, Bell, AlertCircle, Check, Timer } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Medication } from '../types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const settings = useStore((state) => state.settings);
  const medications = useStore((state) => state.medications);
  const takenSchedules = useStore((state) => state.takenSchedules);
  const snoozedAlerts = useStore((state) => state.snoozedAlerts);
  const markAsTaken = useStore((state) => state.markAsTaken);
  const snoozeAlert = useStore((state) => state.snoozeAlert);
  
  const [activeAlert, setActiveAlert] = useState<{ medId: string; time: string; name: string } | null>(null);
  const lastNotifiedRef = useRef<Record<string, number>>({});
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);

  const navItems = [
    { icon: <Home size={settings.isSeniorMode ? 28 : 24} />, label: 'Beranda', path: '/' },
    { icon: <Pill size={settings.isSeniorMode ? 28 : 24} />, label: 'Obat', path: '/medications' },
    { icon: <History size={settings.isSeniorMode ? 28 : 24} />, label: 'Riwayat', path: '/history' },
    { icon: <Settings size={settings.isSeniorMode ? 28 : 24} />, label: 'Setelan', path: '/settings' },
  ];

  const isMedicationScheduledForToday = (med: Medication): boolean => {
    const now = new Date();
    now.setHours(0,0,0,0);
    const currentDay = now.getDay();
    
    if (med.frequencyType === 'daily') return true;
    if (med.frequencyType === 'specific_days') return med.daysOfWeek?.includes(currentDay) || false;
    if (med.frequencyType === 'interval' && med.intervalDays) {
      const diffTime = now.getTime() - med.startDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays % med.intervalDays === 0;
    }
    return true;
  };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleSWMessage = (event: MessageEvent) => {
        const { type, medId, medName, time } = event.data;
        if (type === 'MED_TAKEN') {
          markAsTaken(medId, time);
          stopAlarmSound();
          setActiveAlert(null);
        } else if (type === 'MED_SNOOZE') {
          snoozeAlert(medId, medName, time);
          stopAlarmSound();
          setActiveAlert(null);
        }
      };
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleSWMessage);
    }
  }, [markAsTaken, snoozeAlert]);

  const stopAlarmSound = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const startAlarmSound = () => {
    if (settings.notificationSound === 'silent') return;
    stopAlarmSound();

    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playTone = () => {
      if (!audioContextRef.current) return;
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      if (settings.notificationSound === 'gentle') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioContextRef.current.currentTime);
        gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioContextRef.current.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 1.4);
        oscillator.start();
        oscillator.stop(audioContextRef.current.currentTime + 1.5);
      } else {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(880, audioContextRef.current.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
        gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContextRef.current.currentTime + 0.5);
      }
    };

    playTone();
    alarmIntervalRef.current = window.setInterval(playTone, 2000);
  };

  const triggerNotificationEffects = (medId: string, medName: string, time: string) => {
    if (settings.enableVibration && 'vibrate' in navigator) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }
    startAlarmSound();
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        medId,
        medName,
        time
      });
    }
  };

  useEffect(() => {
    const checker = setInterval(() => {
      const now = new Date();
      const nowTs = now.getTime();
      const nowStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      const todayStr = now.toISOString().split('T')[0];

      medications.forEach(med => {
        // Cek apakah hari ini adalah jadwal obat tersebut
        if (!isMedicationScheduledForToday(med)) return;

        med.schedules.forEach(time => {
          if (time === nowStr) {
            const alreadyTaken = takenSchedules.some(s => s.date === todayStr && s.medicationId === med.id && s.time === time);
            const key = `${med.id}-${time}-${todayStr}`;
            
            if (!alreadyTaken && lastNotifiedRef.current[key] !== 1) {
              setActiveAlert({ medId: med.id, time, name: med.name });
              triggerNotificationEffects(med.id, med.name, time);
              lastNotifiedRef.current[key] = 1;
            }
          }
        });
      });

      snoozedAlerts.forEach(snooze => {
        if (nowTs >= snooze.remindAt) {
          setActiveAlert({ medId: snooze.medId, time: snooze.time, name: snooze.medName });
          triggerNotificationEffects(snooze.medId, snooze.medName, snooze.time);
        }
      });
    }, 15000);

    return () => {
      clearInterval(checker);
      stopAlarmSound();
    };
  }, [medications, takenSchedules, snoozedAlerts, settings]);

  const handleAction = (callback: () => void) => {
    stopAlarmSound();
    callback();
    setActiveAlert(null);
  };

  return (
    <div className={`min-h-screen flex flex-col mx-auto max-w-md bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 shadow-xl transition-colors duration-300 relative`}>
      {activeAlert && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-lg flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-800 w-full rounded-[48px] p-8 text-center space-y-8 animate-in zoom-in duration-300 shadow-2xl ring-4 ring-rose-500/20">
            <div className="mx-auto w-28 h-28 bg-rose-500 text-white rounded-[40px] flex items-center justify-center shadow-2xl shadow-rose-500/40 animate-pulse">
              <Bell size={56} className="animate-bounce" />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-rose-500 font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                Alarm Berdering
              </h3>
              <h2 className="text-4xl font-black text-slate-800 dark:text-white leading-tight">{activeAlert.name}</h2>
              <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 px-4 py-2 rounded-2xl">
                <AlertCircle size={20} className="text-rose-500" />
                <span className="text-slate-600 dark:text-slate-300 font-bold text-lg">Jam {activeAlert.time}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={() => handleAction(() => markAsTaken(activeAlert.medId, activeAlert.time))}
                className="w-full py-6 bg-emerald-500 text-white rounded-[32px] font-black text-2xl shadow-xl shadow-emerald-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Check size={32} strokeWidth={3} /> SAYA SUDAH MINUM
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleAction(() => snoozeAlert(activeAlert.medId, activeAlert.name, activeAlert.time))}
                  className="py-5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-[28px] font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Timer size={18} /> TUNDA 10M
                </button>
                <button 
                  onClick={() => handleAction(() => {})}
                  className="py-5 bg-slate-50 dark:bg-slate-900/50 text-slate-400 font-black text-sm rounded-[28px]"
                >
                  ABAIKAN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200 dark:shadow-none">
            <Pill size={settings.isSeniorMode ? 32 : 28} />
          </div>
          <div>
            <h1 className={`font-black text-slate-900 dark:text-white leading-none ${settings.isSeniorMode ? 'text-2xl' : 'text-xl'}`}>SeHati</h1>
            <p className={`text-slate-500 font-bold ${settings.isSeniorMode ? 'text-sm' : 'text-[10px]'}`}>Teman Sehat Anda</p>
          </div>
        </div>
        <Link to="/add" className={`bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 active:scale-95 transition-all ${settings.isSeniorMode ? 'w-14 h-14' : 'w-11 h-11'}`}>
          <PlusCircle size={settings.isSeniorMode ? 32 : 26} />
        </Link>
      </header>

      <main className={`flex-1 overflow-y-auto pb-28 ${settings.isSeniorMode ? 'text-xl' : 'text-base'}`}>
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 flex justify-around py-4 px-2 z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-rose-500 scale-105' : 'text-slate-400 dark:text-slate-500'}`}>
              <div className={`${isActive ? 'bg-rose-50 dark:bg-rose-500/10 p-2.5 rounded-[18px]' : 'p-2.5'}`}>
                {item.icon}
              </div>
              <span className={`font-black uppercase tracking-widest ${settings.isSeniorMode ? 'text-[11px]' : 'text-[9px]'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
