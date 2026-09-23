import { useState, useEffect } from 'react';

interface Settings {
  notificationsEnabled: boolean;
  voiceEnabled: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  notificationsEnabled: false,
  voiceEnabled: false,
};

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem('rainsense_settings');
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const setSettings = (newSettings: Partial<Settings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('rainsense_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Sync state if localStorage changes from another tab
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'rainsense_settings' && e.newValue) {
        setSettingsState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return { settings, setSettings };
}
