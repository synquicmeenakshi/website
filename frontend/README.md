# Meenakshi — Sacred Sciences

Multi-page React site for Meenakshi: Occult Sciences Expert, Spiritual
Consultant and Destiny Strategist. Content is taken from the client
presentation, `Astrologer Meenakshi Website Content.pptx`.

**Stack:** React 18 · Vite 6 · react-router-dom · GSAP (+ ScrollTrigger,
`@gsap/react`) · Lenis smooth scroll · plain CSS with custom properties. No CSS
framework, no component library, no state manager.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
```

`vercel.json` carries the SPA rewrite: every path serves `index.html`.

## Layout

```
index.html
src/
  App.jsx              routes + the scroll-reveal system + hash handling
  main.jsx
  hooks/
    useSmoothScroll.js Lenis wiring, scrollToY, scrollToAnchor
  data/                all content, kept out of components
    site.js            brand, proof, the seven commitments, code of ethics
    services.js        the eight disciplines
    journey.js         the eight steps, booking policy, what is included
    faq.js legal.js testimonials.js nav.js
  components/          header, footer, and one file per home-page section
  pages/               one per route
  styles/
    global.css         tokens + home page + header/footer
    pages.css          the inner pages
public/img/            images, referenced by absolute path (/img/foo.jpg)
```

Content lives in `src/data/*.js` as plain objects; components render it and own
no copy beyond section headings. To re-theme or re-copy the site, most of the
work is in those files.

## Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/about` | Meet Meenakshi — lineages, commitments, ethics |
| `/services` | The eight disciplines |
| `/services/:slug` | One discipline (8 of them) |
| `/journey` | The consultation journey, in three phases, plus policy |
| `/book` | The booking spread (its own full-bleed layout) |
| `/contact` | Redirects to `/book` |
| `/legal/:slug` | Privacy, terms, refund, ethics, disclaimer |

## The design system

Tokens sit at the top of `src/styles/global.css` under `:root`.

**Colour** — warm ivory page (`--ivory`), raised `--ivory-2`, `--ink` text,
`--ink-soft` secondary, `--maroon` / `--indigo` dark panels, `--saffron` accent,
`--tan` / `--gold` on dark, `--hairline` for every 1px rule.

**Type** — two families: `--font-serif` (Cormorant Garamond) for anything
display, `--font-sans` (Jost) for everything else, plus `--font-deva` (Tiro
Devanagari Hindi) for the Sanskrit micro-labels. Sizes come from one scale —
use a step, don't invent a clamp:

| role | token |
|---|---|
| heading | `--t-heading` |
| quote | `--t-quote` |
| card | `--t-card` |
| body | `--t-body` |
| meta | `--t-meta` |

**The 6px gutter.** Every grid of cards — the hero bento, the service grid, the
journey rail — uses `--gap: 6px`, and the hero is inset 6px from the viewport so
its corners show. `--radius` (10px) on every card.

## Patterns worth knowing

**Data-driven mega panels.** `src/data/nav.js` describes each dropdown as four
zones — `lead` (picture card), `main` (destinations with thumbnails), `more`
(plain arrow links), `featured` (one card). `Header.jsx` renders that shape
generically, so a fifth menu costs only data. Italic words are marked with
`*asterisks*` in the data and parsed by a tiny `Em()` component, which keeps the
data file free of JSX.

**Scroll reveals.** `App.jsx` sweeps the DOM for `[data-reveal]` (fade + rise),
`[data-reveal-child]` (staggered children) and `[data-parallax]` after every
route change. Add an attribute, get the animation — no per-component wiring.

**One template per family.** All five policies render through `pages/Legal.jsx`;
all eight disciplines through `pages/Service.jsx`.

**Testimonials and the FAQ are sections, not pages.** Both live on the home
page; the nav and footer link to `/#testimonials` and `/#faq`.

**The service mosaic is sized to one viewport.** `.svc-mosaic` is five equal
rows inside a fixed `height`, with every tile placed on explicit grid lines, so
the heading and all eight tiles arrive together rather than running past the
fold. Tiles are placed by line, not by span: with spans, auto-placement could
not fit the 4-wide tile beside the 2-row tall one and left a hole.

**Drawn art where there is no photograph.** `components/Jyotish.jsx` holds the
zodiac chakra, bhava chart, yantra, numerology square and rune cast as SVG. They
fill their container and never crop. The hero's astrology cell and the
featured-astrology spread use them.

**The booking spread hides the site chrome.** `body:has(.bk)` drops the header
and the footer's closing CTA, because that page carries its own masthead and its
own call to action.

## Traps carried over from the reference build

**Lenis caches the document height.** It measures once and re-measures only on
resize, so `scrollTo` a long way down clamps to a stale limit — on a route
change that limit is the *previous* page's height. `scrollToY` in
`hooks/useSmoothScroll.js` calls `lenis.resize()` before every programmatic
scroll.

**Anchors move while you travel to them.** Lazy images with no intrinsic size
occupy no height until they decode, and they only decode as the scroll brings
them near. `scrollToAnchor` re-aims on a 130ms interval and stops once the
target holds still three times over.

**Route effects need the hash in their deps.** Menu items pointing at sections
of one page never change `pathname`, so an effect keyed on it alone never runs.

**Reveals use `opacity`, not `autoAlpha`.** `visibility: hidden` stops Chrome
fetching `loading="lazy"` images inside the subtree, and whole sections arrive
blank.

**`overflow-x: clip`, not `hidden`, on html/body.** `hidden` turns the element
into a scroll container, which gives Lenis a second scrollport to fight over.

**`grid-row: 1 / -1` counts to the last *explicit* line.** The hero declares
three rows in `grid-template-rows` for that reason; with two declared and six
cells occupying three, the message panel stopped short and left a bare band.

**Don't kill every ScrollTrigger on a route change.** Child effects run before
the parent's, so the incoming page has already registered its own and a blanket
kill wipes them out.

## Not yet wired

The booking form validates and confirms on the client only. **Razorpay,
calendar scheduling and the WhatsApp/email confirmations still need a backend** —
the hook point is `onSubmit` in `src/components/BookingForm.jsx`.

Instagram in `src/data/site.js` is a placeholder URL.

See `IMAGE-CREDITS.md` for image provenance and the pre-launch note on
compressing them.
