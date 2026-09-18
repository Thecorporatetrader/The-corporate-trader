import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#070b12',
        panel: '#0e1520',
        panel2: '#121c29',
        text: '#eef6ff',
        muted: '#8fa3b8',
        cyan: '#00e5ff',
        green: '#00d084',
        red: '#ff4d6d',
        warn: '#ffcc66',
        line: '#1e3042',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        card: '18px',
      },
    },
  },
  plugins: [],
};

export default config;
