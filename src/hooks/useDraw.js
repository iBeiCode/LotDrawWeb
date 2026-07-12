import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  generatePlayers,
  getWinnerIndices,
  isDrawComplete,
} from '../core/drawEngine.js';

const COMPLETE_DELAY_MS = 600;

export function useDraw(totalPlayers, winnerCount) {
  const [players, setPlayers] = useState(() =>
    generatePlayers(totalPlayers, winnerCount)
  );
  const [showComplete, setShowComplete] = useState(false);
  const completeTimeoutRef = useRef(null);

  const cancelCompleteTimeout = useCallback(() => {
    if (completeTimeoutRef.current !== null) {
      clearTimeout(completeTimeoutRef.current);
      completeTimeoutRef.current = null;
    }
  }, []);

  const scheduleComplete = useCallback(() => {
    cancelCompleteTimeout();
    completeTimeoutRef.current = setTimeout(() => {
      completeTimeoutRef.current = null;
      setShowComplete(true);
    }, COMPLETE_DELAY_MS);
  }, [cancelCompleteTimeout]);

  useEffect(() => () => cancelCompleteTimeout(), [cancelCompleteTimeout]);

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
  }, [totalPlayers, winnerCount, cancelCompleteTimeout]);

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
    flipCard,
    reset,
    dismissComplete,
  };
}
