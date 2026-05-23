/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
        },
        ink: {
          950: '#111827',
          900: '#1f2937',
          700: '#374151',
          500: '#6b7280',
          300: '#d1d5db',
          100: '#f3f4f6',
        },
        health: {
          green: '#15803d',
          amber: '#b45309',
          red: '#b91c1c',
          neutral: '#4b5563',
        },
      },
      boxShadow: {
        panel: '0 1px 2px 0 rgb(15 23 42 / 0.06)',
        card: '0 1px 3px 0 rgb(15 23 42 / 0.08), 0 1px 2px -1px rgb(15 23 42 / 0.08)',
        elevated: '0 18px 40px -24px rgb(15 23 42 / 0.45)',
      },
    },
  },
  plugins: [],
}
