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
                    50: '#edf8f4',
                    100: '#d4ede2',
                    200: '#a9dbc5',
                    300: '#78c6a5',
                    400: '#43b184',
                    500: '#1f9871', // Updated dashboard brand green
                    600: '#1a8663',
                    700: '#166d52',
                    800: '#125642',
                    900: '#0d3e31',
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
