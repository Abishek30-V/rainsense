import { useRegisterSW } from 'virtual:pwa-register/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { RefreshCw, X } from 'lucide-react';

export function PwaUpdateToast() {
  const { t } = useLanguage();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates occasionally
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000); // 1 hour
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-80 z-[100] bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-700 p-4 animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            {t('pwa.newVersion') || 'New version available'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Update now to get the latest features.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateServiceWorker(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <RefreshCw size={12} />
              {t('pwa.refresh') || 'Refresh'}
            </button>
            <button
              onClick={() => setNeedRefresh(false)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
        <button 
          onClick={() => setNeedRefresh(false)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
