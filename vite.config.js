import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // API Java (modo SSO, VITE_SSO_ENABLED=true): o app chama '/forum-api/*', que vira '/api/*'
      // na API, e '/auth/*' (início do login, /auth/me etc.) é repassado como está. Mesmo domínio do
      // front => o cookie de sessão é first-party. Espelha os rewrites do vercel.json.
      '/forum-api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/forum-api/, '/api'),
      },
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Backend do PDI rodando em localhost:3001 — o front chama '/api/bi-progress' e o Vite
      // repassa pra evitar CORS em dev. (Prefixo '/api' continua sendo do PDI, por isso a API
      // Java usa '/forum-api'.)
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
