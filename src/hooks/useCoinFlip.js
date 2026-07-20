import { useCallback, useEffect, useRef, useState } from 'react';
import {
  coinSideLabel,
  flipCoin,
  nextCoinRotation,
} from '../core/coinFlip.js';
import { getIsSaveResults } from '../storage/appSettings.js';
import { createRecord, save as saveHistoryRecord } from '../storage/drawHistory.js';
import { hapticImpact } from '../utils/telegram.js';

export const COIN_FLIP_DURATION_MS = 1400;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function saveCoinToHistoryIfNeeded(side) {
  if (!getIsSaveResults()) return;
  saveHistoryRecord(createRecord({ type: 'coin', side }));
}

export function useCoinFlip() {
  const [phase, setPhase] = useState('idle');
  const [side, setSide] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef(null);
  const rotationRef = useRef(0);

  const cancelTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => cancelTimeout(), [cancelTimeout]);

  const flip = useCallback(() => {
    if (phase === 'flipping') return;

    cancelTimeout();
    const nextSide = flipCoin();
    const duration = prefersReducedMotion() ? 0 : COIN_FLIP_DURATION_MS;
    const endRotation = nextCoinRotation(rotationRef.current, nextSide);

    setSide(nextSide);
    setPhase('flipping');
    hapticImpact('light');

    if (duration === 0) {
      rotationRef.current = endRotation;
      setRotation(endRotation);
      setIsAnimating(false);
      try {
        saveCoinToHistoryIfNeeded(nextSide);
      } catch {
        // never block the result on storage errors
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
        saveCoinToHistoryIfNeeded(nextSide);
      } catch {
        // never block the result on storage errors
      }
      hapticImpact('medium');
      setPhase('result');
    }, duration);
  }, [phase, cancelTimeout]);

  const reset = useCallback(() => {
    cancelTimeout();
    setPhase('idle');
    setSide(null);
    setIsAnimating(false);
  }, [cancelTimeout]);

  return {
    phase,
    side,
    sideLabel: side ? coinSideLabel(side) : null,
    rotation,
    isAnimating,
    isFlipping: phase === 'flipping',
    showResult: phase === 'result',
    flip,
    reset,
  };
}
