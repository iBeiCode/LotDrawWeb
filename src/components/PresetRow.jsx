import PresetChipButton from './PresetChipButton.jsx';

export default function PresetRow({ title, values, selected, maxValue, onSelect }) {
  const availableValues = values.filter(
    (value) => value >= 2 && value <= maxValue
  );

  if (availableValues.length === 0) return null;

  return (
    <div className="preset-row">
      <p className="preset-row__title">{title}</p>
      <div className="preset-row__chips">
        {availableValues.map((value) => (
          <PresetChipButton
            key={value}
            title={String(value)}
            isSelected={selected === value}
            onClick={() => onSelect(value)}
          />
        ))}
      </div>
    </div>
  );
}
