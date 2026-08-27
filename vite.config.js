import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/appyama-novo/', // <-- Adicione esta linha (substitua pelo nome exato do seu repositório se for diferente)
})