export function getTelegramWebApp() {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
}

export function isTelegramMiniApp() {
  const tg = getTelegramWebApp();
  return Boolean(tg?.initData);
}

export function initTelegramWebApp() {
  const tg = getTelegramWebApp();
  if (!tg || !isTelegramMiniApp()) return null;

  tg.ready();
  tg.expand();
  applyTelegramThemeToDocument();
  tg.onEvent?.('themeChanged', applyTelegramThemeToDocument);

  return tg;
}

export function applyTelegramThemeToDocument() {
  if (!isTelegramMiniApp()) return;

  const tg = getTelegramWebApp();
  if (!tg?.themeParams) return;

  const root = document.documentElement;
  const { bg_color, secondary_bg_color, text_color, hint_color, button_color } =
    tg.themeParams;

  if (bg_color) root.style.setProperty('--primary-bg', bg_color);
  if (secondary_bg_color) root.style.setProperty('--secondary-bg', secondary_bg_color);
  if (text_color) root.style.setProperty('--primary-text', text_color);
  if (hint_color) root.style.setProperty('--secondary-text', hint_color);
  if (button_color) root.style.setProperty('--button-primary', button_color);
}

export function shareViaTelegram(text) {
  if (!isTelegramMiniApp()) return false;

  const tg = getTelegramWebApp();
  if (typeof tg?.switchInlineQuery !== 'function') {
    return false;
  }

  try {
    tg.switchInlineQuery(text, ['users', 'groups', 'channels', 'bots']);
    return true;
  } catch {
    return false;
  }
}

export function hapticImpact(style = 'light') {
  if (!isTelegramMiniApp()) return;

  const tg = getTelegramWebApp();
  try {
    tg?.HapticFeedback?.impactOccurred?.(style);
  } catch {
    // haptic unavailable
  }
}
