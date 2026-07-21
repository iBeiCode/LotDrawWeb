import { useState } from 'react';
import PrimaryButton from './PrimaryButton.jsx';
import { setHasSeenOnboarding } from '../storage/appSettings.js';

const PAGES = [
  {
    icon: 'people',
    title: 'Выберите участников',
    subtitle:
      'По числу на колёсах или по списку имён — затем укажите, сколько победителей нужно.',
  },
  {
    icon: 'cards',
    title: 'Открывайте карточки',
    subtitle:
      'Нажимайте на карточки одну за другой, чтобы узнать результат каждого варианта.',
  },
  {
    icon: 'result',
    title: 'Смотрите итог',
    subtitle:
      'В конце увидите победителей. Можно поделиться результатом или сохранить его в истории.',
  },
];

function OnboardingIcon({ type }) {
  const props = {
    className: 'onboarding__icon-svg',
    viewBox: '0 0 24 24',
    width: 56,
    height: 56,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  if (type === 'people') {
    return (
      <svg {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (type === 'cards') {
    return (
      <svg {...props}>
        <rect x="3" y="7" width="14" height="12" rx="2" />
        <path d="M7 5h14a2 2 0 0 1 2 2v12" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function Onboarding({ onDismiss }) {
  const [page, setPage] = useState(0);
  const isLastPage = page === PAGES.length - 1;
  const current = PAGES[page];

  const dismiss = () => {
    setHasSeenOnboarding();
    onDismiss();
  };

  const handlePrimary = () => {
    if (isLastPage) {
      dismiss();
      return;
    }
    setPage((prev) => prev + 1);
  };

  return (
    <div
      className="onboarding-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="onboarding">
        <div className="onboarding__slide">
          <div className="onboarding__icon">
            <OnboardingIcon type={current.icon} />
          </div>
          <h2 id="onboarding-title" className="onboarding__title">
            {current.title}
          </h2>
          <p className="onboarding__subtitle">{current.subtitle}</p>
        </div>

        <div className="onboarding__dots" role="tablist" aria-label="Шаги онбординга">
          {PAGES.map((_, index) => (
            <span
              key={index}
              className={`onboarding__dot${index === page ? ' onboarding__dot--active' : ''}`}
              role="tab"
              aria-selected={index === page}
              aria-label={`Шаг ${index + 1}`}
            />
          ))}
        </div>

        <PrimaryButton className="onboarding__primary" onClick={handlePrimary}>
          {isLastPage ? 'Начать' : 'Далее'}
        </PrimaryButton>

        {!isLastPage && (
          <button type="button" className="onboarding__skip" onClick={dismiss}>
            Пропустить
          </button>
        )}
      </div>
    </div>
  );
}
