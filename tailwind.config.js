/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')
module.exports = {
    darkMode: 'class', // media 跟随系统
    content: [
        './src/**/*.{html,js,jsx,ts,tsx}',
        './public/index.html'
    ],
    theme: {
        extend: {},
        screens: {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px'
        }
    },
    plugins: [
        plugin(({ addVariant }) => {
            addVariant('not-last', '&:not(:last-child)');
        })
    ]
}