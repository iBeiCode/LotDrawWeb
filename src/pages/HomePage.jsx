import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DEFAULT_PLAYERS,
  DEFAULT_WINNERS,
  MIN_PLAYERS,
} from '../core/drawEngine.js';
import { participantsPhrase, winnersPhrase } from '../core/formatting.js';
import PrimaryButton from '../components/PrimaryButton.jsx';
import WheelPicker from '../components/WheelPicker.jsx';
import { ArchiveBoxIcon, GearIcon } from '../components/icons/ToolbarIcons.jsx';
import Onboarding from '../components/Onboarding.jsx';
import { useAppSettings } from '../hooks/useAppSettings.jsx';
import {
  clampedPlayersCount as clampPlayersFromStorage,
  clampedWinnersCount as clampWinnersFromStorage,
  getRememberLastValues,
  hasCompletedDraw,
  hasSavedDrawCounts,
  hasSeenOnboarding,
  loadCompletedDraw,
  loadLastDrawCounts,
  persistLastDrawCounts,
} from '../storage/appSettings.js';

function readInitialCounts() {
  if (!getRememberLastValues() || !hasSavedDrawCounts()) {
    return { players: DEFAULT_PLAYERS, winners: DEFAULT_WINNERS };
  }

  const last = loadLastDrawCounts();
  const players = clampPlayersFromStorage(last.players);
  const winners = clampWinnersFromStorage(last.winners, players);
  return { players, winners };
}

export default function HomePage() {
  const navigate = useNavigate();
  const {
    maxParticipants,
    rememberLastValues,
    clampedPlayersCount,
    clampedWinnersCount,
  } = useAppSettings();
  const [players, setPlayers] = useState(() => readInitialCounts().players);
  const [winners, setWinners] = useState(() => readInitialCounts().winners);
  const [showOnboarding, setShowOnboarding] = useState(() => !hasSeenOnboarding());

  useEffect(() => {
    if (!showOnboarding) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showOnboarding]);

  const maxWinners = Math.max(1, Math.min(players, maxParticipants) - 1);
  const showLastChoice = rememberLastValues && hasSavedDrawCounts();
  const completedDraw = hasCompletedDraw() ? loadCompletedDraw() : null;

  const persistCountsIfNeeded = useCallback(
    (nextPlayers, nextWinners) => {
      if (!rememberLastValues) return;
      persistLastDrawCounts(nextPlayers, nextWinners);
    },
    [rememberLastValues]
  );

  const restoreCountsIfNeeded = useCallback(() => {
    if (!rememberLastValues || !hasSavedDrawCounts()) return;
    const last = loadLastDrawCounts();
    const nextPlayers = clampedPlayersCount(last.players);
    const nextWinners = clampedWinnersCount(last.winners, nextPlayers);
    setPlayers(nextPlayers);
    setWinners(nextWinners);
  }, [rememberLastValues, clampedPlayersCount, clampedWinnersCount]);

  useEffect(() => {
    if (!rememberLastValues) return;
    restoreCountsIfNeeded();
  }, [rememberLastValues, restoreCountsIfNeeded]);

  useEffect(() => {
    setPlayers((prev) => {
      const nextPlayers = clampedPlayersCount(prev);
      setWinners((prevWinners) => clampedWinnersCount(prevWinners, nextPlayers));
      return nextPlayers;
    });
  }, [maxParticipants, clampedPlayersCount, clampedWinnersCount]);

  const navigateToDraw = useCallback(
    (nextPlayers, nextWinners) => {
      persistCountsIfNeeded(nextPlayers, nextWinners);
      navigate(`/draw?players=${nextPlayers}&winners=${nextWinners}`);
    },
    [navigate, persistCountsIfNeeded]
  );

  const attemptStartDraw = useCallback(
    (overridePlayers = players, overrideWinners = winners) => {
      const nextPlayers = clampedPlayersCount(overridePlayers);
      const nextWinners = clampedWinnersCount(overrideWinners, nextPlayers);
      navigateToDraw(nextPlayers, nextWinners);
    },
    [players, winners, clampedPlayersCount, clampedWinnersCount, navigateToDraw]
  );

  const handlePlayersChange = (value) => {
    const nextPlayers = clampedPlayersCount(value);
    const nextWinners = clampedWinnersCount(winners, nextPlayers);
    setPlayers(nextPlayers);
    setWinners(nextWinners);
    persistCountsIfNeeded(nextPlayers, nextWinners);
  };

  const handleWinnersChange = (value) => {
    const nextWinners = clampedWinnersCount(value, players);
    setWinners(nextWinners);
    persistCountsIfNeeded(players, nextWinners);
  };

  const handleRepeatLastDraw = () => {
    if (!completedDraw) return;

    const nextPlayers = clampedPlayersCount(completedDraw.players);
    const nextWinners = clampedWinnersCount(completedDraw.winners, nextPlayers);
    setPlayers(nextPlayers);
    setWinners(nextWinners);
    attemptStartDraw(nextPlayers, nextWinners);
  };

  const lastChoiceText = showLastChoice
    ? (() => {
        const last = loadLastDrawCounts();
        return `Последний выбор: ${participantsPhrase(last.players)}, ${winnersPhrase(last.winners)}`;
      })()
    : null;

  return (
    <div className="page home-page fade-in">
      <div className="home-page__body">
        <header className="home-header">
          <div className="home-header__spacer" aria-hidden="true" />
          <h1 className="page-title home-header__title">Жеребьёвка</h1>
          <nav className="home-toolbar" aria-label="Дополнительные разделы">
            <Link to="/settings" className="home-toolbar__button" aria-label="Настройки">
              <GearIcon />
            </Link>
            <Link to="/history" className="home-toolbar__button" aria-label="История">
              <ArchiveBoxIcon />
            </Link>
          </nav>
        </header>

        {lastChoiceText && (
          <p className="home-last-choice">{lastChoiceText}</p>
        )}

        <div className="spacer" />

        <p className="section-label">Количество участников</p>
        <p className="section-hint">Прокрутите колесо и выберите число</p>
        <WheelPicker
          min={MIN_PLAYERS}
          max={maxParticipants}
          value={players}
          onChange={handlePlayersChange}
          ariaLabel="Количество участников"
        />

        <p className="section-label section-label--spaced">Количество победителей</p>
        <p className="section-hint">Сколько карточек выиграют</p>
        <WheelPicker
          min={1}
          max={maxWinners}
          value={winners}
          onChange={handleWinnersChange}
          ariaLabel="Количество победителей"
        />

        {completedDraw && (
          <button type="button" className="home-repeat-button" onClick={handleRepeatLastDraw}>
            Повторить прошлый жребий
          </button>
        )}
      </div>

      <footer className="home-footer">
        <PrimaryButton onClick={() => attemptStartDraw()}>
          Кинуть жребий
        </PrimaryButton>
      </footer>

      {showOnboarding && (
        <Onboarding onDismiss={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}
