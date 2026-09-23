/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rain: {
          light: '#e0f2fe',
          DEFAULT: '#0ea5e9',
          dark: '#0284c7'
        }
      },
      animation: {
        'rain-drop': 'rainDrop 1s linear infinite',
      },
      keyframes: {
        rainDrop: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(20px)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
