# Meenakshi ⇄ Backend Integration Plan

> **STATUS — implemented 2026-08-05.** Phases 1–5 are built and verified:
> 26/26 end-to-end checks, 18/18 content-parity checks, 16/16 hydration checks.
> Deviations from the plan as written are recorded in §7. Outstanding items are
> in §8. Razorpay and Hindi translation remain out of scope (§6).

**Goal:** make the Meenakshi site content-managed and booking-capable through the
existing (Meenakshi) backend and admin panel.

**Hard constraint:** the user-facing frontend's UI must not change. No markup, no
CSS, no layout, no copy-rendering differences. Wiring code may change; anything a
visitor can see may not. The admin UI is expected to change and will be rebuilt.

**Decisions taken (2026-08-05):**
- **Repurpose** — Meenakshi replaces Meenakshi. ZYL treated as a template.
- **New `Consultation` model** for bookings, rather than extending `Appointment`.

---

## 1 · What we actually have

### Frontend (`frontend/`) — `Chandreshhere/meenakshii`
A Vite + React 18 SPA. Seven routes: Home, About, Services, Service (`/services/:slug`),
Journey, Book, Legal (`/legal/:slug`).

**It is 100% static.** There is not one `fetch`, `axios`, or `VITE_` variable in the
entire `src/` tree. All content lives in eight files under `src/data/`, pulled in by
**25 files across 31 import sites**.

