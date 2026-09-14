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
    // как и в исходной сборке, всё кроме electron и нативных модулей едет внутрь бандла
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
    lib: {
      entry: resolve(PACKAGE_ROOT, 'src/index.ts'),
      formats: ['cjs'],
    },
    rollupOptions: {
      external: [
        'electron',
        'active-win',
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
      ],
      output: {
        entryFileNames: 'index.js',
        chunkFileNames: '[name]-[hash].js',
      },
    },
  },
})
