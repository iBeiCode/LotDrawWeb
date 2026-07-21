import { useCallback, useEffect, useRef, useState } from 'react';
import { DICE_ROLL_MS, rollDice } from '../core/diceEngine.js';
import { getIsSaveResults } from '../storage/appSettings.js';
import { createRecord, save as saveHistoryRecord } from '../storage/drawHistory.js';
import { hapticImpact } from '../utils/telegram.js';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function saveDiceIfNeeded(values) {
  if (!getIsSaveResults()) return;
  saveHistoryRecord(createRecord({ type: 'dice', values }));
}

export function useDice(count) {
  const [phase, setPhase] = useState('idle');
  const [values, setValues] = useState(() => Array.from({ length: count }, () => 1));
  const [displayValues, setDisplayValues] = useState(() =>
    Array.from({ length: count }, () => 1)
  );
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const cancelTimers = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => cancelTimers(), [cancelTimers]);

  useEffect(() => {
    cancelTimers();
    const initial = Array.from({ length: count }, () => 1);
    setValues(initial);
    setDisplayValues(initial);
    setPhase('idle');
  }, [count, cancelTimers]);

  const roll = useCallback(() => {
    if (phase === 'rolling') return;

    cancelTimers();
    const next = rollDice(count);
    const duration = prefersReducedMotion() ? 0 : DICE_ROLL_MS;

    setPhase('rolling');
    hapticImpact('light');

    if (duration === 0) {
      setValues(next);
      setDisplayValues(next);
      try {
        saveDiceIfNeeded(next);
      } catch {
        // ignore
      }
      hapticImpact('medium');
      setPhase('result');
      return;
    }

    intervalRef.current = setInterval(() => {
      setDisplayValues(rollDice(count));
    }, 70);

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setValues(next);
      setDisplayValues(next);
      try {
        saveDiceIfNeeded(next);
      } catch {
        // ignore
      }
      hapticImpact('medium');
      setPhase('result');
    }, duration);
  }, [phase, count, cancelTimers]);

  return {
    phase,
    values,
    displayValues,
    isRolling: phase === 'rolling',
    showResult: phase === 'result',
    roll,
  };
}
