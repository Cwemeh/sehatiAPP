
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { HEALTH_TIPS, MED_FORMS } from '../constants';
import { Clock, CheckCircle2, Timer, Sun, Moon, CalendarDays, Sunset, SunDim, ChevronDown, ChevronUp, Pill, ArrowRight, Check, AlertTriangle } from 'lucide-react';
import { Medication } from '../types';

interface SlideConfirmProps {
  onConfirm: () => void;
  label: string;
  isSeniorMode?: boolean;
  className?: string;
}

const SlideConfirm: React.FC<SlideConfirmProps> = ({ onConfirm, label, isSeniorMode, className = "" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    startX.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const handleWidth = isSeniorMode ? 64 : 56;
    const maxDistance = containerWidth - handleWidth - 12; 
    
    let delta = clientX - startX.current;
    if (delta < 0) delta = 0;
    if (delta > maxDistance) delta = maxDistance;
    
    setTranslateX(delta);
    
    if (delta >= maxDistance) {
      setIsDragging(false);
      setTranslateX(0);
      onConfirm();
      if ('vibrate' in navigator) navigator.vibrate([10, 30, 10]);
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setTranslateX(0); 
  };

  return (
    <div 
      ref={containerRef}
      className={`relative bg-slate-100 dark:bg-slate-800/50 rounded-[40px] p-1.5 flex items-center overflow-hidden touch-none select-none ${isSeniorMode ? 'h-20' : 'h-16 md:h-18'} ${className}`}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 transition-opacity ${translateX > 40 ? 'opacity-0' : 'opacity-100'} ${isSeniorMode ? 'text-sm' : 'text-[10px]'}`}>
          {label}
        </span>
      </div>

      <div 
        style={{ 
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)'
        }}
        className={`${isSeniorMode ? 'w-16 h-16' : 'w-13 h-13'} bg-white dark:bg-slate-200 rounded-full shadow-xl flex items-center justify-center text-rose-500 cursor-grab active:cursor-grabbing z-10 transition-colors ${translateX > 50 ? 'text-rose-600' : ''}`}
      >
        {translateX > 150 ? <Check size={isSeniorMode ? 32 : 24} strokeWidth={4} /> : <ArrowRight size={isSeniorMode ? 32 : 24} strokeWidth={4} />}
      </div>
      
      <div 
        className="absolute left-0 top-0 bottom-0 bg-emerald-500/20 pointer-events-none transition-all"
        style={{ width: `${translateX + (isSeniorMode ? 48 : 40)}px`, borderTopLeftRadius: '40px', borderBottomLeftRadius: '40px' }}
      />
    </div>
  );
};

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
    if (hour >= 5 && hour < 11) return { label: 'Pagi', icon: <SunDim size={settings.isSeniorMode ? 20 : 18} className="text-amber-400" />, order: 1 };
    if (hour >= 11 && hour < 15) return { label: 'Siang', icon: <Sun size={settings.isSeniorMode ? 20 : 18} className="text-amber-500" />, order: 2 };
    if (hour >= 15 && hour < 18) return { label: 'Sore', icon: <Sunset size={settings.isSeniorMode ? 20 : 18} className="text-rose-400" />, order: 3 };
    return { label: 'Malam', icon: <Moon size={settings.isSeniorMode ? 20 : 18} className="text-indigo-400" />, order: 4 };
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
      const aOrder = remainingSchedule.find(i => i.category.label === a[0])?.category.order || 0;
      const bOrder = remainingSchedule.find(i => i.category.label === b[0])?.category.order || 0;
      return aOrder - bOrder;
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
    if (diff <= 0) return 'SEKARANG';
    const diffMin = Math.floor(diff / 60000);
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour > 0) return `${diffHour} JAM ${diffMin % 60} MENIT`;
    return `${diffMin} MENIT LAGI`;
  };

  const lowStockMedications = medications.filter(m => m.stock <= m.lowStockThreshold);

  return (
    <div className={`animate-in fade-in duration-500 ${settings.isSeniorMode ? 'px-7 py-5 space-y-10' : 'px-6 py-4 space-y-8'}`}>
      <section className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
             {hours >= 6 && hours < 18 ? <Sun size={settings.isSeniorMode ? 20 : 18} className="text-amber-500" /> : <Moon size={settings.isSeniorMode ? 20 : 18} className="text-indigo-400" />}
             <span className={`font-bold text-slate-400 uppercase tracking-widest ${settings.isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
                {hours < 11 ? "Pagi" : hours < 15 ? "Siang" : hours < 18 ? "Sore" : "Malam"}
             </span>
          </div>
          <h2 className={`font-black text-slate-900 dark:text-white leading-tight ${settings.isSeniorMode ? 'text-3xl' : 'text-2xl'}`}>Halo, {settings.name}!</h2>
        </div>
        <div className="text-right">
           <div className={`font-black text-slate-900 dark:text-white ${settings.isSeniorMode ? 'text-3xl' : 'text-xl'}`}>{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
           <div className={`font-bold text-slate-400 uppercase tracking-tighter ${settings.isSeniorMode ? 'text-[10px]' : 'text-[9px]'}`}>{currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
        </div>
      </section>

      {lowStockMedications.length > 0 && (
        <Link to="/medications" className="block animate-alert-blink">
          <div className="bg-amber-500 text-white p-4 rounded-[28px] shadow-lg flex items-center gap-4 transition-transform active:scale-95">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
              <p className="font-black uppercase text-[9px] tracking-widest opacity-80">Peringatan Stok</p>
              <p className={`font-bold leading-tight ${settings.isSeniorMode ? 'text-lg' : 'text-sm'}`}>
                {lowStockMedications.length === 1 
                  ? `${lowStockMedications[0].name} hampir habis!` 
                  : `${lowStockMedications.length} obat hampir habis!`}
              </p>
            </div>
            <ArrowRight size={20} className="opacity-60" />
          </div>
        </Link>
      )}

      {nextDose ? (
        <div className={`relative overflow-hidden bg-slate-900 dark:bg-rose-600 rounded-[40px] shadow-xl transition-all animate-in zoom-in-95 duration-500 ${settings.isSeniorMode ? 'p-8' : 'p-7'}`}>
          {nextDose.med.image && <div className="absolute inset-0 opacity-20"><img src={nextDose.med.image} className="w-full h-full object-cover" /></div>}
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <span className={`font-black opacity-80 uppercase tracking-widest ${settings.isSeniorMode ? 'text-sm' : 'text-[10px]'}`}>Berikutnya</span>
              <div className="px-4 py-1.5 bg-white/20 rounded-full text-[9px] font-black backdrop-blur-md uppercase tracking-widest">Penting</div>
            </div>
            <div className="flex items-center gap-5">
               <div className={`${settings.isSeniorMode ? 'w-20 h-20' : 'w-16 h-16'} bg-white/10 rounded-3xl overflow-hidden ring-2 ring-white/10 flex items-center justify-center shrink-0`}>
                {nextDose.med.image ? (
                  <img src={nextDose.med.image} className="w-full h-full object-cover" />
                ) : (
                  MED_FORMS.find(f => f.id === nextDose.med.formType)?.icon || <Pill size={settings.isSeniorMode ? 40 : 32} />
                )}
               </div>
               <div className="space-y-0.5">
                  <h4 className={`font-black leading-tight ${settings.isSeniorMode ? 'text-4xl' : 'text-2xl'}`}>{nextDose.med.name}</h4>
                  <p className={`font-bold opacity-80 ${settings.isSeniorMode ? 'text-xl' : 'text-lg'}`}>{nextDose.med.dosage}</p>
               </div>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-2.5">
                <Clock size={settings.isSeniorMode ? 24 : 18} /><span className={`font-black ${settings.isSeniorMode ? 'text-2xl' : 'text-xl'}`}>Pukul {nextDose.time}</span>
              </div>
              <div className="flex items-center gap-2 text-rose-300 dark:text-rose-100 font-black">
                <Timer size={settings.isSeniorMode ? 22 : 16} className="animate-spin-slow" /><span className={settings.isSeniorMode ? 'text-lg' : 'text-xs'}>{getCountdown(nextDose.time)}</span>
              </div>
            </div>
            
            <div className="pt-2">
              <SlideConfirm 
                label="GESER UNTUK MINUM" 
                isSeniorMode={settings.isSeniorMode}
                onConfirm={() => markAsTaken(nextDose.med.id, nextDose.time)}
                className="bg-white/10 border-2 border-white/20"
              />
            </div>
          </div>
        </div>
      ) : fullTodaySchedule.length > 0 ? (
        <div className="bg-emerald-500 rounded-[40px] p-8 text-white shadow-lg flex items-center gap-5">
           <div className="bg-white/20 p-5 rounded-3xl backdrop-blur-md shrink-0"><CheckCircle2 size={settings.isSeniorMode ? 48 : 36} strokeWidth={3} /></div>
           <div className="space-y-0.5">
              <p className={`font-black leading-none ${settings.isSeniorMode ? 'text-2xl' : 'text-xl'}`}>Hebat!</p>
              <p className={`font-medium opacity-90 leading-tight ${settings.isSeniorMode ? 'text-base' : 'text-sm'}`}>Semua obat hari ini selesai.</p>
           </div>
        </div>
      ) : (
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-[40px] p-12 text-slate-400 flex flex-col items-center text-center gap-4 border-2 border-dashed border-slate-200 dark:border-slate-800">
           <CalendarDays size={48} className="opacity-20" />
           <p className="font-black text-lg text-slate-500 uppercase tracking-widest">Tidak ada jadwal</p>
        </div>
      )}

      <section className="space-y-6">
        <h3 className={`font-black text-slate-900 dark:text-white flex items-center gap-2 ${settings.isSeniorMode ? 'text-2xl' : 'text-lg'}`}>Jadwal Hari Ini</h3>
        <div className="space-y-10">
          {groupedSchedule.map(([category, items]) => (
            <div key={category} className="space-y-5">
              <div className="flex items-center gap-3 px-1">
                 <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-2">{items[0].category.icon}</div>
                 <h4 className={`font-black text-slate-400 uppercase tracking-widest ${settings.isSeniorMode ? 'text-base' : 'text-xs'}`}>{category}</h4>
                 <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="space-y-4">
                {items.map((item, idx) => {
                  const formOption = MED_FORMS.find(f => f.id === item.med.formType);
                  return (
                    <div key={`${item.med.id}-${item.time}-${idx}`} className={`flex flex-col gap-5 p-5 rounded-[40px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-md transition-all`}>
                      <div className="flex items-center gap-4">
                        <div className={`${settings.isSeniorMode ? 'w-16 h-16' : 'w-14 h-14'} rounded-2xl ${item.med.color} relative overflow-hidden flex flex-col items-center justify-center text-white shrink-0 shadow-md font-black`}>
                           {item.med.image && <img src={item.med.image} className="absolute inset-0 w-full h-full object-cover opacity-60" />}
                           <span className="relative z-10 text-[9px] opacity-70 leading-none mb-1">JAM</span>
                           <span className={`relative z-10 leading-none ${settings.isSeniorMode ? 'text-xl' : 'text-lg'}`}>{item.time}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-black text-slate-900 dark:text-white truncate ${settings.isSeniorMode ? 'text-2xl' : 'text-lg'}`}>{item.med.name}</p>
                          <div className="flex items-center gap-2 opacity-60 mt-0.5">
                             <span className="text-slate-500 dark:text-slate-400">{formOption?.icon}</span>
                             <p className={`text-slate-500 dark:text-slate-400 font-bold ${settings.isSeniorMode ? 'text-lg' : 'text-xs'}`}>{item.med.dosage}</p>
                          </div>
                        </div>
                      </div>
                      
                      <SlideConfirm 
                        label="KONFIRMASI" 
                        isSeniorMode={settings.isSeniorMode}
                        onConfirm={() => markAsTaken(item.med.id, item.time)}
                        className="bg-slate-50 dark:bg-slate-900"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {takenTodayCount > 0 && (
        <section className="pt-2">
          <button onClick={() => setShowTakenToday(!showTakenToday)} className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800/30 rounded-[24px]">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center"><CheckCircle2 size={18} /></div>
               <span className={`font-black text-slate-600 dark:text-slate-300 ${settings.isSeniorMode ? 'text-lg' : 'text-xs'}`}>{takenTodayCount} Selesai</span>
            </div>
            {showTakenToday ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
          </button>
          {showTakenToday && (
            <div className="mt-3 space-y-2 px-4 animate-in fade-in slide-in-from-top-2 duration-300">
               {fullTodaySchedule.filter(s => s.isTaken).map((item, i) => (
                 <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 opacity-60">
                    <div className="flex items-center gap-3">
                       <div className={`w-2.5 h-2.5 rounded-full ${item.med.color}`} />
                       <span className={`font-bold text-slate-700 dark:text-slate-200 ${settings.isSeniorMode ? 'text-xl' : 'text-base'}`}>{item.med.name}</span>
                    </div>
                    <span className={`font-black text-slate-400 ${settings.isSeniorMode ? 'text-lg' : 'text-[10px]'}`}>{item.time}</span>
                 </div>
               ))}
            </div>
          )}
        </section>
      )}

      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-[40px] p-6 shadow-sm">
        <h3 className={`font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-2 ${settings.isSeniorMode ? 'text-sm' : 'text-[10px]'}`}>Tips Hari Ini</h3>
        <p className={`${settings.isSeniorMode ? 'text-xl' : 'text-lg'} font-bold text-amber-900/80 dark:text-amber-200/80 italic leading-snug`}>"{tip.tip}"</p>
      </div>
    </div>
  );
};
