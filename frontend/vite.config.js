import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [ react(), tailwindcss() ],
  server: {
    proxy: {
      '/api/auth': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/api/projects': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/ai': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/runtime': {
        target: 'http://localhost',
        changeOrigin: false,
        rewrite: (path) => path.replace(/^\/runtime\/[^/]+/, '') || '/',
        configure(proxy) {
          proxy.on('proxyReq', (proxyRequest, request) => {
            const runtimeId = request.headers[ 'x-runtime-id' ]

            if (typeof runtimeId === 'string' && runtimeId) {
              proxyRequest.setHeader('host', `${runtimeId}.file-system.localhost`)
              proxyRequest.removeHeader('x-runtime-id')
            }
          })
        },
      },
    },
  },
})
