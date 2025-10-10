/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        jost: ['"Jost"', "sans-serif"],
      },
      colors: {
        'custom-red': 'rgb(244 90 87 / 8%)',
      },
    },
  },
  plugins: [],
};
