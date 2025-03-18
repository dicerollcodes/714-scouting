/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'team-blue': '#3b82f6',
        'team-red': '#ef4444',
        'field-gray': '#1e1e1e',
        'alliance-blue': '#1e40af',
        'alliance-red': '#b91c1c',
        'coral-green': '#4ade80',
        'processor-blue': '#2563eb',
        'barge-red': '#dc2626',
      },
      spacing: {
        '1/8': '12.5%',
      }
    },
  },
  plugins: [],
} 