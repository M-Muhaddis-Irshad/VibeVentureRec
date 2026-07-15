/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#fbf8f3",
          100: "#f4ede1",
          200: "#e8dcc7",
          300: "#d8c3a0",
        },
        clay: {
          500: "#b5654a",
          600: "#9a5039",
          700: "#7c3f2c",
        },
        ink: {
          800: "#2c2620",
          900: "#1a1611",
        },
        neon: {
          cyan:    "#00ffe7",
          purple:  "#bf5fff",
          pink:    "#ff2d78",
          green:   "#39ff14",
        },
      },
      boxShadow: {
        "neon-cyan":   "0 0 8px #00ffe7, 0 0 24px #00ffe755",
        "neon-purple": "0 0 8px #bf5fff, 0 0 24px #bf5fff55",
        "neon-pink":   "0 0 8px #ff2d78, 0 0 24px #ff2d7855",
      },
      fontFamily: {
        fontFamily: {
          serif: ["'Playfair Display'", "Georgia", "serif"],
          sans: ["'Inter'", "-apple-system", "Segoe UI", "sans-serif"],
        },
      },
    },
  },
  plugins: [],
};
