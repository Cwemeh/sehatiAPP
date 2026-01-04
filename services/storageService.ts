
const STORAGE_KEYS = {
  MEDICATIONS: 'sehati_medications',
  HISTORY: 'sehati_history',
  TAKEN_SCHEDULES: 'sehati_taken_schedules',
  SETTINGS: 'sehati_settings',
};

export const storageService = {
  save: <T,>(key: string, data: T): void => {
    localStorage.setItem(key, JSON.stringify(data));
  },
  load: <T,>(key: string, defaultValue: T): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },
  getKeys: () => STORAGE_KEYS
};
