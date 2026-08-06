import { useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import useSmoothScroll, { scrollToAnchor, scrollToTop } from './hooks/useSmoothScroll.js'

import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import AskMeenakshi from './components/AskMeenakshi.jsx'

import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Services from './pages/Services.jsx'
import Service from './pages/Service.jsx'
import Journey from './pages/Journey.jsx'
import Book from './pages/Book.jsx'
import Legal from './pages/Legal.jsx'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function App() {
  const main = useRef(null)
  const { pathname, hash } = useLocation()

  useSmoothScroll()

  // A client-side route change keeps the old scroll position, so a new page
  // opens partway down. Reset through Lenis, then re-measure.
  //
  // Do NOT kill every ScrollTrigger here: child effects run before the parent's,
  // so the incoming page has already registered its own and a blanket kill wipes
  // them out. The outgoing page's triggers are reverted by its own useGSAP.
  //
  // `hash` is in the dependency list, not just `pathname`: several menu items
  // point at sections of one page, so moving between them never changes the
  // pathname and an effect keyed on it alone would not run at all.
  useEffect(() => {
    if (hash) {
      ScrollTrigger.refresh()
      return scrollToAnchor(hash, { onMissing: scrollToTop })
    }

    scrollToTop()
    const id = requestAnimationFrame(() => {
      scrollToTop() // again after layout, in case the new page changed height
      ScrollTrigger.refresh()
    })
    return () => cancelAnimationFrame(id)
  }, [pathname, hash])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // opacity rather than autoAlpha: autoAlpha sets visibility:hidden, and
        // Chrome will not fetch loading="lazy" images inside a hidden subtree,
        // so whole sections arrive blank until their reveal fires.
        gsap.utils.toArray('[data-reveal]').forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 26 },
            {
              opacity: 1,
              y: 0,
              duration: 0.85,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            },
          )
        })

        // Grids arrive as a micro-cascade.
        gsap.utils.toArray('[data-reveal-child]').forEach((group) => {
          gsap.fromTo(
            group.children,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              stagger: 0.08,
              scrollTrigger: { trigger: group, start: 'top 86%', once: true },
            },
          )
        })

        // Gentle image drift inside fixed frames.
        gsap.utils.toArray('[data-parallax] img').forEach((img) => {
          gsap.fromTo(
            img,
            { yPercent: 0 },
            {
              yPercent: -7,
              ease: 'none',
              scrollTrigger: {
                trigger: img.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6,
              },
            },
          )
        })
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-reveal], [data-reveal-child] > *', { clearProps: 'all', opacity: 1 })
      })
    },
    // re-runs per route: each page mounts a fresh set of [data-reveal] nodes
    { scope: main, dependencies: [pathname], revertOnUpdate: true },
  )

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main" ref={main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<Service />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/book" element={<Book />} />
          {/* the booking spread is the contact page */}
          <Route path="/contact" element={<Navigate to="/book" replace />} />
          <Route path="/legal/:slug" element={<Legal />} />
          {/* anything else falls back to the home page rather than a blank screen */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      {/* outside <main>: it is a fixture of the site, not part of the page's
          document flow, and it stays mounted across every route change */}
      <AskMeenakshi />
    </>
  )
}
