/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'red-sandalwood': {
          50: '#FBF5F5',
          100: '#F5E6E6',
          200: '#E8C0C0',
          300: '#D49494',
          400: '#B85C5C',
          500: '#8C2E2E',
          600: '#7A2626',
          700: '#5C1A1A',
          800: '#4A1414',
          900: '#3D1010',
          950: '#2A0A0A',
        },
        'gold': {
          50: '#FFFDF5',
          100: '#FEF8E0',
          200: '#FCEEB3',
          300: '#F8DD6E',
          400: '#ECCD3E',
          500: '#D4AF37',
          600: '#B8912B',
          700: '#967323',
          800: '#7A5C1D',
          900: '#654C19',
        },
        'ink-black': '#1A1A1A',
        'paper-white': '#F5F0E6',
        'jade-green': '#3A8A5E',
        'vermilion': '#C0392B',
      },
      fontFamily: {
        'song': ['"Source Han Serif CN"', '"Noto Serif SC"', 'SimSun', 'serif'],
        'hei': ['"Source Han Sans CN"', '"Noto Sans SC"', 'SimHei', 'sans-serif'],
      },
      animation: {
        'pulse-gold': 'pulseGold 1.5s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'scroll-reveal': 'scrollReveal 0.8s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'particles': 'particles 0.8s ease-out forwards',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.7)' },
          '50%': { boxShadow: '0 0 0 15px rgba(212, 175, 55, 0)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scrollReveal: {
          '0%': { transform: 'scaleY(0)', opacity: '0' },
          '100%': { transform: 'scaleY(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(212, 175, 55, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.9), 0 0 40px rgba(212, 175, 55, 0.4)' },
        },
        particles: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
