import { Home, Map, Calendar, Bell, Settings } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils';

export function MobileNav() {
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: 'nav.home', active: true },
    { icon: Map, label: 'nav.map', active: false },
    { icon: Calendar, label: 'nav.forecast', active: false },
    { icon: Bell, label: 'nav.alerts', active: false },
    { icon: Settings, label: 'nav.settings', active: false },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                item.active 
                  ? "text-rain-DEFAULT" 
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              )}
            >
              <Icon size={20} strokeWidth={item.active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{t(item.label)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
