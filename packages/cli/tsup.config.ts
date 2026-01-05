import { defineConfig } from 'tsup'

export default defineConfig([
  // Library entry (no shebang)
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    minify: false,
    target: 'node18',
  },
  // CLI entry (with shebang)
  {
    entry: ['src/bin.ts'],
    format: ['cjs'],
    dts: true,
    sourcemap: true,
    minify: false,
    target: 'node18',
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
])
