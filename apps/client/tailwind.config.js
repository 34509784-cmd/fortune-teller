/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mystic: {
          bg: '#1A1525',
          surface: '#2D2438',
          'surface-hover': '#3D324A',
          primary: '#6B4E71',
          secondary: '#C49BBB',
          accent: '#D4A76A',
          'text-primary': '#F0E6F6',
          'text-secondary': '#B8A9C4',
          success: '#7EB77F',
          warning: '#E8C86A',
          danger: '#D4796E',
          divider: '#3D324A',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['"Nunito"', '"Quicksand"', 'sans-serif'],
        chinese: ['"Noto Serif SC"', '"ZCOOL XiaoWei"', 'serif'],
      },
      borderRadius: {
        mystic: '12px',
        'mystic-lg': '16px',
      },
      boxShadow: {
        'mystic-glow': '0 0 20px rgba(107, 78, 113, 0.3)',
        'mystic-glow-lg': '0 0 40px rgba(107, 78, 113, 0.4)',
        'accent-glow': '0 0 15px rgba(212, 167, 106, 0.4)',
      },
      animation: {
        'star-twinkle': 'twinkle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'coin-flip': 'coinFlip 0.8s ease-out',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(212, 167, 106, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(212, 167, 106, 0.6)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        coinFlip: {
          '0%': { transform: 'rotateY(0deg) rotateX(0deg)' },
          '50%': { transform: 'rotateY(720deg) rotateX(360deg)' },
          '100%': { transform: 'rotateY(0deg) rotateX(0deg)' },
        },
      },
    },
  },
  plugins: [],
};
