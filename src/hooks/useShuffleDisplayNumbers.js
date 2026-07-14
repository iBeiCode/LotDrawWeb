import { useEffect, useState } from 'react';
import { SHUFFLE_ANIMATED_MAX } from '../hooks/useDraw.js';

const SHUFFLE_TICK_MS = 90;
const SHUFFLE_TICK_MS_LARGE = 130;

function randomFrontNumbers(totalPlayers) {
  const numbers = Array.from({ length: totalPlayers }, (_, index) => index + 1);

  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  return numbers;
}

export function pseudoShuffleNumber(index, tick, totalPlayers) {
  return ((index * 2654435761 + tick * 1597334677) % totalPlayers) + 1;
}

export function useShuffleDisplayNumbers(totalPlayers, isShuffling) {
  const useDetailedAnimation = totalPlayers <= SHUFFLE_ANIMATED_MAX;
  const [frontNumbers, setFrontNumbers] = useState(() =>
    randomFrontNumbers(totalPlayers)
  );
  const [shuffleTick, setShuffleTick] = useState(0);

  useEffect(() => {
    if (!isShuffling) return undefined;

    if (useDetailedAnimation) {
      setFrontNumbers(randomFrontNumbers(totalPlayers));
      const intervalId = window.setInterval(() => {
        setFrontNumbers(randomFrontNumbers(totalPlayers));
      }, SHUFFLE_TICK_MS);

      return () => window.clearInterval(intervalId);
    }

    setShuffleTick((tick) => tick + 1);
    const intervalId = window.setInterval(() => {
      setShuffleTick((tick) => tick + 1);
    }, SHUFFLE_TICK_MS_LARGE);

    return () => window.clearInterval(intervalId);
  }, [isShuffling, totalPlayers, useDetailedAnimation]);

  return {
    frontNumbers: useDetailedAnimation ? frontNumbers : null,
    shuffleTick: useDetailedAnimation ? 0 : shuffleTick,
  };
}
