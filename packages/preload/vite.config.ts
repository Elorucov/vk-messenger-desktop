import { builtinModules } from 'node:module'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { buildDefines } from '../../scripts/defines.mjs'

const PACKAGE_ROOT = __dirname
const PROJECT_ROOT = resolve(PACKAGE_ROOT, '../..')

export default defineConfig({
  mode: process.env.MODE || 'production',
  root: PACKAGE_ROOT,
  envDir: PROJECT_ROOT,
  define: buildDefines(),
  resolve: {
    conditions: ['node'],
    mainFields: ['module', 'jsnext:main', 'jsnext', 'main'],
    alias: {
      "react": "preact/compat",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime"
    }
  },
  ssr: {
    noExternal: true,
  },
  build: {
    ssr: true,
    sourcemap: true,
    target: 'node20',
    outDir: 'dist',
    assetsDir: '.',
    minify: 'esbuild',
    emptyOutDir: false,
    reportCompressedSize: false,
    commonjsOptions: {
      // часть пакетов в vendor/ собрана в CJS, а лежат они вне node_modules
      include: [/node_modules/, /vendor/],
    },
    rollupOptions: {
      input: {
        entryVkm: resolve(PACKAGE_ROOT, 'src/entryVkm.ts'),
        entryCalls: resolve(PACKAGE_ROOT, 'src/entryCalls.ts'),
        entryMedia: resolve(PACKAGE_ROOT, 'src/entryMedia.ts'),
        entryRegWebView: resolve(PACKAGE_ROOT, 'src/entryRegWebView.ts'),
      },
      external: [
        'electron',
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
      ],
      output: {
        format: 'cjs',
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
      },
    },
  },
})
