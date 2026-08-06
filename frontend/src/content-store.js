/* ============================================================
   CONTENT STORE
   ============================================================

   The site's copy lives in the database and is edited from the admin panel.
   This module holds the fetched payload; every file in src/data/ reads from it
   and falls back to its own hard-coded content when a field is absent.

   Why it works without touching a single component:

     main.jsx awaits loadContent() and only then dynamically imports App.jsx.
     Because the src/data/* modules are first evaluated as part of that import,
     they see a populated store. Anything they derive at module scope — LEGAL_LINKS,
     the Ask desk's search index in knowledge.js — is therefore built from live
     content too, with no lazy-getter gymnastics.

   The fallback is deliberate. This is a live marketing site: if the API is
   unreachable, slow, or half-deployed, the page must still render exactly what
   it renders today rather than a blank shell. */

// Optional chaining so this module is also importable outside Vite (Node, tests),
// where import.meta.env does not exist.
const API_BASE =
  import.meta.env?.VITE_API_URL ||
  // Same-origin default: in production the API serves this bundle, so /api
  // resolves correctly. In dev without a .env it 404s and we fall back to
  // static content — noisy in the console, never broken on screen.
  '/api'

const store = { data: null, loaded: false, error: null }

/**
 * Read a content key, falling back to the bundled default.
 *
 * Only null/undefined fall back — an empty array is a legitimate editorial
 * choice (an admin deactivating every testimonial) and is respected.
 */
export function get(key, fallback) {
  if (!store.data) return fallback
  const value = store.data[key]
  return value === undefined || value === null ? fallback : value
}

export const status = () => ({ loaded: store.loaded, error: store.error })

/**
 * Fetch published content. Never throws: a failure leaves the store empty,
 * which means every data module serves its bundled default.
 */
export async function loadContent({ timeoutMs = 6000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${API_BASE}/meenakshi/content`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const body = await res.json()
    if (!body || body.success !== true || !body.data) throw new Error('Malformed response')

    store.data = body.data
    store.loaded = true
  } catch (err) {
    store.error = err
    if (import.meta.env?.DEV) {
      console.warn(
        `[content] Falling back to bundled content — ${err.message}. ` +
          `Tried ${API_BASE}/meenakshi/content`,
      )
    }
  } finally {
    clearTimeout(timer)
  }

  return store
}
