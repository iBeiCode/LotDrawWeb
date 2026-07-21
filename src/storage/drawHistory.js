const STORAGE_KEY = 'lotDrawHistory';

function getStorage() {
  try {
    return localStorage;
  } catch {
    return null;
  }
}

function loadRaw() {
  const storage = getStorage();
  if (!storage) return [];

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(records) {
  try {
    getStorage()?.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // localStorage unavailable
  }
}

export function save(record) {
  const records = loadRaw();
  records.unshift(record);
  persist(records);
}

export function loadAll() {
  return loadRaw();
}

export function deleteById(id) {
  persist(loadRaw().filter((record) => record.id !== id));
}

export function clearAll() {
  try {
    getStorage()?.removeItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable
  }
}

export function groupedByDate() {
  const grouped = new Map();

  for (const record of loadRaw()) {
    const date = new Date(record.date);
    const dayKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();

    if (!grouped.has(dayKey)) {
      grouped.set(dayKey, { date: new Date(dayKey), records: [] });
    }

    grouped.get(dayKey).records.push(record);
  }

  return [...grouped.values()]
    .map((group) => ({
      ...group,
      records: group.records.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

function createRecordId() {
  if (globalThis.crypto?.randomUUID) {
    try {
      return globalThis.crypto.randomUUID();
    } catch {
      // insecure context (e.g. http://LAN-IP on iPhone)
    }
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function createRecord({
  type = 'draw',
  totalPlayers,
  winnerCount,
  winnerIndices,
  winnerLabels,
  side,
  label,
  optionCount,
  values,
}) {
  const base = {
    id: createRecordId(),
    date: new Date().toISOString(),
    type,
  };

  if (type === 'coin') {
    return { ...base, side };
  }

  if (type === 'wheel') {
    return { ...base, label, optionCount };
  }

  if (type === 'dice') {
    return { ...base, values };
  }

  return {
    ...base,
    totalPlayers,
    winnerCount,
    winnerIndices,
    ...(winnerLabels?.length ? { winnerLabels } : {}),
  };
}

export function recordType(record) {
  if (record?.type === 'coin') return 'coin';
  if (record?.type === 'wheel') return 'wheel';
  if (record?.type === 'dice') return 'dice';
  return 'draw';
}
