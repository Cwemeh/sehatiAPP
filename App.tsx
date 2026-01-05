import React, { useEffect } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useStore } from "./store/useStore";
import { Layout } from "./components/Layout";
import { Dashboard } from "./screens/Dashboard";
import { MedicationList } from "./screens/MedicationList";
import { AddMedication } from "./screens/AddMedication";
import { EditMedication } from "./screens/EditMedication";
import { History } from "./screens/History";
import { Settings } from "./screens/Settings";
import { Onboarding } from "./screens/Onboarding";
import { Help } from "./screens/Help";

const App: React.FC = () => {
  const settings = useStore((state) => state.settings);
  const medications = useStore((state) => state.medications);
  const history = useStore((state) => state.history);
  const triggerSync = useStore((state) => state.triggerSync);
  const initOneSignal = useStore((state) => state.initOneSignal);

  // Re-apply theme on mount
  useEffect(() => {
    if (settings.isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.isDarkMode]);

  // Real-time Cloud Sync Watcher
  // Every time medications or history change, we update the cloud sync timestamp if enabled.
  useEffect(() => {
    if (settings.isCloudSynced && settings.isOnboarded) {
      triggerSync();
    }
  }, [
    medications,
    history,
    settings.isCloudSynced,
    settings.isOnboarded,
    triggerSync,
  ]);

  // Inisialisasi OneSignal saat aplikasi dibuka
  useEffect(() => {
    initOneSignal();
  }, [initOneSignal]);

  if (!settings.isOnboarded) {
    return <Onboarding />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/medications" element={<MedicationList />} />
          <Route path="/add" element={<AddMedication />} />
          <Route path="/edit/:id" element={<EditMedication />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
