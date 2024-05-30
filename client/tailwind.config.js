/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '!./src/components/AdminPanel.jsx',
    '!./src/components/UsersPanelTiny.jsx'
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
