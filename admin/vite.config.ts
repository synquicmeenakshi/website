import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The runtime guard in src/config/api.ts cannot stop a bad bundle being built —
// Vite inlines import.meta.env at build time, so a missing variable only
// surfaces as a blank page in the browser. Validate here so `npm run build`
// fails instead of shipping a broken or wrongly-pointed bundle.
const REQUIRED = ['VITE_API_URL', 'VITE_SERVER_URL']

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const missing = REQUIRED.filter((key) => !env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}.\n` +
        `Set them in admin/.env.${mode} before building. There is no default — ` +
        `a fallback domain would point this deployment at the wrong site.`
    )
  }

  // Vite loads plain `.env` in every mode, so a developer's local file can
  // silently supply localhost URLs to a production build. Catch the value,
  // not merely its presence.
  if (mode === 'production') {
    const local = REQUIRED.filter((key) => /localhost|127\.0\.0\.1/.test(env[key]))
    if (local.length > 0) {
      throw new Error(
        `Production build has localhost URL(s) in: ${local.join(', ')}.\n` +
          `A plain admin/.env is loaded in every mode and overrides nothing — ` +
          `set the real values in admin/.env.production, or remove admin/.env.`
      )
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    base: '/admin/',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  }
})
