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
                    50: '#f5f0ff',
                    100: '#e9e3ff',
                    200: '#d4c5ff',
                    300: '#b69dff',
                    400: '#9c6dff',
                    500: '#843dff',
                    600: '#7c15ff',
                    700: '#6800ef',
                    800: '#5600c3',
                    900: '#4700a0',
                }
            }
        },
    },
    plugins: [],
} 