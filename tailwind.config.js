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
        'fg-primary': 'var(--color-text-primary)',
        'fg-accent': 'var(--color-text-accent)',
        'fg-muted': 'var(--color-text-muted)',
        'fg-secondary': 'var(--color-text-secondary)',
        'player': 'var(--color-player)',
        'enemy': 'var(--color-enemy)',
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
        'magic': 'var(--color-magic)',
        'hint': 'var(--color-hint)',
        'border-default': 'var(--color-border-default)',
      },
      fontFamily: {
        'cinzel': ['var(--font-cinzel)', 'serif'],
        'inter': ['var(--font-inter)', 'sans-serif'],
        'merriweather': ['var(--font-merriweather)', 'serif'],
        'monospace': ['var(--font-monospace)', 'monospace'],
      },
      fontSize: {
        'display': ['var(--font-size-display)', { lineHeight: '1.2' }],
        'h1': ['var(--font-size-h1)', { lineHeight: '1.3' }],
        'h2': ['var(--font-size-h1)', { lineHeight: '1.3' }],
        'body': ['var(--font-size-body)', { lineHeight: '1.6' }],
        'caption': ['var(--font-size-caption)', { lineHeight: '1.4' }],
        'dice': ['var(--font-size-dice)', { lineHeight: '1.4' }],
      },
      spacing: {
        '1': 'var(--spacing-1)',
        '2': 'var(--spacing-2)',
        '3': 'var(--spacing-3)',
        '4': 'var(--spacing-4)',
        '6': 'var(--spacing-6)',
        '8': 'var(--spacing-8)',
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