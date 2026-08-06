import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { NAV } from '../data/nav.js'
import { BRAND } from '../data/site.js'
import { stopScroll, startScroll } from '../hooks/useSmoothScroll.js'
import { ChevronDown, MenuIcon, CloseIcon, ArrowRight, Monogram } from './Icons.jsx'

/* Panel titles arrive as plain strings with *asterisks* around the words that
   set in italic, so nav.js can stay a data file with no JSX in it. */
function Em({ text }) {
  return text
    .split(/(\*[^*]+\*)/g)
    .map((part, i) =>
      part.startsWith('*') && part.endsWith('*') ? <em key={i}>{part.slice(1, -1)}</em> : part,
    )
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  // Which dropdown is open. Controlled rather than CSS :hover/:focus-within,
  // because the clicked link keeps focus across a route change and would hold
  // its panel open on the new page.
  const [openKey, setOpenKey] = useState(null)
  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  // Full page rail over the hero, drawn in for everything below it.
  const [compact, setCompact] = useState(false)
  const { pathname } = useLocation()

  // After navigating, the nav re-renders under a stationary cursor and fires
  // mouseenter again, which reopens the panel on the new page. Ignore hover
  // until the pointer genuinely moves.
  const ignoreHover = useRef(false)
  const firstRoute = useRef(true)
  const barRef = useRef(null)
  const heroRef = useRef(null)
  const lastY = useRef(0)
  const ticking = useRef(false)
  const menuOpenRef = useRef(false)

  useEffect(() => {
    menuOpenRef.current = menuOpen
  }, [menuOpen])

  // Publish the measured height so sticky sub-navs and anchor offsets can clear
  // the bar without hard-coding a number that changes with the breakpoint.
  useEffect(() => {
    const measure = () => {
      const h = barRef.current?.offsetHeight ?? 0
      document.documentElement.style.setProperty('--header-h', `${h}px`)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // The hero belongs to the page, not to this component, so it is looked up
  // again once each route has committed — and the width state is settled right
  // away, since a route change moves the hero without firing a scroll.
  useEffect(() => {
    heroRef.current = document.querySelector('.hero, .page-hero')
    const bottom = heroRef.current?.getBoundingClientRect().bottom
    setCompact(bottom == null ? window.scrollY > 140 : bottom < 90)
  }, [pathname])

  // Condense once past the top; get out of the way while reading down, and come
  // back the moment the visitor scrolls up.
  useEffect(() => {
    const read = () => {
      const y = window.scrollY
      const delta = y - lastY.current

      // The drawer lives inside this bar, so hiding the bar would take an open
      // menu with it. While it is open the bar stays put.
      if (menuOpenRef.current) {
        setHidden(false)
        lastY.current = y
        ticking.current = false
        return
      }

      setSolid(y > 30)

      // The bar draws in as the hero's bottom edge passes under it, not at some
      // pixel count that would be right on the home page and wrong on every
      // other one. Read live rather than cached: the hero's height still moves
      // while its images decode. Two thresholds, not one, so a wheel nudge
      // parked on that edge cannot flip the bar back and forth.
      const bottom = heroRef.current?.getBoundingClientRect().bottom
      if (bottom == null) setCompact(y > 140)
      else setCompact((was) => (was ? bottom < 130 : bottom < 90))
      if (Math.abs(delta) > 5) {
        setHidden(delta > 0 && y > 280)
        lastY.current = y
      }
      ticking.current = false
    }

    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(read)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    read()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // The drawer must freeze the page behind it, and Lenis holds its own scroll
  // position, so a body lock alone is not enough.
  useEffect(() => {
    if (menuOpen) stopScroll()
    else startScroll()
    return startScroll
  }, [menuOpen])

  // Close every panel on navigation. Without this the clicked link keeps focus
  // and the cursor stays put, so the panel rides along onto the new page.
  useEffect(() => {
    setOpenKey(null)
    setMenuOpen(false)
    document.activeElement?.blur?.()

    // Not on first render: arming the guard on mount would swallow the very
    // first hover, since mouseenter fires before the release can run.
    if (firstRoute.current) {
      firstRoute.current = false
      return
    }
    ignoreHover.current = true
    const t = setTimeout(() => {
      ignoreHover.current = false
    }, 400)
    return () => clearTimeout(t)
  }, [pathname])

  useEffect(() => {
    if (!openKey && !menuOpen) return
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setOpenKey(null)
      setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openKey, menuOpen])

  return (
    <header
      ref={barRef}
      className={`site-header${solid ? ' is-solid' : ''}${compact ? ' is-compact' : ''}${
        hidden ? ' is-hidden' : ''
      }`}
    >
      <div className="site-header__inner">
        <Link className="brand" to="/" aria-label={`${BRAND.name}, home`}>
          <Monogram size={34} />
          <span className="brand__type">
            <span className="brand__name">{BRAND.name}</span>
            <span className="brand__tag">{BRAND.tag}</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {NAV.map((item) => (
            <div
              key={item.label}
              className={`nav-item${item.panel ? ' has-menu' : ''}${
                openKey === item.label ? ' is-open' : ''
              }`}
              onMouseEnter={() => {
                if (item.panel && !ignoreHover.current) setOpenKey(item.label)
              }}
              onMouseLeave={() => item.panel && setOpenKey(null)}
              onFocus={() => {
                if (item.panel && !ignoreHover.current) setOpenKey(item.label)
              }}
              onBlur={(e) => {
                if (item.panel && !e.currentTarget.contains(e.relatedTarget)) setOpenKey(null)
              }}
            >
              <Link className="nav-item__link" to={item.to} aria-label={item.full}>
                {item.label}
                {item.panel && <ChevronDown width="11" height="11" />}
              </Link>

              {item.panel && (
                <div className="nav-panel">
                  {/* The sheet spans the header rather than hanging off the
                      link, so a panel reads as the header opening rather than
                      a tooltip appearing. */}
                  <div className="nav-panel__sheet">
                    <div className="nav-panel__inner">
                      {/* 1 · the lead card */}
                      <Link className="navlead" to={item.panel.lead.to}>
                        <img
                          src={item.panel.lead.img}
                          alt=""
                          loading="lazy"
                          style={{ objectPosition: item.panel.lead.pos }}
                        />
                        <span className="navlead__scrim" aria-hidden="true" />
                        <span className="navlead__body">
                          <span className="navlead__eyebrow">{item.panel.lead.eyebrow}</span>
                          <span className="navlead__title">
                            <Em text={item.panel.lead.title} />
                          </span>
                          <span className="navlead__copy">{item.panel.lead.copy}</span>
                          <span className="navlead__cta">
                            {item.panel.lead.cta} <ArrowRight width="14" height="14" />
                          </span>
                        </span>
                      </Link>

                      {/* 2 · the real destinations, each with a thumbnail */}
                      <div className="navcol">
                        <p className="navcol__group">{item.panel.main.group}</p>
                        <ul className="navthumbs">
                          {item.panel.main.items.map((sub) => (
                            <li key={sub.label}>
                              <Link to={sub.to}>
                                <span className="navthumbs__media">
                                  <img src={sub.img} alt="" loading="lazy" />
                                </span>
                                <span className="navthumbs__text">
                                  <span className="navthumbs__label">{sub.label}</span>
                                  <span className="navthumbs__sub">{sub.sub}</span>
                                </span>
                                <ArrowRight className="navthumbs__go" width="15" height="15" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 3 · everything else */}
                      <div className="navcol">
                        <p className="navcol__group">{item.panel.more.group}</p>
                        <ul className="navlinks">
                          {item.panel.more.items.map((sub) => (
                            <li key={sub.label}>
                              <Link to={sub.to}>
                                <span>{sub.label}</span>
                                <ArrowRight width="14" height="14" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 4 · one thing worth reading */}
                      <div className="navcol navcol--featured">
                        <p className="navcol__group">{item.panel.featured.group}</p>
                        <Link className="navfeat" to={item.panel.featured.to}>
                          <span className="navfeat__media">
                            <img
                              src={item.panel.featured.img}
                              alt={item.panel.featured.alt}
                              loading="lazy"
                            />
                          </span>
                          <span className="navfeat__title">
                            <Em text={item.panel.featured.title} />
                          </span>
                          <span className="navfeat__sub">{item.panel.featured.sub}</span>
                          <span className="navfeat__cta">
                            {item.panel.featured.cta} <ArrowRight width="14" height="14" />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="header-utils">
          <Link className="btn btn--sm btn--primary" to="/book">
            Book a consultation <ArrowRight width="15" height="15" />
          </Link>
          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Sections collapse: expanded, the six groups run to two dozen links, a
          wall of small caps that buries everything below it. One at a time. */}
      <nav id="mobile-nav" className={`mobile-nav${menuOpen ? ' open' : ''}`} aria-label="Mobile">
        <div className="mobile-nav__scroll">
          {NAV.map((item) => (
            <div
              key={item.label}
              className={`mobile-nav__group${openKey === item.label ? ' is-open' : ''}`}
            >
              <div className="mobile-nav__row">
                <Link to={item.to} onClick={() => setMenuOpen(false)}>
                  {item.full}
                </Link>
                {item.panel && (
                  <button
                    className="mobile-nav__toggle"
                    type="button"
                    aria-expanded={openKey === item.label}
                    aria-label={`${openKey === item.label ? 'Collapse' : 'Expand'} ${item.full}`}
                    onClick={() => setOpenKey((k) => (k === item.label ? null : item.label))}
                  >
                    <ChevronDown width="15" height="15" />
                  </button>
                )}
              </div>

              {item.panel && openKey === item.label && (
                /* the phone gets the destinations as one flat list — the
                   four-zone composition has nowhere to go at 390px */
                <ul className="mobile-nav__sub">
                  {[...item.panel.main.items, ...item.panel.more.items].map((sub, i) => (
                    <li key={`${sub.label}-${i}`}>
                      <Link to={sub.to} onClick={() => setMenuOpen(false)}>
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="mobile-nav__foot">
            <Link className="btn btn--primary" to="/book" onClick={() => setMenuOpen(false)}>
              Book a consultation <ArrowRight width="15" height="15" />
            </Link>
            <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
            <a href={BRAND.phoneHref}>{BRAND.phone}</a>
          </div>
        </div>
      </nav>
    </header>
  )
}
