const HAS_SEEN_CARD_HINT_KEY = 'hasSeenCardHint';

export function hasSeenCardHint() {
  try {
    return localStorage.getItem(HAS_SEEN_CARD_HINT_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setHasSeenCardHint() {
  try {
    localStorage.setItem(HAS_SEEN_CARD_HINT_KEY, 'true');
  } catch {
    // localStorage unavailable
  }
}