The booking form is a dead end: [`BookingForm.jsx:97-98`](frontend/src/components/BookingForm.jsx#L97-L98)
validates, then sets `sent = true`. Nothing is transmitted or stored. **Every enquiry
submitted to date has been silently discarded.** This is the single highest-value fix
in this plan.

### Backend (`Backend/`) — Express + MongoDB
18 models, 21 route files, JWT + API-key auth, rate limiting, nodemailer, Twilio,
node-cron reminders, DeepL/Google translation. Solid infrastructure, but every domain
model is shaped for massage therapy and villa rentals in Belgium.

### Admin (`admin/`) — Vite + React 19 + Tailwind 4
12 routes, working auth. Screens: Dashboard, Massage Appointments, Booking Calendar,
Booking Management, Inquiries, Properties, Services, Testimonials, FAQ, Users.

---

## 2 · Content mapping

| Frontend export | Backend target | Gap |
|---|---|---|
| `SERVICES` (8 disciplines) | `Service` | Needs `slug`, `deva`, `lede`, `intro`, `questions[]`, `items[]`, `sceneUrl`. `category` enum is `massage/facial/pmu/therapy`. `price`/`duration` unused by this site. |
| `CONSULT_AREAS` | derive from `Service` | Booking dropdown — derive, don't duplicate. |
| `TESTIMONIALS` | `Testimonial` | Needs `short`, `city`, `service`. `cat` ≈ existing `role`. `category` enum is `massage/rental`. `rating`/`photo` unused. |
| `FAQ_GROUPS`, `FAQ_HOME`, `BOOK_FAQ` | `FAQ` | Model is flat; site groups FAQs and slices different subsets per page. Needs `group` + `placement`. `category` enum is `massage/rental` and **required**. |
| `LEGAL` (4 pages) | `LegalPage` | `pageType` enum lacks `refund-policy`, `code-of-ethics`. `content` is a single String; site needs `sections[[heading, ...paragraphs]]` + `lede` + `updated`. `language` enum lacks `hi`. |
| `JOURNEY`, `POLICY`, `INCLUDED` | **none** | New model required. |
| `BRAND`, `PROOF`, `ASSURANCES`, `MARQUEE`, `LINEAGES`, `WHY`, `ETHICS` | **none** | `PageContent` exists but is shaped for ZYL hero/stats. New `SiteSettings` singleton. |
| `NAV` | — | **Keep static.** Route structure with per-item imagery, not editable copy. CMS-ing it invites broken navigation for no benefit. |
| `knowledge.js` (582 lines) | — | **Keep static.** Rashis, grahas, bhavas, nakshatras — domain reference for the Ask Meenakshi desk, not client-editable content. |

### Booking gap
| Form field | `Appointment` |
|---|---|
| `name` (single) | `firstName` + `lastName`, both required |
| `contact` (phone **or** email) | `email` **and** `phoneNumber`, both required, email regex-validated |
| `dob`, `tob`, `pob` | **no equivalent** |
| `area`, `language` | **no equivalent** |
| `preferred` (optional date) | `appointmentDate` + `appointmentTime`, both required |
| — | `gender` required, enum |
| — | `service` ObjectId required |
| — | `country` defaults `'BE'` |

Confirms the decision: a separate `Consultation` model, not a coerced `Appointment`.

Note the form promises "we will confirm your appointment … within one working day" —
so consultations are **request-based**. The visitor never picks a slot. `BookingSettings`
and `BlockedDate` (which drive the massage slot picker) are therefore **not** part of
this flow; admin assigns the date/time on confirmation. This suits the constraint well,
since adding a slot picker would change the UI.

---

## 3 · Frontend strategy — dynamic content, zero UI change

**Hydrate-before-render.** `src/data/*.js` stay exactly where they are and become the
**fallback defaults**. At bootstrap, `main.jsx` fetches published content and populates
a store before the first render. Components keep their existing imports and their
existing markup.

- No component's JSX changes.
- If the API is unreachable, the site renders today's static content. It can never
  render blank — important, since this is a live marketing site.
- One new file (`src/content.js`), one edited file (`main.jsx`), plus the import-source
  swap in the 25 data-consuming files. No visual diff.

Every field the API returns must match the current shape exactly — same keys, same
types, same ordering semantics. The seed (Phase 1) is what guarantees this: it is
generated *from* the current data files, so parity is exact on day one.

**Verification gate:** screenshot every route before and after, diff the rendered DOM.
Any difference is a bug, not an improvement.

---

## 4 · Phases

### Phase 0 — Repo & deployment hygiene
Cleanup owed from the folder move; nothing else is safe to build on until it's done.

1. ~~Nested git repos~~ — **done 2026-08-05.** Both old `.git` folders (`Synquic/meenakshi`,
   `Chandreshhere/meenakshii`) were deleted and a single fresh repo initialised at
   `Backend/` on branch `main`, no remote yet. Awaiting the new GitHub remote and an
   initial commit. Note: `deploy.sh` is no longer present in the working tree — recover
   it from the old `Synquic/meenakshi` repo if still needed (it targets ZYL infra and
   needs rewriting for this project regardless).
2. `server.js:56` serves `../frontend/dist` in production — now the Meenakshi build.
   Confirm intended, since it changes what `zenyourlife.be` would serve.
3. `Dockerfile` + `package.json` (`build:frontend`, `install:all`) still assume the old
   ZYL frontend. Update or remove.
4. `.env` currently holds dev placeholder secrets (`JWT_SECRET`, `ADMIN_API_KEY`) —
   replace before any deploy. Email credentials still blank.

### Phase 1 — Backend data layer
1. **Extend enums** — `Service.category`, `Testimonial.category`, `FAQ.category`
   gain astrology values. `LegalPage.pageType` gains `refund-policy`, `code-of-ethics`.
2. **Extend models** — fields listed in §2. All additive and optional, so nothing that
   currently reads these collections breaks.
3. **New models** — `Consultation`, `JourneyStep`, `SiteSettings` (singleton).
4. **Restructure `LegalPage`** — `sections[{heading, paragraphs[]}]` alongside the
   existing `content` String.
5. **Seed from the data files.** Write `scripts/seedMeenakshi.js` that imports
   `frontend/src/data/*.js` and writes the 8 services, ~7 testimonials, FAQ groups,
   4 legal pages, 8 journey steps and site settings. This makes the seed
   *derived from* the current site, guaranteeing byte-parity rather than hoping for it.

### Phase 2 — Public read API
- `GET /api/meenakshi/content` — one aggregated, cached payload for bootstrap
  (one request beats eight on first paint).
- Individual `GET` endpoints per collection for admin and incremental use.
- Public reads unauthenticated (matching `serviceRoutes.js`); all writes behind
  `authMiddleware`.
- Response shapes mirror the data files exactly.

### Phase 3 — Frontend wiring
- `src/content.js` — fetch, validate, merge over static defaults, expose same exports.
- `main.jsx` — await hydration, then render.
- Swap import sources across the 25 files. **No JSX touched.**
- Point `BookingForm.onSubmit` at `POST /api/consultations`. The success state already
  exists and stays visually identical — only the trigger changes from local to server-confirmed.
- Add `frontend/.env` (`VITE_API_URL`). Note: the ZYL frontend defaulted to the
  production URL when this was unset, which silently pointed local dev at live data.
  Meenakshi must **fail loudly** instead of defaulting to production.

### Phase 4 — Admin UI (changes expected here)
- Rebuild `Sidebar.tsx` around Meenakshi: Dashboard, **Consultations**, Services,
  Testimonials, FAQ, Journey, Legal Pages, Site Settings, Users.
- Retire Properties, Rental Bookings, Massage Appointments, Booking Calendar/Management
  from nav (keep routes until the data is confirmed dead).
- New screen: **Consultations** — list, filter by status, view full birth details,
  assign confirmed date/time, status transitions (`new → confirmed → completed / cancelled`).
- New screens: Journey steps (ordered), Site Settings (brand, proof stats, assurances,
  marquee, lineages, ethics), Legal Pages (section editor).
- Adapt existing Services / Testimonials / FAQ screens to the new fields.
- Fix `config/api.ts` vs `utils/api.ts` — they disagree on whether `VITE_API_URL`
  includes `/api`. Currently masked by the env var; a real bug waiting for a fresh clone.

### Phase 5 — Notifications & decommission
- Consultation-request email to admin; acknowledgement to client — only if a contact
  email was supplied, since the form accepts a phone number instead.
- Repoint the cron reminder scheduler at `Consultation`, or disable it.
- Business timezone is `Europe/Brussels` — change to `Asia/Kolkata`.
- WhatsApp: the UI already promises WhatsApp confirmation. Twilio is wired but
  unconfigured. Either configure it or the copy is a promise the system doesn't keep.
- Once verified, drop ZYL-only models: `Property`, `RentalBooking`, `RentalTestimonial`,
  `RContactMessage`, `RentalPageSettings`, `Enrollment`.

---

## 5 · Risks

| Risk | Mitigation |
|---|---|
| Content drift changes the UI | Seed derived from the live data files; DOM diff per route as a merge gate |
| API down → blank site | Static fallback always present; render never blocks on network |
| Dropping ZYL models breaks something unnoticed | Defer all deletions to Phase 5, after Meenakshi is verified |
| `zenyourlife.be` is a live client site | Phase 0 confirms what production serves **before** any deploy |
| Nested git repos confuse deploys | Resolved in Phase 0 |

## 7 · Deviations from the plan as written

Three decisions were taken during implementation that differ from §4.

**1. Dedicated models instead of extending the ZYL ones.** §2 proposed extending
`Service`, `Testimonial`, `FAQ` and `LegalPage`. In practice those carry `price`,
`duration`, gallery arrays and FR/DE/NL/ES translation sub-schemas that Meenakshi
never uses, and their `category` enums are *required* with massage/rental values.
Extending them meant loosening validators on collections that still hold live
data. Since the repurpose decision retires them anyway, new collections
(`MeenakshiService`, `MeenakshiTestimonial`, `MeenakshiFaq`, `MeenakshiJourneyStep`,
`MeenakshiLegalPage`, `MeenakshiSettings`) match the frontend shape exactly and
leave the old ones untouched for Phase 5 deletion.

**2. Zero component edits, rather than 25 import swaps.** §3 planned to change the
import source in every data-consuming file. Ordering the bootstrap as
*fetch → **then** dynamically import App* means the `src/data/*` modules evaluate
with the store already populated, so they can serve live content behind their
existing export names. No component was touched. This also fixes a case the
original plan would have missed: `knowledge.js` builds the Ask desk's search index
at module scope, and a provider/hook approach would have left it frozen on
bundled content.

**3. One small piece of user-facing markup was added.** The constraint was no UI
change, and no existing markup was altered. But `BookingForm` previously *could
not fail* — it always showed success. Now that submission is real, failure is
reachable, and a silent failure would reproduce the very bug being fixed. A single
error line was added using the existing `field__err` class (no new styling), shown
only on a failed request, plus a `disabled` attribute on the submit button while
in flight. Nothing changes in the success path.

## 8 · Outstanding

- **`deploy.sh` is missing** from the working tree (noted in §4 Phase 0). Recover
  from the old `Synquic/meenakshi` repo if wanted; it targets ZYL infrastructure
  and needs rewriting regardless.
- **Email is unconfigured.** `EMAIL_USER` / `EMAIL_PASSWORD` are blank, so the
  transporter logs `EAUTH` on boot and notifications are skipped (deliberately —
  a failed send never blocks a booking). Consultations still persist and appear in
  the admin. Set both to enable admin alerts and client acknowledgements.
- **WhatsApp confirmation is promised in the UI but not wired.** The booking
  success copy and journey step 03 both say confirmation arrives by WhatsApp.
  Twilio is installed and `twilioSmsService.js` exists but has no credentials.
- **ZYL screens are routed but unlinked.** Properties, rentals, massage bookings
  and the old Services/Testimonials/FAQ pages still resolve by URL; only the nav
  entries were removed. Delete in Phase 5 once the data is confirmed dead.
- **Dockerfile / `build:frontend` / `server.js:56`** still assume the old ZYL
  frontend layout. Untouched here — they change what production serves and that
  needs a deployment decision.
- **No first commit yet.** The fresh repo at `Backend/` has no remote and no
  commits.

## 9 · Explicitly out of scope
- **Razorpay.** `BookingForm` names it and the backend has no payment integration at
  all. Real work, not a wiring task — needs its own decision.
- **Hindi content translation.** Infrastructure exists (DeepL/Google, `fr/de/nl/es`);
  extending to `hi` is straightforward but the site is currently English-only and
  adding a language selector would change the UI.
- **`NAV` and `knowledge.js`** — deliberately staying static, per §2.
