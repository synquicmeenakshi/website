# Admin Panel Redesign — Plan

Bring the admin portal onto the website's design language: same palette, same
type, same logo, same component idiom.

Nothing below is built yet. Everything was read off the running build, not
assumed.

**Decisions taken (2026-08-08):**
- **Font — Josefin Sans.** Fix the frontend token first so both sides agree.
- **Retired ZenYourLife screens — keep as they are.** They inherit the palette
  through the Tailwind remap; no deletions.
- **Tone — light throughout.** Ivory canvas, cream cards, saffron accents. No
  maroon or indigo panels in the admin.

---

## 1 · What the website's design system actually is

All of it already exists as tokens in `frontend/src/styles/global.css`. This is
the source of truth to port — not something to reinvent.

| | Token | Value | Role |
|---|---|---|---|
| **Canvas** | `--ivory` | `#f7f2e7` | page background |
| | `--ivory-2` | `#efe7d5` | raised card surface |
| | `--sand` | `#e3d7bd` | inset panels, soft borders |
| | `--cream` | `#f8f4ea` | text on dark surfaces |
| **Ink** | `--ink` | `#241a14` | primary text, warm dark brown |
| | `--ink-soft` | `#6f6055` | secondary text |
| **Dark panels** | `--maroon` | `#4a1410` | solid dark band |
| | `--indigo` | `#191533` | the night band |
| **Accent** | `--saffron` | `#d4531d` | **primary accent** |
| | `--saffron-600` | `#ad3f15` | hover |
| | `--gold` / `--tan` | `#b58a46` / `#cfa96b` | secondary metals |
| **Lines** | `--hairline` | `rgba(36,26,20,.15)` | every divider |
| **Shape** | `--radius` | `10px` | every card and control |
| **Motion** | `--ease` / `--dur-quick` | `cubic-bezier(.4,0,.2,1)` / `.22s` | every transition |

**Type:** Cormorant Garamond for display, a sans for UI, Tiro Devanagari for
the `deva` accents. Buttons are `min-height: 52px`, radius 10, with variants
`--primary` (saffron fill), `--outline`, `--quiet`, `--invert`, `--ghost-invert`.

## 2 · What the admin is now

A different product's skin. It is ZenYourLife's, not Meenakshi's.

| | Admin today | Website |
|---|---|---|
| Accent | `#DFB13B → #C9A032` gold gradient | `#d4531d` flat saffron |
| Surfaces | `white` cards on `slate-50` | `--ivory-2` on `--ivory` |
| Text | `slate-800` / `slate-500` (cool grey) | `--ink` / `--ink-soft` (warm brown) |
| Borders | `slate-200` | `--hairline` |
| Radius | `rounded-xl` (12px) mixed with `rounded-lg` (8px) | one `--radius` (10px) |
| Type | Tailwind default stack | Cormorant + sans + Devanagari |
| Logo | **`znlogo.png` — the ZenYourLife logo**, with `alt="Meenakshi"` | `YantraMark` SVG |

That logo is the most visible problem: the admin still shows another brand's
mark on every screen.

## 3 · A decision needed first — the website's sans font is broken

Verified with Chrome's own font resolver, not by eye:

```
--font-sans declares : 'Jost', 'Futura', 'Avenir Next', system-ui
fonts actually loaded: Cormorant Garamond, Josefin Sans, Manrope, Tiro Devanagari
button RENDERED with : Segoe UI Semibold
```

**Jost is never loaded. Josefin Sans is loaded but referenced by nothing.** So
every piece of sans text on the live site is falling back to Segoe UI — which
means "match the website" currently means "match Segoe UI by accident".

Three ways out, and this needs answering before any styling starts, because the
admin will inherit whichever is chosen:

- **A — Load Jost.** Honour the declared intent. Jost is a geometric sans close
  to Futura; it will noticeably change the site's look.
- **B — Point the token at Josefin Sans.** It is already loaded and paid for in
  the font request. Also changes the look, but costs no extra network.
- **C — Keep Segoe UI deliberately.** Set the token to a real system stack so it
  is intentional rather than accidental. Nothing visually changes.

