import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  colorForWheelIndex,
  pickWheelIndex,
  WHEEL_SPIN_MS,
  wheelTargetRotation,
} from '../core/wheelEngine.js';
import { getIsSaveResults } from '../storage/appSettings.js';
import { createRecord, save as saveHistoryRecord } from '../storage/drawHistory.js';
import { hapticImpact } from '../utils/telegram.js';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function saveWheelIfNeeded(label, optionCount) {
  if (!getIsSaveResults()) return;
  saveHistoryRecord(
    createRecord({ type: 'wheel', label, optionCount })
  );
}

export function useWheel(options) {
  const [phase, setPhase] = useState('idle');
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [resultIndex, setResultIndex] = useState(null);
  const timeoutRef = useRef(null);
  const rotationRef = useRef(0);

  const optionsKey = options.join('\u0001');
  const stableOptions = useMemo(
    () => (optionsKey ? optionsKey.split('\u0001') : []),
    [optionsKey]
  );

  const cancelTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => cancelTimeout(), [cancelTimeout]);

  useEffect(() => {
    cancelTimeout();
    setPhase('idle');
    setResultIndex(null);
    setIsAnimating(false);
    rotationRef.current = 0;
    setRotation(0);
  }, [optionsKey, cancelTimeout]);

  const spin = useCallback(() => {
    if (phase === 'spinning' || stableOptions.length < 2) return;

    cancelTimeout();
    const index = pickWheelIndex(stableOptions.length);
    const endRotation = wheelTargetRotation(
      rotationRef.current,
      index,
      stableOptions.length
    );
    const duration = prefersReducedMotion() ? 0 : WHEEL_SPIN_MS;
    const label = stableOptions[index];

    setResultIndex(index);
    setPhase('spinning');
    hapticImpact('light');

    if (duration === 0) {
      rotationRef.current = endRotation;
      setRotation(endRotation);
      setIsAnimating(false);
      try {
        saveWheelIfNeeded(label, stableOptions.length);
      } catch {
        // ignore storage errors
      }
      hapticImpact('medium');
      setPhase('result');
      return;
    }

    setIsAnimating(true);
    requestAnimationFrame(() => {
      rotationRef.current = endRotation;
      setRotation(endRotation);
    });

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setIsAnimating(false);
      try {
        saveWheelIfNeeded(label, stableOptions.length);
      } catch {
        // ignore
      }
      hapticImpact('medium');
      setPhase('result');
    }, duration);
  }, [phase, stableOptions, cancelTimeout]);

  const colors = useMemo(
    () => stableOptions.map((_, index) => colorForWheelIndex(index)),
    [stableOptions]
  );

  return {
    phase,
    rotation,
    isAnimating,
    isSpinning: phase === 'spinning',
    showResult: phase === 'result',
    resultIndex,
    resultLabel: resultIndex != null ? stableOptions[resultIndex] : null,
    colors,
    spin,
  };
}
