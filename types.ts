
export type FrequencyType = 'daily' | 'specific_days' | 'interval';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  stock: number;
  lowStockThreshold: number;
  schedules: string[]; 
  color: string;
  frequencyType: FrequencyType;
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  intervalDays?: number; // e.g., 2 for every 2 days
  startDate: number; // Timestamp for interval calculation reference
}

export interface MedicationHistory {
  id: string;
  medicationId: string;
  medicationName: string;
  takenAt: number;
  dosage: string;
}

export interface TakenSchedule {
  date: string; // YYYY-MM-DD
  medicationId: string;
  time: string; // HH:mm
}

export type NotificationSound = 'gentle' | 'urgent' | 'silent';

export interface UserSettings {
  name: string;
  isDarkMode: boolean;
  isSeniorMode: boolean;
  isOnboarded: boolean;
  notificationSound: NotificationSound;
  enableVibration: boolean;
}

export interface SnoozedAlert {
  medId: string;
  medName: string;
  time: string; // Original schedule time
  remindAt: number; // Timestamp of next alert
}

export interface HealthTip {
  id: number;
  tip: string;
}
