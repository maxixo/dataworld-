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
                'surface-dark': '#1F2937',
                'background-light': '#F9FAFB',
                'background-dark': '#111827',
                'text-main-light': '#111318',
                'text-main-dark': '#F3F4F6',
                'text-muted-light': '#6B7280',
                'text-muted-dark': '#D1D5DB',
                'border-light': '#E5E7EB',
                'border-dark': '#374151',
                'secondary': '#06B6D4',
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
