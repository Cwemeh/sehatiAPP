
import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { HEALTH_TIPS } from '../constants';
import { Clock, CheckCircle2, AlertTriangle, Timer, Sun, Moon, CalendarDays, Sunset, SunDim, ChevronDown, ChevronUp } from 'lucide-react';
import { Medication } from '../types';

export const Dashboard: React.FC = () => {
  const medications = useStore((state) => state.medications);
  const takenSchedules = useStore((state) => state.takenSchedules);
  const settings = useStore((state) => state.settings);
  const markAsTaken = useStore((state) => state.markAsTaken);

  const [tip, setTip] = useState(HEALTH_TIPS[0]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTakenToday, setShowTakenToday] = useState(false);

  useEffect(() => {
    const randomTip = HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)];
    setTip(randomTip);
    
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = currentTime.toISOString().split('T')[0];
  const hours = currentTime.getHours();
  const currentDay = currentTime.getDay(); 
  
  const isMedicationScheduledForToday = (med: Medication): boolean => {
    if (med.frequencyType === 'daily') return true;
    if (med.frequencyType === 'specific_days') return med.daysOfWeek?.includes(currentDay) || false;
    if (med.frequencyType === 'interval' && med.intervalDays) {
      const todayAtMidnight = new Date();
      todayAtMidnight.setHours(0,0,0,0);
      const diffTime = todayAtMidnight.getTime() - med.startDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays % med.intervalDays === 0;
    }
    return true;
  };

  const getTimeCategory = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 5 && hour < 11) return { label: 'Pagi', icon: <SunDim size={18} className="text-amber-400" />, order: 1 };
    if (hour >= 11 && hour < 15) return { label: 'Siang', icon: <Sun size={18} className="text-amber-500" />, order: 2 };
    if (hour >= 15 && hour < 18) return { label: 'Sore', icon: <Sunset size={18} className="text-rose-400" />, order: 3 };
    return { label: 'Malam', icon: <Moon size={18} className="text-indigo-400" />, order: 4 };
  };

  const fullTodaySchedule = medications
    .filter(isMedicationScheduledForToday)
    .flatMap(med => 
      med.schedules.map(time => {
        const isTaken = takenSchedules.some(ts => ts.date === todayStr && ts.medicationId === med.id && ts.time === time);
        return { med, time, isTaken, category: getTimeCategory(time) };
      })
    )
    .sort((a, b) => a.time.localeCompare(b.time));

  const remainingSchedule = fullTodaySchedule.filter(s => !s.isTaken);
  const takenTodayCount = fullTodaySchedule.filter(s => s.isTaken).length;

  const groupedSchedule = useMemo(() => {
    const groups: Record<string, typeof remainingSchedule> = {};
    remainingSchedule.forEach(item => {
      const key = item.category.label;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.entries(groups).sort((a, b) => {
      return (remainingSchedule.find(i => i.category.label === a[0])?.category.order || 0) - 
             (remainingSchedule.find(i => i.category.label === b[0])?.category.order || 0);
    });
  }, [remainingSchedule]);

  const nowStr = currentTime.getHours().toString().padStart(2, '0') + ':' + currentTime.getMinutes().toString().padStart(2, '0');
  const upcoming = remainingSchedule.filter(s => s.time >= nowStr);
  const nextDose = upcoming.length > 0 ? upcoming[0] : (remainingSchedule.length > 0 ? remainingSchedule[0] : null);

  const getCountdown = (targetTime: string) => {
    const [h, m] = targetTime.split(':').map(Number);
    const target = new Date();
    target.setHours(h, m, 0, 0);
    const diff = target.getTime() - currentTime.getTime();
    if (diff <= 0) return 'Sekarang!';
    const diffMin = Math.floor(diff / 60000);
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour > 0) return `${diffHour}j ${diffMin % 60}m`;
    return `${diffMin}m`;
  };

  return (
    <div className="px-6 py-4 space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <section className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
             {hours >= 6 && hours < 18 ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-400" />}
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {hours < 11 ? "Selamat Pagi" : hours < 15 ? "Selamat Siang" : hours < 18 ? "Selamat Sore" : "Selamat Malam"}
             </span>
          </div>
          <h2 className={`font-black text-slate-900 dark:text-white leading-tight ${settings.isSeniorMode ? 'text-3xl' : 'text-2xl'}`}>
            Halo, {settings.name}!
          </h2>
        </div>
        <div className="text-right">
           <div className="text-2xl font-black text-slate-900 dark:text-white">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
           </div>
           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
           </div>
        </div>
      </section>

      {/* Hero / Next Dose Section */}
      {nextDose ? (
        <div className={`relative overflow-hidden bg-slate-900 dark:bg-rose-500 rounded-[40px] p-8 text-white shadow-2xl transition-all animate-in zoom-in-95 duration-500 ${settings.isSeniorMode ? 'ring-8 ring-rose-500/20' : ''}`}>
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <span className={`font-bold opacity-70 uppercase tracking-[0.2em] ${settings.isSeniorMode ? 'text-sm' : 'text-[10px]'}`}>Tugas Sekarang</span>
              <div className="px-4 py-1.5 bg-rose-500/30 dark:bg-white/20 rounded-full text-[10px] font-black backdrop-blur-md uppercase border border-white/10">Prioritas</div>
            </div>
            <div className="space-y-1">
              <h4 className={`font-black leading-tight ${settings.isSeniorMode ? 'text-4xl' : 'text-3xl'}`}>{nextDose.med.name}</h4>
              <p className={`font-bold opacity-80 ${settings.isSeniorMode ? 'text-xl' : 'text-sm'}`}>{nextDose.med.dosage}</p>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10">
                <Clock size={18} />
                <span className="font-bold">{nextDose.time}</span>
              </div>
              <div className="flex items-center gap-2 text-rose-300 dark:text-white font-black">
                <Timer size={18} className="animate-spin-slow" />
                <span>{getCountdown(nextDose.time)}</span>
              </div>
            </div>
            <button 
              onClick={() => markAsTaken(nextDose.med.id, nextDose.time)}
              className="w-full py-5 bg-white text-slate-900 dark:text-rose-500 rounded-[28px] font-black text-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={24} /> SUDAH SAYA MINUM
            </button>
          </div>
        </div>
      ) : fullTodaySchedule.length > 0 ? (
        <div className="bg-emerald-500 rounded-[40px] p-8 text-white shadow-xl flex items-center gap-5 animate-in slide-in-from-bottom-4 duration-700">
           <div className="bg-white/20 p-5 rounded-[32px] backdrop-blur-md shadow-inner">
              <CheckCircle2 size={40} strokeWidth={3} />
           </div>
           <div className="space-y-1">
              <p className="font-black text-2xl leading-none">Hari Selesai!</p>
              <p className="font-medium opacity-90 text-sm leading-tight">Hebat, semua dosis hari ini sudah terpenuhi dengan baik.</p>
           </div>
        </div>
      ) : (
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-[40px] p-12 text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center text-center gap-4 border-4 border-dashed border-slate-200 dark:border-slate-800">
           <div className="p-6 bg-white dark:bg-slate-800 rounded-full shadow-sm">
            <CalendarDays size={48} className="opacity-30" />
           </div>
           <div>
              <p className="font-black text-xl text-slate-500 dark:text-slate-400">TIDAK ADA JADWAL</p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-60">Nikmati hari Anda, tidak ada obat terjadwal hari ini.</p>
           </div>
        </div>
      )}

      {/* Main Schedule List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className={`font-black text-slate-900 dark:text-white flex items-center gap-2 ${settings.isSeniorMode ? 'text-2xl' : 'text-lg'}`}>
            Jadwal Tersisa
          </h3>
          {remainingSchedule.length > 0 && (
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              {remainingSchedule.length} LAGI
            </span>
          )}
        </div>

        <div className="space-y-10">
          {remainingSchedule.length === 0 && fullTodaySchedule.length > 0 ? (
            <div className="text-center py-4 space-y-2 opacity-50">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Semua Tugas Selesai</p>
            </div>
          ) : remainingSchedule.length === 0 ? null : (
            groupedSchedule.map(([category, items]) => (
              <div key={category} className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 px-1">
                   <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                      {items[0].category.icon}
                   </div>
                   <h4 className="font-black text-xs text-slate-400 uppercase tracking-widest">{category}</h4>
                   <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                </div>
                
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div 
                      key={`${item.med.id}-${item.time}-${idx}`}
                      className={`group flex items-center gap-4 p-4 rounded-[32px] bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700/50 shadow-sm transition-all hover:shadow-md active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div className={`w-14 h-14 rounded-2xl ${item.med.color} flex flex-col items-center justify-center text-white shrink-0 shadow-lg font-black`}>
                         <span className="text-xs opacity-70 leading-none mb-1">JAM</span>
                         <span className="text-lg leading-none">{item.time}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-black text-slate-900 dark:text-white truncate ${settings.isSeniorMode ? 'text-2xl' : 'text-base'}`}>{item.med.name}</p>
                        <p className={`text-slate-500 dark:text-slate-400 font-bold ${settings.isSeniorMode ? 'text-lg' : 'text-xs'}`}>{item.med.dosage}</p>
                      </div>
                      <button 
                        onClick={() => markAsTaken(item.med.id, item.time)}
                        className={`w-12 h-12 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center transition-all hover:bg-emerald-500 hover:text-white active:scale-90`}
                      >
                        <CheckCircle2 size={24} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Mini Log Section */}
      {takenTodayCount > 0 && (
        <section className="pt-2">
          <button 
            onClick={() => setShowTakenToday(!showTakenToday)}
            className="w-full flex items-center justify-between px-4 py-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all"
          >
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckCircle2 size={16} />
               </div>
               <span className="text-sm font-black text-slate-600 dark:text-slate-300">{takenTodayCount} Dosis Diminum Hari Ini</span>
            </div>
            {showTakenToday ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
          </button>
          
          {showTakenToday && (
            <div className="mt-3 space-y-2 px-2 animate-in slide-in-from-top-2 duration-300">
               {fullTodaySchedule.filter(s => s.isTaken).map((item, i) => (
                 <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0 opacity-60">
                    <div className="flex items-center gap-3">
                       <div className={`w-2 h-2 rounded-full ${item.med.color.replace('bg-', 'bg-')}`} />
                       <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.med.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400">{item.time}</span>
                 </div>
               ))}
            </div>
          )}
        </section>
      )}

      {/* Health Tip Section */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-900/20 rounded-[32px] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
           <div className="w-9 h-9 bg-amber-200 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shadow-sm">
             <span className="text-xl">💡</span>
           </div>
           <h3 className="font-black text-xs text-amber-700 dark:text-amber-400 uppercase tracking-widest">Tips Kesehatan</h3>
        </div>
        <p className={`${settings.isSeniorMode ? 'text-2xl' : 'text-base'} leading-relaxed font-bold text-amber-900/80 dark:text-amber-200/80 italic`}>
          "{tip.tip}"
        </p>
      </div>

      {/* Low Stock Warning */}
      {medications.filter(med => med.stock <= med.lowStockThreshold).length > 0 && (
        <section className="space-y-4 pt-2">
          <h3 className={`font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-widest ${settings.isSeniorMode ? 'text-lg' : 'text-xs'}`}>
            <AlertTriangle size={18} className="text-amber-500" />
            Persediaan Menipis
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {medications.filter(med => med.stock <= med.lowStockThreshold).map(med => (
              <div key={med.id} className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-5 rounded-[32px] flex items-center justify-between shadow-sm animate-pulse">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${med.color} opacity-20 flex items-center justify-center`}>
                    <AlertTriangle size={24} className="text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <p className={`font-black text-slate-900 dark:text-white ${settings.isSeniorMode ? 'text-xl' : 'text-base'}`}>{med.name}</p>
                    <p className={`text-rose-500 font-bold ${settings.isSeniorMode ? 'text-lg' : 'text-xs'}`}>Sisa {med.stock} dosis</p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-amber-100 dark:bg-amber-500/10 rounded-full">
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase">Isi Ulang</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
