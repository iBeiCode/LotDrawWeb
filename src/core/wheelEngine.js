export const WHEEL_COLORS = [
  '#2B6CB0',
  '#00B894',
  '#E17055',
  '#6C5CE7',
  '#0984E3',
  '#FDCB6E',
  '#E84393',
  '#00CEC9',
  '#636E72',
  '#D63031',
];

export const WHEEL_SPIN_MS = 4200;
export const MIN_WHEEL_OPTIONS = 2;
export const MAX_WHEEL_OPTIONS = 40;

export function pickWheelIndex(optionCount) {
  if (optionCount <= 0) return 0;
  return Math.floor(Math.random() * optionCount);
}

/** Угол, при котором сегмент index оказывается под указателем сверху (0° в conic-gradient). */
export function wheelTargetRotation(currentRotation, index, optionCount) {
  const segment = 360 / optionCount;
  const spins = 5 + Math.floor(Math.random() * 3);
  const segmentCenter = index * segment + segment / 2;
  const normalized = ((currentRotation % 360) + 360) % 360;
  const desired = (360 - segmentCenter) % 360;
  const delta = (desired - normalized + 360) % 360;
  return currentRotation + spins * 360 + delta;
}

export function colorForWheelIndex(index) {
  return WHEEL_COLORS[index % WHEEL_COLORS.length];
}
