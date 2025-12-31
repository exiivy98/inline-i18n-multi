import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/server.ts',
    'src/client.ts',
    'src/middleware.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  treeshake: true,
  external: ['react', 'next', 'inline-i18n-multi', 'inline-i18n-multi-react'],
})
