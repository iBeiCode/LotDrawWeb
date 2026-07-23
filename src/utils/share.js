import { shareViaTelegram } from './telegram.js';

/**
 * @returns {'shared' | 'copied' | 'aborted' | 'failed'}
 */
export async function shareTextContent(text, onCopied) {
  if (shareViaTelegram(text)) {
    onCopied?.();
    return 'shared';
  }

  if (navigator.share) {
    try {
      await navigator.share({ text });
      onCopied?.();
      return 'shared';
    } catch (error) {
      if (error.name === 'AbortError') return 'aborted';
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    onCopied?.();
    return 'copied';
  } catch {
    return 'failed';
  }
}
