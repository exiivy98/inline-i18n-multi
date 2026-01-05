import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  treeshake: false, // disable to prevent 'use client' removal
  external: ['react', 'inline-i18n-multi'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    }
  },
})
