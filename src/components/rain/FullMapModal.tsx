import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { RainMap } from './RainMap';

interface FullMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FullMapModal({ isOpen, onClose }: FullMapModalProps) {
  const { t } = useLanguage();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Full Rain Map"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/95 backdrop-blur-md border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <div>
            <h2 className="text-white font-bold text-sm">{t('map.title')}</h2>
            <p className="text-slate-400 text-xs">Live Rain Radar · Karur, Tamil Nadu</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400 bg-amber-900/30 border border-amber-700/40 px-2.5 py-1 rounded-full">
            ↘ Rain approaching · 8.2 km · 20–30 min
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors"
          >
            <X size={14} />
            {t('map.close')}
          </button>
        </div>
      </div>

      {/* Map fills rest of screen */}
      <div className="flex-1 relative overflow-hidden">
        <RainMap isFullScreen={true} className="w-full h-full" />
      </div>

      {/* Bottom Info Bar */}
      <div className="shrink-0 bg-slate-900/95 backdrop-blur-md border-t border-white/10 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-slate-300">Your Location</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full border border-dashed border-sky-400" />
              <span className="text-slate-300">1 km Detection Zone</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-sky-500 opacity-70" />
              <span className="text-slate-300">Rain Cell</span>
            </div>
          </div>
          <span className="text-slate-500 text-[10px]">
            ⚠️ Prediction only — Use for planning, not safety decisions
          </span>
        </div>
      </div>
    </div>
  );
}
