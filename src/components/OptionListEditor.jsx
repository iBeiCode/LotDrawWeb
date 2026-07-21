export default function OptionListEditor({
  text,
  onTextChange,
  title,
  onTitleChange,
  items,
  minItems = 2,
  lists = [],
  selectedListId,
  onSelectList,
  onSaveList,
  onDeleteList,
  placeholder = 'По одному варианту на строку…',
  showSave = true,
}) {
  const countLabel =
    items.length === 0
      ? 'Пока пусто'
      : items.length < minItems
        ? `Ещё нужно минимум ${minItems - items.length}`
        : `${items.length} в списке`;

  return (
    <div className="list-editor">
      {lists.length > 0 && (
        <div className="list-editor__saved">
          <p className="list-editor__label">Сохранённые</p>
          <div className="list-editor__chips" role="list">
            {lists.map((list) => (
              <div key={list.id} className="list-editor__chip-wrap" role="listitem">
                <button
                  type="button"
                  className={`list-editor__chip${selectedListId === list.id ? ' list-editor__chip--active' : ''}`}
                  onClick={() => onSelectList?.(list.id)}
                >
                  {list.title}
                  <span className="list-editor__chip-count">{list.items.length}</span>
                </button>
                {onDeleteList && (
                  <button
                    type="button"
                    className="list-editor__chip-delete"
                    aria-label={`Удалить список ${list.title}`}
                    onClick={() => onDeleteList(list.id)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showSave && (
        <label className="list-editor__field">
          <span className="list-editor__label">Название списка</span>
          <input
            className="list-editor__input"
            type="text"
            value={title}
            onChange={(event) => onTitleChange?.(event.target.value)}
            placeholder="Например: Команда"
            maxLength={48}
          />
        </label>
      )}

      <label className="list-editor__field">
        <span className="list-editor__label">Варианты</span>
        <textarea
          className="list-editor__textarea"
          value={text}
          onChange={(event) => onTextChange?.(event.target.value)}
          placeholder={placeholder}
          rows={7}
          spellCheck
        />
      </label>

      <div className="list-editor__meta">
        <span
          className={`list-editor__count${items.length >= minItems ? ' list-editor__count--ok' : ''}`}
        >
          {countLabel}
        </span>
        {showSave && (
          <button
            type="button"
            className="list-editor__save-link"
            onClick={onSaveList}
            disabled={items.length === 0}
          >
            Сохранить список
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className="list-editor__preview" aria-label="Превью списка">
          {items.slice(0, 12).map((item) => (
            <span key={item} className="list-editor__preview-item">
              {item}
            </span>
          ))}
          {items.length > 12 && (
            <span className="list-editor__preview-more">+{items.length - 12}</span>
          )}
        </div>
      )}
    </div>
  );
}
