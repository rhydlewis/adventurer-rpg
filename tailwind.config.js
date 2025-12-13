/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'player': 'var(--color-player)',
        'enemy': 'var(--color-enemy)',
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
        'magic': 'var(--color-magic)',
        'hint': 'var(--color-hint)',
        'border-default': 'var(--color-border-default)',
      },
      textColor: {
        'primary': 'var(--color-text-primary)',
        'accent': 'var(--color-text-accent)',
        'muted': 'var(--color-text-muted)',
        'secondary': 'var(--color-text-secondary)',
      },
      fontFamily: {
        'cinzel': ['var(--font-cinzel)', 'serif'],
        'inter': ['var(--font-inter)', 'sans-serif'],
        'merriweather': ['var(--font-merriweather)', 'serif'],
        'monospace': ['var(--font-monospace)', 'monospace'],
      },
      fontSize: {
        'display': ['var(--text-display)', { lineHeight: '1.2' }],
        'h1': ['var(--text-h1)', { lineHeight: '1.3' }],
        'body': ['var(--text-body)', { lineHeight: '1.6' }],
        'caption': ['var(--text-caption)', { lineHeight: '1.4' }],
        'dice': ['var(--text-dice)', { lineHeight: '1.4' }],
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
      },
      fontWeight: {
        'regular': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
        'black': '900',
      },
    },
  },
  plugins: [],
}