/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f6ff',
          100: '#e0edff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        cyber: {
          dark: '#0a0d14',
          card: '#121824',
          border: '#1e293b',
          cyan: '#00f2fe',
          purple: '#7928ca',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 242, 254, 0.25)',
        'glow-purple': '0 0 20px rgba(121, 40, 202, 0.25)',
        'glow-rose': '0 0 20px rgba(244, 63, 94, 0.25)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.25)',
      },
      backgroundImage: {
        'glass-radial': 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.1) 0%, rgba(15, 23, 42, 0) 70%)',
        'glass-card': 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
        'gradient-cyan-purple': 'linear-gradient(135deg, #00f2fe 0%, #4facfe 50%, #7928ca 100%)',
      }
    },
  },
  plugins: [],
}
