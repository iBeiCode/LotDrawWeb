const STORAGE_KEY = 'lotDrawLists';

function getStorage() {
  try {
    return localStorage;
  } catch {
    return null;
  }
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    try {
      return globalThis.crypto.randomUUID();
    } catch {
      // insecure context
    }
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function scopeKey(base, scope) {
  return scope ? `${base}:${scope}` : base;
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

function persist(lists) {
  try {
    getStorage()?.setItem(STORAGE_KEY, JSON.stringify(lists));
  } catch {
    // localStorage unavailable
  }
}

export function parseListItems(text) {
  if (!text || typeof text !== 'string') return [];
  const seen = new Set();
  const items = [];

  for (const line of text.split(/\r?\n/)) {
    const value = line.trim().replace(/\s+/g, ' ');
    if (!value) continue;
    const key = value.toLocaleLowerCase('ru');
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(value);
  }

  return items;
}

export function itemsToText(items) {
  return (items ?? []).join('\n');
}

export function loadAllLists() {
  return loadRaw().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getListById(id) {
  return loadRaw().find((list) => list.id === id) ?? null;
}

export function saveList({ id, title, items }) {
  const lists = loadRaw();
  const cleanedItems = (items ?? [])
    .map((item) => String(item).trim().replace(/\s+/g, ' '))
    .filter(Boolean);
  const now = new Date().toISOString();
  const safeTitle = (title ?? '').trim() || `Список (${cleanedItems.length})`;

  if (id) {
    const index = lists.findIndex((list) => list.id === id);
    if (index >= 0) {
      lists[index] = {
        ...lists[index],
        title: safeTitle,
        items: cleanedItems,
        updatedAt: now,
      };
      persist(lists);
      return lists[index];
    }
  }

  const list = {
    id: createId(),
    title: safeTitle,
    items: cleanedItems,
    createdAt: now,
    updatedAt: now,
  };
  lists.unshift(list);
  persist(lists);
  return list;
}

export function deleteList(id) {
  persist(loadRaw().filter((list) => list.id !== id));
  for (const scope of [undefined, 'shared', 'lot', 'wheel']) {
    if (getLastUsedListId(scope) === id) {
      setLastUsedListId(null, scope);
    }
  }
}

export function getLastUsedListId(scope) {
  try {
    return getStorage()?.getItem(scopeKey('lotDrawLastListId', scope)) ?? null;
  } catch {
    return null;
  }
}

export function setLastUsedListId(id, scope) {
  try {
    const storage = getStorage();
    if (!storage) return;
    const key = scopeKey('lotDrawLastListId', scope);
    if (!id) storage.removeItem(key);
    else storage.setItem(key, id);
  } catch {
    // ignore
  }
}

export function loadListDraft(scope) {
  try {
    const raw = getStorage()?.getItem(scopeKey('lotDrawListDraft', scope));
    if (!raw) return '';
    return String(raw);
  } catch {
    return '';
  }
}

export function saveListDraft(text, scope) {
  try {
    getStorage()?.setItem(scopeKey('lotDrawListDraft', scope), text ?? '');
  } catch {
    // ignore
  }
}
