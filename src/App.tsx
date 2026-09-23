import { useState } from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { CurrentWeatherCard } from './components/weather/CurrentWeatherCard';
import { HourlyForecast } from './components/weather/HourlyForecast';
import { DailyForecast } from './components/weather/DailyForecast';
import { WeatherDetailsGrid } from './components/weather/WeatherDetailsGrid';
import { NearbyRainCard } from './components/rain/NearbyRainCard';
import { RainMap } from './components/rain/RainMap';
import { RainTimeline } from './components/rain/RainTimeline';
import { VoiceAlertCard } from './components/rain/VoiceAlertCard';
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
