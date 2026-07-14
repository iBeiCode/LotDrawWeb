import '../styles/card.css';
import { displayNumber } from '../core/drawEngine.js';
import { pseudoShuffleNumber } from '../hooks/useShuffleDisplayNumbers.js';
import DrawCardEmojiImage from './DrawCardEmojiImage.jsx';

export default function Card({
  player,
  onFlip,
  frontNumber,
  shuffleTick = 0,
  totalPlayers,
  disabled = false,
  isShuffling = false,
}) {
  const number =
    frontNumber ??
    (isShuffling && shuffleTick > 0 && totalPlayers
      ? pseudoShuffleNumber(player.index, shuffleTick, totalPlayers)
      : displayNumber(player.index));
  const isFlipped = player.isFlipped;
  const isDisabled = disabled || isFlipped;

  const accessibilityLabel = isShuffling
    ? `Тасование, карточка ${displayNumber(player.index)}`
    : isFlipped
      ? player.isWinner
        ? `Участник ${number}, победитель`
        : `Участник ${number}, не победитель`
      : `Участник ${number}, карточка закрыта`;

  const shuffleDelay = `${(player.index % 8) * 0.055}s`;

  return (
    <button
      type="button"
      className={`card${isFlipped ? ' card--flipped' : ''}${player.isWinner ? ' card--winner' : ''}${isShuffling ? ' card--shuffling' : ''}`}
      style={isShuffling ? { '--shuffle-delay': shuffleDelay } : undefined}
      onClick={() => onFlip(player.index)}
      disabled={isDisabled}
      aria-label={accessibilityLabel}
      aria-busy={isShuffling || undefined}
    >
      <div className="card__inner">
        <div className="card__face card__face--front">
          <span className="card__number" key={isShuffling ? number : undefined}>
            {number}
          </span>
        </div>
        <div
          className={`card__face card__face--back ${
            player.isWinner ? 'card__face--winner' : 'card__face--loser'
          }`}
        >
          <DrawCardEmojiImage isWinner={player.isWinner} className="card__emoji" />
          <span className="card__corner-number">{number}</span>
        </div>
      </div>
    </button>
  );
}
