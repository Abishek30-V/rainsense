import { Cloud, CloudRain, CloudSun, Sun, Droplets } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useWeatherContext } from '../../contexts/WeatherContext';
import { cn } from '../../lib/utils';

export function HourlyForecast() {
  const { t } = useLanguage();
  const { weather, isLoading } = useWeatherContext();

  if (isLoading || !weather) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 h-[180px] animate-pulse border border-slate-100 dark:border-slate-800" />
    );
  }

  const { hourly } = weather;

  const getIcon = (name: string, isActive: boolean) => {
    const baseClass = "mb-1";
    const props = {
      size: 22,
      className: cn(
        baseClass,
        isActive ? "text-white drop-shadow" :
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

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-4 bg-sky-500 rounded-full inline-block" />
        {t('forecast.today')}
      </h3>

      <div className="flex overflow-x-auto gap-2.5 pb-2 scrollbar-hide snap-x snap-mandatory">
        {hourly.map((hour, index) => {
          const isActive = !!hour.isCurrent;
          return (
            <div
              key={index}
              className={cn(
                "min-w-[76px] flex flex-col items-center py-4 px-3 rounded-2xl snap-start transition-all duration-200 shrink-0 cursor-default",
                isActive
                  ? "bg-gradient-to-b from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 scale-[1.04]"
                  : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <span className={cn(
                "text-[11px] font-semibold uppercase tracking-wide mb-3",
                isActive ? "text-sky-100" : "text-slate-500 dark:text-slate-400"
              )}>
                {hour.time}
              </span>

              {getIcon(hour.icon, isActive)}

              <span className="text-lg font-bold mt-1">{hour.temp}°</span>

              {hour.prob > 0 && (
                <div className={cn(
                  "flex items-center gap-0.5 mt-2 text-xs font-semibold",
                  isActive ? "text-sky-100" : "text-sky-500"
                )}>
                  <Droplets size={11} />
                  <span>{hour.prob}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
