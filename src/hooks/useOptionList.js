import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteList,
  getLastUsedListId,
  getListById,
  itemsToText,
  loadAllLists,
  loadListDraft,
  parseListItems,
  saveList,
  saveListDraft,
  setLastUsedListId,
} from '../storage/lists.js';

function readInitialText(scope, persistDraft) {
  const draft = persistDraft ? loadListDraft(scope) : '';
  if (draft.trim()) return draft;

  const lastId = getLastUsedListId(scope);
  const last = lastId ? getListById(lastId) : null;
  if (last?.items?.length) return itemsToText(last.items);
  return '';
}

function readInitialTitle(scope, persistDraft) {
  const draft = persistDraft ? loadListDraft(scope) : '';
  if (draft.trim()) return '';

  const lastId = getLastUsedListId(scope);
  const last = lastId ? getListById(lastId) : null;
  return last?.title ?? '';
}

function readInitialSelectedId(scope, persistDraft) {
  const draft = persistDraft ? loadListDraft(scope) : '';
  if (draft.trim()) return null;
  return getLastUsedListId(scope);
}

export function useOptionList({
  minItems = 2,
  persistDraft = true,
  scope = 'shared',
} = {}) {
  const [lists, setLists] = useState(() => loadAllLists());
  const [selectedListId, setSelectedListId] = useState(() =>
    readInitialSelectedId(scope, persistDraft)
  );
  const [text, setText] = useState(() => readInitialText(scope, persistDraft));
  const [title, setTitle] = useState(() => readInitialTitle(scope, persistDraft));

  const items = useMemo(() => parseListItems(text), [text]);
  const isValid = items.length >= minItems;

  const reloadLists = useCallback(() => {
    setLists(loadAllLists());
  }, []);

  useEffect(() => {
    if (!persistDraft) return;
    saveListDraft(text, scope);
  }, [text, persistDraft, scope]);

  const selectList = useCallback(
    (id) => {
      const list = getListById(id);
      if (!list) return;
      setSelectedListId(list.id);
      setLastUsedListId(list.id, scope);
      setText(itemsToText(list.items));
      setTitle(list.title);
    },
    [scope]
  );

  const clearSelection = useCallback(() => {
    setSelectedListId(null);
    setLastUsedListId(null, scope);
  }, [scope]);

  const handleTextChange = useCallback(
    (next) => {
      setText(next);
      setSelectedListId(null);
      setLastUsedListId(null, scope);
    },
    [scope]
  );

  const saveCurrent = useCallback(() => {
    if (items.length === 0) return null;
    const saved = saveList({
      id: selectedListId ?? undefined,
      title: title || undefined,
      items,
    });
    setSelectedListId(saved.id);
    setLastUsedListId(saved.id, scope);
    setTitle(saved.title);
    reloadLists();
    return saved;
  }, [items, selectedListId, title, reloadLists, scope]);

  const removeList = useCallback(
    (id) => {
      deleteList(id);
      if (selectedListId === id) {
        setSelectedListId(null);
        setLastUsedListId(null, scope);
      }
      reloadLists();
    },
    [selectedListId, reloadLists, scope]
  );

  return {
    text,
    setText: handleTextChange,
    title,
    setTitle,
    items,
    isValid,
    lists,
    selectedListId,
    selectList,
    clearSelection,
    saveCurrent,
    removeList,
    reloadLists,
  };
}
