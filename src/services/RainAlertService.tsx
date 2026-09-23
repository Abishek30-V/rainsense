import { useEffect, useRef } from 'react';
import { useWeatherContext } from '../contexts/WeatherContext';
import { useSettings } from '../hooks/useSettings';
import { useLanguage } from '../contexts/LanguageContext';

export function RainAlertService() {
  const { weather, timeline } = useWeatherContext();
  const { settings } = useSettings();
  const { language } = useLanguage();
  const lastAlertTime = useRef<number>(0);

  useEffect(() => {
    if (!weather || !timeline) return;
    if (!settings.notificationsEnabled && !settings.voiceEnabled) return;

    // Throttle alerts to once every hour (3600000 ms)
    const now = Date.now();
    if (now - lastAlertTime.current < 3600000) return;

    let shouldAlert = false;
    let timeLabel = '';
    
    // Check timeline for immediate rain
    const upcomingRain = timeline.find(t => t.intensity > 10 && t.time !== 'NOW');
    if (upcomingRain) {
      shouldAlert = true;
      timeLabel = upcomingRain.time;
    } else if (weather.daily[0] && weather.daily[0].prob > 70) {
      // Fallback: high chance today
      shouldAlert = true;
      timeLabel = 'today';
    }

    if (shouldAlert) {
      lastAlertTime.current = now;
      
      const title = language === 'ta' ? 'RainSense எச்சரிக்கை' : 'RainSense Alert';
      const body = language === 'ta' 
        ? `${timeLabel} நேரத்தில் உங்கள் பகுதியில் மழை பெய்ய வாய்ப்புள்ளது.` 
        : `High probability of rain in your area (${timeLabel}).`;

      // 1. Browser Push Notification
      if (settings.notificationsEnabled && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/pwa-192x192.png'
          });
        }
      }

      // 2. Voice (SpeechSynthesis)
      if (settings.voiceEnabled && 'speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(body);
        utterance.lang = language === 'ta' ? 'ta-IN' : 'en-US';
        synth.speak(utterance);
      }
    }

  }, [weather, timeline, settings, language]);

  // This is a background service, it renders nothing
  return null;
}
