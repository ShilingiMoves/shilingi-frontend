/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#edf9f4',
                    100: '#d2f0e4',
                    200: '#a5dfca',
                    300: '#74cda9',
                    400: '#40bb87',
                    500: '#179b6e', // Main dashboard brand green
                    600: '#14875f',
                    700: '#116f4e',
                    800: '#0c563c',
                    900: '#093f2c',
                },
            },
            fontFamily: {
                sans: ['DM Sans', 'system-ui', 'sans-serif'],
                display: ['Inter', 'system-ui', 'sans-serif'],
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(-8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scroll: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
            },
            animation: {
                fadeIn: 'fadeIn 0.2s ease-out',
                scroll: 'scroll 30s linear infinite',
            },
        },
    },
    plugins: [],
}
