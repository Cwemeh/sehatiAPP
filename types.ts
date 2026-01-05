
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
  image?: string; // Base64 thumbnail
  daysOfWeek?: number[]; 
  intervalDays?: number; 
  startDate: number; 
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
  name: string;
  isDarkMode: boolean;
  isSeniorMode: boolean;
  isOnboarded: boolean;
  notificationSound: NotificationSound;
  enableVibration: boolean;
  cloudSyncEmail?: string;
  isCloudSynced: boolean;
  lastSyncedAt?: number;
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
