const SESSION_KEY = 'lotDrawActiveSession';

function getSessionStorage() {
  try {
    return sessionStorage;
  } catch {
    return null;
  }
}

export function saveDrawSession(session) {
  try {
    getSessionStorage()?.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // sessionStorage unavailable
  }
}

export function loadDrawSession() {
  try {
    const raw = getSessionStorage()?.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearDrawSession() {
  try {
    getSessionStorage()?.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
