import { useEffect } from 'react'

/* Per-route title and meta description.
   This is a client-rendered SPA, so index.html carries one static title for
   every route — fine for a crawler that executes JS, poor for link previews and
   for anything that reads the initial HTML. Setting it per route is the cheap
   half of the fix; server rendering or prerendering would be the other half. */

const BASE_TITLE = 'Meenakshi — Occult Sciences Expert, Spiritual Consultant & Destiny Strategist'

function setMeta(name, content) {
  if (!content) return
  let tag = document.querySelector(`meta[name="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setCanonical(path) {
  let link = document.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', window.location.origin + path)
}

export function useSeo({ title, description, path } = {}) {
  useEffect(() => {
    const previous = document.title
    document.title = title ? `${title} — Meenakshi` : BASE_TITLE
    if (description) setMeta('description', description)
    setCanonical(path || window.location.pathname)
    return () => { document.title = previous }
  }, [title, description, path])
}

export default useSeo
