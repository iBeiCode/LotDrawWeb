import '../styles/card.css';
import { displayNumber } from '../core/drawEngine.js';

export default function Card({ player, onFlip }) {
  const number = displayNumber(player.index);
  const isFlipped = player.isFlipped;

  const accessibilityLabel = isFlipped
    ? player.isWinner
      ? `Участник ${number}, победитель`
      : `Участник ${number}, не победитель`
    : `Участник ${number}, карточка закрыта`;

  return (
    <button
      type="button"
      className={`card ${isFlipped ? 'card--flipped' : ''} ${player.isWinner ? 'card--winner' : ''}`}
      onClick={() => onFlip(player.index)}
      disabled={isFlipped}
      aria-label={accessibilityLabel}
    >
      <div className="card__inner">
        <div className="card__face card__face--front">
          <span className="card__number">{number}</span>
        </div>
        <div
          className={`card__face card__face--back ${
            player.isWinner ? 'card__face--winner' : 'card__face--loser'
          }`}
        >
          <span className="card__emoji" aria-hidden="true">
            {player.isWinner ? '👍' : '😱'}
          </span>
          <span className="card__corner-number">{number}</span>
        </div>
      </div>
    </button>
  );
}
