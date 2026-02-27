import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Todo App',
        short_name: 'Todo',
        description: 'Una aplicacion de tareas simple',
        start_url: './',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#963fb5',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        screenshots: [
          {
            src: '/screenshots/Captura1.png',
            sizes: '783x780',
            type: 'image/jpg'
          }
        ]
      },

      // 🔥 IMPORTANTE: desactivar en desarrollo
      devOptions: {
        enabled: false
      }
    })
  ]
})
 