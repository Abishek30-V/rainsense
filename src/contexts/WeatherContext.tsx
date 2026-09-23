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

function formatTime(isoString: string, includeMinutes: boolean = false): string {
  const date = new Date(isoString);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  if (includeMinutes) {
    const mins = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${mins} ${ampm}`;
  }
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



function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((degrees %= 360) < 0 ? degrees + 360 : degrees) / 45) % 8;
  return directions[index];
}

function generateRealTimeline(minutelyData: number[], timeLabels: string[]): TimelineItem[] {
  if (!minutelyData || minutelyData.length === 0) return [];
  
  return minutelyData.slice(0, 6).map((precip, i) => {
    let intensity = precip * 10; // arbitrary scale for UI visualization (0-100)
    let label = 'No Rain';
    if (precip > 0.1) label = 'Light Rain';
    if (precip > 2.5) label = 'Rain';
    if (precip > 7.5) label = 'Heavy Rain';

    return {
      time: i === 0 ? 'NOW' : formatTime(timeLabels[i], true),
      label,
      intensity: Math.min(100, intensity),
      isCurrent: i === 0
    };
  });
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

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility&hourly=temperature_2m,precipitation_probability,weather_code,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max,wind_speed_10m_max&minutely_15=precipitation&timezone=auto`
        );
        
        let data;
        if (!weatherRes.ok) {
          console.warn(`Weather API failed with status ${weatherRes.status}. Using fallback mock data.`);
          // Generate fallback data for development when API rate limits (429) are hit
          const now = new Date();
          data = {
            current: {
              temperature_2m: 28 + Math.floor(Math.random() * 3), 
              relative_humidity_2m: 60 + Math.floor(Math.random() * 10), 
              apparent_temperature: 31 + Math.floor(Math.random() * 2),
              precipitation: 0, 
              weather_code: 1, 
              wind_speed_10m: 10 + Math.floor(Math.random() * 8), // varies 10-17
              wind_direction_10m: 180 + Math.floor(Math.random() * 40),
              surface_pressure: 1010 + Math.floor(Math.random() * 5), 
              visibility: 8000 + Math.floor(Math.random() * 4000), // varies 8km - 12km
              time: now.toISOString()
            },
            hourly: {
              time: Array.from({length: 24}).map((_, i) => new Date(now.getTime() + i*3600000).toISOString()),
              temperature_2m: Array.from({length: 24}).map(() => 28 + Math.random()*4 - 2),
              precipitation_probability: Array.from({length: 24}).map(() => Math.floor(Math.random()*40)),
              weather_code: Array.from({length: 24}).map(() => 1),
              precipitation: Array.from({length: 24}).map(() => 0)
            },
            daily: {
              time: Array.from({length: 7}).map((_, i) => new Date(now.getTime() + i*86400000).toISOString()),
              weather_code: [1, 2, 3, 61, 1, 0, 2],
              temperature_2m_max: [32, 31, 29, 27, 30, 33, 31],
              temperature_2m_min: [24, 23, 22, 21, 22, 23, 24],
              sunrise: Array.from({length: 7}).map((_, i) => {
                const d = new Date(now.getTime() + i*86400000);
                d.setHours(6, 15, 0); // 6:15 AM
                return d.toISOString();
              }),
              sunset: Array.from({length: 7}).map((_, i) => {
                const d = new Date(now.getTime() + i*86400000);
                d.setHours(18, 30, 0); // 6:30 PM
                return d.toISOString();
              }),
              precipitation_probability_max: [10, 20, 60, 90, 10, 0, 5],
              uv_index_max: [8, 7, 5, 3, 7, 9, 8],
              wind_speed_10m_max: [12, 14, 10, 16, 11, 9, 13]
            }
          };
        } else {
          data = await weatherRes.json();
        }

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
          windDir: getWindDirection(data.current.wind_direction_10m), 
          windDeg: data.current.wind_direction_10m,
          visibility: data.current.visibility ? Math.round(data.current.visibility / 1000) : 10,
          pressure: Math.round(data.current.surface_pressure),
          uvIndex: Math.round(data.daily.uv_index_max[0] || 0),
          precipitation: Math.round(data.current.precipitation),
          sunrise: formatTime(data.daily.sunrise[0], true),
          sunset: formatTime(data.daily.sunset[0], true),
          lastUpdated: formatTime(data.current.time, true),
        };

        // Build Hourly Forecast (next 12 hours)
        const hourly: HourlyItem[] = [];
        const currentHour = new Date().getHours();
        let hourIndex = data.hourly.time.findIndex((t: string) => new Date(t).getHours() === currentHour);
        if (hourIndex === -1) hourIndex = 0;

        for (let i = 0; i < 12; i++) {
          const idx = hourIndex + i;
          if (idx >= data.hourly.time.length) break;
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
          if (i >= data.daily.time.length) break;
          const mapped = mapWeatherCode(data.daily.weather_code[i]);
          daily.push({
            day: getDayName(data.daily.time[i], i),
            date: formatDate(data.daily.time[i]),
            condition: mapped.condition,
            icon: mapped.icon,
            prob: data.daily.precipitation_probability_max[i],
            low: Math.round(data.daily.temperature_2m_min[i]),
            high: Math.round(data.daily.temperature_2m_max[i]),
            wind: Math.round(data.daily.wind_speed_10m_max[i] || 0),
            isToday: i === 0,
          });
        }

        // Real rain intelligence based on 15-minute intervals
        // We find the current 15-minute index and extract the next 6 blocks (1.5 hours)
        const currentTimeMillis = new Date().getTime();
        let minutelyIndex = 0;
        if (data.minutely_15 && data.minutely_15.time) {
          minutelyIndex = data.minutely_15.time.findIndex((t: string) => new Date(t).getTime() >= currentTimeMillis);
          if (minutelyIndex === -1) minutelyIndex = 0;
        }
        
        let timeline: TimelineItem[] = [];
        if (data.minutely_15 && data.minutely_15.precipitation) {
          const minutelyPrecip = data.minutely_15.precipitation.slice(minutelyIndex, minutelyIndex + 6);
          const minutelyTimes = data.minutely_15.time.slice(minutelyIndex, minutelyIndex + 6);
          timeline = generateRealTimeline(minutelyPrecip, minutelyTimes);
        } else {
          timeline = []; // fallback if minutely_15 is missing
        }

        setState({
          weather: { current, hourly, daily },
          timeline,
          isLoading: false,
          error: null,
        });

      } catch (err) {
        console.error("Weather fetch error:", err);
        if (!isMounted) return;
        setState(s => ({ ...s, isLoading: false, error: 'Failed to fetch weather data. Rate limit may have been exceeded.' }));
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
