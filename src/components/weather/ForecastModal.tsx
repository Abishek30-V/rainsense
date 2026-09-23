import { useEffect, useState } from 'react';
import { X, Cloud, CloudRain, CloudSun, Sun, Droplets, CalendarDays } from 'lucide-react';
import { useWeatherContext } from '../../contexts/WeatherContext';
import { cn } from '../../lib/utils';

interface ForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForecastModal({ isOpen, onClose }: ForecastModalProps) {
  const { weather, isLoading } = useWeatherContext();
  const [mounted, setMounted] = useState(false);

  // Handle mounting for entry animations
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setMounted(false), 300); // match exit transition duration
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted && !isOpen) return null;

  const daily = weather?.daily || [];
  const weekMin = daily.length ? Math.min(...daily.map((d) => d.low)) : 0;
  const weekMax = daily.length ? Math.max(...daily.map((d) => d.high)) : 100;

  const getIcon = (name: string, isToday: boolean) => {
    const props = {
      size: 28,
      className: cn(
        "transition-transform duration-500 hover:scale-110",
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

  const barStyle = (low: number, high: number) => {
    const range = weekMax - weekMin || 1;
    const left = ((low - weekMin) / range) * 100;
    const width = ((high - low) / range) * 100;
    return { left: `${left}%`, width: `${width}%` };
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 transition-all duration-300",
        isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div 
        className={cn(
          "relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl transition-all duration-500 ease-out flex flex-col overflow-hidden",
          "rounded-t-3xl sm:rounded-3xl max-h-[85vh]",
          isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-full sm:translate-y-12 sm:scale-95 opacity-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3 text-sky-500 dark:text-sky-400">
            <CalendarDays size={24} />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              7-Day Forecast
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3">
          {isLoading || !weather ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            daily.map((day, index) => {
              const isToday = !!day.isToday;
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm transition-all duration-300",
                    isToday 
                      ? "bg-sky-50/80 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800" 
                      : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40",
                    // Staggered animation entry
                    isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  )}
                  style={{ 
                    transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                  }}
                >
                  {/* Day Date block */}
                  <div className="w-16 shrink-0 flex flex-col justify-center">
                    <span className={cn(
                      "font-bold text-sm leading-none",
                      isToday ? "text-sky-600 dark:text-sky-400" : "text-slate-800 dark:text-slate-100"
                    )}>
                      {day.day}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
                      {day.date}
                    </span>
                  </div>

                  {/* Icon & Prob */}
                  <div className="flex items-center justify-center gap-2 w-16 shrink-0">
                    <div className="relative group">
                      {getIcon(day.icon, isToday)}
                      {day.prob > 0 && (
                        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-[10px] font-bold text-sky-500 bg-sky-50 dark:bg-sky-950/80 px-1.5 rounded-full ring-1 ring-white dark:ring-slate-900">
                          <Droplets size={8} />
                          {day.prob}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Temp Bar */}
                  <div className="flex-1 flex items-center gap-2.5 pl-2">
                    <span className="text-xs font-semibold text-slate-500 w-7 text-right">
                      {day.low}°
                    </span>
                    
                    <div className="relative flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-400 transition-all duration-1000 ease-out"
                        style={{
                          ...barStyle(day.low, day.high),
                          // Animate width from 0 on load
                          width: isOpen ? barStyle(day.low, day.high).width : '0%',
                        }}
                      />
                    </div>
                    
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 w-7">
                      {day.high}°
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
