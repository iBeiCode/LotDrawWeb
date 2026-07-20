import { shareViaTelegram } from './telegram.js';

export async function shareTextContent(text, onCopied) {
  if (shareViaTelegram(text)) {
    return;
  }

  if (navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    onCopied?.();
  } catch {
    // clipboard unavailable
  }
}
