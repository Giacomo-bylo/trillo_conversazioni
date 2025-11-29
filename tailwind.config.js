/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4361EE',
          hover: '#3651D4',
          50: '#EEF1FD',
          100: '#D4DBFA',
          500: '#4361EE',
          600: '#3651D4',
          700: '#2A41B8',
        },
      },
    },
  },
  plugins: [],
}
