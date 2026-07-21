import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppSettingsProvider } from './hooks/useAppSettings.jsx';
import CoinFlipPage from './pages/CoinFlipPage.jsx';
import DicePage from './pages/DicePage.jsx';
import DrawPage from './pages/DrawPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ModeSelectPage from './pages/ModeSelectPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import WheelPage from './pages/WheelPage.jsx';

export default function App() {
  return (
    <AppSettingsProvider>
      <HashRouter>
        <div className="app">
          <Routes>
            <Route path="/" element={<ModeSelectPage />} />
            <Route path="/lot" element={<HomePage />} />
            <Route path="/draw" element={<DrawPage />} />
            <Route path="/coin" element={<CoinFlipPage />} />
            <Route path="/wheel" element={<WheelPage />} />
            <Route path="/dice" element={<DicePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </div>
      </HashRouter>
    </AppSettingsProvider>
  );
}
