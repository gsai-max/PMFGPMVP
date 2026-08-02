/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        blinkit: {
          yellow: '#F8CB46',
          green: '#0C831F',
          darkGreen: '#096417',
          lightYellow: '#FFF8E7',
          bg: '#F4F6FB',
          textDark: '#1C1C1C',
        },
      },
    },
  },
  plugins: [],
};
