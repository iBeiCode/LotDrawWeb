import { coinSideLabel } from './coinFlip.js';
import { displayNumber } from './drawEngine.js';
import { recordType } from '../storage/drawHistory.js';

function russianPlural(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 14) {
    return many;
  }

  switch (mod10) {
    case 1:
      return one;
    case 2:
    case 3:
    case 4:
      return few;
    default:
      return many;
  }
}

export function participantsPhrase(count) {
  const word = russianPlural(count, 'участник', 'участника', 'участников');
  return `${count} ${word}`;
}

export function winnersPhrase(count) {
  const word = russianPlural(count, 'победитель', 'победителя', 'победителей');
  return `${count} ${word}`;
}

export function drawSummary(players, winnerCount) {
  return `${participantsPhrase(players)} · ${winnersPhrase(winnerCount)}`;
}

export function coinSummary() {
  return 'Бросок монетки';
}

export function coinOutcomeText(side) {
  return coinSideLabel(side);
}

export function winnerOutcomeText(zeroBasedIndices) {
  const displayNumbers = zeroBasedIndices.map(displayNumber).sort((a, b) => a - b);
  return winnerOutcomeTextFromDisplayNumbers(displayNumbers);
}

export function winnerOutcomeTextFromDisplayNumbers(displayNumbers) {
  const tags = [...displayNumbers].sort((a, b) => a - b).map((n) => `№${n}`);

  switch (tags.length) {
    case 0:
      return 'Победителей нет';
    case 1:
      return `Победил вариант ${tags[0]}`;
    default:
      return `Победили варианты ${tags.join(', ')}`;
  }
}

function formatShareDate(date) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function shareText(players, winnerCount, zeroBasedWinnerIndices, date = new Date()) {
  const lines = ['Жеребьёвка — LotDraw'];

  if (date) {
    lines.push(formatShareDate(date));
  }

  lines.push(drawSummary(players, winnerCount));
  lines.push(winnerOutcomeText(zeroBasedWinnerIndices));
  return lines.join('\n');
}

export function coinShareText(side, date = new Date()) {
  const lines = ['Монетка — LotDraw'];

  if (date) {
    lines.push(formatShareDate(date));
  }

  lines.push(coinSummary());
  lines.push(coinOutcomeText(side));
  return lines.join('\n');
}

export function shareTextForRecord(record) {
  if (recordType(record) === 'coin') {
    return coinShareText(record.side, new Date(record.date));
  }

  const lines = ['Жеребьёвка — LotDraw'];
  lines.push(formatShareDate(new Date(record.date)));
  lines.push(drawSummary(record.totalPlayers, record.winnerCount));
  lines.push(winnerOutcomeTextFromDisplayNumbers(record.winnerIndices));
  return lines.join('\n');
}

export function historySummaryForRecord(record) {
  if (recordType(record) === 'coin') {
    return coinSummary();
  }
  return drawSummary(record.totalPlayers, record.winnerCount);
}

export function historyOutcomeForRecord(record) {
  if (recordType(record) === 'coin') {
    return coinOutcomeText(record.side);
  }
  return winnerOutcomeTextFromDisplayNumbers(record.winnerIndices);
}
