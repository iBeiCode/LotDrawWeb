export default function PresetChipButton({ title, isSelected, onClick }) {
  return (
    <button
      type="button"
      className={`preset-chip ${isSelected ? 'preset-chip--selected' : ''}`}
      onClick={onClick}
    >
      {title}
    </button>
  );
}
