/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
    },
    extend: {
      colors: {
        warm: {
          50: '#FDF8F3',
          100: '#FAF0E6',
          200: '#F3DFC8',
          300: '#E8C69E',
          400: '#DBA76F',
          500: '#E07856',
          600: '#C95D3D',
          700: '#A84630',
          800: '#87382A',
          900: '#6E2F25',
        },
        sage: {
          50: '#F4F8F0',
          100: '#E6F0DC',
          200: '#CFE1BB',
          300: '#AFCB8E',
          400: '#8DB362',
          500: '#7BA05B',
          600: '#5E7D42',
          700: '#4A6036',
          800: '#3C4D2E',
          900: '#334128',
        },
        clay: {
          50: '#F9F6F2',
          100: '#F1EBE1',
          200: '#E3D5C0',
          300: '#D1B895',
          400: '#BD9768',
          500: '#8B6F47',
          600: '#72593A',
          700: '#5C4731',
          800: '#4C3B2B',
          900: '#403226',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        display: ['"ZCOOL KuaiLe"', '"Noto Sans SC"', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(139, 111, 71, 0.12)',
        'card': '0 2px 12px -4px rgba(224, 120, 86, 0.15)',
        'warm': '0 8px 30px -8px rgba(224, 120, 86, 0.25)',
      },
      borderRadius: {
        'xl2': '14px',
        '3xl2': '22px',
      },
      animation: {
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
