import { useState } from 'react';
import { Home, Map, Calendar, Bell, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils';

export function MobileNav({ 
  onOpenFullMap
}: { 
  onOpenFullMap?: () => void;
}) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'home', icon: Home, label: 'nav.home' },
    { id: 'map', icon: Map, label: 'nav.map' },
    { id: 'forecast', icon: Calendar, label: 'nav.forecast' },
    { id: 'alerts', icon: Bell, label: 'nav.alerts' },
    { id: 'settings', icon: Settings, label: 'nav.settings' },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    
    if (id === 'settings') {
      navigate('/settings');
      return;
    }

    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (id === 'map' && onOpenFullMap) {
      onOpenFullMap();
      return;
    }

    if (id === 'forecast') {
      navigate('/forecast');
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isTabActive = (location.pathname === '/forecast' && item.id === 'forecast') || (location.pathname === '/' && activeTab === item.id && item.id !== 'forecast');

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative",
                isTabActive 
                  ? "text-sky-500 dark:text-sky-400" 
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              )}
            >
              {isTabActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-sky-500 dark:bg-sky-400 rounded-b-full shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
              )}
              <Icon size={20} strokeWidth={isTabActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{t(item.label)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
