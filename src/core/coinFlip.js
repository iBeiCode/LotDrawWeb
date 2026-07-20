export const COIN_SIDES = {
  heads: 'heads',
  tails: 'tails',
};

export const COIN_SIDE_LABELS = {
  heads: 'Орёл',
  tails: 'Решка',
};

export function flipCoin() {
  return Math.random() < 0.5 ? COIN_SIDES.heads : COIN_SIDES.tails;
}

export function coinSideLabel(side) {
  return COIN_SIDE_LABELS[side] ?? '';
}

/** Следующий угол rotateX, чтобы после спинов остановиться на нужной стороне. */
export function nextCoinRotation(currentRotation, side) {
  const spins = 5 + Math.floor(Math.random() * 3);
  const normalized = ((currentRotation % 360) + 360) % 360;
  const targetMod = side === COIN_SIDES.heads ? 0 : 180;
  const align = (targetMod - normalized + 360) % 360;
  return currentRotation + spins * 360 + align;
}