**Chosen: B — Josefin Sans.** It is already downloaded on every page load, so
today it is pure waste, and it sits well against Cormorant. The frontend token
is corrected first, then the admin loads the same two families.

## 4 · Strategy — theme first, screens second

Tailwind 4 takes design tokens through `@theme`. That gives one high-leverage
move: **redefine the palette Tailwind hands out, and screens restyle themselves
without being touched.**

This matters because of the volume:

| | Lines |
|---|---|
| Live Meenakshi screens | ~1,900 |
| `BookingManagement` (inherited, reused) | 1,789 |
| Retired ZenYourLife screens still routed | 11,904 |
| Shared components | 1,234 |

Rewriting 16,000 lines of utility classes by hand is not sensible. Instead:

1. Map `slate-*` onto warm greys derived from `--ink` / `--sand`, and the golds
   onto saffron. Every existing `bg-slate-50`, `text-slate-800`, `border-slate-200`
   then resolves to the website's palette automatically — including the 11,904
   lines nobody wants to touch.
2. Add semantic component classes (`.a-btn`, `.a-card`, `.a-field`) mirroring the
   site's `.btn` / card idiom, for the parts worth doing properly.
3. Sweep the screens that carry the most identity by hand.

## 5 · Phases

### Phase 1 — Foundation
- Resolve the font question (§3), fix it in the **frontend** first so both sides
  agree, then load the same families in the admin.
- `admin/src/index.css`: `@theme` block carrying the website tokens verbatim —
  colours, radius, easing, type scale.
- Remap Tailwind's `slate` ramp to warm greys, and `amber/yellow` to saffron, so
  untouched screens inherit the palette.
- Port `YantraMark` / `YantraBadge` from `frontend/src/components/BookIcons.jsx`
  into the admin as shared SVG components. **Delete `znlogo.png` usage.**

### Phase 2 — Shell and chrome
- `Sidebar.tsx` — Yantra mark, `Meenakshi / Sacred Sciences` lockup in Cormorant,
  ivory panel, saffron active state instead of the gold gradient.
- `AdminShell.tsx` — ivory canvas, hairline header, Cormorant page titles.
- `Login.tsx` — the screen that sets the tone; give it the site's masthead
  treatment.

### Phase 3 — Shared components
- `CollectionEditor.tsx` (393 lines) — drives Services, Testimonials, FAQ,
  Journey, Legal. Restyling this alone restyles five screens.
- Buttons, inputs, modals, status pills unified against the site's idiom.

### Phase 4 — Individual screens
Dashboard, Consultations, Customers, Enquiries, BlogPosts, MeenakshiSettings,
BookingCalendar, and BookingManagement's dense schedule grid.

### Phase 5 — Sweep
- Screenshot every screen before and after, side by side.
- Check contrast: saffron on ivory and `--ink-soft` on `--ivory-2` both need
  verifying against WCAG AA, since warm low-contrast palettes fail easily.
- Confirm the retired screens inherited the theme without breaking.

## 6 · Settled

- **Font** — Josefin Sans, corrected in the frontend first.
- **Retired screens** — kept. They restyle themselves through the palette remap,
  which makes the Phase 5 screenshot sweep non-optional: they are the screens
  most likely to break unnoticed, precisely because nobody looks at them.
- **Tone** — light throughout, saffron accents only.

## 7 · Risks

| Risk | Mitigation |
|---|---|
| Remapping `slate` changes screens nobody reviewed | Screenshot sweep in Phase 5 covers every route |
| Warm low-contrast palette fails accessibility | Explicit AA contrast check, not eyeballing |
| Cormorant at small sizes is hard to read | Use it for headings only; sans for all data and controls |
| The dense schedule grid breaks under a new type scale | `BookingManagement` gets its own pass in Phase 4 |
| Retired screens silently break, since they are kept but unreviewed | Sweep covers every route including the unlinked ones, reached by direct URL |
| Changing the frontend font alters the live site's appearance | It is a deliberate correction, screenshotted before and after; flag to the client as a visible change |
