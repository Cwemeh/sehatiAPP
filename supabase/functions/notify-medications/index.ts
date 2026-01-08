Deno.serve(async () => {
  const now = new Date();
  const currentTime = now.toISOString().slice(11, 16); // HH:mm

  // 1️⃣ Ambil jadwal obat dari DB
  const { data: schedules } = await fetch(
    `${Deno.env.get(
      "SUPABASE_URL"
    )}/rest/v1/medication_schedules?time=eq.${currentTime}`,
    {
      headers: {
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
    }
  ).then((res) => res.json());

  if (!schedules || schedules.length === 0) {
    return new Response("No schedules", { status: 200 });
  }

  // 2️⃣ Kirim push ke OneSignal
  await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Deno.env.get("ONESIGNAL_REST_API_KEY")}`,
    },
    body: JSON.stringify({
      app_id: Deno.env.get("ONESIGNAL_APP_ID"),
      included_segments: ["Subscribed Users"],
      headings: { en: "⏰ Waktunya Minum Obat" },
      contents: { en: "Jangan lupa minum obat sesuai jadwal ❤️" },
      priority: 10,
      android_visibility: 1,
      android_led_color: "FF0000FF",
      android_accent_color: "FF0000FF",
      ttl: 3600,
    }),
  });

  return new Response("Push sent", { status: 200 });
});
