import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Medication,
  MedicationHistory,
  TakenSchedule,
  UserSettings,
  SnoozedAlert,
} from "../types";

interface State {
  medications: Medication[];
  history: MedicationHistory[];
  takenSchedules: TakenSchedule[];
  snoozedAlerts: SnoozedAlert[];
  settings: UserSettings;
}

interface Actions {
  addMedication: (med: Omit<Medication, "id">) => void;
  updateMedication: (med: Medication) => void;
  deleteMedication: (id: string) => void;
  markAsTaken: (medId: string, time: string) => void;
  snoozeAlert: (medId: string, medName: string, originalTime: string) => void;
  clearSnooze: (medId: string) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  completeOnboarding: (name: string) => void;
  clearHistory: () => void;
  resetApp: () => void;
}

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      medications: [],
      history: [],
      takenSchedules: [],
      snoozedAlerts: [],
      settings: {
        name: "",
        isDarkMode: false,
        isSeniorMode: false,
        isOnboarded: false,
        notificationSound: "urgent",
        enableVibration: true,
      },

      addMedication: (med) => {
        const newMed = { ...med, id: crypto.randomUUID() };
        set((state) => ({ medications: [...state.medications, newMed] }));
      },

      updateMedication: (updatedMed) => {
        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === updatedMed.id ? updatedMed : m
          ),
        }));
      },

      deleteMedication: (id) => {
        set((state) => ({
          medications: state.medications.filter((m) => m.id !== id),
          takenSchedules: state.takenSchedules.filter(
            (s) => s.medicationId !== id
          ),
          snoozedAlerts: state.snoozedAlerts.filter((s) => s.medId !== id),
        }));
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

        const today = new Date().toISOString().split("T")[0];

        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === medId ? updatedMed : m
          ),
          history: [newLog, ...state.history],
          takenSchedules: [
            ...state.takenSchedules,
            { date: today, medicationId: medId, time },
          ],
          snoozedAlerts: state.snoozedAlerts.filter((s) => s.medId !== medId),
        }));
      },

      snoozeAlert: (medId, medName, originalTime) => {
        const remindAt = Date.now() + 10 * 60 * 1000; // 10 menit
        set((state) => ({
          snoozedAlerts: [
            ...state.snoozedAlerts.filter((s) => s.medId !== medId),
            { medId, medName, time: originalTime, remindAt },
          ],
        }));
      },

      clearSnooze: (medId) => {
        set((state) => ({
          snoozedAlerts: state.snoozedAlerts.filter((s) => s.medId !== medId),
        }));
      },

      updateSettings: (newSettings) => {
        set((state) => {
          const updated = { ...state.settings, ...newSettings };
          if (updated.isDarkMode) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          return { settings: updated };
        });
      },

      completeOnboarding: (name) => {
        set((state) => ({
          settings: { ...state.settings, name, isOnboarded: true },
        }));
      },

      clearHistory: () => set({ history: [] }),

      resetApp: () => {
        set({
          medications: [],
          history: [],
          takenSchedules: [],
          snoozedAlerts: [],
          settings: {
            name: "",
            isDarkMode: false,
            isSeniorMode: false,
            isOnboarded: false,
            notificationSound: "urgent",
            enableVibration: true,
          },
        });
        // Force a reload to clear everything
        window.location.reload();
      },
    }),
    {
      name: "sehati-storage-v2",
    }
  )
);
