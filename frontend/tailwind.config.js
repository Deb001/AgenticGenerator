/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{tsx,ts,jsx,js}'],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a', // indigo-900
        secondary: '#2563eb', // indigo-600
        accent: '#f59e0b' // amber-500
      }
    }
  },
  plugins: []
};