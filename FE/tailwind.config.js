/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
      },
      colors: {
        'primary': '#FEF7FF',
        'secondary': '#FFC0CB',
        'button-primary': '#FF69B4',
        'button-primary-darker': '#FF1493',
        'button-primary-active': '#FF8DA1',
      },
    },
  },
  plugins: [],
}

