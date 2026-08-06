# Manual Regression Test Plan

Astrologer Meenakshi — website, booking system and admin portal.

Work top to bottom. Cases marked **★** cover defects that have already occurred
in this build at least once; they are the ones most worth re-running after any
change.

---

## 0 · Setup

| | |
|---|---|
| Public site | http://localhost:5173 |
| Admin portal | http://localhost:5174/admin/ |
| API | http://localhost:5001 |
| Admin login | `admin@zenyourlife.be` / `ZenYourLife@Admin2026!` |
| Database | MongoDB Atlas, database `meenakshi` |

**Before starting**

1. All three servers running; `GET /api/health` returns `database.status: "connected"`.
2. Do a **hard refresh** (Ctrl+Shift+R) on any tab open from a previous session.
   A stale bundle has already caused one false "it works" and one false "it's broken".
3. Note that `POST /api/consultations` is rate limited to **10 per hour per IP**.
   Heavy booking testing will start returning HTTP 429 — that is the limiter, not a bug.
4. Record what you create. Several cases leave data behind; clean-up is at the end (TC-900).

---

## 1 · Public site — content

| ID | Case | Steps | Expected |
|---|---|---|---|
| TC-101 | Home renders | Open `/` | Hero, services, testimonials, FAQ, footer all present. No console errors. |
| TC-102 | All routes reachable | Visit `/`, `/about`, `/services`, `/services/astrology`, `/journey`, `/book`, `/contact`, `/blog`, `/testimonials`, `/legal/privacy-policy` | Each renders; none blank; no console errors |
| TC-103 | Unknown route | Visit `/nonsense-url` | Falls back to the home page, does not error |
| TC-104 | Legal pages | Visit each of the 5 `/legal/*` slugs via footer links | Privacy, Terms, Refund, Code of Ethics, Disclaimer each render with heading + sections |
| TC-105 ★ | Content is database-driven | Admin → Services → edit Astrology's **Lede** → save. Reload `/services` | The new lede appears. Revert afterwards. |
| TC-106 ★ | Ask desk uses live content | Admin → Services → change Numerology's **Intro** → save. Reload `/`, open the Ask desk, type "tell me about numerology" | The reply quotes the new intro. Revert afterwards. **Note: the desk quotes `intro`, not `lede`.** |
| TC-107 ★ | Site survives the API being down | Stop the API server. Hard-refresh `/` | Page still renders with bundled content — never blank. Console shows a fallback warning. Restart the API. |
| TC-108 | Footer navigation | Click every footer link | All resolve; Journal → `/blog`, Client experiences → `/testimonials`, Contact → `/contact` |
| TC-109 | Responsive | Repeat TC-102 at 375px, 768px, 1440px | No horizontal scroll, no overlapping text, nav usable |

## 2 · Booking — the critical path

| ID | Case | Steps | Expected |
|---|---|---|---|
| TC-201 ★ | Booking actually submits | `/book` → fill everything → submit | Success panel ("Request received"). **Then check Admin → Consultations: the record must be there.** A success message alone is not a pass — this exact flow once showed success while storing nothing. |
| TC-202 | Required-field validation | Submit an empty form | Inline errors on Name, DOB, TOB, POB, Consultation, Date, Contact. Focus jumps to the first invalid field. No request sent. |
| TC-203 | Contact accepts either form | Submit once with an email, once with a phone number | Both accepted |
| TC-204 | Contact rejects rubbish | Enter `abc` as contact | "Enter a valid phone number or email address." |
| TC-205 | Dialling code merges | Choose `+91`, enter `9119138356`, submit | Admin shows contact as `+91 9119138356`, contact type **phone** |
| TC-206 | Email left unprefixed | Submit with `someone@example.com` | Stored as typed, no `+91` prefix, contact type **email** |
| TC-207 | Service shows duration and fee | Select each consultation in the dropdown | Hint below shows `<duration> minutes · <fee>`. With price 0 it reads "Fee on enquiry", **never "₹0"** |
| TC-208 | Date respects lead time | Open the date picker | Dates before today + lead time (default 4 days) are not selectable |
| TC-209 | Date respects horizon | Try a date beyond the horizon (default 60 days) | Not selectable |
| TC-210 | Slots load per date | Pick a valid date | Time chips appear within a second or two |
| TC-211 | Closed day | Pick a Sunday (closed by default) | No chips; message explains the day is unavailable |
| TC-212 | Slot selection | Click a time chip | It highlights; only one can be active |
| TC-213 ★ | Slot is consumed | Book a slot. Reload `/book`, pick the same date | That time is **gone** from the list |
| TC-214 ★ | Double-booking blocked | Open `/book` in two tabs. Select the same date and slot in both. Submit both. | First succeeds. Second shows "That time has just been taken", refreshes the slot list, and does **not** create a second booking |
| TC-215 | Submit disabled in flight | Submit and watch the button | Disabled while sending; cannot double-submit |
| TC-216 ★ | Network failure is visible | DevTools → Network → Offline. Submit. | Red error message appears. **Must not show the success panel.** |
| TC-218 ★ | Long session blocks the next slot | Admin → Services: set Astrology's duration to 120. Book it at the first available time. Reload `/book`, same date. | The following hour is **gone**. A 120-minute session must not leave the slot it overlaps bookable. |
| TC-219 ★ | Long session cannot straddle a break | With a 120-minute service, look at the offered starts | A start whose session would run through a gap in the day's configured times (e.g. 12:00 when 13:00 and 14:00 are not configured) is **not** offered |
| TC-217 | Birth details stored | Book, then open the record in admin | DOB, TOB, POB, language, area all match what was entered |

