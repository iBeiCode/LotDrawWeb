import { useMemo, useState } from 'react';
import {
  drawSummary,
  shareText,
  winnerOutcomeText,
  winnerOutcomeTextFromLabels,
} from '../core/formatting.js';
import { shareTextContent } from '../utils/share.js';
import DrawCardEmojiImage from './DrawCardEmojiImage.jsx';
import PrimaryButton from './PrimaryButton.jsx';

export default function DrawComplete({
  totalPlayers,
  winnerCount,
  winnerIndices,
  winnerLabels,
  onRestart,
  onGoHome,
}) {
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const hasLabels = Array.isArray(winnerLabels) && winnerLabels.length > 0;

  const shareContent = useMemo(
    () =>
      shareText(totalPlayers, winnerCount, winnerIndices, new Date(), hasLabels ? winnerLabels : null),
    [totalPlayers, winnerCount, winnerIndices, winnerLabels, hasLabels]
  );

  const outcome = hasLabels
    ? winnerOutcomeTextFromLabels(winnerLabels)
    : winnerOutcomeText(winnerIndices);

  const handleShare = () => {
    shareTextContent(shareContent, () => {
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2000);
    });
  };

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="draw-complete-title">
      <div className="dialog">
        <DrawCardEmojiImage isWinner size={56} className="dialog__icon-image" />
        <h2 id="draw-complete-title" className="dialog__title">
          Жребий завершён!
        </h2>
        <p className="dialog__summary">
          {drawSummary(totalPlayers, winnerCount)}
        </p>
        <p className="dialog__outcome">{outcome}</p>
        <PrimaryButton className="dialog__share" onClick={handleShare}>
          {copiedFeedback ? 'Скопировано' : 'Поделиться результатом'}
        </PrimaryButton>
        <button type="button" className="dialog__link" onClick={onGoHome}>
          К настройке жеребьёвки
        </button>
        <button type="button" className="dialog__secondary" onClick={onRestart}>
          Новый жребий
        </button>
      </div>
    </div>
  );
}
