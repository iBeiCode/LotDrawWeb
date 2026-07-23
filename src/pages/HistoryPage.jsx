import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ScreenHeader from '../components/ScreenHeader.jsx';
import {
  historyOutcomeForRecord,
  historySummaryForRecord,
  historyTypeLabel,
  shareTextForRecord,
} from '../core/formatting.js';
import { useAppSettings } from '../hooks/useAppSettings.jsx';
import { clearAll, deleteById, groupedByDate, recordType } from '../storage/drawHistory.js';
import { shareTextContent } from '../utils/share.js';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' });
const timeFormatter = new Intl.DateTimeFormat('ru-RU', { timeStyle: 'short' });

function HistoryRecordRow({ record, onDelete, onShareFeedback }) {
  const handleShare = async () => {
    const result = await shareTextContent(shareTextForRecord(record));
    if (result === 'shared' || result === 'copied') {
      onShareFeedback(result === 'copied' ? 'Скопировано' : 'Отправлено');
    } else if (result === 'failed') {
      onShareFeedback('Не удалось скопировать');
    }
  };

  return (
    <article className="history-record">
      <div className="history-record__content">
        <div className="history-record__meta">
          <h3 className="history-record__time">
            {timeFormatter.format(new Date(record.date))}
          </h3>
          <span className={`history-type history-type--${recordType(record)}`}>
            {historyTypeLabel(record)}
          </span>
        </div>
        <p className="history-record__summary">
          {historySummaryForRecord(record)}
        </p>
        <p className="history-record__outcome">
          {historyOutcomeForRecord(record)}
        </p>
      </div>
      <div className="history-record__actions">
        <button type="button" className="history-record__action" onClick={handleShare}>
          Поделиться
        </button>
        <button
          type="button"
          className="history-record__action history-record__action--danger"
          onClick={() => onDelete(record.id)}
        >
          Удалить
        </button>
      </div>
    </article>
  );
}

function DeleteRecordDialog({ onConfirm, onCancel }) {
  return (
    <div className="alert-backdrop" role="alertdialog" aria-modal="true" aria-labelledby="delete-record-title">
      <div className="alert">
        <h2 id="delete-record-title" className="alert__title">
          Удалить запись?
        </h2>
        <p className="alert__message">
          Эта запись будет удалена из истории без возможности восстановления.
        </p>
        <div className="alert__actions">
          <button type="button" className="alert__button alert__button--secondary" onClick={onCancel}>
            Отмена
          </button>
          <button type="button" className="alert__button alert__button--primary" onClick={onConfirm}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

function ClearHistoryDialog({ onConfirm, onCancel }) {
  return (
    <div className="alert-backdrop" role="alertdialog" aria-modal="true" aria-labelledby="clear-history-title">
      <div className="alert">
        <h2 id="clear-history-title" className="alert__title">
          Удалить всю историю?
        </h2>
        <p className="alert__message">
          Все сохранённые результаты будут удалены без возможности восстановления.
        </p>
        <div className="alert__actions">
          <button type="button" className="alert__button alert__button--secondary" onClick={onCancel}>
            Отмена
          </button>
          <button type="button" className="alert__button alert__button--primary" onClick={onConfirm}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { isSaveResults } = useAppSettings();
  const [groups, setGroups] = useState(() => groupedByDate());
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [shareToast, setShareToast] = useState('');

  const reload = useCallback(() => {
    setGroups(groupedByDate());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleDelete = (id) => {
    setPendingDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (!pendingDeleteId) return;
    deleteById(pendingDeleteId);
    setPendingDeleteId(null);
    reload();
  };

  const handleClearAll = () => {
    clearAll();
    setShowClearDialog(false);
    reload();
  };

  const handleShareFeedback = (message) => {
    setShareToast(message);
    setTimeout(() => setShareToast(''), 2000);
  };

  const isEmpty = groups.length === 0;

  return (
    <div className="page history-page">
      <div className="history-page__top">
        <button type="button" className="back-button" onClick={() => navigate('/')}>
          ← Назад
        </button>
        {!isEmpty && (
          <button
            type="button"
            className="history-page__clear"
            onClick={() => setShowClearDialog(true)}
          >
            Очистить
          </button>
        )}
      </div>

      <ScreenHeader title="История" />

      {shareToast && (
        <p className="history-page__toast" role="status">
          {shareToast}
        </p>
      )}

      {isEmpty ? (
        <div className="history-empty">
          {isSaveResults ? (
            <>
              <p className="history-empty__title">Пока нет результатов</p>
              <p className="history-empty__hint">
                Сыграйте в любом режиме — результат появится здесь
              </p>
              <Link to="/" className="history-empty__link">
                К режимам
              </Link>
            </>
          ) : (
            <>
              <p className="history-empty__title">История выключена</p>
              <p className="history-empty__hint">
                Включите «Сохранять историю» в настройках
              </p>
              <Link to="/settings" className="history-empty__link">
                Открыть настройки
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="history-list">
          {groups.map((group) => (
            <section key={group.date.toISOString()} className="history-section">
              <h2 className="history-section__title">
                {dateFormatter.format(group.date)}
              </h2>
              {group.records.map((record) => (
                <HistoryRecordRow
                  key={record.id}
                  record={record}
                  onDelete={handleDelete}
                  onShareFeedback={handleShareFeedback}
                />
              ))}
            </section>
          ))}
        </div>
      )}

      {showClearDialog && (
        <ClearHistoryDialog
          onConfirm={handleClearAll}
          onCancel={() => setShowClearDialog(false)}
        />
      )}

      {pendingDeleteId && (
        <DeleteRecordDialog
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </div>
  );
}
