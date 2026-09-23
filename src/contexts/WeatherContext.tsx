import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import type { CurrentWeather, HourlyItem, DailyItem, TimelineItem } from '../lib/mockData';

interface WeatherContextState {
  weather: {
    current: CurrentWeather;
    hourly: HourlyItem[];
    daily: DailyItem[];
  } | null;
  timeline: TimelineItem[] | null;
  isLoading: boolean;
  error: string | null;
}

const WeatherContext = createContext<WeatherContextState | undefined>(undefined);

// WMO Weather code mapping
function mapWeatherCode(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: 'Clear', icon: 'sun' };
  if (code === 1 || code === 2) return { condition: 'Partly Cloudy', icon: 'cloud-sun' };
  if (code === 3) return { condition: 'Cloudy', icon: 'cloud' };
  if (code >= 45 && code <= 48) return { condition: 'Fog', icon: 'cloud' };
  if (code >= 51 && code <= 67) return { condition: 'Rain', icon: 'cloud-rain' };
  if (code >= 71 && code <= 77) return { condition: 'Snow', icon: 'cloud-rain' };
  if (code >= 80 && code <= 82) return { condition: 'Showers', icon: 'cloud-rain' };
  if (code >= 95) return { condition: 'Thunderstorm', icon: 'cloud-rain' };
  return { condition: 'Unknown', icon: 'cloud' };
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours} ${ampm}`;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

function getDayName(isoString: string, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const date = new Date(isoString);
  return date.toLocaleString('en-US', { weekday: 'short' });
}



function generateSyntheticTimeline(hourlyProbs: number[]): TimelineItem[] {
  const p = hourlyProbs[0] || 0;
  return [
    { time: 'NOW', label: 'Nearby', labelTa: 'அருகில்', intensity: p * 0.2, isCurrent: true },
    { time: '10 min', label: 'Approaching', labelTa: 'நெருங்குகிறது', intensity: p * 0.5 },
    { time: '20 min', label: 'Possible', labelTa: 'சாத்தியம்', intensity: p * 0.8 },
    { time: '30 min', label: '🌧️ Expected', labelTa: '🌧️ எதிர்பார்க்கப்படுகிறது', intensity: p },
    { time: '40 min', label: '🌧️ Raining', labelTa: '🌧️ மழை', intensity: p * 1.1 },
    { time: '60 min', label: 'Decreasing', labelTa: 'குறைகிறது', intensity: p * 0.4 },
  ];
}

export function WeatherProvider({ children }: { children: ReactNode }) {
  const geo = useGeolocation();
  const [state, setState] = useState<WeatherContextState>({
    weather: null,
    timeline: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchWeather() {
      // Use fallback location if geolocation fails or is loading
      const lat = geo.lat ?? 10.9601;
      const lon = geo.lon ?? 78.0766;

      if (geo.loading) return; // Wait for geo to finish

      setState(s => ({ ...s, isLoading: true, error: null }));

      try {
        // Fetch location name
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const geoData = await geoRes.json();
        const locationName = geoData.city || geoData.locality || 'Unknown Location';
        const regionName = geoData.principalSubdivision || '';

        // Fetch weather data
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=temperature_2m,precipitation_probability,weather_code,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max&timezone=auto`
        );
        const data = await weatherRes.json();

        if (!isMounted) return;

        const currentCode = data.current.weather_code;
        const currentMapped = mapWeatherCode(currentCode);

        // Build Current Weather
        const current: CurrentWeather = {
          location: locationName,
          region: regionName,
          lat,
          lon,
          temp: Math.round(data.current.temperature_2m),
          condition: currentMapped.condition,
          conditionCode: currentMapped.icon,
          feelsLike: Math.round(data.current.apparent_temperature),
          high: Math.round(data.daily.temperature_2m_max[0]),
          low: Math.round(data.daily.temperature_2m_min[0]),
          humidity: Math.round(data.current.relative_humidity_2m),
          windSpeed: Math.round(data.current.wind_speed_10m),
          windDir: 'N', // Simplified
          windDeg: data.current.wind_direction_10m,
          visibility: 10, // Not provided directly, default 10km
          pressure: Math.round(data.current.surface_pressure),
          uvIndex: Math.round(data.daily.uv_index_max[0] || 0),
          precipitation: Math.round(data.current.precipitation),
          sunrise: formatTime(data.daily.sunrise[0]),
          sunset: formatTime(data.daily.sunset[0]),
          lastUpdated: formatTime(data.current.time),
        };

        // Build Hourly Forecast (next 12 hours)
        const hourly: HourlyItem[] = [];
        const currentHour = new Date().getHours();
        let hourIndex = data.hourly.time.findIndex((t: string) => new Date(t).getHours() === currentHour);
        if (hourIndex === -1) hourIndex = 0;

        for (let i = 0; i < 12; i++) {
          const idx = hourIndex + i;
          const mapped = mapWeatherCode(data.hourly.weather_code[idx]);
          hourly.push({
            time: formatTime(data.hourly.time[idx]),
            temp: Math.round(data.hourly.temperature_2m[idx]),
            icon: mapped.icon,
            prob: data.hourly.precipitation_probability[idx],
            isCurrent: i === 0,
          });
        }

        // Build Daily Forecast (next 7 days)
        const daily: DailyItem[] = [];
        for (let i = 0; i < 7; i++) {
          const mapped = mapWeatherCode(data.daily.weather_code[i]);
          daily.push({
            day: getDayName(data.daily.time[i], i),
            date: formatDate(data.daily.time[i]),
            condition: mapped.condition,
            icon: mapped.icon,
            prob: data.daily.precipitation_probability_max[i],
            low: Math.round(data.daily.temperature_2m_min[i]),
            high: Math.round(data.daily.temperature_2m_max[i]),
            isToday: i === 0,
          });
        }

        // Synthetic rain intelligence
        const hourlyProbs = data.hourly.precipitation_probability.slice(hourIndex, hourIndex + 6);
        const timeline = generateSyntheticTimeline(hourlyProbs);

        setState({
          weather: { current, hourly, daily },
          timeline,
          isLoading: false,
          error: null,
        });

      } catch (err) {
        if (!isMounted) return;
        setState(s => ({ ...s, isLoading: false, error: 'Failed to fetch weather data.' }));
      }
    }

    fetchWeather();

    return () => {
      isMounted = false;
    };
  }, [geo.lat, geo.lon, geo.loading]);

  return (
    <WeatherContext.Provider value={state}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeatherContext() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeatherContext must be used within a WeatherProvider');
  }
  return context;
}
