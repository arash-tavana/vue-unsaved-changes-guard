import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      entryRoot: 'src',
      include: ['src/index.ts', 'src/composables/**/*.ts', 'src/types/**/*.ts'],
      exclude: ['src/**/*.spec.ts'],
      insertTypesEntry: true,
    }),
  ],

  build: {
    emptyOutDir: true,
    copyPublicDir: false,

    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueUnsavedChangesGuard',
      fileName: 'vue-unsaved-changes-guard',
    },

    rollupOptions: {
      external: ['vue', 'vue-router'],

      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
        },
      },
    },
  },
})
