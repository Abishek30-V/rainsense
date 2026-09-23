import { cn } from '../../lib/utils';
import { Sun, CloudRain, Cloud } from 'lucide-react';

export function DynamicWeatherBackground({ conditionCode }: { conditionCode: string }) {
  if (!conditionCode) return null;

  if (conditionCode.includes('sun')) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-10 right-10 animate-[spin_20s_linear_infinite] opacity-50 dark:opacity-30">
          <Sun size={120} className="text-amber-400 drop-shadow-2xl" strokeWidth={1} />
        </div>
      </div>
    );
  }

  if (conditionCode.includes('rain')) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 to-slate-900/40 dark:from-sky-900/10 dark:to-slate-900/40" />
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 bg-sky-400/40 rounded-full animate-[raindrop_1s_linear_infinite]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-20px`,
              height: `${Math.random() * 30 + 10}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 0.5 + 0.5}s`,
            }}
          />
        ))}
        <style>{`
          @keyframes raindrop {
            0% { transform: translateY(-20px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  // Default to clouds
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-20 -left-20 animate-[float_15s_ease-in-out_infinite] opacity-40 dark:opacity-20">
        <Cloud size={160} className="text-slate-400" strokeWidth={1} />
      </div>
      <div className="absolute top-40 -right-10 animate-[float_20s_ease-in-out_infinite_reverse] opacity-30 dark:opacity-10 delay-1000">
        <Cloud size={120} className="text-slate-400" strokeWidth={1} />
      </div>
      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0); }
          50% { transform: translate(50px, 20px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
    </div>
  );
}
