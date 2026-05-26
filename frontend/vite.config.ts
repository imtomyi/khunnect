import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: { port: 5179 },
  plugins: [
    tailwindcss(),
    tanstackRouter(),
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        // 벤더 라이브러리를 별도 청크로 분리 → 브라우저 캐시 효율 극대화
        manualChunks: (id: string) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom'))
            return 'vendor-react'
          if (id.includes('@tanstack/react-router'))
            return 'vendor-router'
          if (id.includes('@tanstack/react-query'))
            return 'vendor-query'
          if (id.includes('@supabase'))
            return 'vendor-supabase'
        },
      },
    },
  },
})