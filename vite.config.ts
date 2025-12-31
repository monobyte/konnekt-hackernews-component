import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    react(),
    dts({
      // Ensures types are generated for all files handled by the build
      insertTypesEntry: true,
      include: ['src/components'],
      // This helps maintain the clean structure in your dist folder
      outDir: 'dist',
      // Prevents the generation of a single massive .d.ts file
      rollupTypes: false
    })
  ],
  build: {
    lib: {
      // Point to your main index, but rollupOptions will handle the rest
      entry: path.resolve(__dirname, 'src/components/index.ts'),
      formats: ['es'] // Individual exports work best with ES modules
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      input: Object.fromEntries(
        glob.sync('src/components/**/*.{ts,tsx}').map((file) => [
          // This removes the 'src/components/' prefix and the file extension
          // so 'src/components/Calculator.tsx' becomes 'Calculator'
          path.relative('src/components', file.slice(0, file.lastIndexOf(path.extname(file)))),
          fileURLToPath(new URL(file, import.meta.url))
        ])
      ),
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name].[ext]',
        // This ensures your folder structure is preserved in the dist folder
        preserveModules: true,
        preserveModulesRoot: 'src/components',
        dir: 'dist'
      }
    }
  }
});
