import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import svgr from 'vite-plugin-svgr'
import path from 'path'

export default defineConfig({
  plugins: [
    svgr(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-icons/*.png', 'fonts/**/*.woff2'],
      manifest: {
        name: 'PoolDoz',
        short_name: 'PoolDoz',
        description: 'Calculez le volume et dosez les produits de votre piscine',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FFF4EE',
        theme_color: '#2D1B69',
        lang: 'fr',
        icons: [
          {
            src: '/pwa-icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        start_url: '/',
        scope: '/',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 250,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('@supabase')) return 'vendor-supabase'
          if (id.includes('i18next') || id.includes('react-i18next')) return 'vendor-i18n'
          if (id.includes('dexie')) return 'vendor-dexie'
          if (id.includes('react-router') || id.includes('react-dom') || (id.includes('node_modules/react/') && !id.includes('react-i18next'))) return 'vendor-react'
          if (id.includes('zustand')) return 'vendor-state'
        },
      },
    },
  },
})
