/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 定义你的主题颜色
        'primary': {
          light: '#6366f1', // 例如一个浅色调
          DEFAULT: '#4f46e5', // 例如主色调
          dark: '#4338ca',   // 例如一个深色调
        },
        'secondary': '#10b981', // 例如次要颜色
        'accent': '#f59e0b',    // 例如强调颜色
        'dark-background': '#1a202c', // 深色背景
        'dark-surface': '#2d3748',     // 深色面板/卡片
        'dark-text': '#e2e8f0',      // 深色文本
        // 明亮主题色
        'panel-bg': '#f9fafb',
        'panel-border': '#e5e7eb',
        'panel-title': '#111827',
        'panel-subtitle': '#374151',
        'panel-var-blue': '#2563eb',
        'panel-var-red': '#dc2626',
        'panel-var-gray': '#6b7280',
        // ... 其他你需要的颜色
      },
    },
  },
  plugins: [],
};
