import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clampedPlayersCount,
  clampedWinnersCount,
  DEFAULT_PLAYERS,
  DEFAULT_WINNERS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PLAYER_PRESETS,
  shouldWarnAboutPerformance,
  WINNER_PRESETS,
} from '../core/drawEngine.js';
import PresetRow from '../components/PresetRow.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';

function Stepper({ value, min, max, onChange }) {
  return (
    <div className="stepper">
      <button
        type="button"
        className="stepper__button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Уменьшить"
      >
        −
      </button>
      <span className="stepper__value" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="stepper__button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Увеличить"
      >
        +
      </button>
    </div>
  );
}

function PerformanceWarning({ onContinue, onCancel }) {
  return (
    <div className="alert-backdrop" role="alertdialog" aria-modal="true" aria-labelledby="perf-warning-title">
      <div className="alert">
        <h2 id="perf-warning-title" className="alert__title">
          Много участников
        </h2>
        <p className="alert__message">
          Большое число карточек может замедлить интерфейс. Рекомендуем уменьшить количество участников.
        </p>
        <div className="alert__actions">
          <button type="button" className="alert__button alert__button--secondary" onClick={onCancel}>
            Отмена
          </button>
          <button type="button" className="alert__button alert__button--primary" onClick={onContinue}>
            Продолжить
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState(DEFAULT_PLAYERS);
  const [winners, setWinners] = useState(DEFAULT_WINNERS);
  const [showWarning, setShowWarning] = useState(false);

  const maxWinners = Math.max(1, Math.min(players, MAX_PLAYERS) - 1);

  const handlePlayersChange = (value) => {
    const nextPlayers = clampedPlayersCount(value);
    setPlayers(nextPlayers);
    setWinners((prev) => clampedWinnersCount(prev, nextPlayers));
  };

  const handleWinnersChange = (value) => {
    setWinners(clampedWinnersCount(value, players));
  };

  const startDraw = () => {
    navigate(`/draw?players=${players}&winners=${winners}`);
  };

  const attemptStartDraw = () => {
    if (shouldWarnAboutPerformance(players)) {
      setShowWarning(true);
    } else {
      startDraw();
    }
  };

  return (
    <div className="page fade-in">
      <h1 className="page-title">Жеребьёвка</h1>

      <div className="spacer" />

      <p className="section-label">Количество участников</p>
      <PresetRow
        title="Быстрый выбор"
        values={PLAYER_PRESETS}
        selected={players}
        maxValue={MAX_PLAYERS}
        onSelect={handlePlayersChange}
      />
      <Stepper
        value={players}
        min={MIN_PLAYERS}
        max={MAX_PLAYERS}
        onChange={handlePlayersChange}
      />

      <p className="section-label section-label--spaced">Количество победителей</p>
      <PresetRow
        title="Быстрый выбор"
        values={WINNER_PRESETS}
        selected={winners}
        maxValue={maxWinners}
        onSelect={handleWinnersChange}
      />
      <Stepper
        value={winners}
        min={1}
        max={maxWinners}
        onChange={handleWinnersChange}
      />

      <div className="spacer" />

      <PrimaryButton onClick={attemptStartDraw}>
        Кинуть жребий
      </PrimaryButton>

      {showWarning && (
        <PerformanceWarning
          onContinue={() => {
            setShowWarning(false);
            startDraw();
          }}
          onCancel={() => setShowWarning(false)}
        />
      )}
    </div>
  );
}
