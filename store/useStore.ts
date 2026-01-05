import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Medication,
  MedicationHistory,
  TakenSchedule,
  UserSettings,
  SnoozedAlert,
  DBMedication,
} from "../types";
import { supabaseService } from "../services/supabaseService";

interface State {
  medications: Medication[];
  history: MedicationHistory[];
  takenSchedules: TakenSchedule[];
  snoozedAlerts: SnoozedAlert[];
  settings: UserSettings;
  isSyncing: boolean;
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
  triggerSync: () => Promise<void>;
  initOneSignal: () => void;
  restoreFromCloud: (userId?: string) => Promise<boolean>;
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
        userId: crypto.randomUUID(),
        name: "",
        isDarkMode: false,
        isSeniorMode: false,
        isOnboarded: false,
        notificationSound: "urgent",
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

      deleteMedication: async (id) => {
        set((state) => ({
          medications: state.medications.filter((m) => m.id !== id),
          takenSchedules: state.takenSchedules.filter(
            (s) => s.medicationId !== id
          ),
          snoozedAlerts: state.snoozedAlerts.filter((s) => s.medId !== id),
        }));

        if (get().settings.isCloudSynced) {
          await supabaseService.deleteMedication(id);
        }
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
        get().triggerSync();
      },

      snoozeAlert: (medId, medName, originalTime) => {
        const remindAt = Date.now() + 10 * 60 * 1000;
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
        get().initOneSignal();
      },

      clearHistory: () => {
        set({ history: [] });
        get().triggerSync();
      },

      initOneSignal: () => {
        if (typeof window === "undefined") return;

        // Gunakan OneSignalDeferred untuk SDK v16+
        (window as any).OneSignalDeferred =
          (window as any).OneSignalDeferred || [];

        (window as any).OneSignalDeferred.push(async (OneSignal: any) => {
          // Init sudah dilakukan di index.html, kita fokus menangani perubahan subscription

          const handleSubscriptionChange = () => {
            // API v16: Mengakses User Push Subscription
            const pushSubscription = OneSignal.User.PushSubscription;

            // Cek apakah user sudah opt-in dan memiliki ID
            if (pushSubscription.optedIn && pushSubscription.id) {
              const userId = pushSubscription.id;
              get().updateSettings({ pushToken: userId });

              if (get().settings.isCloudSynced) {
                supabaseService.registerPushToken(
                  get().settings.userId,
                  userId
                );
              }
            }
          };

          // Listener untuk perubahan (misal user baru allow notif)
          OneSignal.User.PushSubscription.addEventListener(
            "change",
            handleSubscriptionChange
          );

          // Jalankan sekali di awal untuk menangkap status saat ini
          handleSubscriptionChange();
        });
      },

      restoreFromCloud: async (targetUserId?: string) => {
        set({ isSyncing: true });
        try {
          // Gunakan ID yang diinputkan (untuk restore) atau ID saat ini
          const userIdToFetch = targetUserId || get().settings.userId;

          const { medications, history } = await supabaseService.fetchUserData(
            userIdToFetch
          );

          if (medications && medications.length > 0) {
            // Jika restore berhasil dari ID manual, update ID lokal kita
            if (targetUserId && targetUserId !== get().settings.userId) {
              set((state) => ({
                settings: {
                  ...state.settings,
                  userId: targetUserId,
                  isCloudSynced: true,
                },
              }));
            }

            const mappedMeds: Medication[] = medications.map(
              (m: DBMedication) => ({
                id: m.id,
                name: m.name,
                dosage: m.dosage,
                stock: m.stock,
                lowStockThreshold: m.threshold,
                schedules: m.schedules,
                color: m.color,
                frequencyType: m.frequency.type,
                formType: m.form_type || "tablet",
                image: m.image_url,
                daysOfWeek: m.frequency.days,
                intervalDays: m.frequency.interval,
                startDate: new Date((m as any).start_date).getTime(), // Pulihkan dari DB
              })
            );
            set({ medications: mappedMeds });

            // Restore History juga
            if (history && history.length > 0) {
              const mappedHistory: MedicationHistory[] = history.map(
                (h: any) => ({
                  id: h.id,
                  medicationId: h.medication_id,
                  medicationName: h.medication_name,
                  takenAt: h.taken_at,
                  dosage: h.dosage,
                })
              );
              set({ history: mappedHistory });
            }

            return true;
          }
          return false;
        } catch (e) {
          console.error("Gagal restore:", e);
          return false;
        } finally {
          set({ isSyncing: false });
        }
      },

      triggerSync: async () => {
        const state = get();

        // Debugging Log
        console.log(
          `[Sync] Status: ${
            state.settings.isCloudSynced ? "ON" : "OFF"
          }, UserID: ${state.settings.userId}`
        );

        if (!state.settings.isCloudSynced) return;

        set({ isSyncing: true });
        try {
          const { error: medError } = await supabaseService.syncMedications(
            state.settings.userId,
            state.medications
          );

          if (medError) {
            console.error("❌ Gagal sinkronisasi obat ke Supabase:", medError);
            throw medError;
          }

          // Sync History (BARU)
          const { error: histError } = await supabaseService.syncHistory(
            state.settings.userId,
            state.history
          );
          if (histError)
            console.error(
              "⚠️ Gagal sinkronisasi history:",
              JSON.stringify(histError, null, 2)
            );

          if (state.settings.pushToken) {
            const { error: pushError } =
              await supabaseService.registerPushToken(
                state.settings.userId,
                state.settings.pushToken
              );
            if (pushError)
              console.error("⚠️ Gagal sinkronisasi token push:", pushError);
          }
          set((s) => ({
            settings: { ...s.settings, lastSyncedAt: Date.now() },
          }));
        } catch (e) {
          console.warn("Sinkronisasi Supabase tertunda/gagal:", e);
        } finally {
          set({ isSyncing: false });
        }
      },

      importData: (data) => {
        set((state) => ({
          medications: data.medications || state.medications,
          history: data.history || state.history,
          takenSchedules: data.takenSchedules || state.takenSchedules,
          settings: { ...state.settings, ...data.settings, isOnboarded: true },
        }));
      },
    }),
    {
      name: "sehati-supabase-storage-v3.0",
      partialize: (state) => ({
        medications: state.medications,
        history: state.history,
        takenSchedules: state.takenSchedules,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.settings.isOnboarded) {
          state.initOneSignal();
        }
      },
    }
  )
);
