import { coinSideLabel } from './coinFlip.js';
import { displayNumber } from './drawEngine.js';
import { diceSum } from './diceEngine.js';
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

export function wheelSummary(optionCount) {
  const count = Number(optionCount) || 0;
  return `Колесо · ${count} ${russianPlural(count, 'вариант', 'варианта', 'вариантов')}`;
}

export function wheelOutcomeText(label) {
  return `Выпало: ${label || '—'}`;
}

export function diceSummary(count) {
  const safe = Number(count) || 0;
  return `${safe} ${russianPlural(safe, 'кубик', 'кубика', 'кубиков')}`;
}

export function diceOutcomeText(values) {
  const safeValues = Array.isArray(values) ? values : [];
  if (!safeValues.length) return 'Нет броска';
  if (safeValues.length === 1) return `Выпало ${safeValues[0]}`;
  return `${safeValues.join(' + ')} = ${diceSum(safeValues)}`;
}

export function winnerOutcomeText(zeroBasedIndices) {
  const displayNumbers = zeroBasedIndices.map(displayNumber).sort((a, b) => a - b);
  return winnerOutcomeTextFromDisplayNumbers(displayNumbers);
}

export function winnerOutcomeTextFromDisplayNumbers(displayNumbers) {
  const tags = [...(displayNumbers ?? [])].sort((a, b) => a - b).map((n) => `№${n}`);

  switch (tags.length) {
    case 0:
      return 'Победителей нет';
    case 1:
      return `Победил вариант ${tags[0]}`;
    default:
      return `Победили варианты ${tags.join(', ')}`;
  }
}

export function winnerOutcomeTextFromLabels(labels) {
  const cleaned = (labels ?? []).filter(Boolean);

  switch (cleaned.length) {
    case 0:
      return 'Победителей нет';
    case 1:
      return `Победил: ${cleaned[0]}`;
    default:
      return `Победили: ${cleaned.join(', ')}`;
  }
}

function formatShareDate(date) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function shareText(
  players,
  winnerCount,
  zeroBasedWinnerIndices,
  date = new Date(),
  winnerLabels = null
) {
  const lines = ['Жеребьёвка — LotDraw'];

  if (date) {
    lines.push(formatShareDate(date));
  }

  lines.push(drawSummary(players, winnerCount));
  lines.push(
    winnerLabels?.length
      ? winnerOutcomeTextFromLabels(winnerLabels)
      : winnerOutcomeText(zeroBasedWinnerIndices)
  );
  return lines.join('\n');
}

export function coinShareText(side, date = new Date()) {
  const lines = ['Монетка — LotDraw'];
  if (date) lines.push(formatShareDate(date));
  lines.push(coinSummary());
  lines.push(coinOutcomeText(side));
  return lines.join('\n');
}

export function wheelShareText(label, optionCount, date = new Date()) {
  const lines = ['Колесо — LotDraw'];
  if (date) lines.push(formatShareDate(date));
  lines.push(wheelSummary(optionCount));
  lines.push(wheelOutcomeText(label));
  return lines.join('\n');
}

export function diceShareText(values, date = new Date()) {
  const safeValues = Array.isArray(values) ? values : [];
  const lines = ['Кубики — LotDraw'];
  if (date) lines.push(formatShareDate(date));
  lines.push(diceSummary(safeValues.length));
  lines.push(diceOutcomeText(safeValues));
  return lines.join('\n');
}

export function shareTextForRecord(record) {
  const type = recordType(record);
  const date = new Date(record?.date || Date.now());

  if (type === 'coin') return coinShareText(record?.side, date);
  if (type === 'wheel') {
    return wheelShareText(record?.label, record?.optionCount ?? 0, date);
  }
  if (type === 'dice') return diceShareText(record?.values, date);

  const lines = ['Жеребьёвка — LotDraw'];
  lines.push(formatShareDate(date));
  lines.push(drawSummary(record?.totalPlayers ?? 0, record?.winnerCount ?? 0));
  lines.push(
    record?.winnerLabels?.length
      ? winnerOutcomeTextFromLabels(record.winnerLabels)
      : winnerOutcomeTextFromDisplayNumbers(record?.winnerIndices)
  );
  return lines.join('\n');
}

export function historySummaryForRecord(record) {
  const type = recordType(record);
  if (type === 'coin') return coinSummary();
  if (type === 'wheel') return wheelSummary(record?.optionCount ?? 0);
  if (type === 'dice') return diceSummary(record?.values?.length ?? 0);
  return drawSummary(record?.totalPlayers ?? 0, record?.winnerCount ?? 0);
}

export function historyOutcomeForRecord(record) {
  const type = recordType(record);
  if (type === 'coin') return coinOutcomeText(record?.side);
  if (type === 'wheel') return wheelOutcomeText(record?.label);
  if (type === 'dice') return diceOutcomeText(record?.values);
  if (record?.winnerLabels?.length) return winnerOutcomeTextFromLabels(record.winnerLabels);
  return winnerOutcomeTextFromDisplayNumbers(record?.winnerIndices);
}
