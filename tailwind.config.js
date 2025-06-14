/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-primary',
    'text-primary',
    'hover:bg-primary',
    'hover:text-primary',
    'bg-primary/10',
    'border-primary',
    'focus:ring-primary'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        primaryDark: '#2563EB',
        secondary: "#64ffda",
        tertiary: "#112240",
        lightText: "#ccd6f6",
        darkText: "#8892b0",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'inherit',
            a: {
              color: '#3B82F6',
              '&:hover': {
                color: '#2563EB',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 