# React + Vite + TypeScript 教学动画项目

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

一个用于 Python OOP 概念可视化教学的现代化 React + Vite + TypeScript 项目。

## 🎉 特性

- **React** - 构建用户界面的 JavaScript 库。
- **Vite** - 极速的前端构建工具。
- **TypeScript** - 类型安全的 JavaScript 超集。
- **Tailwind CSS** - 实用优先的 CSS 框架。
- **Zustand** - 轻量级状态管理。
- **ESLint** - 代码质量保障。
- **PostCSS** & **Autoprefixer** - CSS 处理。

## ⚙️ 环境要求

- Node.js (16 及以上)
- pnpm (推荐包管理器)

## 🚀 快速开始

1. 克隆仓库：

   ```bash
   git clone <your-repo-url>
   ```

2. 进入项目目录：

   ```bash
   cd class_animation
   ```

3. 安装依赖：

   ```bash
   pnpm install
   ```

4. 启动开发服务器：

   ```bash
   pnpm dev
   ```

## 📜 可用脚本

- `pnpm dev`    启动开发服务器
- `pnpm build`  构建生产包
- `pnpm lint`   代码检查
- `pnpm preview` 预览生产包

## 📂 目录结构

```text
class_animation/
  ├── public/            # 公共资源
  ├── src/               # 源码目录
  │   ├── components/    # 组件
  │   ├── constants/     # 常量/静态数据
  │   ├── lib/           # 工具函数/状态管理
  │   ├── state/         # reducer 等状态逻辑
  │   ├── styles/        # 样式
  │   ├── App.tsx        # 应用入口
  │   └── main.tsx       # 渲染入口
  ├── .eslintrc.json     # ESLint 配置
  ├── index.html         # HTML 入口
  ├── postcss.config.js  # PostCSS 配置
  ├── tailwind.config.js # Tailwind CSS 配置
  ├── tsconfig.json      # TypeScript 配置
  └── vite.config.ts     # Vite 配置
```

## 📝 说明

- 推荐使用 [pnpm](https://pnpm.io/) 进行依赖管理。
- 交互动画和代码高亮均已支持动态联动。
- 如需自定义场景或高亮，编辑 `src/constants/scenes.ts`。

## 📄 License

MIT
