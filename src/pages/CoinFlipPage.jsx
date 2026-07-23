import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModeToolbar from '../components/ModeToolbar.jsx';
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
  const [shareFeedback, setShareFeedback] = useState('');

  const shareContent = useMemo(
    () => (side ? coinShareText(side) : ''),
    [side]
  );

  const handleShare = async () => {
    if (!shareContent) return;
    const result = await shareTextContent(shareContent);
    if (result === 'shared' || result === 'copied') {
      setShareFeedback(result === 'copied' ? 'Скопировано' : 'Отправлено');
    } else if (result === 'failed') {
      setShareFeedback('Не удалось скопировать');
    } else {
      setShareFeedback('');
      return;
    }
    setTimeout(() => setShareFeedback(''), 2000);
  };

  const statusText = (() => {
    if (isFlipping) return 'Крутится…';
    if (showResult) return sideLabel;
    return 'Нажмите, чтобы подбросить';
  })();

  return (
    <div className="page coin-page fade-in">
      <header className="mode-page-header">
        <button type="button" className="home-header__back" onClick={() => navigate('/')} aria-label="К выбору режима">
          ←
        </button>
        <div className="coin-header mode-page-header__center">
          <h1 className="coin-header__title">Монетка</h1>
          <p className="coin-header__hint">Орёл или решка — один бросок</p>
        </div>
        <ModeToolbar />
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
            {shareFeedback || 'Поделиться результатом'}
          </button>
        )}
      </footer>
    </div>
  );
}
