
export type FrequencyType = 'daily' | 'specific_days' | 'interval';
export type MedicationFormType = 'tablet' | 'capsule' | 'syrup' | 'ointment' | 'drops' | 'injection';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  stock: number;
  lowStockThreshold: number;
  schedules: string[]; 
  color: string;
  frequencyType: FrequencyType;
  formType: MedicationFormType;
  image?: string; 
  daysOfWeek?: number[]; 
  intervalDays?: number; 
  startDate: number; 
}

// Interface untuk data dari Database (Supabase)
export interface DBMedication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  stock: number;
  threshold: number;
  schedules: string[];
  frequency: {
    type: FrequencyType;
    days?: number[];
    interval?: number;
  };
  color: string;
  image_url?: string;
  form_type?: MedicationFormType;
  created_at?: string;
}

export interface MedicationHistory {
  id: string;
  medicationId: string;
  medicationName: string;
  takenAt: number;
  dosage: string;
}

export interface TakenSchedule {
  date: string; 
  medicationId: string;
  time: string; 
}

export type NotificationSound = 'gentle' | 'urgent' | 'silent';

export interface UserSettings {
  userId: string; // ID unik untuk Supabase
  name: string;
  isDarkMode: boolean;
  isSeniorMode: boolean;
  isOnboarded: boolean;
  notificationSound: NotificationSound;
  enableVibration: boolean;
  isCloudSynced: boolean;
  lastSyncedAt?: number;
  pushToken?: string; // OneSignal Player ID
}

export interface SnoozedAlert {
  medId: string;
  medName: string;
  time: string; 
  remindAt: number; 
}

export interface HealthTip {
  id: number;
  tip: string;
}
