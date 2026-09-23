import { Droplets, Wind, Eye, Gauge, Thermometer, CloudRain, Sunrise, Sunset } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useWeatherContext } from '../../contexts/WeatherContext';
import { cn } from '../../lib/utils';

export function WeatherDetailsGrid() {
  const { t } = useLanguage();
  const { weather, isLoading } = useWeatherContext();

  if (isLoading || !weather) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 h-[250px] animate-pulse border border-slate-100 dark:border-slate-800" />
    );
  }

  const { current } = weather;

  const details = [
    {
      label: t('weather.humidity'),
      value: `${current.humidity}%`,
      icon: Droplets,
      color: 'text-sky-500',
      bg: 'bg-sky-50 dark:bg-sky-500/10',
      subtext: current.humidity > 70 ? 'High' : current.humidity > 40 ? 'Moderate' : 'Low',
    },
    {
      label: t('weather.wind'),
      value: `${current.windSpeed} km/h`,
      icon: Wind,
      color: 'text-teal-500',
      bg: 'bg-teal-50 dark:bg-teal-500/10',
      subtext: current.windDir,
    },
    {
      label: t('weather.visibility'),
      value: `${current.visibility} km`,
      icon: Eye,
      color: 'text-violet-500',
      bg: 'bg-violet-50 dark:bg-violet-500/10',
      subtext: current.visibility > 10 ? 'Clear' : 'Moderate',
    },
    {
      label: t('weather.pressure'),
      value: `${current.pressure} hPa`,
      icon: Gauge,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-500/10',
      subtext: current.pressure > 1013 ? 'High' : 'Normal',
    },
    {
      label: t('weather.uvIndex'),
      value: `${current.uvIndex}`,
      icon: Thermometer,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      subtext: current.uvIndex <= 2 ? 'Low' : current.uvIndex <= 5 ? 'Moderate' : 'High',
    },
    {
      label: t('weather.precipitation'),
      value: `${current.precipitation}%`,
      icon: CloudRain,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      subtext: 'Today',
    },
    {
      label: t('weather.sunrise'),
      value: current.sunrise,
      icon: Sunrise,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-500/10',
      subtext: 'Morning',
    },
    {
      label: t('weather.sunset'),
      value: current.sunset,
      icon: Sunset,
      color: 'text-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-500/10',
      subtext: 'Evening',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
        <span className="w-1 h-4 bg-violet-500 rounded-full inline-block" />
        Weather Details
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {details.map(({ label, value, icon: Icon, color, bg, subtext }) => (
          <div
            key={label}
            className={cn(
              "rounded-2xl p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform cursor-default",
              bg
            )}
          >
            <div className="flex items-center gap-2">
              <Icon size={16} className={color} />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                {label}
              </span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{value}</span>
            <span className="text-[11px] text-slate-400">{subtext}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
