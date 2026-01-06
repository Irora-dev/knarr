/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Palette
        forge: {
          black: '#0D0D0F',
          DEFAULT: '#0D0D0F',
        },
        longhouse: {
          grey: '#1A1A1E',
          DEFAULT: '#1A1A1E',
        },
        iron: {
          slate: '#2A2A30',
          DEFAULT: '#2A2A30',
        },
        bone: {
          white: '#E8E4DF',
          DEFAULT: '#E8E4DF',
        },
        fog: {
          grey: '#9A9590',
          DEFAULT: '#9A9590',
        },
        stone: {
          grey: '#5C5955',
          DEFAULT: '#5C5955',
        },
        // Accent Colors
        ember: {
          gold: '#C9A227',
          DEFAULT: '#C9A227',
        },
        aged: {
          bronze: '#8B6914',
          DEFAULT: '#8B6914',
        },
        fjord: {
          blue: '#3D5A6C',
          DEFAULT: '#3D5A6C',
        },
        storm: {
          slate: '#4A5568',
          DEFAULT: '#4A5568',
        },
        // Semantic Colors
        victory: {
          green: '#2D5A3D',
          DEFAULT: '#2D5A3D',
        },
        warning: {
          amber: '#A67C00',
          DEFAULT: '#A67C00',
        },
        blood: {
          red: '#8B2635',
          DEFAULT: '#8B2635',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        'display-lg': ['32px', { lineHeight: '1.1', fontWeight: '700' }],
        'display-md': ['28px', { lineHeight: '1.2', fontWeight: '600' }],
        'heading-lg': ['24px', { lineHeight: '1.25', fontWeight: '600' }],
        'heading-md': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
        'data-lg': ['32px', { lineHeight: '1.1', fontWeight: '500' }],
        'data-md': ['24px', { lineHeight: '1.2', fontWeight: '400' }],
        'data-sm': ['16px', { lineHeight: '1.3', fontWeight: '400' }],
      },
      boxShadow: {
        'forge': '0 4px 12px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.2)',
        'forge-lg': '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(232, 228, 223, 0.05)',
        'forge-glow': '0 0 30px rgba(201, 162, 39, 0.15), 0 0 60px rgba(201, 162, 39, 0.1)',
        'storm': '0 16px 48px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'forge-reveal': 'forgeReveal 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        forgeReveal: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      transitionTimingFunction: {
        'forge': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
