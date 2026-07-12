import { useMemo, useState } from 'react';
import { drawSummary, shareText, winnerOutcomeText } from '../core/formatting.js';
import PrimaryButton from './PrimaryButton.jsx';

export default function DrawComplete({
  totalPlayers,
  winnerCount,
  winnerIndices,
  onRestart,
  onGoHome,
}) {
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const shareContent = useMemo(
    () => shareText(totalPlayers, winnerCount, winnerIndices),
    [totalPlayers, winnerCount, winnerIndices]
  );

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareContent });
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareContent);
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="draw-complete-title">
      <div className="dialog">
        <div className="dialog__icon" aria-hidden="true">
          👍
        </div>
        <h2 id="draw-complete-title" className="dialog__title">
          Жребий завершён!
        </h2>
        <p className="dialog__summary">
          {drawSummary(totalPlayers, winnerCount)}
        </p>
        <p className="dialog__outcome">
          {winnerOutcomeText(winnerIndices)}
        </p>
        <PrimaryButton className="dialog__share" onClick={handleShare}>
          {copiedFeedback ? 'Скопировано' : 'Поделиться результатом'}
        </PrimaryButton>
        <button type="button" className="dialog__link" onClick={onGoHome}>
          На главную
        </button>
        <button type="button" className="dialog__secondary" onClick={onRestart}>
          Новый жребий
        </button>
      </div>
    </div>
  );
}
