/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        pact: {
          50:  '#FFF7F3',
          100: '#FFE8DB',
          200: '#FFD0B5',
          300: '#FFB48E',
          400: '#FF9268',
          500: '#E8734E',
          600: '#CC5A38',
          700: '#A34529',
          800: '#7A331E',
          900: '#522214',
        },
      },
    },
  },
  plugins: [],
}
