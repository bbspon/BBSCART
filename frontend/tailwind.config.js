/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        logoPrimary: '#dc2043',
        primary: '#dc2043',
        secondary: '#002f4b',
        tertiary: '#0da89c',
        logoSecondary: '#0da89c',
      },
      borderColor: theme => ({
        ...theme('colors'),
        logoPrimary: theme('colors.logoPrimary'),
        primary: theme('colors.primary'),
        secondary: theme('colors.secondary'),
        tertiary: theme('colors.tertiary'),
        logoSecondary: theme('colors.logoSecondary'),
      }),
      textColor: theme => ({
        ...theme('colors'),
        logoPrimary: theme('colors.logoPrimary'),
        primary: theme('colors.primary'),
        secondary: theme('colors.secondary'),
        tertiary: theme('colors.tertiary'),
        logoSecondary: theme('colors.logoSecondary'),
      }),
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        marquee: 'marquee 20s linear infinite',
      },
    },
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'w-881': '881px',
      'lg': '1024px',
      'w-1125': '1125px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [
    function ({ addComponents, theme }) {
      addComponents({
        '.bbscontainer': {
          maxWidth: theme('theme.bbscontainer.width.DEFAULT', '1400px'),
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('theme.container.padding.DEFAULT'),
          paddingRight: theme('theme.container.padding.DEFAULT'),
        },
      });
    },
  ],
};
