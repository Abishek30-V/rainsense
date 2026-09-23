// =============================================================
// MOCK DATA — Replace individual sections with real API calls
// =============================================================

export interface CurrentWeather {
  location: string;
  region: string;
  lat: number;
  lon: number;
  temp: number;
  condition: string;
  conditionCode: string; // for icon mapping
  feelsLike: number;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number;
  windDir: string;
  windDeg: number;
  visibility: number;
  pressure: number;
  uvIndex: number;
  precipitation: number;
  sunrise: string;
  sunset: string;
  lastUpdated: string;
}

export interface HourlyItem {
  time: string;
  temp: number;
  icon: string;
  prob: number;
  isCurrent?: boolean;
}

export interface DailyItem {
  day: string;
  date: string;
  condition: string;
  icon: string;
  prob: number;
  low: number;
  high: number;
  isToday?: boolean;
}

export interface RainCell {
  lat: number;
  lon: number;
  intensity: 'light' | 'moderate' | 'heavy';
  radius: number; // km
}

export interface RainData {
  status: 'approaching' | 'uncertain' | 'moving-away';
  detected: boolean;
  distance: number; // km
  direction: string;
  speedKmh: number;
  arrivalMin: number;
  arrivalMax: number;
  possibility: number; // 0-100
  confidence: 'low' | 'moderate' | 'high';
  cells: RainCell[];
}

export interface TimelineItem {
  time: string;
  label: string;
  labelTa?: string;
  intensity: number; // 0-100
  icon?: string;
  isCurrent?: boolean;
}


