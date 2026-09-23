export type Language = 'en' | 'ta';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // App & Navigation
    'app.name': 'RainSense',
    'app.tagline': 'Weather + Local Rain Intelligence',
    'nav.home': 'Home',
    'nav.map': 'Map',
    'nav.forecast': 'Forecast',
    'nav.alerts': 'Alerts',
    'nav.settings': 'Settings',
    
    // Status & System
    'status.loading': 'Loading...',
    'status.updating': 'Updating...',
    'status.locationUnavailable': 'Location unavailable',
    'status.locationDenied': 'Location permission denied',
    'status.weatherUnavailable': 'Weather unavailable',
    'status.rainUnavailable': 'Rain data unavailable',
    'status.networkError': 'Network error',
    'status.tryAgain': 'Try again',

    // Search & Location
    'search.placeholder': 'Search location...',

    // Current Weather
    'currentWeather': 'Current Weather',
    'weather.temperature': 'Temperature',
    'weather.feelsLike': 'Feels like',
    'weather.high': 'High',
    'weather.low': 'Low',
    'weather.humidity': 'Humidity',
    'weather.wind': 'Wind',
    'weather.windDirection': 'Wind direction',
    'weather.visibility': 'Visibility',
    'weather.pressure': 'Pressure',
    'weather.uvIndex': 'UV Index',
    'weather.precipitation': 'Precipitation',
    'weather.sunrise': 'Sunrise',
    'weather.sunset': 'Sunset',
    'weather.updated': 'Updated',
    
    // Forecast
    'forecast.today': 'Today\'s Forecast',
    'forecast.hourly': 'Hourly forecast',
    'forecast.daily': '7-Day Forecast',
    'forecast.rainProb': 'Rain',

    // Rain Tracker & Alerts
    'rain.title': 'Rain Near You',
    'rain.detected': 'Rain detected nearby',
    'rain.away': 'away',
    'rain.direction': 'Direction',
    'rain.movement': 'Speed',
    'rain.speed': 'Speed',
    'rain.distance': 'Distance',
    'rain.arrival': 'Possible arrival',
    'rain.estimatedRainPossibility': 'Estimated Rain Possibility',
    'rain.appGeneratedEstimate': 'App-generated estimate',
    'rain.possibilityTooltip': 'Estimated Rain Possibility is calculated by RainSense from observed rainfall movement, proximity, intensity and tracking confidence. It is not an official weather probability.',
    'rain.confidence': 'Confidence',
    
    // Rain Movement Messages
    'rain.msg.approaching': 'Rain may reach your area.',
    'rain.msg.movingToward': 'Rain is moving toward your area.',
    'rain.msg.movingAway': 'Rain is moving away from your area.',
    'rain.msg.crossing': 'Rain is nearby but is not currently projected to reach your area.',
    'rain.msg.stationary': 'Stationary',
    'rain.msg.uncertain': 'Rain movement is uncertain.',
    'rain.msg.collecting': 'Collecting rain movement data...',
    'rain.msg.noRain': 'No rain nearby',
    
    // Short-term ETA Messages
    'rain.eta.approaching': 'Rain may reach your area in {eta}.',

    // Map
    'rain.viewMap': 'View Full Rain Map',
    'map.title': 'Rain Radar Map',
    'map.userLocation': 'User location',
    'map.detection': '1 km Detection Zone',
    'map.rainIntensity': 'Rain intensity',
    'map.light': 'Light',
    'map.moderate': 'Moderate',
    'map.heavy': 'Heavy',
    'map.observedPath': 'Observed path',
    'map.projectedPath': 'Projected path',
    'map.rainCell': 'Rain cell',
    'map.currentPosition': 'Current position',
    'map.close': 'Close Map',

    // Timeline
    'rain.timeline': 'Rain Timeline',
    'rain.timelineNote': 'Estimated prediction only',
    'timeline.rainInArea': 'Rain in area',
    'timeline.clear': 'Clear',
    'timeline.projectedRain': 'Projected Rain',
    
    // Alerts Settings
    'alerts.title': 'Voice Rain Alerts',
    'alerts.toggle': 'Voice Alerts',
    'alerts.language': 'Alert Language',
    'alerts.test': 'Test Voice Alert',
    'alerts.on': 'On',
    'alerts.off': 'Off',
    
    // Settings Page
    'nav.settings': 'Settings',
    'settings.alerts': 'Alert Preferences',
    'settings.pushNotifications': 'Push Notifications',
    'settings.pushDesc': 'Get silent system alerts before rain starts.',
    'settings.voiceAlerts': 'Voice Alerts',
    'settings.voiceDesc': 'Have rain warnings read out loud to you.',
    'settings.notifEnabled': 'Push Notifications enabled!',
    'settings.voiceEnabled': 'Voice alerts enabled!',
    
    // Classifications
    'status.approaching': 'APPROACHING',
    'status.uncertain': 'UNCERTAIN',
    'status.movingAway': 'AWAY',
    'status.crossing': 'NEARBY',
    'status.stationary': 'STATIONARY',

    // Voice
    'voice.noTamilVoice': 'Tamil voice is not available on this device.',
    'voice.readAloud': 'Read rain prediction aloud',
    'voice.stopReading': 'Stop reading',
    'voice.full.approaching': 'Rain is {distance} kilometers away and moving toward your area at {speed} kilometers per hour. It may reach your area in {eta}. Estimated rain possibility is {possibility} percent. Confidence is {confidence}.',
    
    // PWA
    'pwa.install': 'Install RainSense',
    'pwa.offline': 'You\'re offline - showing the last available app data',
    'pwa.newVersion': 'New version available',
    'pwa.refresh': 'Refresh',
  },
  ta: {
    // App & Navigation
    'app.name': 'RainSense',
    'app.tagline': 'வானிலை + உள்ளூர் மழை நுண்ணறிவு',
    'nav.home': 'முகப்பு',
    'nav.map': 'வரைபடம்',
    'nav.forecast': 'முன்னறிவிப்பு',
    'nav.alerts': 'எச்சரிக்கைகள்',
    'nav.settings': 'அமைப்புகள்',
    
    // Status & System
    'status.loading': 'ஏற்றுகிறது...',
    'status.updating': 'புதுப்பிக்கிறது...',
    'status.locationUnavailable': 'இடம் கிடைக்கவில்லை',
    'status.locationDenied': 'இடத்திற்கான அனுமதி மறுக்கப்பட்டது',
    'status.weatherUnavailable': 'வானிலை கிடைக்கவில்லை',
    'status.rainUnavailable': 'மழை தரவு கிடைக்கவில்லை',
    'status.networkError': 'நெட்வொர்க் பிழை',
    'status.tryAgain': 'மீண்டும் முயற்சிக்கவும்',

    // Search & Location
    'search.placeholder': 'இடத்தைத் தேடுக...',

    // Current Weather
    'currentWeather': 'தற்போதைய வானிலை',
    'weather.temperature': 'வெப்பநிலை',
    'weather.feelsLike': 'உணரப்படுவது',
    'weather.high': 'அதிக',
    'weather.low': 'குறைந்த',
    'weather.humidity': 'ஈரப்பதம்',
    'weather.wind': 'காற்று',
    'weather.windDirection': 'காற்றின் திசை',
    'weather.visibility': 'பார்வை',
    'weather.pressure': 'அழுத்தம்',
    'weather.uvIndex': 'UV குறியீடு',
    'weather.precipitation': 'மழை வீழ்ச்சி',
    'weather.sunrise': 'சூரிய உதயம்',
    'weather.sunset': 'சூரிய மறைவு',
    'weather.updated': 'புதுப்பிக்கப்பட்டது',
    
    // Forecast
    'forecast.today': 'இன்றைய வானிலை',
    'forecast.hourly': 'மணிநேர வானிலை',
    'forecast.daily': '7-நாள் வானிலை',
    'forecast.rainProb': 'மழை',

    // Rain Tracker & Alerts
    'rain.title': 'உங்கள் அருகிலுள்ள மழை',
    'rain.detected': 'அருகில் மழை கண்டறியப்பட்டது',
    'rain.away': 'தொலைவில்',
    'rain.direction': 'திசை',
    'rain.movement': 'வேகம்',
    'rain.speed': 'வேகம்',
    'rain.distance': 'தூரம்',
    'rain.arrival': 'மழை வரக்கூடிய நேரம்',
    'rain.estimatedRainPossibility': 'மதிப்பிடப்பட்ட மழை வாய்ப்பு',
    'rain.appGeneratedEstimate': 'செயலியால் கணக்கிடப்பட்ட மதிப்பீடு',
    'rain.possibilityTooltip': 'மதிப்பிடப்பட்ட மழை வாய்ப்பு RainSense செயலியால் நகர்வு, தூரம், மற்றும் தீவிரத்தின் அடிப்படையில் கணக்கிடப்படுகிறது. இது அதிகாரப்பூர்வமான வானிலை அறிவிப்பு அல்ல.',
    'rain.confidence': 'நம்பகத்தன்மை',
    
    // Rain Movement Messages
    'rain.msg.approaching': 'மழை உங்கள் பகுதியை அடையலாம்.',
    'rain.msg.movingToward': 'மழை உங்கள் பகுதியை நோக்கி நகர்கிறது.',
    'rain.msg.movingAway': 'மழை உங்கள் பகுதியிலிருந்து விலகி நகர்கிறது.',
    'rain.msg.crossing': 'மழை அருகில் உள்ளது, ஆனால் உங்கள் பகுதியை அடைய வாய்ப்பில்லை.',
    'rain.msg.stationary': 'நிலையானது',
    'rain.msg.uncertain': 'மழையின் நகர்வு உறுதியாகத் தெரியவில்லை.',
    'rain.msg.collecting': 'மழையின் நகர்வுத் தரவு சேகரிக்கப்படுகிறது...',
    'rain.msg.noRain': 'அருகில் மழை இல்லை',

    // Short-term ETA Messages
    'rain.eta.approaching': 'உங்கள் பகுதியில் {eta} மழை பெய்யக்கூடும்.',

    // Map
    'rain.viewMap': 'முழு மழை வரைபடம் காண்க',
    'map.title': 'மழை ரேடார் வரைபடம்',
    'map.userLocation': 'பயனர் இருப்பிடம்',
    'map.detection': '1 கிமீ கண்டறிவு மண்டலம்',
    'map.rainIntensity': 'மழை தீவிரம்',
    'map.light': 'லேசான',
    'map.moderate': 'மிதமான',
    'map.heavy': 'கனமான',
    'map.observedPath': 'கண்டறியப்பட்ட பாதை',
    'map.projectedPath': 'கணிக்கப்பட்ட பாதை',
    'map.rainCell': 'மழைப் பகுதி',
    'map.currentPosition': 'தற்போதைய நிலை',
    'map.close': 'வரைபடத்தை மூடு',

    // Timeline
    'rain.timeline': 'மழை காலவரிசை',
    'rain.timelineNote': 'மதிப்பீடு மட்டுமே',
    'timeline.rainInArea': 'இப்போது',
    'timeline.clear': 'தெளிவானது',
    'timeline.projectedRain': 'மழை வாய்ப்பு',
    
    // Alerts Settings
    'alerts.title': 'குரல் மழை எச்சரிக்கைகள்',
    'alerts.toggle': 'குரல் எச்சரிக்கைகள்',
    'alerts.language': 'எச்சரிக்கை மொழி',
    'alerts.test': 'குரல் எச்சரிக்கையை சோதிக்க',
    'alerts.on': 'இயக்கம்',
    'alerts.off': 'நிறுத்தம்',

    // Settings Page
    'nav.settings': 'அமைப்புகள்',
    'settings.alerts': 'எச்சரிக்கை விருப்பங்கள்',
    'settings.pushNotifications': 'அறிவிப்புகள்',
    'settings.pushDesc': 'மழை தொடங்கும் முன் சிஸ்டம் அறிவிப்புகளைப் பெறவும்.',
    'settings.voiceAlerts': 'குரல் அறிவிப்புகள்',
    'settings.voiceDesc': 'மழை எச்சரிக்கைகளை சத்தமாக படிக்கச் செய்யவும்.',
    'settings.notifEnabled': 'அறிவிப்புகள் இயக்கப்பட்டுள்ளன!',
    'settings.voiceEnabled': 'குரல் அறிவிப்புகள் இயக்கப்பட்டுள்ளன!',

    // Classifications
    'status.approaching': 'நெருங்குகிறது',
    'status.uncertain': 'நிச்சயமற்றது',
    'status.movingAway': 'விலகுகிறது',
    'status.crossing': 'அருகில்',
    'status.stationary': 'நிலையானது',

    // Voice
    'voice.noTamilVoice': 'இந்த சாதனத்தில் தமிழ் குரல் வசதி இல்லை.',
    'voice.readAloud': 'மழை கணிப்பை சத்தமாக வாசிக்கவும்',
    'voice.stopReading': 'வாசிப்பதை நிறுத்தவும்',
    'voice.full.approaching': 'மழை உங்கள் பகுதியிலிருந்து {distance} கிலோமீட்டர் தொலைவில் உள்ளது. அது உங்கள் பகுதியை நோக்கி மணிக்கு {speed} கிலோமீட்டர் வேகத்தில் நகர்கிறது. {eta} உங்கள் பகுதியில் மழை பெய்யக்கூடும். மதிப்பிடப்பட்ட மழை வாய்ப்பு {possibility} சதவீதம். நம்பகத்தன்மை {confidence}.',

    // PWA
    'pwa.install': 'RainSense செயலியை நிறுவவும்',
    'pwa.offline': 'நீங்கள் ஆஃப்லைனில் உள்ளீர்கள் - கடைசியாக சேமிக்கப்பட்ட தரவு காட்டப்படுகிறது',
    'pwa.newVersion': 'புதிய பதிப்பு கிடைக்கிறது',
    'pwa.refresh': 'புதுப்பிக்கவும்',
  }
};
