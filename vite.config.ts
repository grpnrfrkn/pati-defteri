import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const base = '/pati-defteri/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Pati Defteri',
        short_name: 'Pati Defteri',
        description: 'Görevlerin ve minik kedin için sıcak bir defter',
        lang: 'tr',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#fbf7f4',
        theme_color: '#fbf7f4',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
