import { useState, useEffect } from 'react';
import { ArrowLeft, CalendarDays, Droplets, Wind, Sun, Cloud, CloudSun, CloudRain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWeatherContext } from '../contexts/WeatherContext';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DynamicWeatherBackground } from '../components/weather/DynamicWeatherBackground';

export function ForecastPage() {
  const navigate = useNavigate();
  const { weather, isLoading } = useWeatherContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
  }, []);

  if (isLoading || !weather) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { daily } = weather;

  const getIcon = (name: string, isActive: boolean) => {
    const props = {
      size: 24,
      className: cn(
        "transition-transform duration-500",
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

  // Prepare data for the chart
  const chartData = daily.map(d => ({
    name: d.day.substring(0, 3),
    high: d.high,
    low: d.low,
  }));

  return (
    <div className="min-h-screen bg-slate-50/90 dark:bg-slate-950/90 font-sans transition-colors duration-300 pb-20 md:pb-8 relative">
      <DynamicWeatherBackground conditionCode={weather.current.conditionCode} />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays size={20} className="text-sky-500" />
              Detailed Forecast
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-8">
        
        {/* Chart Section */}
        <section 
          className={cn(
            "bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-700 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">Temperature Trend</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0ea5e9', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="high" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorHigh)" />
                <Area type="monotone" dataKey="low" stroke="#94a3b8" strokeWidth={2} fill="none" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-sky-500 rounded-full" /> High Temp
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-slate-400 rounded-full border-t-2 border-dashed" /> Low Temp
            </div>
          </div>
        </section>

        {/* Daily Breakdown List */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 ml-2">7-Day Breakdown</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {daily.map((day, idx) => (
              <div
                key={idx}
                className={cn(
                  "bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border transition-all duration-500 ease-out hover:shadow-md",
                  day.isToday ? "border-sky-200 dark:border-sky-800 bg-sky-50/30 dark:bg-sky-900/10" : "border-slate-100 dark:border-slate-800",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
                style={{ transitionDelay: `${(idx + 1) * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className={cn("text-base font-bold", day.isToday ? "text-sky-600 dark:text-sky-400" : "text-slate-900 dark:text-white")}>
                      {day.day}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{day.date}</p>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    {getIcon(day.icon, false)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">High / Low</span>
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                      {day.high}° <span className="text-sm font-medium text-slate-400">/ {day.low}°</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Condition</span>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {day.condition}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1">
                      <Droplets size={10} className="text-sky-500" /> Precipitation
                    </span>
                    <div className="text-sm font-bold text-sky-600 dark:text-sky-400">
                      {day.prob}% chance
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1">
                      <Wind size={10} className="text-teal-500" /> Wind
                    </span>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      ~{day.wind} km/h
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
