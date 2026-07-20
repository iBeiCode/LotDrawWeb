import './styles/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { initTelegramWebApp } from './utils/telegram.js';

initTelegramWebApp();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
