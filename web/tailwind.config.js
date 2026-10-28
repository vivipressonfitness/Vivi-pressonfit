/** @type {import('tailwindcss').Config} */
// Sistema de diseño y tokens unificados VIVIPRESSONFIT (F-10)
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
          DEFAULT: '#FF2E93',        // accent-pink (5.57:1 contraste sobre background)
          hover: '#e0247f',
          soft: '#ff5fae',
        },
        'accent-pink': '#FF2E93',
        'whatsapp-green': '#25D366',
        // Tokens semánticos de estado
        status: {
          active: '#10B981',         // emerald-500
          trial: '#0EA5E9',          // sky-500
          warning: '#F59E0B',        // amber-500
          danger: '#EF4444',         // red-500
          neutral: '#737373',        // neutral-500
        },
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'ui-sans-serif', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.375rem',              // 6px
        DEFAULT: '0.5rem',           // 8px
        md: '0.5rem',                // 8px
        lg: '0.75rem',               // 12px
        xl: '1rem',                  // 16px
        '2xl': '1.5rem',             // 24px
        pill: '9999px',              // píldora accesible
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
