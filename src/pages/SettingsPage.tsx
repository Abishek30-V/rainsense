import { ArrowLeft, Bell, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../hooks/useSettings';

export function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { settings, setSettings } = useSettings();

  const handleToggleNotifications = async () => {
    if (!settings.notificationsEnabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setSettings({ notificationsEnabled: true });
          new Notification('RainSense', { body: t('settings.notifEnabled') || 'Notifications enabled!' });
        } else {
          alert('Notification permission denied by the browser.');
        }
      } else {
        alert('Your browser does not support notifications.');
      }
    } else {
      setSettings({ notificationsEnabled: false });
    }
  };

  const handleToggleVoice = () => {
    if (!settings.voiceEnabled) {
      // Browsers often require a user interaction to unlock SpeechSynthesis. This counts as one.
      const synth = window.speechSynthesis;
      if (synth) {
        setSettings({ voiceEnabled: true });
        const utterance = new SpeechSynthesisUtterance(t('settings.voiceEnabled') || 'Voice alerts enabled.');
        utterance.lang = t('locale') || 'en-US';
        synth.speak(utterance);
      } else {
        alert('Your browser does not support voice synthesis.');
      }
    } else {
      setSettings({ voiceEnabled: false });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 pb-20 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('nav.settings')}
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg space-y-6">
        
        {/* Settings Group */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{t('settings.alerts')}</h2>
          
          <div className="space-y-6">
            {/* Push Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-500">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{t('settings.pushNotifications')}</h3>
                  <p className="text-sm text-slate-500">{t('settings.pushDesc')}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.notificationsEnabled}
                  onChange={handleToggleNotifications}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sky-500"></div>
              </label>
            </div>

            {/* Voice Alerts Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
                  <Volume2 size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{t('settings.voiceAlerts')}</h3>
                  <p className="text-sm text-slate-500">{t('settings.voiceDesc')}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.voiceEnabled}
                  onChange={handleToggleVoice}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
