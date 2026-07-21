import { useNavigate } from 'react-router-dom';
import ScreenHeader from '../components/ScreenHeader.jsx';
import SettingsPickerRow from '../components/SettingsPickerRow.jsx';
import SettingsToggleRow from '../components/SettingsToggleRow.jsx';
import { useAppSettings } from '../hooks/useAppSettings.jsx';
import {
  APP_THEME_LABELS,
  APP_THEMES,
  MAX_PARTICIPANTS_OPTIONS,
} from '../storage/appSettings.js';

const THEME_OPTIONS = [APP_THEMES.system, APP_THEMES.light, APP_THEMES.dark];

export default function SettingsPage() {
  const navigate = useNavigate();
  const {
    isSaveResults,
    rememberLastValues,
    appTheme,
    maxParticipants,
    setIsSaveResults,
    setRememberLastValues,
    setAppTheme,
    setMaxParticipants,
  } = useAppSettings();

  return (
    <div className="page settings-page">
      <button type="button" className="back-button" onClick={() => navigate(-1)}>
        ← Назад
      </button>

      <ScreenHeader title="Настройки" />

      <div className="settings-list">
        <SettingsToggleRow
          title="Сохранять историю жеребьёвок"
          subtitle="Записи появятся в разделе «История»"
          checked={isSaveResults}
          onChange={setIsSaveResults}
        />
        <div className="settings-divider" />

        <SettingsToggleRow
          title="Запоминать участников и победителей"
          subtitle="Восстанавливает последние значения на главном экране"
          checked={rememberLastValues}
          onChange={setRememberLastValues}
        />
        <div className="settings-divider" />

        <SettingsPickerRow
          title="Тема оформления"
          subtitle="Внешний вид приложения"
          value={appTheme}
          options={THEME_OPTIONS}
          getLabel={(theme) => APP_THEME_LABELS[theme]}
          onChange={setAppTheme}
        />
        <div className="settings-divider" />

        <SettingsPickerRow
          title="Максимум участников"
          subtitle="Ограничивает выбор на главном экране"
          value={maxParticipants}
          options={MAX_PARTICIPANTS_OPTIONS}
          getLabel={(value) => String(value)}
          onChange={setMaxParticipants}
        />
      </div>
    </div>
  );
}
