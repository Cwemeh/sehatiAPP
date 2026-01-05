import React, { useState } from "react";
import { useStore } from "../store/useStore";
import {
  ShieldCheck,
  CloudDownload,
  ArrowRight,
  Loader2,
  Heart,
} from "lucide-react";

export const Onboarding: React.FC = () => {
  const completeOnboarding = useStore((state) => state.completeOnboarding);
  const restoreFromCloud = useStore((state) => state.restoreFromCloud);

  const [name, setName] = useState("");
  const [restoreId, setRestoreId] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState("");

  const handleStart = () => {
    if (name.trim()) {
      completeOnboarding(name);
    }
  };

  const handleRestore = async () => {
    if (!restoreId.trim()) return;

    setIsRestoring(true);
    setRestoreError("");

    const success = await restoreFromCloud(restoreId);

    if (success) {
      // Jika data ditemukan, masuk ke dashboard
      // Kita gunakan nama default atau nama dari input jika ada
      completeOnboarding(name || "Pengguna Kembali");
    } else {
      setRestoreError("Data tidak ditemukan. Periksa kembali ID Anda.");
    }
    setIsRestoring(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-6 space-y-12 animate-in fade-in duration-700">
      {/* Header Logo */}
      <div className="text-center space-y-4">
        <div className="w-24 h-24 bg-rose-500 rounded-[32px] flex items-center justify-center mx-auto shadow-xl shadow-rose-500/30 rotate-3">
          <Heart size={48} className="text-white fill-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            SeHati
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Teman Sehat Disiplin Obat
          </p>
        </div>
      </div>

      {/* Form Pengguna Baru */}
      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Nama Panggilan
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Budi"
            className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-2xl px-5 py-4 font-bold text-lg focus:ring-2 focus:ring-rose-500 transition-all dark:text-white"
          />
        </div>
        <button
          onClick={handleStart}
          disabled={!name.trim()}
          className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          Mulai Sekarang <ArrowRight size={20} strokeWidth={3} />
        </button>
      </div>

      {/* Bagian Restore Data (Pengganti Google Drive) */}
      <div className="w-full max-w-sm pt-8 border-t border-slate-100 dark:border-slate-800">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 space-y-4 border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <CloudDownload size={20} />
            </div>
            <span className="font-bold text-sm">Sudah punya data?</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Masukkan <b>ID Pengguna</b> lama Anda untuk memulihkan jadwal obat
            dari cloud.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={restoreId}
              onChange={(e) => setRestoreId(e.target.value)}
              placeholder="ID Pengguna (UUID)"
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
            />
            <button
              onClick={handleRestore}
              disabled={isRestoring || !restoreId.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center min-w-[80px]"
            >
              {isRestoring ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Pulihkan"
              )}
            </button>
          </div>
          {restoreError && (
            <p className="text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-900/20 p-2 rounded-lg">
              {restoreError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
