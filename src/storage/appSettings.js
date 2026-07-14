import {
  clampedPlayersCount as clampPlayersInEngine,
  clampedWinnersCount as clampWinnersInEngine,
  DEFAULT_PLAYERS,
  DEFAULT_WINNERS,
} from '../core/drawEngine.js';

export const STORAGE_KEYS = {
  isSaveResults: 'isSaveResults',
  rememberLastValues: 'rememberLastValues',
  appTheme: 'appTheme',
  maxParticipants: 'maxParticipants',
  lastPlayersCount: 'lastPlayersCount',
  lastWinnersCount: 'lastWinnersCount',
  lastCompletedPlayers: 'lastCompletedPlayers',
  lastCompletedWinners: 'lastCompletedWinners',
  hasSeenOnboarding: 'hasSeenOnboarding',
  hasSeenCardHint: 'hasSeenCardHint',
};

export const APP_THEMES = {
  system: 'system',
  light: 'light',
  dark: 'dark',
};

export const APP_THEME_LABELS = {
  [APP_THEMES.system]: 'Как в системе',
  [APP_THEMES.light]: 'Светлая',
  [APP_THEMES.dark]: 'Тёмная',
};

export const MAX_PARTICIPANTS_OPTIONS = [10, 50, 100, 500, 1000];

export const DEFAULT_SETTINGS = {
  isSaveResults: false,
  rememberLastValues: false,
  appTheme: APP_THEMES.system,
  maxParticipants: 100,
};

function getStorage() {
  try {
    return localStorage;
  } catch {
    return null;
  }
}

function getItem(key) {
  return getStorage()?.getItem(key) ?? null;
}

function setItem(key, value) {
  try {
    getStorage()?.setItem(key, String(value));
  } catch {
    // localStorage unavailable
  }
}

export function getBool(key, defaultValue) {
  const raw = getItem(key);
  if (raw === null) return defaultValue;
  return raw === 'true';
}

export function setBool(key, value) {
  setItem(key, value);
}

export function getString(key, defaultValue) {
  const raw = getItem(key);
  return raw ?? defaultValue;
}

export function getInt(key, defaultValue) {
  const raw = getItem(key);
  if (raw === null) return defaultValue;
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

export function setInt(key, value) {
  setItem(key, value);
}

export function hasStorageKey(key) {
  return getItem(key) !== null;
}

export function getIsSaveResults() {
  return getBool(STORAGE_KEYS.isSaveResults, DEFAULT_SETTINGS.isSaveResults);
}

export function setIsSaveResults(value) {
  setBool(STORAGE_KEYS.isSaveResults, value);
}

export function getRememberLastValues() {
  return getBool(STORAGE_KEYS.rememberLastValues, DEFAULT_SETTINGS.rememberLastValues);
}

export function setRememberLastValues(value) {
  setBool(STORAGE_KEYS.rememberLastValues, value);
}

export function getAppTheme() {
  const theme = getString(STORAGE_KEYS.appTheme, DEFAULT_SETTINGS.appTheme);
  return Object.values(APP_THEMES).includes(theme) ? theme : DEFAULT_SETTINGS.appTheme;
}

export function setAppTheme(theme) {
  setItem(STORAGE_KEYS.appTheme, theme);
}

export function getMaxParticipantsSetting() {
  const stored = getInt(STORAGE_KEYS.maxParticipants, DEFAULT_SETTINGS.maxParticipants);
  return MAX_PARTICIPANTS_OPTIONS.includes(stored) ? stored : DEFAULT_SETTINGS.maxParticipants;
}

export function setMaxParticipantsSetting(value) {
  setInt(STORAGE_KEYS.maxParticipants, value);
}

export function getCurrentMaxParticipants() {
  return getMaxParticipantsSetting();
}

export function clampedPlayersCount(value, maxParticipants) {
  const max = maxParticipants ?? getCurrentMaxParticipants();
  return clampPlayersInEngine(value, max);
}

export function clampedWinnersCount(winners, players, maxParticipants) {
  const max = maxParticipants ?? getCurrentMaxParticipants();
  return clampWinnersInEngine(winners, players, max);
}

export function persistLastDrawCounts(players, winners) {
  const clampedPlayers = clampedPlayersCount(players);
  setInt(STORAGE_KEYS.lastPlayersCount, clampedPlayers);
  setInt(
    STORAGE_KEYS.lastWinnersCount,
    clampedWinnersCount(winners, clampedPlayers)
  );
}

export function hasSavedDrawCounts() {
  return hasStorageKey(STORAGE_KEYS.lastPlayersCount);
}

export function loadLastDrawCounts() {
  const players = clampedPlayersCount(getInt(STORAGE_KEYS.lastPlayersCount, DEFAULT_PLAYERS));
  const storedWinners = getInt(STORAGE_KEYS.lastWinnersCount, 0);
  const winners =
    storedWinners === 0
      ? DEFAULT_WINNERS
      : clampedWinnersCount(storedWinners, players);
  return { players, winners };
}

export function hasCompletedDraw() {
  return hasStorageKey(STORAGE_KEYS.lastCompletedPlayers);
}

export function persistCompletedDraw(players, winners) {
  const clampedPlayers = clampedPlayersCount(players);
  setInt(STORAGE_KEYS.lastCompletedPlayers, clampedPlayers);
  setInt(
    STORAGE_KEYS.lastCompletedWinners,
    clampedWinnersCount(winners, clampedPlayers)
  );
}

export function loadCompletedDraw() {
  if (!hasCompletedDraw()) return null;
  const players = clampedPlayersCount(getInt(STORAGE_KEYS.lastCompletedPlayers, DEFAULT_PLAYERS));
  const winners = clampedWinnersCount(
    getInt(STORAGE_KEYS.lastCompletedWinners, DEFAULT_WINNERS),
    players
  );
  return { players, winners };
}

export function hasSeenOnboarding() {
  return getBool(STORAGE_KEYS.hasSeenOnboarding, false);
}

export function setHasSeenOnboarding(value = true) {
  setBool(STORAGE_KEYS.hasSeenOnboarding, value);
}

export function hasSeenCardHint() {
  return getBool(STORAGE_KEYS.hasSeenCardHint, false);
}

export function setHasSeenCardHint(value = true) {
  setBool(STORAGE_KEYS.hasSeenCardHint, value);
}

export function applyThemeToDocument(theme) {
  const root = document.documentElement;
  if (theme === APP_THEMES.system) {
    root.removeAttribute('data-theme');
  } else {
    root.dataset.theme = theme;
  }
}

export function loadAllSettings() {
  return {
    isSaveResults: getIsSaveResults(),
    rememberLastValues: getRememberLastValues(),
    appTheme: getAppTheme(),
    maxParticipants: getMaxParticipantsSetting(),
  };
}