### Payment — requires Razorpay keys

| ID | Case | Steps | Expected |
|---|---|---|---|
| TC-220 | No keys configured | With `RAZORPAY_KEY_ID` unset, book a service with a price | Booking completes **without** checkout; payment status `not_required`. Bookings are never blocked by missing keys. |
| TC-230 ★ | Times shown in the visitor's timezone | DevTools → ⋮ → More tools → Sensors → set Location to London. Reload `/book`, pick a date. | Chips show **London** times, with a line reading "Times shown in your local time (Europe/London). The practice keeps Asia/Kolkata." Hovering a chip shows the IST time. |
| TC-231 | Same timezone, no noise | With the machine in IST, pick a date | Chips show IST; the hint reads "Times shown in Asia/Kolkata" with no conversion wording |
| TC-232 ★ | Booked time is the practice's | After TC-230, book a slot and open it in admin | The stored time is the **IST** wall time, not the visitor's local rendering |
| TC-221 | Zero-price service | Book a service priced at 0 | No checkout; booking recorded |
| TC-222 | Checkout opens | With test keys set and a priced service, submit | Razorpay modal opens showing the correct amount |
| TC-223 | Successful payment | Complete with a Razorpay test card | Success panel; admin shows payment **paid**, status **confirmed**, payment ID recorded |
| TC-224 ★ | Abandoned checkout | Open checkout, close the modal without paying | Booking still exists in admin with payment `pending`. **The enquiry must not be lost.** |
| TC-225 | Failed payment | Use a failing test card | Admin shows payment `failed`; record still present |
| TC-226 | Revenue updates | After a successful payment, open the admin Dashboard | Total revenue and paid count increase |

## 3 · Contact / enquiries

| ID | Case | Steps | Expected |
|---|---|---|---|
| TC-301 | Form renders | Open `/contact` | Name, email, phone, subject, message present. It is **not** a redirect to `/book`. |
| TC-302 | Required fields | Submit empty | Errors on Name and Message |
| TC-303 ★ | Needs a reply route | Fill name + message only, submit | "An email address or phone number is required." Client-side, before any request. |
| TC-304 | Email format | Enter `not-an-email` | Validation error |
| TC-305 | Submits | Fill validly and submit | Confirmation panel shown |
| TC-306 | Lands in admin | After TC-305, open Admin → Enquiries | The message is listed with status **new** |
| TC-307 | Opening marks read | Click the enquiry | Status changes to **read** automatically |
| TC-308 | Status + notes persist | Set status to Replied, add a note, save, reload | Both persist |
| TC-309 | Delete | Delete an enquiry, confirm | Removed from the list |

## 4 · Blog

| ID | Case | Steps | Expected |
|---|---|---|---|
| TC-401 | Empty state | With no posts, open `/blog` | "No articles yet. There will be." — not an error |
| TC-402 | Create + publish | Admin → Blog → New post, fill in, tick Published, save | Appears in the admin list marked **published** |
| TC-403 | Appears publicly | Open `/blog` | Post listed with date and reading time |
| TC-404 | Article renders | Click through | Body renders; blank lines become paragraphs; a line starting `## ` becomes a heading |
| TC-405 ★ | Drafts are private | Create a post with Published **off**. Visit `/blog/<its-slug>` directly | "Article not found". It must **not** be readable by guessing the URL. |
| TC-406 | Unpublish | Unpublish a live post, reload `/blog` | Gone from the index; direct URL now 404s |
| TC-407 | Tag filter | Create posts with different tags, open `/blog` | Tag chips appear; clicking one filters; "All" restores |
| TC-408 | Slug auto-fill | Type a title on a **new** post | Slug auto-generates as lowercase-hyphenated |
| TC-409 | Slug frozen on edit | Edit an **existing** post's title | Slug does **not** change automatically (it would break live links) |
| TC-410 | Duplicate slug | Create two posts with the same slug | Second rejected with a clear message |
| TC-411 | Per-article SEO | Open an article, view page source / `document.title` | Title reflects the article; canonical link present |
| TC-412 | Related posts | With 2+ posts sharing a tag, open one | "Also worth reading" lists the others |

## 5 · Admin — access control

