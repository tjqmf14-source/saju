import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(process.cwd(), 'src/android-engine-entry.js'),
      name: 'SajutaroEngineBundle',
      formats: ['iife'],
      fileName: () => 'engine.js'
    },
    outDir: 'android/app/build/generated/engine-assets/engine',
    emptyOutDir: true,
    minify: false,
    sourcemap: false
  }
});
