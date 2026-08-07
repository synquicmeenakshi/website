# Proposal vs. Build — Status

Against *Synquic Proposal — Astrology Website + Admin Portal*, 4 August 2026,
prepared for Anshul Ji. Total project value ₹70,000.

Assessed 2026-08-06 against the running build. Verified in a real browser, not
assumed.

---

## Headline

Roughly **55–60% of scope delivered**. The content site and the admin portal are
substantially built and working. The two things missing are the two that carry
the most commercial weight: **payment integration** and **real-time slot
booking** — together the core of the ₹18,000 booking line item.

There is also a **stack discrepancy** that needs a decision (§5).

---

## 1 · Website Pages — proposal calls for 7

| # | Page | Status | Note |
|---|---|---|---|
| 01 | Homepage | **Done** | Hero, services overview, trust signals, booking CTA all present |
| 02 | About / Astrologer Profile | **Done** | Background, credentials, lineages, imagery |
| 03 | Services | **Partial** | Pages exist per discipline. **No duration, no pricing** — the proposal specifies "each with duration and pricing" |
| 04 | Appointment Booking | **Partial** | Capture works end-to-end. "Service selection through to payment in a single flow" — payment absent |
| 05 | Testimonials | **Partial** | Exists as a homepage section, not the standalone page implied |
| 06 | Blog / Articles | **Not started** | No route, no model, no admin screen. Entirely absent |
| 07 | Contact Us | **Not started** | `/contact` redirects to `/book`. No enquiry form, nothing lands in admin |

**Delivered beyond scope** (not billed, worth noting): `/journey`, five legal
pages (`/legal/:slug`), and the "Ask Meenakshi" guidance desk.

## 2 · Appointment Booking System

| Item | Status | Note |
|---|---|---|
| Service selection with duration and pricing | **Partial** | Consultation-area dropdown works; no duration or price anywhere in the data model |
| Real-time slot availability, date & time picker | **Not started** | Form asks only "preferred date". Admin assigns the slot manually afterwards. `BookingSettings` / `BlockedDate` infrastructure exists from Meenakshi but is not wired to consultations |
| Customer details capture (name, birth details, contact) | **Done** | Name, DOB, TOB, POB, area, language, contact — all stored |
| Razorpay payment gateway | **Not started** | No integration of any kind. Site copy already promises "Secure payment — processed through Razorpay" |
| Automated booking confirmation email | **Built, not live** | Admin alert + client acknowledgement written and wired; `EMAIL_USER`/`EMAIL_PASSWORD` blank so sends are skipped |
| Reschedule & cancellation via admin | **Partial** | Status changes and date/time reassignment work. No client-facing reschedule, no notification when changed |
| Automated reminder emails | **Not started** | `reminderScheduler` runs but still queries the Meenakshi `Appointment` model, not `Consultation` |

## 3 · Admin Portal

| Item | Status | Note |
|---|---|---|
| Secure admin login | **Done** | JWT + API key + session cookie |
| Dashboard — booking summary | **Done** | Status tiles, recent requests, content counts |
| Dashboard — **revenue** summary | **Not started** | No payment data exists to report on |
| Appointment management (view/approve/reschedule/cancel) | **Done** | Full detail view, status workflow, slot assignment, internal notes |
| Availability & time-slot management | **Not started** | Not wired to consultations |
| Service management | **Done** | Full CRUD + reorder |
| **Pricing** management | **Not started** | No price field on the model |
| Customer records & enquiry management | **Not started** | No customer model — repeat clients create unlinked records. The "Users" screen is a dead Meenakshi leftover reading empty `enrollments` |

Also delivered beyond scope: admin editing for testimonials, FAQ, journey
steps, legal pages and site-wide settings.

## 4 · Features Included

| Item | Status |
|---|---|
| Custom UI/UX design | **Done** |
| Mobile responsive | **Done** |
| SEO-friendly structure | **Partial** — `robots.txt` and `sitemap.xml` present; single static `<title>`/description for every route, no per-page meta |
| Basic on-page SEO setup | **Partial** — same reason |
| Performance optimisation | **Partial** — code-split, gzipped ~105 KB main chunk |
| Social media integration | **Partial** — Instagram/WhatsApp links only |
| Basic reports on bookings and payments | **Partial** — booking counts yes; payments impossible |
| SSL configuration | **Pending** — deployment stage |
| Deployment on managed server + domain | **Pending** |

## 5 · Technology Stack — one discrepancy

| Proposal | Built | |
|---|---|---|
| React.js frontend | React 18 + Vite | ✅ |
| React.js admin portal | React 19 + Vite + Tailwind | ✅ |
| Node.js & Express REST API | Node + Express | ✅ |
| **PostgreSQL** | **MongoDB Atlas** | ⚠️ **mismatch** |
| Razorpay | — | ❌ not started |
| Transactional email service | nodemailer, unconfigured | ⚠️ |
| Synquic-managed server, SSL | — | ❌ pending |

The proposal commits to PostgreSQL "for services, slots, bookings, customers and
payments". The build is MongoDB, inherited from the Meenakshi codebase this
was adapted from. Functionally fine, but it differs from a signed document — it
needs either client sign-off on the change or a migration. Raising it now is far
cheaper than at handover.

## 6 · Deliverables checklist

| Deliverable | Status |
|---|---|
| Fully functional website with booking system | **Partial** — booking captures, does not take payment or slots |
| Responsive frontend across devices | **Done** |
| Secure admin portal with database | **Done** |
| Payment gateway integration | **Not started** |
| Email notification setup | **Built, not configured** |
| Deployment on managed server + domain | **Not started** |
| Admin usage walkthrough & basic training | **Not started** |
| Basic testing before launch | **Partial** — automated suites in place (parity, e2e, route audit); no formal UAT |

## 7 · Against the payment schedule

| Milestone | % | Amount | Realistic position |
|---|---|---|---|
| Advance — signing | 15% | ₹10,500 | Presumably collected |
| UI approval | 10% | ₹7,000 | Frontend built and reviewable |
| UAT sign-off | 40% | ₹28,000 | **Not reachable** — payment, slots, blog and contact are all in scope for UAT |
| Production & handover | 35% | ₹24,500 | Not reachable |

## 8 · Ordered list of remaining work

1. **Razorpay integration** — booking flow, payment records, admin visibility. Largest single gap; site copy already promises it.
2. **Real-time slot availability** — client-facing date/time picker plus availability management in admin. Note this *will* change the booking-page UI.
3. **Service duration & pricing** — model fields, admin editing, display on service and booking pages.
4. **Contact Us page** — enquiry form landing in admin (`ContactMessage` model already exists, unused).
5. **Blog / Articles** — model, admin CRUD, listing and article routes; the main SEO vehicle in the proposal.
6. **Customer records** — group consultations by person, history, search.
7. **Reminder emails** — repoint the scheduler at `Consultation`.
8. **Email credentials** — makes confirmations live; already coded.
9. **Revenue reporting** — depends on 1.
10. **Per-route SEO meta** — titles and descriptions per page.
11. **Standalone testimonials page.**
12. **Deployment** — server, domain, SSL, plus the Dockerfile/`build:frontend`/`server.js` paths that still assume the old Meenakshi layout.
13. **PostgreSQL decision** — migrate, or get the change signed off.
14. **Training & handover walkthrough.**

Items 2 and 3 are worth flagging to the client early: both change the booking
page's visible UI, which has so far been held unchanged by explicit instruction.