| ID | Case | Steps | Expected |
|---|---|---|---|
| TC-501 | Login | Correct credentials | Lands on Dashboard |
| TC-502 | Bad password | Wrong password | Rejected with an error; no session created |
| TC-503 ★ | Protected routes | Log out, then visit `/admin/consultations` directly | Redirected to login. (Auth uses **both** a `localStorage` token and an `adminSession` cookie — clearing either should log you out.) |
| TC-504 | Session persists | Log in, reload | Still authenticated |
| TC-505 | Logout | Click Sign Out | Returns to login; protected routes no longer reachable |
| TC-506 ★ | API rejects anonymous | `curl http://localhost:5001/api/consultations` with no auth header | 401/403. Repeat for `/api/meenakshi/admin/services`, `/api/enquiries`, `/api/customers` |
| TC-507 | Public endpoints stay open | `curl` `/api/meenakshi/content` and `/api/blog` with no auth | 200 |

## 6 · Admin — screens

| ID | Case | Steps | Expected |
|---|---|---|---|
| TC-601 | Every screen loads | Click each sidebar item | All 12 render, none stuck on "Loading…", no console errors |
| TC-602 ★ | Dashboard shows consultations | Submit a booking, open Dashboard | Appears under Recent requests; status tiles update. **This page once showed massage data and knew nothing of consultations.** |
| TC-603 | Dashboard revenue | Check the revenue tiles | Total, this month, paid count — all render (zeros are fine) |
| TC-604 | Consultations filter | Use the status tabs | List filters; counts match |
| TC-605 | Consultations search | Search a name, contact or area | Filters correctly |
| TC-606 | Confirm a booking | Open one, set status Confirmed, assign date/time, save | Persists after reload; appears in the Confirmed tab |
| TC-607 | Content CRUD | On each of Services / Testimonials / FAQ / Journey / Legal: create, edit, delete | All work; changes appear on the public site |
| TC-608 | Reorder | Use the up/down arrows on any content list | Order changes and persists; public site reflects it |
| TC-609 | Show/hide | Toggle the eye icon on a service | Hidden item disappears from the public site, stays in admin |
| TC-610 | Service pricing | Set a price and duration, save | Shows on `/services/<slug>` and in the booking dropdown |
| TC-611 | Site settings | Edit brand details, proof stats, assurances; save | Reflected across the public site |
| TC-612 | Availability — schedule | Turn a weekday off, save. Try booking that weekday | No slots offered |
| TC-613 | Availability — slots | Add a time to a working day, save | Appears in the booking picker |
| TC-614 | Availability — lead time | Change lead time to 10, save | Booking calendar's earliest date moves accordingly |
| TC-615 ★ | Blocked date | Block a date. Try to book it | No slots; reason shown. Unblock → slots return. |
| TC-616 | Customers grouping | Book twice with the same phone number in different formats (`9119138356` and `+91 91191 38356`) | Admin → Customers shows **one** person with 2 bookings, not two people |
| TC-617 | Customer history | Open a customer | Full consultation history with birth details and status |
| TC-618 ★ | No dead screens | Check the sidebar | No "Users" entry. (It read ZenYourLife enrolments and was permanently empty.) |

## 7 · Cross-cutting

| ID | Case | Steps | Expected |
|---|---|---|---|
| TC-701 ★ | API returning non-JSON | Point the frontend at a wrong API URL, submit a booking | Error shown. A 200 from something that is not this API must **not** read as success. |
| TC-702 | Rate limiting | Submit 11 bookings within an hour from one IP | 11th rejected with 429 |
| TC-703 | Long input | Paste 5,000 characters into a message field | Handled gracefully; no crash |
| TC-704 | Special characters | Use Devanagari, emoji and apostrophes in name and message | Stored and displayed correctly |
| TC-705 | Browser back | Navigate several pages, use Back | History behaves; no blank screens |
| TC-706 ★ | Mongo drop | Stop the network / kill the Atlas connection briefly, then restore | Server logs a disconnect and reconnects. It must not sit "up" with every request hanging. |
| TC-707 | Concurrent admin edits | Edit the same service in two tabs, save both | Last write wins; no crash |

## 8 · Known gaps — expected to fail, do not raise

| Area | Behaviour |
|---|---|
| Email | `EMAIL_USER` / `EMAIL_PASSWORD` are blank. No confirmation or notification emails send. Bookings and enquiries still save — this is deliberate. |
| WhatsApp | The UI promises WhatsApp confirmation; Twilio is installed but unconfigured. Nothing sends. |
| Payments | Without Razorpay keys, TC-222 to TC-226 cannot run. |
| Prices | All services are ₹0 until set, so everything reads "On enquiry" and payment is skipped. |
| Reminders | The scheduler still targets the old ZenYourLife appointment model, not consultations. |
| SEO | Titles and descriptions are set client-side. Crawlers that do not execute JavaScript see only the base title. |
| Consent | The booking form has no consent checkbox, so `consent` is stored as `false`. |

## 9 · Clean-up

| ID | Case |
|---|---|
| TC-900 | Delete every test consultation, enquiry, blog post and blocked date created during this run. Restore any content edited in TC-105, TC-106 and TC-611. Confirm Admin → Customers reflects the removals. |
