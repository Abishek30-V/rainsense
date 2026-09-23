import { type Language, translations } from './translations';
import type { TrackedCell } from '../services/rainMovementService';

export function getTranslation(lang: Language, key: string): string {
  return translations[lang]?.[key] || key;
}

export function getRainAlertMessage(language: Language, rainPrediction: TrackedCell | null, isCollecting: boolean): string {
  if (isCollecting) {
    return getTranslation(language, 'rain.msg.collecting');
  }

  if (!rainPrediction) {
    return getTranslation(language, 'rain.msg.noRain');
  }

  const { classification, projection, distanceToUserKm, speedKmh } = rainPrediction;

  if (classification === 'APPROACHING') {
    let tmpl = getTranslation(language, 'voice.full.approaching');
    
    // Replace distance
    tmpl = tmpl.replace('{distance}', Math.round(distanceToUserKm).toString());
    
    // Replace speed
    tmpl = tmpl.replace('{speed}', speedKmh ? Math.round(speedKmh).toString() : '0');
    
    // Replace eta
    if (projection?.intersectsUserArea && projection.minArrivalMinutes !== undefined) {
      const minMins = projection.minArrivalMinutes;
      const maxMins = projection.maxArrivalMinutes;
      const etaStr = `${minMins} ${language === 'ta' ? 'முதல்' : 'to'} ${maxMins} ${language === 'ta' ? 'நிமிடங்களில்' : 'minutes'}`;
      tmpl = tmpl.replace('{eta}', language === 'ta' ? etaStr : `within the next ${etaStr}`);
    } else {
       // if no eta, maybe we shouldn't use the full template or we should remove the ETA part.
       // The prompt says "Do not generate an ETA when the existing prediction does not provide one."
       tmpl = tmpl.replace(
           language === 'ta' ? '{eta} உங்கள் பகுதியில் மழை பெய்யக்கூடும். ' : 'It may reach your area in {eta}. ', 
           ''
       );
    }
    
    // Replace possibility
    const poss = projection?.estimatedPossibility || 0;
    tmpl = tmpl.replace('{possibility}', poss.toString());
    
    // Replace confidence
    const conf = rainPrediction.confidence || 'LOW';
    let confStr = language === 'ta' ? 'குறைவானது' : 'low';
    if (conf === 'HIGH') confStr = language === 'ta' ? 'அதிகமானது' : 'high';
    else if (conf === 'MODERATE') confStr = language === 'ta' ? 'மிதமானது' : 'moderate';
    tmpl = tmpl.replace('{confidence}', confStr);
    
    return tmpl;
  }

  if (classification === 'AWAY') return getTranslation(language, 'rain.msg.movingAway');
  if (classification === 'CROSSING') return getTranslation(language, 'rain.msg.crossing');
  if (classification === 'STATIONARY') return getTranslation(language, 'rain.msg.stationary');

  return getTranslation(language, 'rain.msg.uncertain');
}

