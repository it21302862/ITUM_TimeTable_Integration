/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Lexend", "sans-serif"],
      },
      colors: {
        // Match reference palette
        "background-light": "#f6f6f8",
        "background-dark": "#101622",

        // Keep existing keys used across screens, but tune to reference primary
        primary: {
          blue: "#135bec",
          "blue-light": "#60a5fa",
          "blue-badge": "#BFDBFE",
        },

        status: {
          past: "#374151",
          active: "#135bec",
          draft: "#6EE7B7",
          upcoming: "#10B981",
          "plan-draft": "#8B5CF6",
          orange: "#F97316",
        },

        border: {
          subtle: "#D1D5DB",
          "subtle-alt": "#E2E8F0",
        },
      },
    },
    plugins: [],
  },
};
