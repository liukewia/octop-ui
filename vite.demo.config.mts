import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

/**
 * 展厅（demo）的构建配置，与库构建（vite.config.ts）分开。
 *
 * base 用相对路径：GitHub Pages 的 project site 挂在 /<repo>/ 下，
 * 相对路径同时也能在本地 `vite preview` 和任意子目录静态托管里跑，
 * 不需要为每个部署目标改一次配置。
 */
export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  plugins: [tailwindcss(), react()],
  build: { outDir: 'demo-dist', emptyOutDir: true },
}));
