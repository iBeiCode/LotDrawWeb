export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 100;
export const DEFAULT_PLAYERS = 2;
export const DEFAULT_WINNERS = 1;
export const PLAYER_PRESETS = [3, 5, 10, 20, 50];
export const WINNER_PRESETS = [1, 2, 3];
export const PERFORMANCE_WARNING_THRESHOLD = 50;

export function displayNumber(index) {
  return index + 1;
}

export function clampedPlayersCount(value) {
  return Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, value));
}

export function clampedWinnersCount(winners, players) {
  const maxWinners = Math.max(1, Math.min(players - 1, MAX_PLAYERS - 1));
  return Math.min(maxWinners, Math.max(1, winners));
}

export function shouldWarnAboutPerformance(participants) {
  return participants > PERFORMANCE_WARNING_THRESHOLD;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function generatePlayers(totalPlayers, winnerCount) {
  let remainingWinners = winnerCount;
  const players = [];

  for (let i = 0; i < totalPlayers; i++) {
    const isWinner = remainingWinners > 0;
    if (isWinner) remainingWinners--;
    players.push({ index: i, isWinner, isFlipped: false });
  }

  shuffle(players);
  for (let i = 0; i < totalPlayers; i++) {
    const player = players.splice(i, 1)[0];
    player.index = i;
    players.splice(i, 0, player);
  }

  return shuffle(players);
}

export function getWinnerIndices(players) {
  return players.filter((p) => p.isWinner).map((p) => p.index).sort((a, b) => a - b);
}

export function isDrawComplete(players) {
  return players.length > 0 && players.every((p) => p.isFlipped);
}
