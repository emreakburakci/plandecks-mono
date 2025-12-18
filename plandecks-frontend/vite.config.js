import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Docker için gerekli (0.0.0.0 dinlemesi için)
    port: 5173,
    allowedHosts: [
      'plandecks.com',
      'www.plandecks.com',
      '94.154.34.86', // IP ile girmeyi denerseniz diye
      'plandecks-frontend' // Docker içi iletişim için gerekebilir
    ]
    // VEYA TÜMÜNE İZİN VERMEK İÇİN (Daha Kolay):
    // allowedHosts: true,
  }
})