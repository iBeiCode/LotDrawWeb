import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  clampedPlayersCount,
  clampedWinnersCount,
  DEFAULT_PLAYERS,
  DEFAULT_WINNERS,
} from '../core/drawEngine.js';
import Card from '../components/Card.jsx';
import DrawComplete from '../components/DrawComplete.jsx';
import { useDraw } from '../hooks/useDraw.js';
import { hasSeenCardHint, setHasSeenCardHint } from '../storage/appSettings.js';

export default function DrawPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  }, [searchParams]);

  const {
    players,
    flippedCount,
    drawProgress,
    winnerIndices,
    showComplete,
    flipCard,
    reset,
  } = useDraw(totalPlayers, winnerCount);

  const handleFlip = useCallback(
    (index) => {
      if (showCardHint) {
        setHasSeenCardHint();
        setShowCardHint(false);
      }
      flipCard(index);
    },
    [flipCard, showCardHint]
  );

  const showHint = showCardHint && flippedCount === 0;

  return (
    <div className="page">
      <button type="button" className="back-button" onClick={() => navigate('/')}>
        ← Назад
      </button>

      <header className="draw-header fade-in">
        <h1 className="draw-header__title">Выберите один из вариантов</h1>
        <p className="draw-header__progress">
          Открыто {flippedCount} из {totalPlayers}
        </p>
        <div className="progress-bar" role="progressbar" aria-valuenow={flippedCount} aria-valuemin={0} aria-valuemax={totalPlayers}>
          <div
            className="progress-bar__fill"
            style={{ width: `${drawProgress * 100}%` }}
          />
        </div>
        {showHint && (
          <p className="draw-hint">Нажмите на карточку, чтобы открыть</p>
        )}
      </header>

      <div className="card-grid">
        {players.map((player) => (
          <Card key={player.index} player={player} onFlip={handleFlip} />
        ))}
      </div>

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
