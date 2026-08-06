import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { loadContent } from './content-store.js'
import './styles/global.css'
import './styles/pages.css'
import './styles/ask.css'

/* Content is fetched before App is imported, not before it renders.
   The distinction matters: src/data/* derive values at module scope — the
   legal link list, the Ask desk's search index — so those modules must first
   evaluate with the store already populated. A static `import App` at the top
   of this file would load them too early and freeze the bundled fallbacks in.

   loadContent never rejects; on failure the site renders its bundled content. */

async function start() {
  await loadContent()

  const { default: App } = await import('./App.jsx')

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  )
}

start()
