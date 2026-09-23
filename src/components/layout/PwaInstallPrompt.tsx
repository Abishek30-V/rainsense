import { Download } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePWA } from '../../hooks/usePWA';

export function PwaInstallPrompt() {
  const { t } = useLanguage();
  const { isInstallable, installApp } = usePWA();

  if (!isInstallable) return null;

  return (
    <button
      onClick={installApp}
      aria-label={t('pwa.install') || 'Install RainSense'}
      className="flex items-center gap-2 px-3 py-1.5 bg-sky-100 hover:bg-sky-200 dark:bg-sky-900/40 dark:hover:bg-sky-800/60 text-sky-700 dark:text-sky-300 rounded-full text-xs font-semibold transition-colors"
    >
      <Download size={14} />
      <span className="hidden sm:inline">{t('pwa.install')}</span>
      <span className="sm:hidden">Install</span>
    </button>
  );
}
