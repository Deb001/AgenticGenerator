module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A',
        secondary: '#2563EB',
        accent: '#10B981'
      },
      boxShadow: {
        card: '0 4px 6px rgba(0,0,0,0.1)'
      }
    }
  },
  plugins: []
};
