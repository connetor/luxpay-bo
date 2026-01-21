/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        thunder: {
          // Teal palette (kept "thunder" namespace for compatibility with existing classes)
          yellow: '#14B8A6',
          'yellow-light': '#CCFBF1',
          'yellow-dark': '#0D9488',
          'yellow-accent': '#2DD4BF',
          orange: '#0F766E',
          'orange-light': '#99F6E4',
          black: '#1a1a1a',
          gray: '#2d2d2d',
          'light-gray': '#f8f9fa',
        },
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        }
      },
      backgroundImage: {
        'thunder-gradient': 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
        'thunder-gradient-light': 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)',
        'thunder-gradient-dark': 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
        'thunder-gradient-hero': 'linear-gradient(135deg, #14B8A6 0%, #0D9488 50%, #0F766E 100%)',
        'thunder-gradient-vertical': 'linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)',
      },
      boxShadow: {
        'thunder': '0 8px 32px rgba(20, 184, 166, 0.35)',
        'thunder-light': '0 4px 16px rgba(20, 184, 166, 0.22)',
        'thunder-dark': '0 12px 40px rgba(13, 148, 136, 0.35)',
        'thunder-card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'thunder-lg': '0 8px 30px rgba(20, 184, 166, 0.28)',
      },
      fontFamily: {
        'thai': ['IBM Plex Sans Thai', 'sans-serif'],
      },
      borderRadius: {
        'thunder': '12px',
        'thunder-lg': '16px',
      },
      animation: {
        'thunder-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'thunder-bounce': 'bounce 1s infinite',
      }
    },
  },
  plugins: [],
}

