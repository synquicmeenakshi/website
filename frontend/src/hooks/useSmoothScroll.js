import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Lenis smooth scrolling, stepped from GSAP's ticker.
 *
 * Two things matter for correctness:
 *  - ScrollTrigger must update on every Lenis frame, or scroll-linked animation
 *    lags behind the actual scroll position.
 *  - Lenis must run on GSAP's ticker rather than its own rAF, so the two share
 *    one loop instead of competing for frames.
 */

/* The live instance, so route changes can reset scroll *through* Lenis rather
   than around it. window.scrollTo only moves the native position; Lenis holds
   its own and reasserts it on the next frame, which on a shorter page clamps to
   the bottom. That is the "new page opens at the bottom" bug. */
let lenisInstance = null

export function scrollToTop() {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate: true, force: true })
    return
  }
  window.scrollTo(0, 0) // reduced-motion visitors never get a Lenis instance
}

/* Overlays and the mobile drawer must freeze the page behind them. Lenis holds
   its own scroll position, so `overflow: hidden` on the body is not enough —
   the wheel still drives Lenis and the page creeps underneath. Stop Lenis
   itself, and fall back to a body lock for visitors who have no instance. */
export function stopScroll() {
  if (lenisInstance) {
    lenisInstance.stop()
    return
  }
  document.body.style.overflow = 'hidden'
}

export function startScroll() {
  if (lenisInstance) {
    lenisInstance.start()
    return
  }
  document.body.style.overflow = ''
}

/* Lenis measures the document once and caches that as its scroll limit,
   re-measuring only on resize. After a route change the cached height is still
   the *previous* page's, so a scrollTo aimed further down silently clamps.
   Re-measure before every programmatic scroll: two layout reads, and the target
   becomes reachable. */
function remeasure() {
  lenisInstance?.resize()
}

export function scrollToY(y, opts = {}) {
  if (lenisInstance) {
    remeasure()
    lenisInstance.scrollTo(y, opts)
    return
  }
  window.scrollTo({ top: y, behavior: opts.immediate ? 'auto' : 'smooth' })
}

/* Enough to clear the floating header. */
export const HASH_OFFSET = 104

/**
 * Scroll to an element, and keep correcting until it stops moving.
 *
 * Aiming once is not enough. Sections below the fold hold lazy images with no
 * intrinsic size, so they occupy no height until they decode — and they only
 * decode as the scroll brings them near. The target therefore moves *while we
 * are travelling towards it*.
 *
 * So re-aim on a short interval and stop once the number has held still three
 * times over, rather than after a fixed delay. An already-settled page gets
 * exactly one scroll. Returns a cancel function.
 */
export function scrollToAnchor(hash, { offset = HASH_OFFSET, onMissing } = {}) {
  let last = -1
  let stable = 0
  let tries = 0
  let timer = 0

  const aim = () => {
    const target = typeof hash === 'string' ? document.querySelector(hash) : hash
    if (!target) {
      onMissing?.()
      return
    }

    const y = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset)
    if (Math.abs(y - last) < 4) {
      stable += 1
    } else {
      stable = 0
      last = y
      scrollToY(y)
    }

    tries += 1
    if (stable < 3 && tries < 24) timer = setTimeout(aim, 130)
  }

  const raf = requestAnimationFrame(aim)
  return () => {
    cancelAnimationFrame(raf)
    clearTimeout(timer)
  }
}

export default function useSmoothScroll() {
  useEffect(() => {
    // Stop the browser restoring a previous position on top of ours.
    const priorRestoration = history.scrollRestoration
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

    // Honour the OS setting: no hijacked scrolling for people who opt out.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch devices already feel right on native scrolling.
      syncTouch: false,
    })

    lenisInstance = lenis
    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time) => lenis.raf(time * 1000) // GSAP gives seconds, Lenis wants ms
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // In-page anchors glide rather than jump, through the same settling loop
    // the router uses — a jump to the footer has the same moving-target problem.
    const onClick = (e) => {
      const link = e.target.closest?.('a[href^="#"]')
      if (!link) return
      const hash = link.getAttribute('href')
      if (!hash || hash.length < 2) return
      const target = document.querySelector(hash)
      if (!target) return
      e.preventDefault()
      scrollToAnchor(target)
    }
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      gsap.ticker.remove(raf)
      gsap.ticker.lagSmoothing(500, 33)
      lenisInstance = null
      if ('scrollRestoration' in history) history.scrollRestoration = priorRestoration
      lenis.destroy()
    }
  }, [])
}
