/* global require, __dirname */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

const path = require('path');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), visualizer({
    emitFile: false,
    file: 'stats.html', //分析图生成的文件名
    // open:true
  })],
  base: './',
  build: {
    // 输出路径
    // outDir: './dist',
    // 自定义底层的 Rollup 打包配置
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, './index.html'),
        uNetwork: path.resolve(__dirname, './uNetwork.html'),
        declarativeNetRequest: path.resolve(__dirname, './declarativeNetRequest.html'),
      },
      output: {
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: 'static/css/[name]-[hash].[ext]',
      }
    },
  }
});
