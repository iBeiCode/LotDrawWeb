export default function ScreenHeader({ title }) {
  return (
    <header className="screen-header">
      <h1 className="screen-header__title">{title}</h1>
      <div className="screen-header__divider" />
    </header>
  );
}
