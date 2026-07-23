import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModeToolbar from '../components/ModeToolbar.jsx';
import OptionListEditor from '../components/OptionListEditor.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { wheelShareText } from '../core/formatting.js';
import {
  MAX_WHEEL_OPTIONS,
  MIN_WHEEL_OPTIONS,
  WHEEL_SPIN_MS,
} from '../core/wheelEngine.js';
import { useOptionList } from '../hooks/useOptionList.js';
import { useWheel } from '../hooks/useWheel.js';
import { shareTextContent } from '../utils/share.js';

function WheelVisual({ options, colors, rotation, isAnimating, disabled }) {
  const segment = 360 / Math.max(options.length, 1);
  const showLabels = options.length <= 16;
  const gradient = options
    .map((_, index) => {
      const start = index * segment;
      const end = (index + 1) * segment;
      return `${colors[index]} ${start}deg ${end}deg`;
    })
    .join(', ');

  const transition = isAnimating
    ? `transform ${WHEEL_SPIN_MS}ms cubic-bezier(0.12, 0.75, 0.12, 1)`
    : 'none';

  const labelRadius = options.length > 10 ? 108 : 118;
  const labelSize = options.length > 10 ? '0.625rem' : '0.6875rem';

  return (
    <div className={`fortune-wheel${disabled ? ' fortune-wheel--disabled' : ''}`}>
      <div className="fortune-wheel__pointer" aria-hidden="true" />
      <div
        className="fortune-wheel__disk"
        style={{
          background: `conic-gradient(from 0deg, ${gradient})`,
          transform: `rotate(${rotation}deg)`,
          transition,
        }}
      >
        {showLabels &&
          options.map((label, index) => {
            const angle = index * segment + segment / 2;
            return (
              <span
                key={`${label}-${index}`}
                className="fortune-wheel__label"
                style={{
                  transform: `rotate(${angle}deg) translateY(-${labelRadius}px) rotate(${-angle}deg)`,
                  fontSize: labelSize,
                }}
              >
                <span className="fortune-wheel__label-text">{label}</span>
              </span>
            );
          })}
      </div>
      <div className="fortune-wheel__hub" aria-hidden="true" />
    </div>
  );
}

export default function WheelPage() {
  const navigate = useNavigate();
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  const optionList = useOptionList({ minItems: MIN_WHEEL_OPTIONS, scope: 'wheel' });

  const options = useMemo(
    () => optionList.items.slice(0, MAX_WHEEL_OPTIONS),
    [optionList.items]
  );

  const {
    phase,
    rotation,
    isAnimating,
    isSpinning,
    showResult,
    resultLabel,
    colors,
    spin,
  } = useWheel(options);

  const canSpin = options.length >= MIN_WHEEL_OPTIONS && !isSpinning;
  const needsSetup = options.length < MIN_WHEEL_OPTIONS;

  const shareContent = useMemo(
    () => (resultLabel ? wheelShareText(resultLabel, options.length) : ''),
    [resultLabel, options.length]
  );

  const handleSaveList = () => {
    const saved = optionList.saveCurrent();
    if (!saved) return;
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 1600);
  };

  const handleShare = async () => {
    if (!shareContent) return;
    const result = await shareTextContent(shareContent);
    if (result === 'shared' || result === 'copied') {
      setShareFeedback(result === 'copied' ? 'Скопировано' : 'Отправлено');
    } else if (result === 'failed') {
      setShareFeedback('Не удалось скопировать');
    } else {
      return;
    }
    setTimeout(() => setShareFeedback(''), 2000);
  };

  const statusText = (() => {
    if (isSpinning) return 'Крутится…';
    if (showResult) return resultLabel;
    if (needsSetup) return 'Добавьте минимум 2 варианта';
    return 'Готово к запуску';
  })();

  return (
    <div className="page wheel-page fade-in">
      <header className="mode-page-header">
        <button type="button" className="home-header__back" onClick={() => navigate('/')} aria-label="К выбору режима">
          ←
        </button>
        <div className="coin-header mode-page-header__center">
          <h1 className="coin-header__title">Колесо</h1>
          <p className="coin-header__hint">Крутите — и пусть выберет судьба</p>
        </div>
        <ModeToolbar />
      </header>

      <div className="wheel-page__body">
        {options.length >= MIN_WHEEL_OPTIONS ? (
          <button
            type="button"
            className="wheel-hitbox"
            onClick={spin}
            disabled={!canSpin}
            aria-label={isSpinning ? 'Колесо крутится' : 'Крутить колесо'}
          >
            <WheelVisual
              options={options}
              colors={colors}
              rotation={rotation}
              isAnimating={isAnimating}
              disabled={isSpinning}
            />
          </button>
        ) : (
          <div className="wheel-placeholder">
            <p>Добавьте хотя бы 2 варианта</p>
          </div>
        )}

        <p
          className={`coin-status${showResult ? ' coin-status--result' : ''}${isSpinning ? ' coin-status--busy' : ''}`}
          aria-live="polite"
        >
          {statusText}
        </p>

        <details className="wheel-setup" open={needsSetup || undefined}>
          <summary className="wheel-setup__summary">Список вариантов</summary>
          <OptionListEditor
            text={optionList.text}
            onTextChange={optionList.setText}
            title={optionList.title}
            onTitleChange={optionList.setTitle}
            items={optionList.items}
            minItems={MIN_WHEEL_OPTIONS}
            lists={optionList.lists}
            selectedListId={optionList.selectedListId}
            onSelectList={optionList.selectList}
            onSaveList={handleSaveList}
            onDeleteList={optionList.removeList}
            placeholder={'Пицца\nСуши\nБургер\nПаста'}
          />
          {optionList.items.length > MAX_WHEEL_OPTIONS && (
            <p className="form-error">
              На колесе будут первые {MAX_WHEEL_OPTIONS} вариантов.
            </p>
          )}
          {saveFeedback && (
            <p className="list-editor__toast" role="status">
              Список сохранён
            </p>
          )}
        </details>
      </div>

      <footer className="coin-footer">
        <PrimaryButton onClick={spin} disabled={!canSpin}>
          {phase === 'idle' ? 'Крутить' : 'Ещё раз'}
        </PrimaryButton>
        {needsSetup && (
          <p className="footer-hint" role="status">
            Добавьте минимум 2 варианта
          </p>
        )}
        {showResult && (
          <button type="button" className="dialog__link" onClick={handleShare}>
            {shareFeedback || 'Поделиться результатом'}
          </button>
        )}
      </footer>
    </div>
  );
}
