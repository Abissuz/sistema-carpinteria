import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto', // Asegura la inyección inmediata
      devOptions: { enabled: true },
      workbox: { maximumFileSizeToCacheInBytes: 4000000 },
      manifest: {
        name: 'Carpintería Sagrada Familia',
        short_name: 'Carpintería',
        description: 'Sistema de Cotizaciones y Cobros',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'logo-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'logo-512.png', sizes: '512x512', type: 'image/png' }
        ],
        // Silenciamos las advertencias de "Richer PWA Install UI"
        screenshots: [
          { src: "logo-512.png", sizes: "512x512", type: "image/png", form_factor: "wide" },
          { src: "logo-512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ]
})