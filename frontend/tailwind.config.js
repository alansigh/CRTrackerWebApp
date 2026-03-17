/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0D0D12',
        champagne: '#C9A84C',
        ivory: '#FAF8F5',
        slate: '#2A2A35',
        'slate-light': '#3A3A45',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        drama: ['"Playfair Display"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'skeuo-inset': 'inset 2px 2px 5px rgba(0, 0, 0, 0.5), inset -2px -2px 5px rgba(255, 255, 255, 0.05)',
        'skeuo-outset': '2px 2px 5px rgba(0, 0, 0, 0.5), -1px -1px 3px rgba(255, 255, 255, 0.05)',
        'skeuo-button': '0 4px 6px rgba(0, 0, 0, 0.3), inset 1px 1px 2px rgba(255, 255, 255, 0.1), inset -1px -1px 2px rgba(0, 0, 0, 0.4)',
        'skeuo-button-pressed': 'inset 2px 2px 5px rgba(0, 0, 0, 0.6), inset -1px -1px 2px rgba(255, 255, 255, 0.05)',
        'glow-champagne': '0 0 10px rgba(201, 168, 76, 0.5), 0 0 20px rgba(201, 168, 76, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
