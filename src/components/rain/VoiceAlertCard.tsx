import { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Play, Square, Globe, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRainMovement } from '../../hooks/useRainMovement';
import { getRainAlertMessage } from '../../i18n/i18n';
import { cn } from '../../lib/utils';

export function VoiceAlertCard() {
  const { t, language, setLanguage } = useLanguage();
  const { trackedCells, isCollecting } = useRainMovement();
  
  const [isAlertsEnabled, setIsAlertsEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [missingTamilVoice, setMissingTamilVoice] = useState(false);

  // Stop speech if language changes or component unmounts
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language]);

  const handleStopVoice = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, []);

  const handlePlayVoice = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    
    // Always cancel any existing speech first to prevent overlap
    window.speechSynthesis.cancel();
    setMissingTamilVoice(false);

    // Get primary cell
    const primaryCell = trackedCells.length > 0 
      ? trackedCells.reduce((prev, curr) => (prev.distanceToUserKm < curr.distanceToUserKm ? prev : curr))
      : null;

    // Generate natural text
    const textToSpeak = getRainAlertMessage(language, primaryCell, isCollecting);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Find best voice
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    
    if (language === 'ta') {
      selectedVoice = voices.find(v => v.lang.startsWith('ta'));
      if (!selectedVoice) {
        setMissingTamilVoice(true);
        // Fallback to default
        selectedVoice = voices.find(v => v.default) || voices[0];
      }
    } else {
      selectedVoice = voices.find(v => v.lang.startsWith('en'));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.lang = language === 'en' ? 'en-US' : 'ta-IN';
    utterance.rate = 0.95;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
  }, [language, trackedCells, isCollecting]);

  // Preview text (just for the UI display, not what is necessarily spoken)
  const primaryCell = trackedCells.length > 0 
    ? trackedCells.reduce((prev, curr) => (prev.distanceToUserKm < curr.distanceToUserKm ? prev : curr))
    : null;
  const previewText = `"${getRainAlertMessage(language, primaryCell, isCollecting)}"`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
          {isAlertsEnabled ? (
            <Volume2 size={16} className="text-sky-500" />
          ) : (
            <VolumeX size={16} className="text-slate-400" />
          )}
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-white text-base">{t('alerts.title')}</h3>
      </div>

      <div className="space-y-4">
        {/* Toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('alerts.toggle')}</span>
          <button
            onClick={() => setIsAlertsEnabled(!isAlertsEnabled)}
            className={cn(
              "w-12 h-6 rounded-full p-0.5 transition-all duration-300 relative",
              isAlertsEnabled ? "bg-sky-500 shadow-sm" : "bg-slate-300 dark:bg-slate-600"
            )}
            aria-label="Toggle voice alerts"
          >
            <div className={cn(
              "w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300",
              isAlertsEnabled ? "translate-x-6" : "translate-x-0"
            )} />
          </button>
        </div>

        {/* Language Selector */}
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('alerts.language')}</span>
          </div>
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5">
            <button
              onClick={() => setLanguage('en')}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                language === 'en'
                  ? "bg-sky-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                language === 'ta'
                  ? "bg-sky-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              தமிழ்
            </button>
          </div>
        </div>

        {/* Missing Tamil Voice Warning */}
        {missingTamilVoice && language === 'ta' && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl text-xs border border-amber-200 dark:border-amber-700/50">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <p>{t('voice.noTamilVoice')}</p>
          </div>
        )}

        {/* Preview Text */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-3 border border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">{previewText}</p>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {isPlaying ? (
            <button
              onClick={handleStopVoice}
              disabled={!isAlertsEnabled}
              aria-label={t('voice.stopReading') || 'Stop reading'}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 bg-red-500 hover:bg-red-400 active:bg-red-600 text-white shadow-lg shadow-red-500/30"
            >
              <Square size={15} fill="currentColor" />
              {t('voice.stopReading') || 'Stop'}
            </button>
          ) : (
            <button
              onClick={handlePlayVoice}
              disabled={!isAlertsEnabled}
              aria-label={t('voice.readAloud') || 'Read rain prediction aloud'}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all duration-200",
                isAlertsEnabled
                  ? "bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white shadow-lg shadow-sky-500/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              )}
            >
              <Play size={15} fill="currentColor" />
              {t('alerts.test')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
