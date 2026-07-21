export const MIN_PLAYERS = 2;
export const ABSOLUTE_MAX_PLAYERS = 1000;
export const DEFAULT_PLAYERS = 2;
export const DEFAULT_WINNERS = 1;
export const PLAYER_PRESETS = [3, 5, 10, 20, 50];
export const WINNER_PRESETS = [1, 2, 3];

export function displayNumber(index) {
  return index + 1;
}

export function clampedPlayersCount(value, maxParticipants = ABSOLUTE_MAX_PLAYERS) {
  return Math.min(maxParticipants, Math.max(MIN_PLAYERS, value));
}

export function clampedWinnersCount(winners, players, maxParticipants = ABSOLUTE_MAX_PLAYERS) {
  const maxWinners = Math.max(1, Math.min(players - 1, maxParticipants - 1));
  return Math.min(maxWinners, Math.max(1, winners));
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function generatePlayers(totalPlayers, winnerCount, labels = null) {
  const count = labels?.length ? labels.length : totalPlayers;
  const winnerTarget = Math.min(Math.max(1, winnerCount), Math.max(1, count - 1));
  const players = [];

  for (let i = 0; i < count; i++) {
    players.push({
      index: i,
      isWinner: false,
      isFlipped: false,
      label: labels?.[i] ?? null,
    });
  }

  // Сначала перемешиваем участников, потом назначаем победителей —
  // иначе при именах всегда выигрывают первые N из списка.
  shuffle(players);
  for (let i = 0; i < winnerTarget; i++) {
    players[i].isWinner = true;
  }

  shuffle(players);
  for (let i = 0; i < count; i++) {
    players[i].index = i;
  }

  return players;
}

export function getWinnerIndices(players) {
  return players.filter((p) => p.isWinner).map((p) => p.index).sort((a, b) => a - b);
}

export function getWinnerLabels(players) {
  return players
    .filter((p) => p.isWinner)
    .sort((a, b) => a.index - b.index)
    .map((p) => p.label || `№${displayNumber(p.index)}`);
}

export function isDrawComplete(players) {
  return players.length > 0 && players.every((p) => p.isFlipped);
}
