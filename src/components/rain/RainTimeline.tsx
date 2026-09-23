import { Clock, Info } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useWeatherContext } from '../../contexts/WeatherContext';
import { useRainMovement } from '../../hooks/useRainMovement';
import { cn } from '../../lib/utils';

export function RainTimeline() {
  const { t } = useLanguage();
  const { timeline: timelineData, isLoading } = useWeatherContext();
  const { trackedCells } = useRainMovement();

  if (isLoading || !timelineData) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 h-[300px] animate-pulse border border-slate-100 dark:border-slate-800" />
    );
  }

  // Find primary cell and projections
  const primaryCell = trackedCells.length > 0 
    ? trackedCells.reduce((prev, curr) => (prev.distanceToUserKm < curr.distanceToUserKm ? prev : curr))
    : null;
  const proj = primaryCell?.projection;

  // Merge weather API timeline with our movement projections
  const displayTimeline = [...timelineData];
  
  if (proj && proj.futurePositions.length > 0) {
    // Generate new timeline entries from projections
    const futureTimeline = [
      { time: 'Now', label: proj.intersectsUserArea && primaryCell?.distanceToUserKm && primaryCell.distanceToUserKm <= 1 ? t('timeline.rainInArea') || 'Rain in area' : t('timeline.clear') || 'Clear', intensity: (proj.intersectsUserArea && primaryCell?.distanceToUserKm && primaryCell.distanceToUserKm <= 1) ? 80 : 0, isCurrent: true },
    ];

    proj.futurePositions.forEach(pos => {
      let intensity = 0;
      let label = t('timeline.clear') || 'Clear';
      if (proj.minArrivalMinutes !== undefined && proj.maxArrivalMinutes !== undefined) {
         if (pos.minutes >= proj.minArrivalMinutes && pos.minutes <= proj.maxArrivalMinutes + 15) {
             intensity = proj.estimatedPossibility;
             label = t('timeline.projectedRain') || 'Projected Rain';
         }
      }
      futureTimeline.push({
        time: `+${pos.minutes}m`,
        label,
        intensity,
        isCurrent: false
      });
    });
    
    // Replace the next hour of timeline with our detailed projection
    displayTimeline.splice(0, 5, ...futureTimeline);
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-sky-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">{t('rain.timeline')}</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-700/50">
          <Info size={11} />
          {t('rain.timelineNote')}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-sky-500/60 to-sky-200/20 dark:to-sky-900/20 rounded-full" />

        <div className="space-y-5 pl-6">
          {displayTimeline.slice(0, 5).map((item, idx) => {
            const isRaining = item.intensity > 60;
            const isActive = !!item.isCurrent;

            return (
              <div key={idx} className="relative flex items-center justify-between gap-4">
                {/* Dot */}
                <div className={cn(
                  "absolute -left-[22px] w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all",
                  isActive
                    ? "border-sky-500 bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)] scale-125"
                    : isRaining
                    ? "border-blue-500 bg-blue-500"
                    : item.intensity > 0
                    ? "border-sky-300 bg-sky-200 dark:bg-sky-800"
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                )} />

                {/* Time */}
                <span className={cn(
                  "text-sm font-bold w-14 shrink-0",
                  isActive ? "text-sky-500" : "text-slate-500 dark:text-slate-400"
                )}>
                  {item.time}
                </span>

                {/* Label */}
                <span className={cn(
                  "flex-1 text-sm",
                  isRaining
                    ? "text-slate-900 dark:text-white font-semibold"
                    : isActive
                    ? "text-sky-600 dark:text-sky-400 font-medium"
                    : "text-slate-500 dark:text-slate-400"
                )}>
                  {item.label}
                </span>

                {/* Intensity bar */}
                <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      item.intensity > 70 ? "bg-gradient-to-r from-blue-500 to-blue-700" :
                      item.intensity > 30 ? "bg-gradient-to-r from-sky-400 to-sky-600" :
                      item.intensity > 0 ? "bg-sky-300" : "bg-transparent"
                    )}
                    style={{ width: `${item.intensity}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
