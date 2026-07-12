export default function PrimaryButton({ children, onClick, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`primary-button ${className}`.trim()}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
