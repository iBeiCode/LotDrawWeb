import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DEFAULT_PLAYERS, DEFAULT_WINNERS } from '../core/drawEngine.js';
import Card from '../components/Card.jsx';
import DrawComplete from '../components/DrawComplete.jsx';
import { useAppSettings } from '../hooks/useAppSettings.jsx';
import { SHUFFLE_ANIMATED_MAX, useDraw } from '../hooks/useDraw.js';
import { useShuffleDisplayNumbers } from '../hooks/useShuffleDisplayNumbers.js';
import { hasSeenCardHint, setHasSeenCardHint } from '../storage/appSettings.js';

export default function DrawPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clampedPlayersCount, clampedWinnersCount } = useAppSettings();
  const [showCardHint, setShowCardHint] = useState(() => !hasSeenCardHint());

  const { totalPlayers, winnerCount } = useMemo(() => {
    const rawPlayers = parseInt(searchParams.get('players') ?? '', 10);
    const rawWinners = parseInt(searchParams.get('winners') ?? '', 10);
    const players = clampedPlayersCount(
      Number.isNaN(rawPlayers) ? DEFAULT_PLAYERS : rawPlayers
    );
    const winners = clampedWinnersCount(
      Number.isNaN(rawWinners) ? DEFAULT_WINNERS : rawWinners,
      players
    );
    return { totalPlayers: players, winnerCount: winners };
  }, [searchParams, clampedPlayersCount, clampedWinnersCount]);

  const {
    players,
    flippedCount,
    drawProgress,
    winnerIndices,
    showComplete,
    isShuffling,
    flipCard,
    reset,
  } = useDraw(totalPlayers, winnerCount);

  const { frontNumbers: shuffleFrontNumbers, shuffleTick } = useShuffleDisplayNumbers(
    totalPlayers,
    isShuffling
  );
  const showSimpleShuffleOverlay = isShuffling && totalPlayers > SHUFFLE_ANIMATED_MAX;

  const handleFlip = useCallback(
    (index) => {
      if (isShuffling) return;

      if (showCardHint) {
        setHasSeenCardHint();
        setShowCardHint(false);
      }
      flipCard(index);
    },
    [flipCard, isShuffling, showCardHint]
  );

  const showHint = !isShuffling && showCardHint && flippedCount === 0;

  useEffect(() => {
    if (!showComplete) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showComplete]);

  return (
    <div className={`page${showComplete ? ' page--modal-open' : ''}`}>
      <button type="button" className="back-button" onClick={() => navigate('/')}>
        ← Назад
      </button>

      <header className="draw-header fade-in">
        <h1 className="draw-header__title" aria-live="polite">
          {isShuffling ? 'Тасуем карточки…' : 'Выберите один из вариантов'}
        </h1>
        <p className="draw-header__progress">
          {isShuffling ? 'Жеребьёвка' : `Открыто ${flippedCount} из ${totalPlayers}`}
        </p>
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuenow={flippedCount}
          aria-valuemin={0}
          aria-valuemax={totalPlayers}
          aria-hidden={isShuffling || undefined}
        >
          <div
            className="progress-bar__fill"
            style={{ width: `${drawProgress * 100}%` }}
          />
        </div>
        {showHint && (
          <p className="draw-hint">Нажмите на карточку, чтобы открыть</p>
        )}
      </header>

      {!showComplete && (
        <div
          className={`card-grid${isShuffling ? ' card-grid--shuffling' : ''}${showSimpleShuffleOverlay ? ' card-grid--shuffling-simple' : ''}`}
        >
          {players.map((player) => (
            <Card
              key={player.index}
              player={player}
              onFlip={handleFlip}
              frontNumber={shuffleFrontNumbers?.[player.index]}
              shuffleTick={shuffleTick}
              totalPlayers={totalPlayers}
              disabled={isShuffling}
              isShuffling={isShuffling}
            />
          ))}
          {showSimpleShuffleOverlay && (
            <div className="shuffle-overlay" aria-live="polite">
              Тасуем карточки…
            </div>
          )}
        </div>
      )}

      {showComplete && (
        <DrawComplete
          totalPlayers={totalPlayers}
          winnerCount={winnerCount}
          winnerIndices={winnerIndices}
          onRestart={reset}
          onGoHome={() => navigate('/')}
        />
      )}
    </div>
  );
}
