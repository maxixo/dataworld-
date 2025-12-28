/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2563EB',
                'primary-hover': '#1d4ed8',
                'accent-teal': '#06B6D4',
                'surface-light': '#ffffff',
                'background-light': '#F9FAFB',
            },
            fontFamily: {
                display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                xl: '0.75rem',
                '2xl': '1rem',
            },
        },
    },
    plugins: [],
}
