function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variableName}) / ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: withOpacity('--background'),
        foreground: withOpacity('--foreground'),
        primary: {
          DEFAULT: withOpacity('--primary'),
          foreground: withOpacity('--primary-foreground'),
        },
        secondary: withOpacity('--secondary'),
        accent: withOpacity('--accent'),
        'panel-bg': withOpacity('--panel-bg'),
        'panel-border': withOpacity('--panel-border'),
        'panel-title': withOpacity('--panel-title'),
        'panel-subtitle': withOpacity('--panel-subtitle'),
        'panel-var-blue': withOpacity('--panel-var-blue'),
        'panel-var-red': withOpacity('--panel-var-red'),
        'panel-var-gray': withOpacity('--panel-var-gray'),
        'highlight-bg': withOpacity('--highlight-bg'),
        'highlight-border': withOpacity('--highlight-border'),
        'highlight-fg': withOpacity('--highlight-fg'),
        'secondary': '#10b981', // 例如次要颜色
        'accent': '#f59e0b',    // 例如强调颜色
        'dark-background': '#1a202c', // 深色背景
        'dark-surface': '#2d3748',     // 深色面板/卡片
        'dark-text': '#e2e8f0',      // 深色文本
      },
    },
  },
  plugins: [],
};
