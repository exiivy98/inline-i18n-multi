import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/extension.ts'],
  format: ['cjs'],
  dts: false,
  clean: true,
  sourcemap: true,
  minify: false,
  target: 'node18',
  external: ['vscode'],
})
