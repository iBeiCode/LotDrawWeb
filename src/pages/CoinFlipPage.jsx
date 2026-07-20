import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { COIN_SIDES } from '../core/coinFlip.js';
import { coinShareText } from '../core/formatting.js';
import { COIN_FLIP_DURATION_MS, useCoinFlip } from '../hooks/useCoinFlip.js';
import { shareTextContent } from '../utils/share.js';

function CoinVisual({ side, rotation, isAnimating }) {
  const transition = isAnimating
    ? `transform ${COIN_FLIP_DURATION_MS}ms cubic-bezier(0.22, 0.8, 0.28, 1)`
    : 'none';

  return (
    <div className={`coin-stage${isAnimating ? ' coin-stage--flipping' : ''}`}>
      <div className="coin-shadow" aria-hidden="true" />
      <div
        className="coin"
        style={{
          transform: `rotateX(${rotation}deg)`,
          transition,
        }}
      >
        <div className="coin__face coin__face--heads" aria-hidden={side === COIN_SIDES.tails}>
          <span className="coin__ring" />
          <span className="coin__emblem">О</span>
          <span className="coin__caption">ОРЁЛ</span>
        </div>
        <div className="coin__face coin__face--tails" aria-hidden={side === COIN_SIDES.heads}>
          <span className="coin__ring" />
          <span className="coin__emblem">Р</span>
          <span className="coin__caption">РЕШКА</span>
        </div>
      </div>
    </div>
  );
}

export default function CoinFlipPage() {
  const navigate = useNavigate();
  const {
    phase,
    side,
    sideLabel,
    rotation,
    isAnimating,
    isFlipping,
    showResult,
    flip,
  } = useCoinFlip();
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const shareContent = useMemo(
    () => (side ? coinShareText(side) : ''),
    [side]
  );

  const handleShare = () => {
    if (!shareContent) return;
    shareTextContent(shareContent, () => {
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2000);
    });
  };

  const statusText = (() => {
    if (isFlipping) return 'Крутится…';
    if (showResult) return sideLabel;
    return 'Нажмите, чтобы подбросить';
  })();

  return (
    <div className="page coin-page fade-in">
      <button type="button" className="back-button" onClick={() => navigate('/')}>
        ← Назад
      </button>

      <header className="coin-header">
        <h1 className="coin-header__title">Монетка</h1>
        <p className="coin-header__hint">Орёл или решка — один бросок</p>
      </header>

      <div className="coin-page__body">
        <button
          type="button"
          className="coin-hitbox"
          onClick={flip}
          disabled={isFlipping}
          aria-label={isFlipping ? 'Монетка крутится' : 'Подбросить монетку'}
        >
          <CoinVisual side={side} rotation={rotation} isAnimating={isAnimating} />
        </button>

        <p
          className={`coin-status${showResult ? ' coin-status--result' : ''}${isFlipping ? ' coin-status--busy' : ''}`}
          aria-live="polite"
        >
          {statusText}
        </p>
      </div>

      <footer className="coin-footer">
        <PrimaryButton onClick={flip} disabled={isFlipping}>
          {phase === 'idle' ? 'Подбросить' : 'Ещё раз'}
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
