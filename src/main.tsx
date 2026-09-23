import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LanguageProvider } from './contexts/LanguageContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { WeatherProvider } from './contexts/WeatherContext'
import { registerSW } from 'virtual:pwa-register'

// Register Service Worker
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system">
      <LanguageProvider>
        <WeatherProvider>
          <App />
        </WeatherProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
