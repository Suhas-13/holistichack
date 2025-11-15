/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme
        void: '#0a0e14',
        surface: '#111827',
        elevated: '#1a1f2e',

        // Accent colors
        'primary-cyan': '#00d9ff',
        'primary-purple': '#a78bfa',
        'primary-magenta': '#ff006e',
        'primary-green': '#00ff88',

        // Status colors
        'status-running': '#00d9ff',
        'status-success': '#10b981',
        'status-failure': '#ef4444',
        'status-pending': '#6b7280',
        'status-partial': '#fbbf24',

        // Text colors
        'text-primary': '#f9fafb',
        'text-secondary': '#9ca3af',
        'text-muted': '#6b7280'
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        numeric: ['Roboto Mono', 'monospace']
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'scan': 'scan 2s linear infinite'
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)'
          },
          '50%': {
            opacity: '0.7',
            transform: 'scale(1.05)'
          }
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-1000px 0'
          },
          '100%': {
            backgroundPosition: '1000px 0'
          }
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)'
          },
          '50%': {
            transform: 'translateY(-10px)'
          }
        },
        scan: {
          '0%': {
            transform: 'translateY(-100%)'
          },
          '100%': {
            transform: 'translateY(100%)'
          }
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 217, 255, 0.5)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
        'glow-purple': '0 0 20px rgba(167, 139, 250, 0.5)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
};
