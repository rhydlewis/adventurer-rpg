/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': 'var(--bg-primary)',
        'secondary': 'var(--bg-secondary)',
        'text-primary': 'var(--text-primary)',
        'text-accent': 'var(--text-accent)',
        'player': 'var(--color-player)',
        'enemy': 'var(--color-enemy)',
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
        'magic': 'var(--color-magic)',
        'border-default': 'var(--border-default)',
      },
      fontFamily: {
        'cinzel': ['var(--font-cinzel)', 'serif'],
        'inter': ['var(--font-inter)', 'sans-serif'],
        'merriweather': ['var(--font-merriweather)', 'serif'],
        'monospace': ['var(--font-monospace)', 'monospace'],
      },
      fontSize: {
        'display': 'var(--text-display)',
        'h1': 'var(--text-h1)',
        'body': 'var(--text-body)',
        'caption': 'var(--text-caption)',
        'dice': 'var(--text-dice)',
      }
    },
  },
  plugins: [],
}