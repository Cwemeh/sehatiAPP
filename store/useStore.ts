
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Medication, MedicationHistory, TakenSchedule, UserSettings, SnoozedAlert } from '../types';
import { googleDriveService } from '../services/googleDriveService';

interface State {
  medications: Medication[];
  history: MedicationHistory[];
  takenSchedules: TakenSchedule[];
  snoozedAlerts: SnoozedAlert[];
  settings: UserSettings;
  accessToken?: string;
  isSyncing: boolean;
}

interface Actions {
  addMedication: (med: Omit<Medication, 'id'>) => void;
  updateMedication: (med: Medication) => void;
  deleteMedication: (id: string) => void;
  markAsTaken: (medId: string, time: string) => void;
  snoozeAlert: (medId: string, medName: string, originalTime: string) => void;
  clearSnooze: (medId: string) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  completeOnboarding: (name: string) => void;
  clearHistory: () => void;
  triggerSync: () => Promise<void>;
  connectCloud: () => void;
  restoreFromCloud: () => Promise<void>;
  importData: (data: any) => void;
}

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      medications: [],
      history: [],
      takenSchedules: [],
      snoozedAlerts: [],
      isSyncing: false,
      settings: {
        name: '',
        isDarkMode: false,
        isSeniorMode: false,
        isOnboarded: false,
        notificationSound: 'urgent',
        enableVibration: true,
        isCloudSynced: false,
      },

      addMedication: (med) => {
        const newMed = { ...med, id: crypto.randomUUID() };
        set((state) => ({ medications: [...state.medications, newMed] }));
        get().triggerSync();
      },

      updateMedication: (updatedMed) => {
        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === updatedMed.id ? updatedMed : m
          ),
        }));
        get().triggerSync();
      },

      deleteMedication: (id) => {
        set((state) => ({
          medications: state.medications.filter((m) => m.id !== id),
          takenSchedules: state.takenSchedules.filter((s) => s.medicationId !== id),
          snoozedAlerts: state.snoozedAlerts.filter(s => s.medId !== id),
        }));
        get().triggerSync();
      },

      markAsTaken: (medId, time) => {
        const state = get();
        const med = state.medications.find((m) => m.id === medId);
        if (!med) return;

        const updatedMed = { ...med, stock: Math.max(0, med.stock - 1) };
        const newLog: MedicationHistory = {
          id: crypto.randomUUID(),
          medicationId: medId,
          medicationName: med.name,
          takenAt: Date.now(),
          dosage: med.dosage,
        };

        const today = new Date().toISOString().split('T')[0];

        set((state) => ({
          medications: state.medications.map((m) => m.id === medId ? updatedMed : m),
          history: [newLog, ...state.history],
          takenSchedules: [...state.takenSchedules, { date: today, medicationId: medId, time }],
          snoozedAlerts: state.snoozedAlerts.filter(s => s.medId !== medId),
        }));
        get().triggerSync();
      },

      snoozeAlert: (medId, medName, originalTime) => {
        const remindAt = Date.now() + 10 * 60 * 1000;
        set((state) => ({
          snoozedAlerts: [
            ...state.snoozedAlerts.filter(s => s.medId !== medId),
            { medId, medName, time: originalTime, remindAt }
          ]
        }));
      },

      clearSnooze: (medId) => {
        set((state) => ({
          snoozedAlerts: state.snoozedAlerts.filter(s => s.medId !== medId)
        }));
      },

      updateSettings: (newSettings) => {
        set((state) => {
          const updated = { ...state.settings, ...newSettings };
          if (updated.isDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { settings: updated };
        });
      },

      completeOnboarding: (name) => {
        set((state) => ({
          settings: { ...state.settings, name, isOnboarded: true },
        }));
      },

      clearHistory: () => {
        set({ history: [] });
        get().triggerSync();
      },

      connectCloud: () => {
        googleDriveService.authenticate(async (token) => {
          try {
            const profile = await googleDriveService.getUserProfile(token);
            set({ accessToken: token });
            get().updateSettings({ 
              isCloudSynced: true, 
              cloudSyncEmail: profile.email,
              lastSyncedAt: Date.now() 
            });
            get().triggerSync();
          } catch (e) {
            console.error('Koneksi profil gagal');
          }
        });
      },

      restoreFromCloud: async () => {
        let token = get().accessToken;
        if (!token) {
          return new Promise<void>((resolve) => {
            googleDriveService.authenticate(async (t) => {
              set({ accessToken: t });
              await get().restoreFromCloud();
              resolve();
            });
          });
        }

        set({ isSyncing: true });
        try {
          const fileId = await googleDriveService.findBackupFile(token);
          if (fileId) {
            const cloudData = await googleDriveService.downloadBackup(token, fileId);
            get().importData(cloudData);
            get().updateSettings({ lastSyncedAt: Date.now() });
          }
        } catch (e) {
          set({ accessToken: undefined }); // Token mungkin invalid
          console.error('Gagal restore:', e);
        } finally {
          set({ isSyncing: false });
        }
      },

      triggerSync: async () => {
        const state = get();
        if (!state.settings.isCloudSynced || !state.accessToken) return;

        set({ isSyncing: true });
        try {
          const backupData = {
            medications: state.medications,
            history: state.history,
            takenSchedules: state.takenSchedules,
            settings: state.settings
          };
          await googleDriveService.uploadBackup(state.accessToken, backupData);
          set((s) => ({
            settings: { ...s.settings, lastSyncedAt: Date.now() }
          }));
        } catch (e: any) {
          if (e.status === 401) {
            set({ accessToken: undefined });
          }
          console.warn('Sync tertunda');
        } finally {
          set({ isSyncing: false });
        }
      },

      importData: (data) => {
        set((state) => ({
          medications: data.medications || state.medications,
          history: data.history || state.history,
          takenSchedules: data.takenSchedules || state.takenSchedules,
          settings: { ...state.settings, ...data.settings, isOnboarded: true }
        }));
      }
    }),
    {
      name: 'sehati-storage-v2.6',
      partialize: (state) => ({
        medications: state.medications,
        history: state.history,
        takenSchedules: state.takenSchedules,
        settings: state.settings,
        accessToken: state.accessToken
      }),
    }
  )
);
