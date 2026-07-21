export const MIN_DICE = 1;
export const MAX_DICE = 6;
export const DICE_FACES = 6;
export const DICE_ROLL_MS = 1100;

export function rollDie() {
  return 1 + Math.floor(Math.random() * DICE_FACES);
}

export function rollDice(count) {
  const safeCount = Math.min(MAX_DICE, Math.max(MIN_DICE, count));
  return Array.from({ length: safeCount }, () => rollDie());
}

export function diceSum(values) {
  return values.reduce((sum, value) => sum + value, 0);
}
