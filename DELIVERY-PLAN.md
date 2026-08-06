# Delivery Plan — closing the proposal gaps

Database stays **MongoDB Atlas**. The PostgreSQL line in the proposal is a
documentation change to agree with the client, not a migration (§5 of
PROPOSAL-STATUS.md).

UI changes are now permitted, held to the existing design language: Cormorant /
Josefin type scale, gold `#DFB13B`, the `bk-*` and `ask-*` class idioms, and the
existing spacing rhythm. No new visual system.

---

## Phase A — Backend

**A1 · Service pricing & duration**
`MeenakshiService` gains `price`, `duration`, `currency`. Public payload and
admin editor updated. Proposal: "each with duration and pricing".

**A2 · Availability & real-time slots**
- `MeenakshiAvailability` — singleton weekly schedule (per-day working flag +
  time slots) and slot length.
- `MeenakshiBlockedDate` — full-day or per-slot blocks.
- `GET /api/consultations/slots?date=` — returns slots for a date, minus those
  already taken and minus blocked ones. This is the "real-time" part.

Deliberately **not** reusing ZenYourLife's `BookingSettings` / `BlockedDate`:
they are wired to the massage `Appointment` model and its Belgium assumptions.

**A3 · Consultation booking & payment**
`Consultation` gains `appointmentDate`, `appointmentTime`, and payment fields
(`paymentStatus`, `amount`, `orderId`, `paymentId`, `signature`).

Order of operations — the enquiry is persisted **before** payment is attempted,
so a failed or abandoned payment still leaves a record. The earlier bug in this
project was losing submissions; the payment flow must not reintroduce it.

1. `POST /api/consultations` → saved, `status: 'new'`, `paymentStatus: 'pending'`
2. `POST /api/payments/order` → Razorpay order for that consultation
3. Razorpay Checkout on the client
4. `POST /api/payments/verify` → HMAC signature check → `paid` + `confirmed`

Razorpay is gated on `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`. Absent those,
the booking completes without payment rather than failing — the practice keeps
taking bookings while keys are pending.

**A4 · Contact enquiries**
`MeenakshiEnquiry` + public `POST /api/enquiries` + admin list/status/delete.
Proposal: "enquiry form with contact details, landing in the admin portal".

**A5 · Blog**
`MeenakshiPost` — title, slug, excerpt, body, cover, tags, author, publish
state, `publishedAt`, SEO title/description. Public list + detail, admin CRUD.

**A6 · Customer records**
Derived from consultations, grouped by normalised contact — no duplicate source
of truth. Returns per-person totals, first/last seen, spend and full history.

**A7 · Reminders**
Repoint the scheduler at `Consultation` using `appointmentDate`.

## Phase B — Admin

- Availability (weekly schedule + blocked dates)
- Enquiries
- Blog posts
- Customers
- Dashboard: revenue tiles
- Services: price/duration fields
- Remove the dead "Users" screen — it reads ZenYourLife enrolments and is
  permanently empty

## Phase C — Frontend

- Service cards and detail pages show duration + price
- `/book`: real slot picker (date → live slots) and Razorpay checkout
- `/contact`: real page with enquiry form, replacing the redirect to `/book`
- `/blog` and `/blog/:slug`
- `/testimonials` standalone page
- Per-route `<title>` and meta description

## Out of scope here

Email credentials, Razorpay live keys, server/domain/SSL deployment and the
handover walkthrough all need client input or infrastructure, not code.
