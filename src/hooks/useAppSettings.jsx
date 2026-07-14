import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  applyThemeToDocument,
  clampedPlayersCount,
  clampedWinnersCount,
  getAppTheme,
  getIsSaveResults,
  getMaxParticipantsSetting,
  getRememberLastValues,
  loadAllSettings,
  setAppTheme,
  setIsSaveResults,
  setMaxParticipantsSetting,
  setRememberLastValues,
} from '../storage/appSettings.js';

const AppSettingsContext = createContext(null);

export function AppSettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => loadAllSettings());

  useEffect(() => {
    applyThemeToDocument(settings.appTheme);
  }, [settings.appTheme]);

  const updateSetting = useCallback((key, value, persist) => {
    persist(value);
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setIsSaveResultsSetting = useCallback(
    (value) => updateSetting('isSaveResults', value, setIsSaveResults),
    [updateSetting]
  );

  const setRememberLastValuesSetting = useCallback(
    (value) => updateSetting('rememberLastValues', value, setRememberLastValues),
    [updateSetting]
  );

  const setAppThemeSetting = useCallback(
    (value) => updateSetting('appTheme', value, setAppTheme),
    [updateSetting]
  );

  const setMaxParticipants = useCallback(
    (value) => updateSetting('maxParticipants', value, setMaxParticipantsSetting),
    [updateSetting]
  );

  const clampPlayers = useCallback(
    (value) => clampedPlayersCount(value, settings.maxParticipants),
    [settings.maxParticipants]
  );

  const clampWinners = useCallback(
    (winners, players) => clampedWinnersCount(winners, players, settings.maxParticipants),
    [settings.maxParticipants]
  );

  const value = useMemo(
    () => ({
      ...settings,
      setIsSaveResults: setIsSaveResultsSetting,
      setRememberLastValues: setRememberLastValuesSetting,
      setAppTheme: setAppThemeSetting,
      setMaxParticipants,
      clampedPlayersCount: clampPlayers,
      clampedWinnersCount: clampWinners,
    }),
    [
      settings,
      setIsSaveResultsSetting,
      setRememberLastValuesSetting,
      setAppThemeSetting,
      setMaxParticipants,
      clampPlayers,
      clampWinners,
    ]
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return context;
}

export function readAppSettingsSnapshot() {
  return {
    isSaveResults: getIsSaveResults(),
    rememberLastValues: getRememberLastValues(),
    appTheme: getAppTheme(),
    maxParticipants: getMaxParticipantsSetting(),
  };
}
