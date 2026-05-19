import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * Разбиваем бандл на логические чанки:
         *
         * vendor-react    — react + react-dom. Меняется редко → долгий кеш.
         * vendor-supabase — @supabase. Меняется при обновлении SDK.
         * vendor-icons    — @hugeicons. Меняется при добавлении иконок.
         *
         * Контентные локали (nodes/tutorials/library) — lazy-чанки,
         * создаются автоматически из динамических import() в content-xx.js.
         */
        manualChunks(id) {
          if (id.includes('/node_modules/react-dom/') ||
              id.includes('/node_modules/react/')) {
            return 'vendor-react';
          }
          if (id.includes('/node_modules/@supabase/')) {
            return 'vendor-supabase';
          }
          if (id.includes('/node_modules/@hugeicons/')) {
            return 'vendor-icons';
          }
        },
      },
    },
  },
});
