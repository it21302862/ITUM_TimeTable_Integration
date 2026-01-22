/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Blue Accent - Used for active highlights, links, buttons, logo
        primary: {
          blue: '#2563EB', // blue-600
          'blue-light': '#3B82F6', // blue-500
          'blue-badge': '#BFDBFE', // blue-200
        },
        // Dark Text/Heading
        text: {
          dark: '#1F2937', // gray-900
          'dark-alt': '#2C3E50',
        },
        // Medium Gray Text
        gray: {
          medium: '#6B7280', // gray-500
          'medium-alt': '#475467',
          'medium-dark': '#64748B', // slate-500
        },
        // Light Gray Background
        bg: {
          light: '#F8F8F8',
          'light-alt': '#F6F8FC',
        },
        // Status colors
        status: {
          past: '#374151', // gray-700
          active: '#2563EB', // blue-600
          draft: '#6EE7B7', // emerald-300
          upcoming: '#10B981', // emerald-500
          'plan-draft': '#8B5CF6', // violet-500
          orange: '#F97316', // orange-500
        },
        // Border colors
        border: {
          subtle: '#D1D5DB', // gray-300
          'subtle-alt': '#E2E8F0', // slate-200
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
