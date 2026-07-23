import { Link } from 'react-router-dom';
import { ArchiveBoxIcon, GearIcon } from './icons/ToolbarIcons.jsx';

export default function ModeToolbar() {
  return (
    <nav className="home-toolbar" aria-label="Дополнительные разделы">
      <Link to="/settings" className="home-toolbar__button" aria-label="Настройки">
        <GearIcon />
      </Link>
      <Link to="/history" className="home-toolbar__button" aria-label="История">
        <ArchiveBoxIcon />
      </Link>
    </nav>
  );
}
