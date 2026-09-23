import { CloudRain, Search, Menu, Settings, Moon, Sun, MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { PwaInstallPrompt } from './PwaInstallPrompt';

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-rain-DEFAULT to-rain-dark p-2 rounded-xl text-white shadow-lg shadow-rain-DEFAULT/30">
            <CloudRain size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 hidden sm:block leading-tight">
              {t('app.name')}
            </h1>
            <div className="hidden sm:flex items-center text-xs text-slate-500 font-medium mt-0.5">
              <MapPin size={10} className="mr-1 text-rain-DEFAULT" />
              Karur, Tamil Nadu
            </div>
          </div>
        </div>

        {/* Location Search - Centered */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-rain-DEFAULT transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              list="locations"
              placeholder={t('search.placeholder')}
              className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-rain-DEFAULT/50 transition-all placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
            <datalist id="locations">
              <option value="Karur, Tamil Nadu" />
              <option value="Coimbatore, Tamil Nadu" />
              <option value="Chennai, Tamil Nadu" />
              <option value="Trichy, Tamil Nadu" />
              <option value="Madurai, Tamil Nadu" />
            </datalist>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <PwaInstallPrompt />

          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle language"
          >
            <span className={language === 'en' ? 'font-bold' : 'opacity-70'}>English</span>
            <span className="mx-1 opacity-30">|</span>
            <span className={language === 'ta' ? 'font-bold' : 'opacity-70'}>தமிழ்</span>
          </button>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden">
            <Menu size={20} />
          </button>
          
          <button className="hidden md:block p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Settings size={20} />
          </button>
        </div>
        
      </div>
    </header>
  );
}
