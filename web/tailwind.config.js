/** @type {import('tailwindcss').Config} */
// Colores tomados de la SPA actual (dark + acento emerald) para mantener diseño
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#141414',
        border: '#262626',
        'text-primary': '#f5f5f5',
        'text-secondary': '#a3a3a3',
        accent: {
          DEFAULT: '#10b981', // emerald-500
          hover: '#059669',   // emerald-600
          soft: '#34d399',    // emerald-400
        },
        'whatsapp-green': '#25D366',
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '9999px',
      },
    },
  },
  plugins: [],
};
