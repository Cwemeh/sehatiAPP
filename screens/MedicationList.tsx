
import React from 'react';
import { useStore } from '../store/useStore';
import { Pill, Trash2, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MedicationList: React.FC = () => {
  const medications = useStore((state) => state.medications);
  const deleteMedication = useStore((state) => state.deleteMedication);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Daftar Obat</h2>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{medications.length} Obat</span>
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
          {medications.map(med => (
            <div key={med.id} className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${med.color} flex items-center justify-center text-white shrink-0 shadow-lg`}>
                  <Pill size={28} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 dark:text-white text-lg">{med.name}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{med.dosage} • {med.schedules.length}x sehari</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Stok</p>
                    <p className={`font-bold ${med.stock <= med.lowStockThreshold ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}>{med.stock}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link to={`/edit/${med.id}`} className="p-3 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors">
                    <Edit3 size={20} />
                  </Link>
                  <button 
                    onClick={() => { if(confirm('Hapus obat ini?')) deleteMedication(med.id) }}
                    className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
