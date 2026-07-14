import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppSettingsProvider } from './hooks/useAppSettings.jsx';
import DrawPage from './pages/DrawPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import HomePage from './pages/HomePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

export default function App() {
  return (
    <AppSettingsProvider>
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/draw" element={<DrawPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppSettingsProvider>
  );
}
