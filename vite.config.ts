/// <reference types="vitest" />

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
      // runtime: path.resolve(__dirname, './wailsjs/runtime'),
      // backend: path.resolve(__dirname, './wailsjs/go')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    threads: false
  }
})
