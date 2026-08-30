/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        wari: {
          primary: '#8B3A3A',
          secondary: '#D4A373',
          accent: '#2D6A4F',
          background: '#FDF8F0',
          paper: '#FDF8F0',
          ink: '#2D1B0E',
          brown: '#5A4030',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 4px 20px rgba(139, 58, 58, 0.08)',
        'warm-hover': '0 8px 30px rgba(139, 58, 58, 0.15)',
      },
      borderRadius: {
        wari: '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
};
