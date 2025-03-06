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
        'button-primary': '#FFC0CB',
        'button-primary-hover': '#FFB6C1',
      },
    },
  },
  plugins: [],
}

