import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#ffffff',
        panel: '#ffffff',
        panel2: '#f5f7f9',
        text: '#202b36',
        muted: '#596b7b',
        cyan: '#225d8e',
        green: '#217449',
        red: '#b6324a',
        warn: '#946414',
        line: '#dce2e7',
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
