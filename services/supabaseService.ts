/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";
import { DBMedication } from "../types";

// Catatan: Ganti dengan URL dan Anon Key Anda dari Dashboard Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseService = {
  // Medications
  syncMedications: async (userId: string, medications: any[]) => {
    const { error } = await supabase.from("medications").upsert(
      medications.map((m) => ({
        id: m.id,
        user_id: userId,
        name: m.name,
        dosage: m.dosage,
        stock: m.stock,
        threshold: m.lowStockThreshold,
        schedules: m.schedules,
        frequency: {
          type: m.frequencyType,
          days: m.daysOfWeek,
          interval: m.intervalDays,
        },
        color: m.color,
        image_url: m.image,
        form_type: m.formType,
      })),
      { onConflict: "id" }
    );
    return { error };
  },

  deleteMedication: async (id: string) => {
    return await supabase.from("medications").delete().eq("id", id);
  },

  // Subscriptions
  registerPushToken: async (userId: string, playerId: string) => {
    return await supabase.from("push_subscriptions").upsert(
      {
        user_id: userId,
        onesignal_player_id: playerId,
      },
      { onConflict: "user_id" }
    );
  },

  // Fetch all user data
  fetchUserData: async (userId: string) => {
    const { data: medications } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", userId)
      .returns<DBMedication[]>(); // Menentukan tipe kembalian di sini

    return { medications };
  },
};
