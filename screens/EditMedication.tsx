
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { COLORS, MED_FORMS } from '../constants';
import { ChevronLeft, Plus, X, Camera, Save, Trash2, Calendar, Check } from 'lucide-react';
import { FrequencyType, MedicationFormType } from '../types';

export const EditMedication: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const medications = useStore((state) => state.medications);
  const updateMedication = useStore((state) => state.updateMedication);
  const deleteMedication = useStore((state) => state.deleteMedication);
  const settings = useStore((state) => state.settings);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [stock, setStock] = useState('0');
  const [threshold, setThreshold] = useState('5');
  const [schedules, setSchedules] = useState<string[]>(['08:00']);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [formType, setFormType] = useState<MedicationFormType>('tablet');
  const [image, setImage] = useState<string | undefined>(undefined);
  
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [intervalDays, setIntervalDays] = useState('2');
  const [startDate, setStartDate] = useState<number>(Date.now());

  const fileInputRef = useRef<HTMLInputElement>(null);

  const DAYS = [
    { id: 1, label: 'S' }, { id: 2, label: 'S' }, { id: 3, label: 'R' },
    { id: 4, label: 'K' }, { id: 5, label: 'J' }, { id: 6, label: 'S' }, { id: 0, label: 'M' }
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
      setFormType(med.formType || 'tablet');
      setImage(med.image);
      setDaysOfWeek(med.daysOfWeek || [1, 2, 3, 4, 5]);
      setIntervalDays((med.intervalDays || 2).toString());
      setStartDate(med.startDate);
    } else {
      navigate('/medications');
    }
  }, [id, medications, navigate]);

  const toggleDay = (day: number) => {
    setDaysOfWeek(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400;
          let width = img.width; let height = img.height;
          if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
          else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
          setImage(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage || !id) return;
    updateMedication({
      id, name, dosage, stock: parseInt(stock), lowStockThreshold: parseInt(threshold),
      schedules, color: selectedColor, frequencyType, formType, image,
      daysOfWeek: frequencyType === 'specific_days' ? daysOfWeek : undefined,
      intervalDays: frequencyType === 'interval' ? parseInt(intervalDays) : undefined,
      startDate
    });
    navigate('/medications');
  };

  return (
    <div className="p-6 space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
          <ChevronLeft size={24} />
        </button>
        <h2 className={`font-black text-slate-900 dark:text-white ${settings.isSeniorMode ? 'text-3xl' : 'text-2xl'}`}>Edit Obat</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Foto Obat</h3>
          <div onClick={() => fileInputRef.current?.click()} className="relative w-full aspect-video bg-slate-50 dark:bg-slate-800 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col items-center justify-center cursor-pointer shadow-inner">
            {image ? <img src={image} className="w-full h-full object-cover" /> : (
              <div className="text-center space-y-2">
                <Camera size={32} className="mx-auto text-slate-400" />
                <p className="text-sm font-bold text-slate-400">Ganti foto obat</p>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Warna Penanda</h3>
          <div className="flex flex-wrap gap-4 px-1">
            {COLORS.map(color => (
              <button 
                key={color} 
                type="button" 
                onClick={() => setSelectedColor(color)} 
                className={`w-12 h-12 rounded-full ${color} transition-all relative flex items-center justify-center ${selectedColor === color ? 'ring-4 ring-offset-4 ring-rose-500/30 scale-110' : 'opacity-40 hover:opacity-100 scale-90'}`}
              >
                {selectedColor === color && <Check className="text-white" size={24} strokeWidth={4} />}
              </button>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Identitas & Ikon</h3>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
              <div className="grid grid-cols-3 gap-3">
                {MED_FORMS.map(form => (
                  <button 
                    key={form.id} 
                    type="button" 
                    onClick={() => setFormType(form.id)} 
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${formType === form.id ? `${selectedColor} border-transparent text-white shadow-lg scale-105` : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-400'}`}
                  >
                    {form.icon}
                    <span className="text-[10px] font-black uppercase">{form.label}</span>
                  </button>
                ))}
              </div>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Nama Obat" className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 text-slate-800 dark:text-white font-bold" />
              <input type="text" required value={dosage} onChange={e => setDosage(e.target.value)} placeholder="Dosis" className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 text-slate-800 dark:text-white font-bold" />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Jadwal & Frekuensi</h3>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
              <div className="flex p-1 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                {(['daily', 'specific_days', 'interval'] as const).map(type => (
                  <button key={type} type="button" onClick={() => setFrequencyType(type)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${frequencyType === type ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-sm' : 'text-slate-400'}`}>
                    {type === 'daily' ? 'Harian' : type === 'specific_days' ? 'Hari' : 'Interval'}
                  </button>
                ))}
              </div>

              {frequencyType === 'specific_days' && (
                <div className="flex justify-between gap-1 animate-in slide-in-from-top-2 duration-300">
                  {DAYS.map(day => (
                    <button key={day.id} type="button" onClick={() => toggleDay(day.id)} className={`w-10 h-10 rounded-xl font-black transition-all ${daysOfWeek.includes(day.id) ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-900 text-slate-400'}`}>
                      {day.label}
                    </button>
                  ))}
                </div>
              )}

              {frequencyType === 'interval' && (
                 <div className="flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-slate-400"><Calendar size={20} /></div>
                    <div className="flex-1 flex items-center gap-2">
                       <span className="text-xs font-bold text-slate-400 uppercase">Setiap</span>
                       <input type="number" min="2" value={intervalDays} onChange={e => setIntervalDays(e.target.value)} className="w-20 bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center font-black text-rose-500" />
                       <span className="text-xs font-bold text-slate-400 uppercase">hari</span>
                    </div>
                 </div>
              )}

              <div className="space-y-3">
                {schedules.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="time" value={s} onChange={e => { const n = [...schedules]; n[i] = e.target.value; setSchedules(n); }} className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 text-slate-800 dark:text-white font-black text-lg" />
                    {schedules.length > 1 && (
                      <button type="button" onClick={() => setSchedules(schedules.filter((_, idx) => idx !== i))} className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-2xl"><X size={20} /></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setSchedules([...schedules, '12:00'])} className="w-full py-4 border-2 border-dashed border-slate-100 dark:border-slate-700 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"><Plus size={16} /> Tambah Jam</button>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Stok Obat</h3>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sisa Stok</label>
                  <input type="number" required value={stock} onChange={e => setStock(e.target.value)} placeholder="Misal: 30" className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 text-slate-800 dark:text-white font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alert Stok</label>
                  <input type="number" required value={threshold} onChange={e => setThreshold(e.target.value)} placeholder="Misal: 5" className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 text-slate-800 dark:text-white font-bold" />
                </div>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <button type="submit" className="w-full py-5 bg-rose-500 text-white rounded-[32px] font-black text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
            <Save size={24} /> SIMPAN PERUBAHAN
          </button>
          <button type="button" onClick={() => { if(confirm('Hapus obat?')) { deleteMedication(id!); navigate('/medications'); } }} className="w-full py-4 text-rose-400 font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <Trash2 size={16} /> Hapus Obat Permanen
          </button>
        </div>
      </form>
    </div>
  );
};
