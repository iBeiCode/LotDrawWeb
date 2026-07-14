export default function SettingsPickerRow({
  title,
  subtitle,
  value,
  options,
  getLabel,
  onChange,
}) {
  return (
    <div className="settings-row settings-row--picker">
      <span className="settings-row__title">{title}</span>
      {subtitle && <span className="settings-row__subtitle">{subtitle}</span>}
      <div className="settings-segmented" role="group" aria-label={title}>
        {options.map((option) => {
          const label = getLabel(option);
          const selected = option === value;

          return (
            <button
              key={String(option)}
              type="button"
              className={`settings-segmented__option${selected ? ' settings-segmented__option--selected' : ''}`}
              aria-pressed={selected}
              onClick={() => onChange(option)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
