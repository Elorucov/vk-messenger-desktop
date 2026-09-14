import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { buildDefines } from '../../scripts/defines.mjs'

const PACKAGE_ROOT = __dirname
const PROJECT_ROOT = resolve(PACKAGE_ROOT, '../..')

export default defineConfig({
  mode: process.env.MODE || 'production',
  root: PACKAGE_ROOT,
  envDir: PROJECT_ROOT,
  base: './',
  publicDir: 'public',
  define: buildDefines(),
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'mobx', '@vkontakte/vkui'],
    alias: {
      "react": "preact/compat",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime"
    }
  },
  worker: {
    format: 'es',
  },
  build: {
    outDir: 'dist',
    assetsDir: '',
    sourcemap: true,
    target: 'esnext',
    minify: 'esbuild',
    emptyOutDir: true,
    reportCompressedSize: false,
    commonjsOptions: {
      // часть пакетов в vendor/ собрана в CJS, а лежат они вне node_modules
      include: [/node_modules/, /vendor/],
    },
    chunkSizeWarningLimit: 4096,
    rollupOptions: {
      input: {
        index: resolve(PACKAGE_ROOT, 'index.html'),
        auth: resolve(PACKAGE_ROOT, 'auth.html'),
        calls: resolve(PACKAGE_ROOT, 'calls.html'),
        media: resolve(PACKAGE_ROOT, 'media.html'),
      },
    },
  },
})
