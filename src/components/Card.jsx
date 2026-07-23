import '../styles/card.css';
import { displayNumber } from '../core/drawEngine.js';
import { pseudoShuffleNumber } from '../hooks/useShuffleDisplayNumbers.js';
import DrawCardEmojiImage from './DrawCardEmojiImage.jsx';

function truncateLabel(label, max = 14) {
  if (!label) return '';
  if (label.length <= max) return label;
  return `${label.slice(0, max - 1)}…`;
}

export default function Card({
  player,
  onFlip,
  frontNumber,
  shuffleTick = 0,
  totalPlayers,
  disabled = false,
  isShuffling = false,
}) {
  const hasLabel = Boolean(player.label);
  const number =
    frontNumber ??
    (isShuffling && shuffleTick > 0 && totalPlayers
      ? pseudoShuffleNumber(player.index, shuffleTick, totalPlayers)
      : displayNumber(player.index));

  const frontText = hasLabel
    ? isShuffling
      ? '···'
      : truncateLabel(player.label, 16)
    : String(number);

  const cornerText = hasLabel
    ? truncateLabel(player.label, 12)
    : String(displayNumber(player.index));

  const isFlipped = player.isFlipped;
  const isDisabled = disabled || isFlipped;

  const accessibilityLabel = isShuffling
    ? `Тасование, карточка ${displayNumber(player.index)}`
    : isFlipped
      ? player.isWinner
        ? `${player.label || `Участник ${number}`}, победитель`
        : `${player.label || `Участник ${number}`}, не победитель`
      : `${player.label || `Участник ${number}`}, карточка закрыта`;

  const shuffleDelay = `${(player.index % 8) * 0.055}s`;

  return (
    <button
      type="button"
      className={`card${isFlipped ? ' card--flipped' : ''}${player.isWinner ? ' card--winner' : ''}${isShuffling ? ' card--shuffling' : ''}${hasLabel ? ' card--labeled' : ''}`}
      style={isShuffling ? { '--shuffle-delay': shuffleDelay } : undefined}
      onClick={() => onFlip(player.index)}
      disabled={isDisabled}
      aria-label={accessibilityLabel}
      aria-busy={isShuffling || undefined}
    >
      <div className="card__inner">
        <div className="card__face card__face--front">
          <span className={`card__number${hasLabel ? ' card__number--label' : ''}`} key={isShuffling ? frontText : undefined}>
            {frontText}
          </span>
        </div>
        <div
          className={`card__face card__face--back ${
            player.isWinner ? 'card__face--winner' : 'card__face--loser'
          }`}
        >
          <DrawCardEmojiImage isWinner={player.isWinner} className="card__emoji" />
          <span className={`card__corner-number${hasLabel ? ' card__corner-number--label' : ''}`}>
            {cornerText}
          </span>
        </div>
      </div>
    </button>
  );
}
