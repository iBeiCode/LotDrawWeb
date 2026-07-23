import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DEFAULT_PLAYERS,
  DEFAULT_WINNERS,
  MIN_PLAYERS,
} from '../core/drawEngine.js';
import { participantsPhrase, winnersPhrase } from '../core/formatting.js';
import OptionListEditor from '../components/OptionListEditor.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import SegmentedControl from '../components/SegmentedControl.jsx';
import ModeToolbar from '../components/ModeToolbar.jsx';
import WheelPicker from '../components/WheelPicker.jsx';
import Onboarding from '../components/Onboarding.jsx';
import { useAppSettings } from '../hooks/useAppSettings.jsx';
import { useOptionList } from '../hooks/useOptionList.js';
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
import { saveDrawSession } from '../storage/drawSession.js';

const SETUP_MODES = [
  { value: 'count', label: 'По числу' },
  { value: 'list', label: 'По списку' },
];

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
  const [setupMode, setSetupMode] = useState('count');
  const [players, setPlayers] = useState(() => readInitialCounts().players);
  const [winners, setWinners] = useState(() => readInitialCounts().winners);
  const [listWinners, setListWinners] = useState(1);
  const [showOnboarding, setShowOnboarding] = useState(() => !hasSeenOnboarding());
  const [saveFeedback, setSaveFeedback] = useState(false);

  const optionList = useOptionList({ minItems: MIN_PLAYERS, scope: 'lot' });

  useEffect(() => {
    if (!showOnboarding) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showOnboarding]);

  const maxWinners = Math.max(1, Math.min(players, maxParticipants) - 1);
  const listMaxWinners = Math.max(1, optionList.items.length - 1);
  const showLastChoice = rememberLastValues && hasSavedDrawCounts() && setupMode === 'count';
  const completedDraw = hasCompletedDraw() ? loadCompletedDraw() : null;

  useEffect(() => {
    setListWinners((prev) => Math.min(Math.max(1, prev), Math.max(1, listMaxWinners)));
  }, [listMaxWinners]);

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

  const startDraw = useCallback(
    (nextPlayers, nextWinners, labels = null) => {
      persistCountsIfNeeded(nextPlayers, nextWinners);
      saveDrawSession({
        mode: labels ? 'list' : 'count',
        players: nextPlayers,
        winners: nextWinners,
        labels,
      });
      navigate(`/draw?players=${nextPlayers}&winners=${nextWinners}`, {
        state: {
          mode: labels ? 'list' : 'count',
          players: nextPlayers,
          winners: nextWinners,
          labels,
        },
      });
    },
    [navigate, persistCountsIfNeeded]
  );

  const attemptStartDraw = () => {
    if (setupMode === 'list') {
      if (!optionList.isValid) return;
      const nextPlayers = optionList.items.length;
      const nextWinners = clampedWinnersCount(listWinners, nextPlayers);
      startDraw(nextPlayers, nextWinners, optionList.items);
      return;
    }

    const nextPlayers = clampedPlayersCount(players);
    const nextWinners = clampedWinnersCount(winners, nextPlayers);
    startDraw(nextPlayers, nextWinners, null);
  };

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
    setSetupMode('count');
    setPlayers(nextPlayers);
    setWinners(nextWinners);
    startDraw(nextPlayers, nextWinners, null);
  };

  const handleSaveList = () => {
    const saved = optionList.saveCurrent();
    if (!saved) return;
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 1600);
  };

  const lastChoiceText = showLastChoice
    ? (() => {
        const last = loadLastDrawCounts();
        return `Последний выбор: ${participantsPhrase(last.players)}, ${winnersPhrase(last.winners)}`;
      })()
    : null;

  const canStart =
    setupMode === 'count' ? true : optionList.isValid && optionList.items.length <= maxParticipants;

  return (
    <div className="page home-page fade-in">
      <div className="home-page__body">
        <header className="home-header home-header--with-back">
          <button
            type="button"
            className="home-header__back"
            onClick={() => navigate('/')}
            aria-label="К выбору режима"
          >
            ←
          </button>
          <h1 className="page-title home-header__title">Жребий</h1>
          <ModeToolbar />
        </header>

        <SegmentedControl
          options={SETUP_MODES}
          value={setupMode}
          onChange={setSetupMode}
          ariaLabel="Способ настройки жеребьёвки"
        />

        {lastChoiceText && <p className="home-last-choice">{lastChoiceText}</p>}

        <div className="spacer" />

        {setupMode === 'count' ? (
          <>
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

            {completedDraw && setupMode === 'count' && (
              <button type="button" className="home-repeat-button" onClick={handleRepeatLastDraw}>
                Повторить прошлый жребий
              </button>
            )}
          </>
        ) : (
          <>
            <p className="section-label">Список участников</p>
            <p className="section-hint">Имена на карточках — по одному на строку</p>
            <OptionListEditor
              text={optionList.text}
              onTextChange={optionList.setText}
              title={optionList.title}
              onTitleChange={optionList.setTitle}
              items={optionList.items}
              minItems={MIN_PLAYERS}
              lists={optionList.lists}
              selectedListId={optionList.selectedListId}
              onSelectList={optionList.selectList}
              onSaveList={handleSaveList}
              onDeleteList={optionList.removeList}
              placeholder={'Анна\nБорис\nВика\nГлеб'}
            />
            {saveFeedback && (
              <p className="list-editor__toast" role="status">
                Список сохранён
              </p>
            )}

            {optionList.items.length >= MIN_PLAYERS && (
              <>
                <p className="section-label section-label--spaced">Количество победителей</p>
                <p className="section-hint">Сколько имён выиграют</p>
                <WheelPicker
                  min={1}
                  max={listMaxWinners}
                  value={Math.min(listWinners, listMaxWinners)}
                  onChange={setListWinners}
                  ariaLabel="Количество победителей"
                />
              </>
            )}

            {optionList.items.length > maxParticipants && (
              <p className="form-error">
                Слишком много имён. Максимум в настройках: {maxParticipants}.
              </p>
            )}
          </>
        )}
      </div>

      <footer className="home-footer">
        <PrimaryButton onClick={attemptStartDraw} disabled={!canStart}>
          Кинуть жребий
        </PrimaryButton>
        {!canStart && setupMode === 'list' && (
          <p className="footer-hint" role="status">
            {optionList.items.length > maxParticipants
              ? `Слишком много имён. Максимум: ${maxParticipants}`
              : 'Добавьте минимум 2 имени'}
          </p>
        )}
      </footer>

      {showOnboarding && <Onboarding onDismiss={() => setShowOnboarding(false)} />}
    </div>
  );
}
