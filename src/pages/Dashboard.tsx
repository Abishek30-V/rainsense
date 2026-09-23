import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { CurrentWeatherCard } from '../components/weather/CurrentWeatherCard';
import { HourlyForecast } from '../components/weather/HourlyForecast';
import { DailyForecast } from '../components/weather/DailyForecast';
import { WeatherDetailsGrid } from '../components/weather/WeatherDetailsGrid';
import { NearbyRainCard } from '../components/rain/NearbyRainCard';
import { RainMap } from '../components/rain/RainMap';
import { RainTimeline } from '../components/rain/RainTimeline';
import { VoiceAlertCard } from '../components/rain/VoiceAlertCard';
import { FullMapModal } from '../components/rain/FullMapModal';

export function Dashboard() {
  const [isFullMapOpen, setIsFullMapOpen] = useState(false);

  return (
    <>
      <DashboardLayout onOpenFullMap={() => setIsFullMapOpen(true)}>
        <div className="w-full flex-1 flex flex-col xl:flex-row gap-6">

          {/* Left Column — Main Weather */}
          <div id="home" className="w-full xl:w-8/12 flex flex-col gap-5">
            <CurrentWeatherCard />

            {/* Rain Near You — visible on mobile/tablet, hidden on xl */}
            <div id="alerts" className="xl:hidden">
              <NearbyRainCard onViewMap={() => setIsFullMapOpen(true)} />
            </div>

            <div id="forecast">
              <HourlyForecast />
            </div>

            {/* Map + right-side rain cards for tablet — hidden on xl */}
            <div id="map" className="xl:hidden flex flex-col gap-5">
              <RainMap onViewFullMap={() => setIsFullMapOpen(true)} />
              <RainTimeline />
              <VoiceAlertCard />
            </div>

            <DailyForecast />
            <WeatherDetailsGrid />
          </div>

          {/* Right Column — Rain Intelligence, xl+ only */}
          <div className="hidden xl:flex w-full xl:w-4/12 flex-col gap-5">
            <NearbyRainCard onViewMap={() => setIsFullMapOpen(true)} />
            <RainTimeline />
            <VoiceAlertCard />
          </div>

        </div>

        {/* Full-width Rain Map — xl+ only, below main columns */}
        <div className="hidden xl:block w-full">
          <RainMap onViewFullMap={() => setIsFullMapOpen(true)} />
        </div>

      </DashboardLayout>

      {/* Full Screen Map Modal */}
      <FullMapModal isOpen={isFullMapOpen} onClose={() => setIsFullMapOpen(false)} />
    </>
  );
}
