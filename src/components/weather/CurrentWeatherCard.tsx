import { CloudRain, CloudSun, Sun, Cloud, Droplets, Wind, Eye, Gauge, Sunset, Sunrise, Thermometer, MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useWeatherContext } from '../../contexts/WeatherContext';

export function CurrentWeatherCard() {
  const { t } = useLanguage();
  const { weather, isLoading } = useWeatherContext();

  if (isLoading || !weather) {
    return (
      <div className="bg-slate-900 rounded-3xl h-[400px] animate-pulse flex items-center justify-center shadow-2xl">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { current } = weather;

  const getWeatherIcon = (code: string) => {
    const cls = "drop-shadow-lg";
    switch (code) {
      case 'sun': return <Sun size={80} className={`text-amber-400 ${cls}`} />;
      case 'cloud-sun': return <CloudSun size={80} className={`text-amber-400 ${cls}`} />;
      case 'cloud-rain': return <CloudRain size={80} className={`text-sky-400 ${cls}`} />;
      default: return <Cloud size={80} className={`text-slate-400 ${cls}`} />;
    }
  };

  const uvLabel = (uv: number) => {
    if (uv <= 2) return { text: 'Low', color: 'text-green-500' };
    if (uv <= 5) return { text: 'Moderate', color: 'text-amber-500' };
    if (uv <= 7) return { text: 'High', color: 'text-orange-500' };
    return { text: 'Very High', color: 'text-red-500' };
  };
  const uv = uvLabel(current.uvIndex);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 rounded-3xl overflow-hidden shadow-2xl relative text-white">
      {/* Subtle animated glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-8">
        {/* Location Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <div>
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-sky-400" />
                <span className="font-semibold text-white text-base">{current.location}</span>
                <span className="text-slate-400 text-sm">, {current.region}</span>
              </div>
            </div>
          </div>
          <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full">
            {t('weather.updated')} {current.lastUpdated}
          </span>
        </div>

        {/* Main temp + icon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-6">
            {getWeatherIcon(current.conditionCode)}
            <div>
              <div className="flex items-start leading-none">
                <span className="text-8xl sm:text-9xl font-black tracking-tighter">{current.temp}</span>
                <span className="text-3xl font-light text-slate-300 mt-3">°C</span>
              </div>
              <p className="text-xl sm:text-2xl font-medium text-slate-300 mt-1">{current.condition}</p>
              <p className="text-sm text-slate-500 mt-1">
                {t('weather.feelsLike')} <span className="text-slate-300 font-medium">{current.feelsLike}°</span>
                &nbsp;·&nbsp;
                <span className="text-red-400 font-medium">H:{current.high}°</span>
                &nbsp;
                <span className="text-sky-400 font-medium">L:{current.low}°</span>
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
            {[
              { icon: Droplets, label: t('weather.humidity'), value: `${current.humidity}%`, color: 'text-sky-400' },
              { icon: Wind, label: t('weather.wind'), value: `${current.windSpeed} km/h ${current.windDir}`, color: 'text-teal-400' },
              { icon: Eye, label: t('weather.visibility'), value: `${current.visibility} km`, color: 'text-violet-400' },
              { icon: Gauge, label: t('weather.pressure'), value: `${current.pressure} hPa`, color: 'text-amber-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={13} className={color} />
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{label}</span>
                </div>
                <span className="text-sm font-semibold text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Row: UV, Precipitation, Sunrise, Sunset */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Thermometer size={15} className="text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{t('weather.uvIndex')}</p>
              <p className="text-sm font-semibold text-white">{current.uvIndex} <span className={`text-xs ${uv.color}`}>({uv.text})</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center">
              <CloudRain size={15} className="text-sky-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{t('weather.precipitation')}</p>
              <p className="text-sm font-semibold text-white">{current.precipitation}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Sunrise size={15} className="text-orange-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{t('weather.sunrise')}</p>
              <p className="text-sm font-semibold text-white">{current.sunrise}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <Sunset size={15} className="text-rose-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{t('weather.sunset')}</p>
              <p className="text-sm font-semibold text-white">{current.sunset}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
