import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { diceOutcomeText, diceShareText } from '../core/formatting.js';
import { MAX_DICE, MIN_DICE } from '../core/diceEngine.js';
import { useDice } from '../hooks/useDice.js';
import { shareTextContent } from '../utils/share.js';

const PIP_MAP = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function DieFace({ value, rolling }) {
  const pips = PIP_MAP[value] ?? PIP_MAP[1];

  return (
    <div className={`die${rolling ? ' die--rolling' : ''}`} aria-hidden="true">
      <div className="die__face">
        {Array.from({ length: 9 }, (_, index) => (
          <span
            key={index}
            className={`die__pip${pips.includes(index) ? ' die__pip--on' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function DicePage() {
  const navigate = useNavigate();
  const [count, setCount] = useState(2);
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const { phase, displayValues, isRolling, showResult, roll } = useDice(count);

  const shareContent = useMemo(
    () => (showResult ? diceShareText(displayValues) : ''),
    [showResult, displayValues]
  );

  const handleShare = () => {
    if (!shareContent) return;
    shareTextContent(shareContent, () => {
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2000);
    });
  };

  return (
    <div className="page dice-page fade-in">
      <button type="button" className="back-button" onClick={() => navigate('/')}>
        ← Назад
      </button>

      <header className="coin-header">
        <h1 className="coin-header__title">Кубики</h1>
        <p className="coin-header__hint">Классический бросок 1–6 граней</p>
      </header>

      <div className="dice-page__body">
        <p className="section-label">Сколько кубиков</p>
        <div className="dice-count" role="group" aria-label="Количество кубиков">
          {Array.from({ length: MAX_DICE - MIN_DICE + 1 }, (_, index) => {
            const value = MIN_DICE + index;
            return (
              <button
                key={value}
                type="button"
                className={`dice-count__button${count === value ? ' dice-count__button--active' : ''}`}
                onClick={() => setCount(value)}
                disabled={isRolling}
              >
                {value}
              </button>
            );
          })}
        </div>

        <div className="dice-tray" aria-live="polite">
          {displayValues.map((value, index) => (
            <DieFace key={`${index}-${count}`} value={value} rolling={isRolling} />
          ))}
        </div>

        <p
          className={`coin-status${showResult ? ' coin-status--result' : ''}${isRolling ? ' coin-status--busy' : ''}`}
        >
          {isRolling ? 'Бросаем…' : showResult ? diceOutcomeText(displayValues) : 'Готово к броску'}
        </p>
      </div>

      <footer className="coin-footer">
        <PrimaryButton onClick={roll} disabled={isRolling}>
          {phase === 'idle' ? 'Бросить' : 'Ещё раз'}
        </PrimaryButton>
        {showResult && (
          <button type="button" className="dialog__link" onClick={handleShare}>
            {copiedFeedback ? 'Скопировано' : 'Поделиться результатом'}
          </button>
        )}
      </footer>
    </div>
  );
}
