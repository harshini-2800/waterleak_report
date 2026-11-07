/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060D17',
          900: '#0B1728',
          800: '#13233C',
          700: '#1D3354',
        },
        aqua: {
          DEFAULT: '#19B5C5',
          light: '#42D3E2',
          dark: '#128B97',
        },
        emerald: {
          brand: '#16A77A',
          glow: '#1FDF9F',
        },
        surface: {
          soft: '#F5F8FA',
          card: '#FFFFFF',
        },
        muted: '#718096',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(11, 23, 40, 0.07), 0 0 1px 1px rgba(11, 23, 40, 0.05)',
        'luxury-hover': '0 30px 60px -12px rgba(25, 181, 197, 0.15), 0 0 1px 1px rgba(25, 181, 197, 0.2)',
        'glow': '0 0 25px rgba(25, 181, 197, 0.35)',
      }
    },
  },
  plugins: [],
}
