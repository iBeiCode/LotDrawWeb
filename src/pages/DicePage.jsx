import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModeToolbar from '../components/ModeToolbar.jsx';
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
  const [shareFeedback, setShareFeedback] = useState('');
  const { phase, displayValues, isRolling, showResult, roll } = useDice(count);

  const shareContent = useMemo(
    () => (showResult ? diceShareText(displayValues) : ''),
    [showResult, displayValues]
  );

  const handleShare = async () => {
    if (!shareContent) return;
    const result = await shareTextContent(shareContent);
    if (result === 'shared' || result === 'copied') {
      setShareFeedback(result === 'copied' ? 'Скопировано' : 'Отправлено');
    } else if (result === 'failed') {
      setShareFeedback('Не удалось скопировать');
    } else {
      return;
    }
    setTimeout(() => setShareFeedback(''), 2000);
  };

  return (
    <div className="page dice-page fade-in">
      <header className="mode-page-header">
        <button type="button" className="home-header__back" onClick={() => navigate('/')} aria-label="К выбору режима">
          ←
        </button>
        <div className="coin-header mode-page-header__center">
          <h1 className="coin-header__title">Кубики</h1>
          <p className="coin-header__hint">1–6 кубиков</p>
        </div>
        <ModeToolbar />
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
            {shareFeedback || 'Поделиться результатом'}
          </button>
        )}
      </footer>
    </div>
  );
}
