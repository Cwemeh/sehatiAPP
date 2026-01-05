
import React from 'react';
import { HealthTip, MedicationFormType } from './types';
import { Pill, Tablet, Droplets, Syringe, Clipboard as Ointment, FlaskConical } from 'lucide-react';

export const HEALTH_TIPS: HealthTip[] = [
  { id: 1, tip: "Minum air putih setidaknya 8 gelas sehari untuk menjaga hidrasi." },
  { id: 2, tip: "Istirahat yang cukup membantu tubuh memulihkan diri lebih cepat." },
  { id: 3, tip: "Jangan lewatkan sarapan untuk energi maksimal di pagi hari." },
  { id: 4, tip: "Olahraga ringan selama 15 menit dapat meningkatkan suasana hati." },
  { id: 5, tip: "Konsumsi sayur dan buah setiap hari untuk imunitas yang kuat." },
  { id: 6, tip: "Cek tanggal kadaluarsa obat secara rutin di kotak obat Anda." },
  { id: 7, tip: "Selalu minum obat sesuai anjuran dosis dari dokter." }
];

export const COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-indigo-500'
];

export interface MedFormOption {
  id: MedicationFormType;
  label: string;
  icon: React.ReactNode;
  verb: string;
}

export const MED_FORMS: MedFormOption[] = [
  { id: 'tablet', label: 'Tablet', icon: <Tablet size={24} />, verb: 'Minum' },
  { id: 'capsule', label: 'Kapsul', icon: <Pill size={24} />, verb: 'Minum' },
  { id: 'syrup', label: 'Sirup', icon: <FlaskConical size={24} />, verb: 'Tuangkan' },
  { id: 'ointment', label: 'Salep', icon: <Ointment size={24} />, verb: 'Oleskan' },
  { id: 'drops', label: 'Tetes', icon: <Droplets size={24} />, verb: 'Teteskan' },
  { id: 'injection', label: 'Suntik', icon: <Syringe size={24} />, verb: 'Suntikkan' },
];
