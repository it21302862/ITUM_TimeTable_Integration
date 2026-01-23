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
        primary: {
          blue: "#2563EB",
          "blue-light": "#3B82F6",
          "blue-badge": "#BFDBFE",
          "background-light": "#f6f6f8",
          "background-dark": "#101622",
        },

        status: {
          past: "#374151",
          active: "#2563EB",
          draft: "#6EE7B7",
          upcoming: "#10B981",
          "plan-draft": "#8B5CF6",
          orange: "#F97316",
        },

        border: {
          subtle: "#D1D5DB",
          "subtle-alt": "#E2E8F0",
        },
        borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
      },
    },
    plugins: [],
  },
};
