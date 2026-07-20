import { Link } from 'react-router-dom';
import { ArchiveBoxIcon, GearIcon } from '../components/icons/ToolbarIcons.jsx';

function CardsModeIcon() {
  return (
    <svg className="mode-tile__icon-svg" viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
      <rect
        x="10"
        y="14"
        width="28"
        height="38"
        rx="6"
        fill="currentColor"
        opacity="0.28"
        transform="rotate(-8 24 33)"
      />
      <rect x="22" y="10" width="28" height="38" rx="6" fill="currentColor" />
      <text
        x="36"
        y="35"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fill="var(--primary-bg)"
        fontFamily="system-ui, sans-serif"
      >
        1
      </text>
    </svg>
  );
}

function CoinModeIcon() {
  return (
    <svg className="mode-tile__icon-svg" viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
      <circle cx="32" cy="32" r="24" fill="currentColor" opacity="0.2" />
      <circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="32" cy="32" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      <text
        x="32"
        y="38"
        textAnchor="middle"
        fontSize="18"
        fontWeight="700"
        fill="currentColor"
        fontFamily="system-ui, sans-serif"
      >
        ₽
      </text>
    </svg>
  );
}

const MODES = [
  {
    to: '/lot',
    title: 'Жребий',
    subtitle: 'Карточки и победители',
    Icon: CardsModeIcon,
    tone: 'lot',
  },
  {
    to: '/coin',
    title: 'Монетка',
    subtitle: 'Орёл или решка',
    Icon: CoinModeIcon,
    tone: 'coin',
  },
];

export default function ModeSelectPage() {
  return (
    <div className="page mode-select-page fade-in">
      <header className="home-header">
        <div className="home-header__spacer" aria-hidden="true" />
        <div className="mode-select-brand">
          <p className="mode-select-brand__name">LotDraw</p>
          <h1 className="mode-select-brand__title">Что бросаем?</h1>
        </div>
        <nav className="home-toolbar" aria-label="Дополнительные разделы">
          <Link to="/settings" className="home-toolbar__button" aria-label="Настройки">
            <GearIcon />
          </Link>
          <Link to="/history" className="home-toolbar__button" aria-label="История">
            <ArchiveBoxIcon />
          </Link>
        </nav>
      </header>

      <div className="mode-select-tiles">
        {MODES.map(({ to, title, subtitle, Icon, tone }, index) => (
          <Link
            key={to}
            to={to}
            className={`mode-tile mode-tile--${tone}`}
            style={{ '--tile-delay': `${index * 80}ms` }}
          >
            <span className="mode-tile__icon">
              <Icon />
            </span>
            <span className="mode-tile__text">
              <span className="mode-tile__title">{title}</span>
              <span className="mode-tile__subtitle">{subtitle}</span>
            </span>
            <span className="mode-tile__chevron" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
