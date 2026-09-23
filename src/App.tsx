import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { ForecastPage } from './pages/ForecastPage';
import { SettingsPage } from './pages/SettingsPage';
import { RainAlertService } from './services/RainAlertService';

function App() {
  return (
    <BrowserRouter>
      <RainAlertService />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/forecast" element={<ForecastPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
