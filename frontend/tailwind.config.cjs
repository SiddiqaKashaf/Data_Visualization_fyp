/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
      },
      colors: {
        brand: '#7f5af0',
        bgGlass: 'rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
};
