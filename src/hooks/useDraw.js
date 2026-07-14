import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  generatePlayers,
  displayNumber,
  getWinnerIndices,
  isDrawComplete,
} from '../core/drawEngine.js';
import { getIsSaveResults, persistCompletedDraw } from '../storage/appSettings.js';
import { createRecord, save as saveHistoryRecord } from '../storage/drawHistory.js';

const COMPLETE_DELAY_MS = 600;
export const SHUFFLE_MIN_MS = 1000;
export const SHUFFLE_MAX_MS = 2000;
export const SHUFFLE_ANIMATED_MAX = 50;

function saveDrawToHistoryIfNeeded(players, totalPlayers, winnerCount) {
  if (!getIsSaveResults()) return;

  const winnerDisplayNumbers = getWinnerIndices(players).map(displayNumber);
  saveHistoryRecord(
    createRecord({
      totalPlayers,
      winnerCount,
      winnerIndices: winnerDisplayNumbers,
    })
  );
}

export function randomShuffleDurationMs() {
  return (
    SHUFFLE_MIN_MS +
    Math.floor(Math.random() * (SHUFFLE_MAX_MS - SHUFFLE_MIN_MS + 1))
  );
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useDraw(totalPlayers, winnerCount) {
  const [players, setPlayers] = useState(() =>
    generatePlayers(totalPlayers, winnerCount)
  );
  const [showComplete, setShowComplete] = useState(false);
  const [isShuffling, setIsShuffling] = useState(true);
  const completeTimeoutRef = useRef(null);
  const shuffleTimeoutRef = useRef(null);
  const playersRef = useRef(players);

  playersRef.current = players;

  const cancelCompleteTimeout = useCallback(() => {
    if (completeTimeoutRef.current !== null) {
      clearTimeout(completeTimeoutRef.current);
      completeTimeoutRef.current = null;
    }
  }, []);

  const cancelShuffleTimeout = useCallback(() => {
    if (shuffleTimeoutRef.current !== null) {
      clearTimeout(shuffleTimeoutRef.current);
      shuffleTimeoutRef.current = null;
    }
  }, []);

  const startShuffle = useCallback(() => {
    cancelShuffleTimeout();
    setIsShuffling(true);

    const duration = prefersReducedMotion() ? 0 : randomShuffleDurationMs();
    shuffleTimeoutRef.current = setTimeout(() => {
      shuffleTimeoutRef.current = null;
      setIsShuffling(false);
    }, duration);
  }, [cancelShuffleTimeout]);

  useEffect(() => {
    startShuffle();
    return cancelShuffleTimeout;
  }, [totalPlayers, winnerCount, startShuffle, cancelShuffleTimeout]);

  const scheduleComplete = useCallback(() => {
    cancelCompleteTimeout();
    completeTimeoutRef.current = setTimeout(() => {
      completeTimeoutRef.current = null;

      try {
        saveDrawToHistoryIfNeeded(playersRef.current, totalPlayers, winnerCount);
        persistCompletedDraw(totalPlayers, winnerCount);
      } catch {
        // never block the completion screen on storage errors
      }

      setShowComplete(true);
    }, COMPLETE_DELAY_MS);
  }, [cancelCompleteTimeout, totalPlayers, winnerCount]);

  useEffect(
    () => () => {
      cancelCompleteTimeout();
      cancelShuffleTimeout();
    },
    [cancelCompleteTimeout, cancelShuffleTimeout]
  );

  const flippedCount = useMemo(
    () => players.filter((p) => p.isFlipped).length,
    [players]
  );

  const drawProgress = totalPlayers > 0 ? flippedCount / totalPlayers : 0;

  const winnerIndices = useMemo(() => getWinnerIndices(players), [players]);

  const flipCard = useCallback(
    (index) => {
      setPlayers((prev) => {
        const target = prev.find((p) => p.index === index);
        if (!target || target.isFlipped) return prev;

        const next = prev.map((p) =>
          p.index === index ? { ...p, isFlipped: true } : p
        );

        if (isDrawComplete(next)) {
          playersRef.current = next;
          scheduleComplete();
        }

        return next;
      });
    },
    [scheduleComplete]
  );

  const reset = useCallback(() => {
    cancelCompleteTimeout();
    setPlayers(generatePlayers(totalPlayers, winnerCount));
    setShowComplete(false);
    startShuffle();
  }, [totalPlayers, winnerCount, cancelCompleteTimeout, startShuffle]);

  const dismissComplete = useCallback(() => {
    cancelCompleteTimeout();
    setShowComplete(false);
  }, [cancelCompleteTimeout]);

  return {
    players,
    flippedCount,
    drawProgress,
    winnerIndices,
    showComplete,
    isShuffling,
    flipCard,
    reset,
    dismissComplete,
  };
}
