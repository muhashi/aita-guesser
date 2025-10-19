import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/aita-guesser/', // https://vitejs.dev/guide/static-deploy.html#github-pages
  plugins: [react()],
})
