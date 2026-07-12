import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DrawPage from './pages/DrawPage.jsx';
import HomePage from './pages/HomePage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/draw" element={<DrawPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
