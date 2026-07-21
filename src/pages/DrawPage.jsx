import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { DEFAULT_PLAYERS, DEFAULT_WINNERS } from '../core/drawEngine.js';
import Card from '../components/Card.jsx';
import DrawComplete from '../components/DrawComplete.jsx';
import { useAppSettings } from '../hooks/useAppSettings.jsx';
import { SHUFFLE_ANIMATED_MAX, useDraw } from '../hooks/useDraw.js';
import { useShuffleDisplayNumbers } from '../hooks/useShuffleDisplayNumbers.js';
import { hasSeenCardHint, setHasSeenCardHint } from '../storage/appSettings.js';
import { clearDrawSession, loadDrawSession } from '../storage/drawSession.js';

function resolveDrawConfig({ locationState, session, searchParams, clampedPlayersCount, clampedWinnersCount }) {
  const fromState =
    locationState && typeof locationState === 'object' ? locationState : null;
  const fromSession = session && typeof session === 'object' ? session : null;

  const listSource =
    fromState?.mode === 'list' && Array.isArray(fromState.labels) && fromState.labels.length >= 2
      ? fromState
      : fromSession?.mode === 'list' &&
          Array.isArray(fromSession.labels) &&
          fromSession.labels.length >= 2
        ? fromSession
        : null;

  if (listSource) {
    const players = listSource.labels.length;
    const winners = clampedWinnersCount(
      listSource.winners ?? DEFAULT_WINNERS,
      players
    );
    return {
      totalPlayers: players,
      winnerCount: winners,
      labels: listSource.labels,
      mode: 'list',
    };
  }

  const rawPlayers = parseInt(searchParams.get('players') ?? '', 10);
  const rawWinners = parseInt(searchParams.get('winners') ?? '', 10);
  const players = clampedPlayersCount(
    Number.isNaN(rawPlayers) ? DEFAULT_PLAYERS : rawPlayers
  );
  const winners = clampedWinnersCount(
    Number.isNaN(rawWinners) ? DEFAULT_WINNERS : rawWinners,
    players
  );
  return {
    totalPlayers: players,
    winnerCount: winners,
    labels: null,
    mode: 'count',
  };
}

export default function DrawPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { clampedPlayersCount, clampedWinnersCount } = useAppSettings();
  const [showCardHint, setShowCardHint] = useState(() => !hasSeenCardHint());

  const { totalPlayers, winnerCount, labels, mode } = useMemo(
    () =>
      resolveDrawConfig({
        locationState: location.state,
        session: loadDrawSession(),
        searchParams,
        clampedPlayersCount,
        clampedWinnersCount,
      }),
    [location.state, searchParams, clampedPlayersCount, clampedWinnersCount]
  );

  useEffect(() => {
    if (mode === 'list' && location.state?.mode === 'list') {
      // Keep session as fallback for refresh within the same tab.
      return undefined;
    }
    if (mode === 'count') {
      clearDrawSession();
    }
    return undefined;
  }, [mode, location.state]);

  const {
    players,
    flippedCount,
    drawProgress,
    winnerIndices,
    winnerLabels,
    showComplete,
    isShuffling,
    flipCard,
    reset,
  } = useDraw(totalPlayers, winnerCount, labels);

  const { frontNumbers: shuffleFrontNumbers, shuffleTick } = useShuffleDisplayNumbers(
    totalPlayers,
    isShuffling && !labels
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

  const goToLotSetup = useCallback(() => {
    clearDrawSession();
    navigate('/lot');
  }, [navigate]);

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
      <button type="button" className="back-button" onClick={goToLotSetup}>
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
              frontNumber={labels ? undefined : shuffleFrontNumbers?.[player.index]}
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
          winnerLabels={labels ? winnerLabels : null}
          onRestart={reset}
          onGoHome={goToLotSetup}
        />
      )}
    </div>
  );
}
