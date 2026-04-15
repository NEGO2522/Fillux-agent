import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// When building the Chrome extension, set VITE_BUILD_TARGET=extension
// so asset paths stay relative (required by extensions).
// For the normal web build, base is '/' so BrowserRouter works correctly on Vercel.
const isExtension = process.env.VITE_BUILD_TARGET === 'extension';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5175,
  },
  base: isExtension ? './' : '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
})
