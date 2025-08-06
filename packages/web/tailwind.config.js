/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'etcetera': {
          50: '#fef7ff',
          100: '#fceeff',
          200: '#f8ddff',
          300: '#f2bfff',
          400: '#e993ff',
          500: '#dc5eff',
          600: '#c73cf7',
          700: '#a726db',
          800: '#8a22b3',
          900: '#721e92',
          950: '#4b0a6e',
        },
        'rarity': {
          common: '#6B7280',
          uncommon: '#10B981',
          rare: '#3B82F6',
          epic: '#8B5CF6',
          legendary: '#F59E0B',
          mythic: '#EF4444',
          unique: '#EC4899',
        }
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgb(220, 94, 255)' },
          '100%': { boxShadow: '0 0 20px rgb(220, 94, 255), 0 0 30px rgb(220, 94, 255)' },
        },
        sparkle: {
          '0%, 100%': { opacity: 0.7, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.1)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}