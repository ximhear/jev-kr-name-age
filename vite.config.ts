import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { jevApi } from './server/plugin.ts'

export default defineConfig(({ mode }) => {
  // Expose TYPESAFE_API_KEY from .env to the server-side SDK (never to the client bundle).
  Object.assign(process.env, loadEnv(mode, process.cwd(), 'TYPESAFE_'))
  return { plugins: [react(), jevApi()] }
})
