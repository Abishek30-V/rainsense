import { type ReactNode } from 'react';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { usePWA } from '../../hooks/usePWA';
import { useLanguage } from '../../contexts/LanguageContext';
import { CloudOff } from 'lucide-react';
import { PwaUpdateToast } from './PwaUpdateToast';

interface DashboardLayoutProps {
  children: ReactNode;
  onOpenFullMap?: () => void;
  onOpenForecast?: () => void;
}

export function DashboardLayout({ children, onOpenFullMap, onOpenForecast }: DashboardLayoutProps) {
  const { isOffline } = usePWA();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300 pb-16 md:pb-0">
      <Header />
      
      {isOffline && (
        <div className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium shadow-sm z-40 relative">
          <CloudOff size={16} />
          <span>{t('pwa.offline') || "You're offline - showing the last available app data"}</span>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-7xl flex flex-col gap-6">
        {children}
      </main>

      <PwaUpdateToast />
      <MobileNav onOpenFullMap={onOpenFullMap} onOpenForecast={onOpenForecast} />
    </div>
  );
}
