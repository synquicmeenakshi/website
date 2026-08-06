import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import useSeo from '../hooks/useSeo.js'
import { BRAND } from '../data/site.js'
import { ArrowRight } from '../components/Icons.jsx'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const fmtDate = (iso) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return '' }
}

/* Body is plain text, authored in the admin panel. Blank lines separate
   paragraphs and a leading "## " marks a heading — deliberately not HTML, so
   nothing authored there can inject markup into this page. */
function renderBody(body) {
  return String(body || '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, i) =>
      block.startsWith('## ')
        ? <h2 key={i}>{block.slice(3)}</h2>
        : <p key={i}>{block}</p>,
    )
}

export default function Article() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [related, setRelated] = useState([])
  const [notFound, setNotFound] = useState(false)

  useSeo({
    title: post?.seoTitle || post?.title,
    description: post?.seoDescription || post?.excerpt,
    path: `/blog/${slug}`,
  })

  useEffect(() => {
    let cancelled = false
    setPost(null)
    setNotFound(false)
    fetch(`${API_BASE}/blog/${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((b) => {
        if (cancelled) return
        if (!b?.success) { setNotFound(true); return }
        setPost(b.data)
        setRelated(b.related || [])
      })
      .catch(() => { if (!cancelled) setNotFound(true) })
    return () => { cancelled = true }
  }, [slug])

  if (notFound) {
    return (
      <>
        <PageHero eyebrow="Journal" title="Article not found" lede="That piece is not here — it may have been moved or unpublished." />
        <section className="legal">
          <div className="container">
            <Link className="btn btn--outline" to="/blog">All articles <ArrowRight width="16" height="16" /></Link>
          </div>
        </section>
      </>
    )
  }

  if (!post) {
    return (
      <section className="legal">
        <div className="container"><p className="blog__empty">Loading…</p></div>
      </section>
    )
  }

  return (
    <>
      <PageHero
        eyebrow="Journal"
        title={post.title}
        lede={post.excerpt}
        crumb={{ label: 'All articles', to: '/blog' }}
        meta={[
          [fmtDate(post.publishedAt), 'Published'],
          [`${post.readMinutes || 1} min`, 'Reading time'],
        ]}
      />

      <section className="legal">
        <div className="container legal__grid">
          <nav className="legal__nav" aria-label="Journal">
            <p className="legal__nav-h">Journal</p>
            <ul>
              <li><Link to="/blog">All articles</Link></li>
            </ul>
            {post.tags?.length > 0 && (
              <p className="legal__nav-note">{post.tags.join(' · ')}</p>
            )}
          </nav>

          <article className="legal__body article">
            {post.cover && (
              <img className="article__cover" src={post.cover} alt={post.coverAlt || ''} />
            )}

            {renderBody(post.body)}

            <p className="article__sign">
              — {post.author || BRAND.name}
            </p>

            <p className="article__cta">
              <Link className="btn btn--outline" to="/book">
                Book a consultation <ArrowRight width="16" height="16" />
              </Link>
            </p>

            {related.length > 0 && (
              <div className="article__related">
                <h2>Also worth reading</h2>
                <ul>
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link to={`/blog/${r.slug}`}>{r.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        </div>
      </section>
    </>
  )
}
