import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import useSeo from '../hooks/useSeo.js'
import { ArrowRight } from '../components/Icons.jsx'

/* The articles index. Posts are fetched rather than bundled: unlike the rest of
   the site's copy there is no sensible static fallback for content that does
   not exist yet, so an empty or unreachable list simply says so. */

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const fmtDate = (iso) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch { return '' }
}

export default function Blog() {
  const [posts, setPosts] = useState(null)
  const [tags, setTags] = useState([])
  const [tag, setTag] = useState('')
  const [failed, setFailed] = useState(false)

  useSeo({
    title: 'Journal',
    description: 'Articles on Vedic astrology, numerology, vastu and the traditional metaphysical sciences.',
    path: '/blog',
  })

  useEffect(() => {
    let cancelled = false
    setPosts(null)
    fetch(`${API_BASE}/blog${tag ? `?tag=${encodeURIComponent(tag)}` : ''}`)
      .then((r) => r.json())
      .then((b) => {
        if (cancelled) return
        setPosts(b?.data || [])
        if (!tag) setTags(b?.tags || [])
      })
      .catch(() => { if (!cancelled) { setPosts([]); setFailed(true) } })
    return () => { cancelled = true }
  }, [tag])

  return (
    <>
      <PageHero
        eyebrow="Journal"
        deva="लेख"
        title="Writing on the sciences"
        lede="Notes on the chart, the numbers and the practices behind them — written for someone who has not studied any of it."
        meta={[
          ['Plain', 'No jargon left unexplained'],
          ['Free', 'Nothing here needs a consultation'],
        ]}
      />

      <section className="legal">
        <div className="container">
          {tags.length > 0 && (
            <nav className="blog__tags" aria-label="Filter by topic">
              <button
                type="button"
                className={`blog__tag${tag === '' ? ' is-on' : ''}`}
                onClick={() => setTag('')}
              >
                All
              </button>
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`blog__tag${tag === t ? ' is-on' : ''}`}
                  onClick={() => setTag(t)}
                >
                  {t}
                </button>
              ))}
            </nav>
          )}

          {posts === null ? (
            <p className="blog__empty">Loading…</p>
          ) : posts.length === 0 ? (
            <p className="blog__empty">
              {failed
                ? 'The journal could not be loaded just now. Please try again shortly.'
                : 'No articles yet. There will be.'}
            </p>
          ) : (
            <ul className="blog__list">
              {posts.map((p) => (
                <li key={p.slug} className="blog__item">
                  <Link to={`/blog/${p.slug}`} className="blog__link">
                    {p.cover && (
                      <span className="blog__thumb">
                        <img src={p.cover} alt={p.coverAlt || ''} loading="lazy" />
                      </span>
                    )}
                    <span className="blog__text">
                      <span className="blog__meta">
                        {fmtDate(p.publishedAt)}
                        {p.readMinutes ? ` · ${p.readMinutes} min read` : ''}
                      </span>
                      <span className="blog__title">{p.title}</span>
                      {p.excerpt && <span className="blog__excerpt">{p.excerpt}</span>}
                      <span className="blog__more">
                        Read <ArrowRight width="14" height="14" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
