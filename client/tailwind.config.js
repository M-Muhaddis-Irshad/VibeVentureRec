/** @type {import('tailwindcss').Config} */
export default {
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
