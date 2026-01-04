
import React from 'react';
import { useStore } from '../store/useStore';
import { Calendar, Download } from 'lucide-react';

export const History: React.FC = () => {
  const history = useStore((state) => state.history);
  const clearHistory = useStore((state) => state.clearHistory);
  const settings = useStore((state) => state.settings);

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(ts));
  };

  const exportToCSV = () => {
    if (history.length === 0) return;
    
    const headers = ['Nama Obat', 'Dosis', 'Waktu Diminum'];
    const rows = history.map(item => [
      item.medicationName,
      item.dosage,
      formatDate(item.takenAt).replace(/,/g, '')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Riwayat_Obat_SeHati_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`font-bold text-slate-800 dark:text-white ${settings.isSeniorMode ? 'text-3xl' : 'text-2xl'}`}>Riwayat</h2>
        <div className="flex gap-2">
          {history.length > 0 && (
            <>
              <button onClick={exportToCSV} className="flex items-center gap-1.5 text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full">
                <Download size={14} /> Ekspor
              </button>
              <button onClick={() => {if(confirm('Hapus semua riwayat?')) clearHistory()}} className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 rounded-full">
                Hapus
              </button>
            </>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600">
            <Calendar size={40} />
          </div>
          <p className="text-slate-400 font-medium text-center">Belum ada riwayat minum obat.</p>
        </div>
      ) : (
        <div className="space-y-4 relative">
          <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800" />
          {history.map((item) => (
            <div key={item.id} className="relative pl-14 pb-2">
              <div className="absolute left-4 top-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white ring-4 ring-white dark:ring-slate-900 z-10">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div className={`bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all ${settings.isSeniorMode ? 'p-6' : 'p-4'}`}>
                <p className={`font-bold text-slate-800 dark:text-white ${settings.isSeniorMode ? 'text-xl' : 'text-base'}`}>{item.medicationName}</p>
                <p className={`text-slate-500 dark:text-slate-400 font-medium mb-2 ${settings.isSeniorMode ? 'text-lg' : 'text-xs'}`}>{item.dosage}</p>
                <div className={`flex items-center gap-1.5 text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tight ${settings.isSeniorMode ? 'text-sm' : 'text-[10px]'}`}>
                  <Calendar size={settings.isSeniorMode ? 16 : 12} />
                  {formatDate(item.takenAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
