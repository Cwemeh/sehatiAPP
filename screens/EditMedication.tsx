
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { COLORS } from '../constants';
import { ChevronLeft, Plus, X, Save } from 'lucide-react';
import { FrequencyType } from '../types';

export const EditMedication: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const medications = useStore((state) => state.medications);
  const updateMedication = useStore((state) => state.updateMedication);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [stock, setStock] = useState('30');
  const [threshold, setThreshold] = useState('5');
  const [schedules, setSchedules] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  
  // Frequency states
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [intervalDays, setIntervalDays] = useState('2');
  const [startDate, setStartDate] = useState<number>(Date.now());

  const DAY_NAMES = [
    { label: 'Min', val: 0 },
    { label: 'Sen', val: 1 },
    { label: 'Sel', val: 2 },
    { label: 'Rab', val: 3 },
    { label: 'Kam', val: 4 },
    { label: 'Jum', val: 5 },
    { label: 'Sab', val: 6 },
  ];

  useEffect(() => {
    const med = medications.find(m => m.id === id);
    if (med) {
      setName(med.name);
      setDosage(med.dosage);
      setStock(med.stock.toString());
      setThreshold(med.lowStockThreshold.toString());
      setSchedules(med.schedules);
      setSelectedColor(med.color);
      setFrequencyType(med.frequencyType);
      setDaysOfWeek(med.daysOfWeek || [1, 2, 3, 4, 5]);
      setIntervalDays((med.intervalDays || 2).toString());
      setStartDate(med.startDate);
    } else {
      navigate('/medications');
    }
  }, [id, medications, navigate]);

  const handleAddSchedule = () => setSchedules([...schedules, '12:00']);
  const handleRemoveSchedule = (index: number) => setSchedules(schedules.filter((_, i) => i !== index));
  const handleScheduleChange = (index: number, val: string) => {
    const newScheds = [...schedules];
    newScheds[index] = val;
    setSchedules(newScheds);
  };

  const toggleDay = (day: number) => {
    setDaysOfWeek(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage || !id) return;

    updateMedication({
      id,
      name,
      dosage,
      stock: parseInt(stock),
      lowStockThreshold: parseInt(threshold),
      schedules,
      color: selectedColor,
      frequencyType,
      daysOfWeek: frequencyType === 'specific_days' ? daysOfWeek : undefined,
      intervalDays: frequencyType === 'interval' ? parseInt(intervalDays) : undefined,
      startDate
    });
    navigate('/medications');
  };

  return (
    <div className="p-6 space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ubah Obat</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Informasi Dasar</h3>
            <div className="space-y-4 bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nama Obat</label>
                <input 
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Dosis</label>
                <input 
                  type="text" required value={dosage} onChange={e => setDosage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all font-bold"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Frekuensi Minum</h3>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex p-1 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                {(['daily', 'specific_days', 'interval'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFrequencyType(type)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                      frequencyType === type 
                      ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-sm' 
                      : 'text-slate-400'
                    }`}
                  >
                    {type === 'daily' ? 'Tiap Hari' : type === 'specific_days' ? 'Hari Tertentu' : 'Interval'}
                  </button>
                ))}
              </div>

              {frequencyType === 'specific_days' && (
                <div className="flex justify-between gap-1 animate-in slide-in-from-top-2 duration-300">
                  {DAY_NAMES.map(day => (
                    <button
                      key={day.val}
                      type="button"
                      onClick={() => toggleDay(day.val)}
                      className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${
                        daysOfWeek.includes(day.val)
                        ? 'bg-rose-500 text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-400'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              )}

              {frequencyType === 'interval' && (
                <div className="flex items-center gap-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Diminum Setiap...</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" value={intervalDays} onChange={e => setIntervalDays(e.target.value)}
                        className="w-20 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-center text-slate-800 dark:text-white font-black"
                      />
                      <span className="font-bold text-slate-500 text-sm">Hari</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Waktu & Stok</h3>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
              <div className="space-y-3">
                {schedules.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input 
                      type="time" value={s} onChange={e => handleScheduleChange(i, e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-slate-800 dark:text-white font-black text-lg"
                    />
                    {schedules.length > 1 && (
                      <button type="button" onClick={() => handleRemoveSchedule(i)} className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-2xl">
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  type="button" onClick={handleAddSchedule}
                  className="w-full py-4 border-2 border-dashed border-slate-100 dark:border-slate-700 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                >
                  <Plus size={16} /> Tambah Jam Minum
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Stok Sekarang</label>
                  <input 
                    type="number" required value={stock} onChange={e => setStock(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-slate-800 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Batas Minimum</label>
                  <input 
                    type="number" required value={threshold} onChange={e => setThreshold(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-slate-800 dark:text-white font-bold"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Personalisasi</h3>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-1">Ubah Warna</label>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {COLORS.map(c => (
                  <button
                    key={c} type="button" onClick={() => setSelectedColor(c)}
                    className={`w-12 h-12 shrink-0 rounded-2xl transition-all ${c} ${selectedColor === c ? 'ring-4 ring-offset-4 ring-rose-500 dark:ring-offset-slate-800' : 'opacity-40 scale-90'}`}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="pt-4 pb-12">
          <button type="submit" className="w-full py-5 bg-rose-500 text-white rounded-[32px] font-black text-lg shadow-2xl shadow-rose-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2">
            <Save size={24} /> SIMPAN PERUBAHAN
          </button>
        </div>
      </form>
    </div>
  );
};
