import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';

const isLib = process.argv.includes('build');

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(isLib
      ? [
          dts({
            tsconfigPath: './tsconfig.build.json',
            include: ['src'],
            entryRoot: 'src',
            insertTypesEntry: false,
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
  build: {
    cssCodeSplit: false,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'index.js',
      cssFileName: 'octop-ui',
    },
    rollupOptions: {
      // 依赖不打进产物：消费方按 package.json 安装，与常见组件库一致
      external: (id) => !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0'),
      output: {
        assetFileNames: (asset) =>
          asset.name === 'style.css' || asset.name === 'octop-ui.css'
            ? 'octop-ui.css'
            : '[name][extname]',
      },
    },
  },
});
