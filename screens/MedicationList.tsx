
import React from 'react';
import { useStore } from '../store/useStore';
import { Pill, Trash2, Edit3, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MED_FORMS } from '../constants';

export const MedicationList: React.FC = () => {
  const medications = useStore((state) => state.medications);
  const deleteMedication = useStore((state) => state.deleteMedication);
  const settings = useStore((state) => state.settings);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`font-black text-slate-800 dark:text-white ${settings.isSeniorMode ? 'text-3xl' : 'text-2xl'}`}>Daftar Obat</h2>
        <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-widest">{medications.length} Obat</span>
      </div>

      {medications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600">
            <Pill size={40} />
          </div>
          <p className="text-slate-400 font-medium text-center px-10">Belum ada data obat. Tekan tombol "+" untuk menambah.</p>
          <Link to="/add" className="bg-rose-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-rose-200 dark:shadow-none transition-transform active:scale-95">
            Tambah Obat Baru
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {medications.map(med => {
            const medForm = MED_FORMS.find(f => f.id === med.formType);
            const isLowStock = med.stock <= med.lowStockThreshold;
            
            return (
              <div key={med.id} className={`bg-white dark:bg-slate-800 p-4 rounded-3xl border-2 transition-all relative ${isLowStock ? 'border-rose-500 shadow-md shadow-rose-100 dark:shadow-none' : 'border-slate-50 dark:border-slate-700/50 shadow-sm'} space-y-4`}>
                
                {isLowStock && (
                  <div className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-lg z-10 animate-pulse">
                    <AlertTriangle size={14} strokeWidth={3} />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className={`${settings.isSeniorMode ? 'w-16 h-16' : 'w-14 h-14'} rounded-2xl ${med.color} flex items-center justify-center text-white shrink-0 shadow-lg`}>
                    {medForm?.icon || <Pill size={28} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-black text-slate-800 dark:text-white truncate ${settings.isSeniorMode ? 'text-xl' : 'text-lg'}`}>{med.name}</h4>
                    <p className={`text-slate-500 dark:text-slate-400 font-bold ${settings.isSeniorMode ? 'text-lg' : 'text-sm'}`}>{med.dosage} • {med.schedules.length}x sehari</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <div className="text-left px-1">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Sisa Stok</p>
                      <div className="flex items-center gap-2">
                        <p className={`font-black ${isLowStock ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'} ${settings.isSeniorMode ? 'text-xl' : 'text-base'}`}>{med.stock}</p>
                        {isLowStock && <span className="text-[10px] font-black text-rose-500 uppercase tracking-tighter">(ISI ULANG)</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link to={`/edit/${med.id}`} className="p-3 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors active:scale-90">
                      <Edit3 size={20} />
                    </Link>
                    <button 
                      onClick={() => { if(confirm('Hapus obat ini?')) deleteMedication(med.id) }}
                      className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors active:scale-90"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
