import { useCallback, useEffect, useMemo, useRef } from 'react';

export const WHEEL_ITEM_HEIGHT = 40;
export const WHEEL_VISIBLE_HEIGHT = 160;

export default function WheelPicker({
  min,
  max,
  value,
  onChange,
  ariaLabel,
}) {
  const listRef = useRef(null);
  const isSyncingRef = useRef(false);
  const scrollEndTimerRef = useRef(null);
  const lastEmittedRef = useRef(value);

  const values = useMemo(() => {
    if (max < min) return [min];
    return Array.from({ length: max - min + 1 }, (_, index) => min + index);
  }, [min, max]);

  const padding = (WHEEL_VISIBLE_HEIGHT - WHEEL_ITEM_HEIGHT) / 2;

  const scrollToValue = useCallback(
    (nextValue, behavior = 'auto') => {
      const list = listRef.current;
      if (!list) return;

      const index = nextValue - min;
      isSyncingRef.current = true;
      list.scrollTo({ top: index * WHEEL_ITEM_HEIGHT, behavior });
      window.requestAnimationFrame(() => {
        isSyncingRef.current = false;
      });
    },
    [min]
  );

  const emitValueFromScroll = useCallback(() => {
    const list = listRef.current;
    if (!list || isSyncingRef.current) return;

    const index = Math.round(list.scrollTop / WHEEL_ITEM_HEIGHT);
    const nextValue = Math.min(max, Math.max(min, min + index));

    if (nextValue !== lastEmittedRef.current) {
      lastEmittedRef.current = nextValue;
      onChange(nextValue);
    }
  }, [min, max, onChange]);

  useEffect(() => {
    lastEmittedRef.current = value;
    scrollToValue(value);
  }, [value, min, max, scrollToValue]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;

    const handleScrollEnd = () => emitValueFromScroll();

    list.addEventListener('scrollend', handleScrollEnd);
    return () => {
      list.removeEventListener('scrollend', handleScrollEnd);
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }
    };
  }, [emitValueFromScroll]);

  const handleScroll = () => {
    if (scrollEndTimerRef.current) {
      clearTimeout(scrollEndTimerRef.current);
    }

    scrollEndTimerRef.current = window.setTimeout(() => {
      emitValueFromScroll();
    }, 100);
  };

  return (
    <div
      className="wheel-picker"
      style={{ height: WHEEL_VISIBLE_HEIGHT }}
    >
      <div className="wheel-picker__frame" aria-hidden="true" />
      <ul
        ref={listRef}
        className="wheel-picker__list"
        style={{
          paddingTop: padding,
          paddingBottom: padding,
        }}
        onScroll={handleScroll}
        role="listbox"
        aria-label={ariaLabel}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
      >
        {values.map((item) => (
          <li
            key={item}
            className={`wheel-picker__item${item === value ? ' wheel-picker__item--selected' : ''}`}
            role="option"
            aria-selected={item === value}
            style={{ height: WHEEL_ITEM_HEIGHT }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
