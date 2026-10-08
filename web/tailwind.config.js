/** @type {import('tailwindcss').Config} */
// Paleta y tipografías extraídas del archivo EJEMPLO (landing VIVIPREFIT)
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#080709',       // bg-base
        surface: '#131015',          // bg-elevated
        raised: '#1E1A22',           // bg-raised
        border: '#332B36',           // border-line
        'text-primary': '#F7F5F8',
        'text-secondary': '#9E95A3',
        accent: {
          DEFAULT: '#FF2E93',        // accent-pink
          hover: '#e0247f',
          soft: '#ff5fae',
        },
        'accent-pink': '#FF2E93',
        'whatsapp-green': '#25D366',
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'ui-sans-serif', 'sans-serif'],
      },
      borderRadius: {
        pill: '9999px',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: { marquee: 'marquee 22s linear infinite' },
    },
  },
  plugins: [],
};
