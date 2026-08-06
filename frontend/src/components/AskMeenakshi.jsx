import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ask } from '../lib/ask.js'
import { PAGE_CHIPS, OPENERS } from '../data/knowledge.js'
import { BRAND } from '../data/site.js'
import { ArrowRight, CloseIcon, Star } from './Icons.jsx'

/* ============================================================
   ASK MEENAKSHI
   The guidance desk, bottom right of every page.
   ============================================================

   It answers from src/data/knowledge.js through src/lib/ask.js — the sciences
   on one side, this site's own services, journey, policy and FAQ on the other,
   so it can route as well as explain. Every answer can carry links, and a link
   navigates the site behind the panel rather than opening a new page: asking
   where to go and then being taken there is the whole point of a desk.

   No API, no key, no request leaves the page. */

const GREETING = {
  from: 'her',
  text:
    'Namaste 🙏 I am the guidance desk. Ask me about the chart — lagna, dashas, houses, manglik, guna milan, muhurat — or about a consultation itself: what it costs, what I need from you, how soon.\n\nOr just give me your **date of birth** and I will read the sign and the numbers now.',
  links: [],
}

/* The answers carry **bold** and blank lines. Two rules is the whole parser —
   anything more and the desk would need a markdown library to say a sentence. */
function Rich({ text }) {
  return text.split('\n\n').map((para, i) => (
    <p key={i}>
      {para.split(/(\*\*[^*]+\*\*)/g).map((bit, j) =>
        bit.startsWith('**') && bit.endsWith('**') ? <strong key={j}>{bit.slice(2, -2)}</strong> : bit,
      )}
    </p>
  ))
}

/* A small yantra, drawn rather than imported: the launcher is the only mark on
   the page that has to read at 26px on top of a photograph. */
function DeskMark({ size = 26 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.3" opacity="0.55" />
      <path d="M24 6 38 24 24 42 10 24Z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M24 13 33 24 24 35 15 24Z" stroke="currentColor" strokeWidth="1" opacity="0.75" />
      <circle cx="24" cy="24" r="4.2" fill="currentColor" />
    </svg>
  )
}

export default function AskMeenakshi() {
  const [open, setOpen] = useState(false)
  const [log, setLog] = useState([GREETING])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const [nudged, setNudged] = useState(false)

  const { pathname } = useLocation()
  const navigate = useNavigate()

  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const timer = useRef(null)

  // The transcript survives a route change — the panel unmounts nothing, but a
  // reload of the tab should not lose a conversation either.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('ask-meenakshi')
      if (saved) setLog(JSON.parse(saved))
    } catch {
      /* private mode, or a transcript we can no longer read: start fresh */
    }
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem('ask-meenakshi', JSON.stringify(log.slice(-40)))
    } catch {
      /* nothing worth failing over */
    }
  }, [log])

  // Land at the newest message, not at the top of a long answer.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [log, typing, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // One quiet invitation, once per visit, after the visitor has settled.
  useEffect(() => {
    if (nudged || open) return
    const t = setTimeout(() => setNudged(true), 9000)
    return () => clearTimeout(t)
  }, [nudged, open])

  useEffect(() => () => clearTimeout(timer.current), [])

  const send = (raw) => {
    const text = raw.trim()
    if (!text || typing) return

    setLog((l) => [...l, { from: 'you', text }])
    setDraft('')
    setTyping(true)

    // A beat before the reply. Instant answers read as a lookup table; this
    // reads as somebody turning to face you.
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const a = ask(text)
      setTyping(false)
      setLog((l) => [...l, { from: 'her', text: a.text, links: a.links, chips: a.chips }])
    }, 420 + Math.min(text.length * 8, 500))
  }

  const go = (to) => {
    if (/^https?:/.test(to)) {
      window.open(to, '_blank', 'noopener')
      return
    }
    navigate(to)
    // Left open on purpose: the visitor asked where to go, and may want the
    // next answer once they are there. On a phone it would cover the page.
    if (window.matchMedia('(max-width: 640px)').matches) setOpen(false)
  }

  const last = [...log].reverse().find((m) => m.from === 'her')
  const chips = (last?.chips?.length ? last.chips : PAGE_CHIPS[pathname] || OPENERS).slice(0, 3)

  return (
    <>
      <button
        type="button"
        className={`ask-fab${open ? ' is-open' : ''}${nudged && !open ? ' is-nudging' : ''}`}
        aria-expanded={open}
        aria-controls="ask-panel"
        aria-label={open ? 'Close Ask Meenakshi' : 'Ask Meenakshi — guidance desk'}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="ask-fab__mark">{open ? <CloseIcon width="20" height="20" /> : <DeskMark />}</span>
        <span className="ask-fab__label">
          <span>Ask Meenakshi</span>
          <span>पूछिए</span>
        </span>
      </button>

      <section
        id="ask-panel"
        className={`ask${open ? ' is-open' : ''}`}
        role="dialog"
        aria-label="Ask Meenakshi"
        aria-hidden={!open}
      >
        <header className="ask__head">
          <span className="ask__mark"><DeskMark size={30} /></span>
          <span className="ask__title">
            <strong>Ask Meenakshi</strong>
            <span>Guidance desk · usually instant</span>
          </span>
          <button type="button" className="ask__x" onClick={() => setOpen(false)} aria-label="Close">
            <CloseIcon width="18" height="18" />
          </button>
        </header>

        {/* `data-lenis-prevent`: Lenis binds wheel and touch on the document and
            drives the page from them, so a nested scroller never receives the
            event and the page scrolls instead of the transcript. The attribute
            tells Lenis to leave events originating inside this element alone. */}
        <div className="ask__scroll" ref={scrollRef} aria-live="polite" data-lenis-prevent>
          {log.map((m, i) => (
            <article key={i} className={`ask-msg ask-msg--${m.from}`}>
              {m.from === 'her' && <span className="ask-msg__who"><Star width="8" height="8" /> Meenakshi</span>}
              <div className="ask-msg__body">
                <Rich text={m.text} />
                {!!m.links?.length && (
                  <div className="ask-msg__links">
                    {m.links.map(([label, to]) => (
                      <button key={label + to} type="button" onClick={() => go(to)}>
                        {label} <ArrowRight width="13" height="13" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}

          {typing && (
            <article className="ask-msg ask-msg--her">
              <span className="ask-msg__who"><Star width="8" height="8" /> Meenakshi</span>
              <div className="ask-msg__body ask-msg__body--typing" aria-label="Reading">
                <i /><i /><i />
              </div>
            </article>
          )}
        </div>

        <div className="ask__chips" data-lenis-prevent-horizontal>
          {chips.map((c) => (
            <button key={c} type="button" onClick={() => send(c)} disabled={typing}>
              {c}
            </button>
          ))}
        </div>

        <form
          className="ask__form"
          onSubmit={(e) => {
            e.preventDefault()
            send(draft)
          }}
        >
          <label className="sr-only" htmlFor="ask-input">Your question</label>
          <input
            id="ask-input"
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="A question, or your date of birth…"
            autoComplete="off"
          />
          <button type="submit" aria-label="Send" disabled={!draft.trim() || typing}>
            <ArrowRight width="17" height="17" />
          </button>
        </form>

        <p className="ask__foot">
          Guidance, not a guarantee. For anything this desk cannot answer —{' '}
          <Link to="/book" onClick={() => setOpen(false)}>write to Meenakshi</Link> or{' '}
          <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>.
        </p>
      </section>
    </>
  )
}
