export default function SettingsToggleRow({ title, subtitle, checked, onChange }) {
  return (
    <label className="settings-row settings-row--toggle">
      <span className="settings-row__header">
        <span className="settings-row__title">{title}</span>
        <input
          type="checkbox"
          className="settings-row__toggle"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
      </span>
      {subtitle && <span className="settings-row__subtitle">{subtitle}</span>}
    </label>
  );
}
