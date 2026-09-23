import { Cloud, CloudRain, CloudSun, Sun, Droplets } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useWeatherContext } from '../../contexts/WeatherContext';
import { cn } from '../../lib/utils';

export function DailyForecast() {
  const { t } = useLanguage();
  const { weather, isLoading } = useWeatherContext();

  if (isLoading || !weather) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 h-[400px] animate-pulse border border-slate-100 dark:border-slate-800" />
    );
  }

  const { daily } = weather;

  const weekMin = Math.min(...daily.map(d => d.low));
  const weekMax = Math.max(...daily.map(d => d.high));

  const getIcon = (name: string, isToday: boolean) => {
    const props = {
      size: 22,
      className: cn(
        isToday ? "" : "",
        name.includes('sun') ? "text-amber-400" :
        name.includes('rain') ? "text-sky-400" :
        "text-slate-400"
      )
    };
    switch (name) {
      case 'sun': return <Sun {...props} />;
      case 'cloud': return <Cloud {...props} />;
      case 'cloud-sun': return <CloudSun {...props} />;
      case 'cloud-rain': return <CloudRain {...props} />;
      default: return <Cloud {...props} />;
    }
  };

  // Calculate the position and width of the temp bar relative to weekly range
  const barStyle = (low: number, high: number) => {
    const range = weekMax - weekMin;
    const left = ((low - weekMin) / range) * 100;
    const width = ((high - low) / range) * 100;
    return { left: `${left}%`, width: `${width}%` };
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-4 bg-indigo-500 rounded-full inline-block" />
        {t('forecast.daily')}
      </h3>

      <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
        {daily.map((day, index) => {
          const isToday = !!day.isToday;
          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 sm:gap-3 py-3 px-1 sm:px-2 rounded-xl transition-colors",
                isToday
                  ? "bg-sky-50 dark:bg-sky-900/20 -mx-1 sm:-mx-2 px-2 sm:px-4"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
              )}
            >
              {/* Day */}
              <div className="w-14 sm:w-20 shrink-0">
                <span className={cn(
                  "font-semibold text-xs sm:text-sm",
                  isToday ? "text-sky-600 dark:text-sky-400" : "text-slate-800 dark:text-slate-200"
                )}>
                  {day.day}
                </span>
                <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">{day.date}</p>
              </div>

              {/* Icon + condition */}
              <div className="flex items-center gap-1 sm:gap-2 w-24 sm:w-36 shrink-0">
                {getIcon(day.icon, isToday)}
                {day.prob > 0 && (
                  <div className="flex items-center gap-0.5 text-[10px] sm:text-xs font-medium text-sky-500">
                    <Droplets size={10} />
                    {day.prob}%
                  </div>
                )}
              </div>

              {/* Temp bar */}
              <div className="flex-1 flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="text-[10px] sm:text-xs text-slate-400 w-6 sm:w-8 text-right shrink-0">{day.low}°</span>
                <div className="relative flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-400"
                    style={barStyle(day.low, day.high)}
                  />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 w-6 sm:w-8 shrink-0">{day.high}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
