import { CloudRain, Navigation2, Clock, Activity, AlertCircle, ChevronRight, Info } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useWeatherContext } from '../../contexts/WeatherContext';
import { useRainMovement } from '../../hooks/useRainMovement';

interface NearbyRainCardProps {
  onViewMap?: () => void;
}

export function NearbyRainCard({ onViewMap }: NearbyRainCardProps) {
  const { t } = useLanguage();
  const { weather, isLoading } = useWeatherContext();
  const { trackedCells, isCollecting } = useRainMovement();

  if (isLoading || !weather) {
    return (
      <div className="bg-slate-900 rounded-3xl p-6 h-[400px] animate-pulse border border-slate-800" />
    );
  }

  // Find the closest tracked cell for the card
  const primaryCell = trackedCells.length > 0 
    ? trackedCells.reduce((prev, curr) => (prev.distanceToUserKm < curr.distanceToUserKm ? prev : curr))
    : null;

  // Use mathematically projected possibility if available, else fallback to API hourly prob
  const prob = primaryCell?.projection?.estimatedPossibility ?? (weather.hourly[0]?.prob || 0);
  
  let statusKey = 'uncertain';
  if (primaryCell) {
    if (primaryCell.projection?.intersectsUserArea) {
      statusKey = 'approaching';
    } else if (primaryCell.classification === 'AWAY') {
      statusKey = 'moving-away';
    } else if (primaryCell.classification === 'CROSSING') {
      statusKey = 'crossing';
    } else if (primaryCell.classification === 'STATIONARY') {
      statusKey = 'stationary';
    }
  }

  const statusConfig: Record<string, any> = {
    'approaching': {
      label: t('status.approaching'),
      msg: t('rain.msg.approaching'),
      dot: 'bg-emerald-400',
      badge: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
    },
    'crossing': {
      label: t('status.crossing'),
      msg: t('rain.msg.crossing'),
      dot: 'bg-blue-400',
      badge: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
    },
    'stationary': {
      label: t('status.stationary'),
      msg: t('rain.msg.stationary'),
      dot: 'bg-purple-400',
      badge: 'bg-purple-400/20 text-purple-300 border-purple-400/30',
    },
    'uncertain': {
      label: t('status.uncertain'),
      msg: isCollecting ? t('rain.msg.collecting') : t('rain.msg.uncertain'),
      dot: 'bg-amber-400',
      badge: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
    },
    'moving-away': {
      label: t('status.movingAway'),
      msg: t('rain.msg.movingAway'),
      dot: 'bg-sky-400',
      badge: 'bg-sky-400/20 text-sky-300 border-sky-400/30',
    },
  };

  const { label, msg, dot, badge } = statusConfig[statusKey];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-sky-500/10 text-white relative overflow-hidden border border-white/5">
      {/* Animated rain drops background */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-sky-300 rounded-full"
            style={{
              left: `${(i * 5.5) % 100}%`,
              top: `-${(i * 7) % 30}%`,
              width: '1.5px',
              height: `${10 + (i % 6) * 3}px`,
              animationName: 'rainFall',
              animationDuration: `${0.8 + (i % 5) * 0.2}s`,
              animationDelay: `${(i * 0.15) % 2}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${dot} animate-pulse shadow-lg`} />
            <CloudRain size={18} className="text-sky-400" />
            <h2 className="font-semibold text-white">{t('rain.title')}</h2>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${badge}`}>
            {label}
          </span>
        </div>

        {/* Distance display */}
        <div className="mb-6">
          {primaryCell ? (
            <>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-black tracking-tight">{primaryCell.distanceToUserKm}</span>
                <span className="text-lg text-slate-400">km {t('rain.away')}</span>
              </div>
              <p className="text-sm text-slate-400">
                {t('rain.detected')}
              </p>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xl font-bold tracking-tight text-white/50">
                  {isCollecting ? t('rain.msg.collecting') : t('rain.msg.noRain')}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { icon: Navigation2, label: t('rain.speed'), value: primaryCell?.speedKmh !== undefined ? `${primaryCell.speedKmh} km/h` : '---', color: 'text-teal-400' },
            { 
              icon: Clock, 
              label: t('rain.arrival'), 
              value: primaryCell?.projection?.minArrivalMinutes !== undefined 
                ? `${primaryCell.projection.minArrivalMinutes}-${primaryCell.projection.maxArrivalMinutes} min` 
                : '---', 
              color: 'text-amber-400' 
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white/8 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-1.5 mb-2">
                <Icon size={13} className={color} />
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{label}</span>
              </div>
              <span className="text-lg font-bold text-white">{value}</span>
            </div>
          ))}
          
          {/* Custom Probability Card */}
          <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
            <div className="flex flex-col mb-1">
              <div className="flex items-center gap-1.5">
                <Activity size={13} className="text-sky-400" />
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                  {t('rain.estimatedRainPossibility')}
                </span>
                <div className="group relative">
                  <Info size={11} className="text-slate-500 hover:text-slate-300 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-slate-300 text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl border border-slate-700">
                    {t('rain.possibilityTooltip')}
                  </div>
                </div>
              </div>
              <span className="text-[9px] text-sky-400/80 italic mt-0.5">
                {t('rain.appGeneratedEstimate')}
              </span>
            </div>
            <span className="text-lg font-bold text-white">
              {isCollecting ? '---' : !primaryCell ? '0%' : `${prob}%`}
            </span>
          </div>

          <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertCircle size={13} className="text-violet-400" />
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{t('rain.confidence')}</span>
            </div>
            <span className="text-lg font-bold text-white">{primaryCell?.confidence || (isCollecting ? 'LOW' : '---')}</span>
          </div>
        </div>

        {/* Probability Bar */}
        <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>{t('rain.estimatedRainPossibility')}</span>
            <span className="font-semibold text-white">
              {isCollecting ? '---' : !primaryCell ? '0%' : `${prob}%`}
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-blue-400 rounded-full transition-all duration-1000"
              style={{ width: `${isCollecting || !primaryCell ? 0 : prob}%` }}
            />
          </div>
        </div>

        {/* Message */}
        <div className="bg-amber-400/10 border border-amber-400/20 rounded-2xl p-4 mb-4">
          <p className="text-sm leading-relaxed text-amber-100">{msg}</p>
        </div>

        {/* View Map Button */}
        {onViewMap && (
          <button
            onClick={onViewMap}
            className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 transition-colors rounded-2xl py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30"
          >
            {t('rain.viewMap')}
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
