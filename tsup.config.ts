import { defineConfig } from 'tsup';

export default defineConfig({
  // Entry points
  entry: {
    index: 'src/index.ts',
    'cli/cli': 'src/cli/cli.ts',
  },

  // Output formats
  format: ['esm', 'cjs'],

  // Output directories
  outDir: 'dist',
  outExtension: ({ format }) => ({
    js: format === 'esm' ? '.js' : '.cjs',
  }),

  // TypeScript declarations
  dts: {
    resolve: true,
  },

  // Source maps
  sourcemap: true,

  // Clean output directory before build
  clean: true,

  // Minification
  minify: false,

  // Code splitting
  splitting: false,

  // Tree shaking
  treeshake: true,

  // Target environment
  target: 'node18',
  platform: 'node',

  // External dependencies (don't bundle)
  external: [
    'libxmljs2',
    'xpath',
    '@xmldom/xmldom',
    'commander',
  ],

  // Shims for Node.js builtins
  shims: true,

  // Keep original names
  keepNames: true,

  // Don't add banner here - the shebang is already in the source file
});
