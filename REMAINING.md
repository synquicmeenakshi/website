# Remaining Work

Checked against the running build on 2026-08-08, not copied from earlier docs.
Much of what `PROPOSAL-STATUS.md` lists as missing is now built — payment,
real-time slots, blog, contact, customers and the admin redesign have all
landed since it was written.

---

## 1 · Blocked on you — nothing ships without these

| # | Item | Why it blocks | Effort |
|---|---|---|---|
| 1.1 | **Slide message templates** | The account has **zero** templates. Both channels are template-only, so **no WhatsApp or email confirmation can send at all**. Code is wired and waiting. | You: create 2 in the Slide dashboard, send me the names/IDs |
| 1.2 | **Service prices** | All 8 services are ₹0, so every booking is `not_required` and **Razorpay is never invoked**. The gateway works — it just never runs. | You: set them in Admin → Services |
| 1.3 | **Rotate the Slide key** | `sk_live_…` was pasted in plaintext chat and is in this transcript. Live key, `whatsapp:send` + `email:send` scope. | You: rotate, send new key |
| 1.4 | **Production domain** | `admin/.env.production` has no values, so the admin production build **correctly refuses to run**. Deliberate guard, not a bug. | You: assign domain |
| 1.5 | **Razorpay webhook secret** | Endpoint is built, signature-verified and idempotent, but unconfigured. Without it, a customer who closes the tab mid-payment is charged while the booking stays `pending` forever. Needs a public URL, so it follows deployment. | You: add webhook in Razorpay dashboard |

## 2 · Code — ready to build when you want it

| # | Item | Note |
|---|---|---|
| 2.1 | **Reminder emails** | `reminderScheduler.js` still queries the ZenYourLife `Enrollment` model. It runs daily and does nothing. Repoint at `Consultation`. |
| 2.2 | **Deployment config** | `Dockerfile`, root `package.json` (`build:frontend`) and `server.js:56` still assume the old ZenYourLife layout. They will not build the current tree. |
| 2.3 | **Client self-service** | No reschedule or cancel link for the client. Admin-only today, and with no email configured a client cannot even ask. |
| 2.4 | **Consultation follow-through** | The site promises a written report and 15 days of support. Neither has anywhere to live on the record. |
| 2.5 | **Calendar sync** | Nothing blocks a slot when Meenakshi books something elsewhere. The main remaining gap versus a tool like Calendly. |
| 2.6 | **Buffers between sessions** | No gap enforced between back-to-back consultations. |
| 2.7 | **Per-service schedules** | One global weekly schedule; every service offers the same times. |
| 2.8 | **Website button contrast** | `.btn--primary` is cream on `#d4531d` = **3.78**, below AA. Same issue I fixed in the admin. Left alone deliberately — changing it alters the live site's look, which is your call. |

## 3 · Housekeeping

| # | Item | Note |
|---|---|---|
| 3.1 | **Push 4 commits** | Remote is set (`synquicmeenakshi/website`), `main` tracks `origin/main`, 4 commits unpushed. |
| 3.2 | **Delete test data** | 7 consultations in the database, most of them mine and yours from testing. Blog and enquiries are empty. |
| 3.3 | **Dev placeholder secrets** | `JWT_SECRET` and `ADMIN_API_KEY` are still the throwaway dev values. Must change before production. |
| 3.4 | **Admin account** | Login is `admin@zenyourlife.be` — another brand's domain, purely an identifier. Worth replacing with a Meenakshi address. |
| 3.5 | **`deploy.sh` missing** | Disappeared during the folder restructure. Recoverable from the old `Synquic/zenyourlife` repo; targets ZYL infrastructure so needs rewriting regardless. |
| 3.6 | **Misleading class names** | Admin utilities say `slate` and render warm brown, because the Tailwind ramp was remapped rather than 16,000 lines rewritten. Deliberate, but it will confuse the next reader. |
| 3.7 | **Rebrand comment damage** | A global ZenYourLife→Meenakshi rename rewrote historical comments, so several now contradict themselves — e.g. `DELIVERY-PLAN.md` says "deliberately not reusing Meenakshi's BookingSettings", `timezone.js` says "originally hardcoded to Europe/Brussels for Meenakshi". |
| 3.8 | **Retired ZYL screens** | 11,904 lines, unlinked but routed, inheriting the theme. Checked structurally, not reviewed by eye. |

## 4 · Out of scope until asked

- **Hindi translation.** Infrastructure exists (DeepL/Google, FR/DE/NL/ES); the site is English-only and a language switcher would change the UI.
- **PostgreSQL.** The proposal names it; the build is MongoDB. Settled as a documentation change, still needs the client's sign-off.
- **Client training / handover walkthrough.** A proposal deliverable, not a code task.
- **Formal UAT.** Automated suites cover parity, e2e, routes, slots, payments and contrast. No human test pass has been run — `TEST-PLAN.md` has 92 cases ready.

---

## Shortest path to a working launch

1. Create the two Slide templates → confirmations start sending (1.1)
2. Set service prices → payment starts running (1.2)
3. Repoint the reminder scheduler (2.1)
4. Fix the deployment config (2.2)
5. Assign the domain, deploy, add the webhook (1.4, 1.5)
6. Rotate keys, replace dev secrets, clear test data (1.3, 3.2, 3.3)

Items 1 and 2 are the difference between a booking system that quietly works
and one where a client books, pays nothing, and hears nothing back.
