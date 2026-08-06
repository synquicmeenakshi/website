# ZenYourLife — Admin Handbook & Complete Guide

> **This document is for the admin of the ZenYourLife portal.**
> Every field in every popup, every section on the website, emails triggered, translations, images — everything is documented here.

---

## Table of Contents

1. [How to Log In](#1-how-to-log-in)
2. [Admin Panel Overview — Sidebar Menu](#2-admin-panel-overview--sidebar-menu)
3. [Dashboard](#3-dashboard)
4. [Massage Appointments — Every Field & Every Popup](#4-massage-appointments--every-field--every-popup)
5. [Booking Calendar](#5-booking-calendar)
6. [Booking Management — Schedule & Blocked Dates](#6-booking-management--schedule--blocked-dates)
7. [Inquiries](#7-inquiries)
8. [Properties — Every Field & Every Popup](#8-properties--every-field--every-popup)
9. [Services — Every Field & Every Popup](#9-services--every-field--every-popup)
10. [Testimonials — Every Field & Every Popup](#10-testimonials--every-field--every-popup)
11. [FAQ — Every Field & Every Popup](#11-faq--every-field--every-popup)
12. [Users](#12-users)
13. [How Language Translations Work](#13-how-language-translations-work)
14. [Images — How to Change or Upload](#14-images--how-to-change-or-upload)
15. [Email & SMS Reminders — Full System Explained](#15-email--sms-reminders--full-system-explained)
16. [Emails Sent Automatically — Complete List](#16-emails-sent-automatically--complete-list)
17. [Which Email Address Sends Everything](#17-which-email-address-sends-everything)
18. [Master Map — What Admin Section Controls What on the Website](#18-master-map--what-admin-section-controls-what-on-the-website)

---

## 1. How to Log In

1. Open your browser and go to: **https://zenyourlife.be/admin**
2. Enter your admin credentials.
3. Click **Login**.

> If you need to reset the admin password, contact the developer — passwords are stored in the MongoDB database.

---

## 2. Admin Panel Overview — Sidebar Menu

| Sidebar Item | URL path | Purpose |
|---|---|---|
| Dashboard | `/admin/dashboard` | Stats & recent booking overview |
| Massage Appointments | `/admin/massage-appointments` | All massage bookings |
| Booking Calendar | `/admin/booking-calendar` | Visual calendar of appointments |
| Booking Management | `/admin/booking-management` | Working hours, time slots, blocked dates |
| Inquiries | `/admin/inquiries` | Contact form messages |
| Properties | `/admin/properties` | Rental property listings |
| Services | `/admin/services` | Massage service listings |
| Testimonials | `/admin/testimonials` | Customer reviews |
| FAQ | `/admin/faq` | Frequently asked questions |
| Users | `/admin/users` | Customer records (read-only) |

---

## 3. Dashboard

**Read-only.** No editing is possible here.

**Stats cards shown:**
- **Upcoming Bookings** — Count of future appointments
- **Pending Bookings** — Count of appointments not yet confirmed
- **Total Bookings** — All-time count
- **Confirmed Rate %** — Percentage of confirmed bookings

**Appointments table shows:** Booking ID, customer full name, service, date, time, status, email, phone.

**Filter button (top right):** Switches the table between:
- All Time
- Last 24 Hours
- Last 7 Days
- Last 30 Days
- Last Year

---

## 4. Massage Appointments — Every Field & Every Popup

**URL:** `/admin/massage-appointments`

This is a **split-panel** view:
- **Left panel** — list of all bookings (scrollable)
- **Right panel** — detail view of the selected booking

---

### Left Panel: List & Filters

**Search bar:** Searches by customer name, email, or service name.

**Status filter dropdown:**
- All
- Pending
- Confirmed
- Cancelled
- Completed

**Period filter dropdown:**
- All Time
- Today
- Last 24 Hours
- Last 7 Days
- Last 30 Days
- Last Year

**Each booking row shows:** Customer name, service booked, date, time, status badge.

**Click any row** → opens the full detail in the right panel.

---

### Right Panel: Booking Detail

When you click a booking, the right panel shows:

| Field | What it shows |
|---|---|
| Booking ID | Auto-generated number (e.g., #1042) |
| Status badge | Pending / Confirmed / Cancelled / Completed |
| Service | Name of the massage service booked |
| Date | Appointment date |
| Time | Appointment time (Belgian timezone) |
| First Name | Customer's first name |
| Last Name | Customer's last name |
| Email | Customer's email address |
| Phone | Customer's phone number |
| Country | Customer's country |
| Gender | male / female |
| Special Requests | Any notes the customer entered at booking |
| Message | Additional message from the customer |
| Booked On | When the booking was created |

---

### Status Action Buttons (in Right Panel)

| Button | What it does | Email triggered? |
|---|---|---|
| **Confirm** | Changes status → Confirmed | No automatic email on admin confirm (confirmation was already sent when customer booked) |
| **Cancel** | Changes status → Cancelled | No automatic email |
| **Complete** | Changes status → Completed | No automatic email |

> When a customer books themselves on the website, **a confirmation email is automatically sent immediately** — you do not need to confirm anything for that email to go out. The Confirm button in admin simply changes the database status.

---

### Popup 1: Create New Booking (Manual Entry)

Click **+ New Booking** button (top right).

A popup modal opens with these fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| First Name | Text input | Yes | Customer's first name |
| Last Name | Text input | Yes | Customer's last name |
| Email | Email input | Yes | Customer's email address |
| Phone Number | Text input | Yes | Full number with country code |
| Country | Dropdown | Yes | BE, IN, US, GB, FR, DE, NL |
| Gender | Dropdown | Yes | Male, Female |
| Service | Dropdown | Yes | Pulls from active services in the database |
| Appointment Date | Date picker | Yes | Must be a working day, not blocked |
| Appointment Time | Text input | Yes | Enter time e.g. 10:00 |
| Special Requests | Textarea | No | Optional notes |
| Message | Textarea | No | Additional message |

**What happens when you Save:**
- A new booking is created in the database with status **Confirmed**.
- It appears immediately in the left panel list.
- **No confirmation email is sent** for admin-created bookings (only customer-initiated bookings trigger emails).

**Cancel button:** Closes the popup without saving anything.

---

### Popup 2: Send Message to Customer

Click the **Message** icon/button in the right panel.

A popup modal opens:

| Field | Type | Notes |
|---|---|---|
| Message Type | Toggle (Email / SMS) | Choose Email or SMS |
| Subject | Text input | Email only — subject line |
| Message body | Textarea | The actual message content |

**What happens when you Send:**
- **If Email:** Sends an email from `EMAIL_USER` (ZenYourLife Gmail) to the customer's email. Email is styled with ZenYourLife gold branding. Shows "Dear [Customer Name]" and your typed message.
- **If SMS:** Sends an SMS via Twilio to the customer's phone number. Message prefixes with "Zen Your Life" and signs off "- Zen Your Life Team".

**Success/Error feedback:** A green or red status banner appears at the bottom of the popup.

---

### Popup 3: Delete Booking

Click the **Delete** (trash) icon in the right panel.

A confirmation popup appears:
- Text: "Are you sure you want to delete this booking?"
- **Confirm Delete** → permanently removes the booking from the database. Cannot be undone.
- **Cancel** → closes popup, nothing is deleted.

---

### Popup 4: Cancel Booking Confirmation

Click **Cancel** status button.

A small confirmation popup:
- **Confirm** → Sets status to Cancelled.
- **Cancel** → Closes popup, status unchanged.

---

### Panel Layout Controls

- **Drag the divider** between left and right panels to resize.
- **Left arrow icon (top of right panel)** → Shows left panel only (full width list).
- **Right arrow icon** → Shows right panel only (full width detail).
- **Both arrows** → Returns to split view.

---

## 5. Booking Calendar

**URL:** `/admin/booking-calendar`

A full **monthly calendar** view.

- Dates with bookings are marked (with count or color).
- Click a date to see bookings for that day.
- Navigate months using left/right arrows.
- **Read-only** — no editing from here.

---

## 6. Booking Management — Schedule & Blocked Dates

**URL:** `/admin/booking-management`

Two tabs: **Schedule** and **Blocked Dates**.

---

### Tab 1: Schedule

#### Working Days & Time Slots

For each day (Mon–Sun):

| What you see | What it controls |
|---|---|
| Day name + ON/OFF toggle | Whether this day is a working day |
| List of time slots | Available booking times for that day (e.g., 09:00, 10:00, 11:00…) |
| Edit button | Opens the day edit popup |

**→ Day Edit Popup (click Edit on any day):**

| Field | Type | Notes |
|---|---|---|
| Working Day toggle | ON / OFF | Marks the day as available or not |
| Time slot list | List | Shows all current slots for this day |
| Remove slot (X button) | Click X next to a slot | Removes that time from availability |
| New slot input | Text (HH:MM) | Type a time e.g. `14:30` |
| Add slot button | Click | Adds the typed time to the list |
| Save button | Click | Saves all changes |
| Cancel button | Click | Closes without saving |

**What changes on the website:** The **date/time selection step** in the customer booking form will only show the working days you enabled, and only show the time slots you have added for each day.

#### Minimum Advance Booking

A number input: "Customers must book at least X hours in advance."
- If set to 24, a customer trying to book for tomorrow after midnight won't see tomorrow's time slots as available.
- Save button applies the change immediately.

---

### Tab 2: Blocked Dates

A list of all dates that have been blocked. Blocked dates show as **unavailable** to customers in the booking form.

#### → Popup: Block a Date (click + Block Date)

| Field | Type | Notes |
|---|---|---|
| Mode | Single / Range toggle | Block one date or a range of dates |
| Date (Start) | Date picker | The date to block |
| Date (End) | Date picker (Range mode only) | Last date of the range |
| Block Type | Full Day / Specific Slots | Full Day = entire day unavailable; Specific Slots = only chosen times blocked |
| Reason | Text input | Optional note (e.g., "Vacation") — visible to admin only, not to customers |
| Slot selection | Checkbox list | Only shown if Block Type = Specific Slots. Select which time slots to block. |
| Save button | Saves the block | |
| Cancel button | Closes popup without saving | |

**What changes on the website:** Blocked full-day dates show as grayed out in the customer date picker. Blocked time slots within a day show as strikethrough / unavailable in the time grid.

#### Delete a Blocked Date

- Click the trash icon on any blocked date in the list.
- A confirmation prompt appears.
- Confirm → removes the block. That date becomes available again immediately.

---

## 7. Inquiries

**URL:** `/admin/inquiries`

All contact form messages from website visitors (both massage site and rental site).

**Left panel:** List of all messages with name, status badge, date.

**Filters:**
- Status: All / New / Read / Replied / Archived
- Period: All / Last 24h / Last Week / Last Month / Last Year
- Search: By name or email

**Right panel (click a message):**

| Field | What it shows |
|---|---|
| Name | First + Last name |
| Email | Customer email |
| Phone | Phone number with country code |
| Message | Full message text |
| Received | Date and time |
| Status | new / read / replied / archived |

**Action buttons:**
- **Mark as Read** — Changes status to "read"
- **Mark as Replied** — Changes status to "replied"
- **Archive** — Changes status to "archived"
- **Delete** — Opens confirm popup → permanently deletes

**No automatic email** is sent when you change inquiry status. Replies must be done manually from your own email client.

---

## 8. Properties — Every Field & Every Popup

**URL:** `/admin/properties`

Controls all rental property listings on **https://zenyourlife.be/rental** (the rental website).

---

### Where Each Field Appears on the Website

The Properties section feeds **three places** on the rental website:
1. **Apartments listing section** on the Rental Home page
2. **Particular Property detail page** (`/particular-property/:id`)
3. **Testimonials** (testimonials can be linked to a property)

---

### → Popup: Add / Edit Property

When you click **+ Add Property** or the **Edit** (pencil) icon, a large modal opens.

At the top of the modal: **Language tabs: EN | FR | DE | NL | ES**

> Always fill everything in the **EN** tab first. Then switch tabs to see/edit the auto-translated versions.

---

#### Section: Basic Info

| Field | Type | Required | Where it appears on website |
|---|---|---|---|
| Property Name | Text input | Yes | Large heading on the property card; page title on detail page |
| Description | Textarea | Yes | Main description text on the property card and detail page. Translatable. |
| Price | Number input | Yes | Displayed as "€[price]" on the card |
| Currency | Dropdown (€, $, £) | Yes | Shown next to the price |
| Price Unit | Text input | Yes | Shown as "per night" or custom text next to price. Translatable. |
| Guests | Number input | Yes | Shown with 👥 icon on the card |
| Bedrooms | Number input | Yes | Shown with 🛏️ icon on the card |
| Parking | Text input | Yes | Shown with 🚗 icon on the card. Translatable. |
| Map URL | URL input | No | "View on Map 📍" link on the card — paste a Google Maps share/embed URL |
| Active / Inactive toggle | Toggle | Yes | OFF = property hidden from website entirely |

---

#### Section: Property Image

| Field | Type | Notes | Where it appears |
|---|---|---|---|
| Preset image selector | 4 image tiles | Click to select: Apat1.png, Apat2.png, Villa1.png, Villa2.png | Main card image; hero image on detail page |
| Upload custom image | Upload button | Upload any JPG/PNG from your computer | Replaces the preset selection |
| Image URL | Text input | Paste a direct image URL instead of uploading | Same — main card and detail hero |

---

#### Section: Gallery Images

| Field | Type | Notes | Where it appears |
|---|---|---|---|
| Upload gallery photos | Multi-upload button | Upload multiple photos at once | Shown as a photo slider/gallery on the property detail page |
| Remove photo | X on each thumbnail | Removes that photo from the gallery | |

---

#### Section: Cleanliness

| Field | Type | Notes | Where it appears |
|---|---|---|---|
| Cleanliness Title | Text input | e.g., "Spotless Cleanliness" | Shown in the cleanliness section on the property card |
| Cleanliness Description | Textarea | Describe the cleaning standard. Translatable. | Shown as text under the title on the card |

---

#### Section: Amenities

| What you see | How to use | Where it appears |
|---|---|---|
| Predefined amenity checkboxes | Check the ones that apply | Displayed as blue pill badges on the property card and detail page |
| Available presets | High-speed Wi-Fi, Washing machine, Smart TV, Fresh linens & towels, Safe neighborhood, Coffee maker, Outdoor seating, Self check-in, Air conditioning, Swimming pool, Fully equipped kitchen, Free parking, Private garden, Gym access, Ocean/Mountain view | |
| Custom amenity input | Type any text + click Add | Adds a custom amenity pill |

First **4 amenities** are shown by default on the card. If there are more, a "+X more" indicator appears.

---

#### Section: Overview (for the property detail page)

These fields only appear on the **full property detail page**, not on the listing card.

| Field | Type | Notes | Where it appears |
|---|---|---|---|
| Overview Title | Text input | Main heading | Detail page overview section header |
| Description 1 | Textarea | First paragraph. Translatable. | Detail page |
| Description 2 | Textarea | Second paragraph. Translatable. | Detail page |
| Highlights | Repeatable text items | Bullet points / feature tags | Shown as pill tags on detail page |
| Features (up to 4) | Repeatable blocks | Each feature has: Title, Description, Image (upload) | Shown as feature cards on detail page |

---

#### Section: Location (for the property detail page)

| Field | Type | Notes | Where it appears |
|---|---|---|---|
| Location Title | Text input | e.g., "Prime Location" | Detail page location section heading |
| Location Description | Textarea | Text about location. Translatable. | Below heading on detail page |
| Map Embed URL | URL input | Google Maps embed URL (iframe src) | Interactive map shown on detail page |
| Nearby Places (repeatable) | Title + Image | Add local restaurants, beaches, etc. | Shown as place cards on detail page |

---

#### Section: Host (optional)

| Field | Type | Where it appears |
|---|---|---|
| Host Name | Text input | "Meet your host: [Name]" link on the property card |

---

#### Save button
- Saves all fields.
- **Triggers auto-translation** of all translatable fields (Description, Price Unit, Parking, Cleanliness description, Location description, Overview descriptions) into FR, DE, NL, ES using the DeepL API.
- Changes appear on the rental website **immediately**.

#### Cancel button
- Closes the modal without saving anything.

---

### → Popup: Delete Property

Click the trash icon on a property card.

- Confirmation popup: "Are you sure you want to delete [Property Name]?"
- **Delete** → permanently removes from database. All related testimonials that referenced this property still exist but lose the property link.
- **Cancel** → closes popup.

---

### → Popup: Section Settings (gear icon at top of Properties page)

Controls the **heading and description** of the Apartments section on the rental homepage.

| Field | Type | Where it appears |
|---|---|---|
| Badge text | Text input | Small label above the section title on the rental homepage (e.g., "Our Properties") |
| Section Title | Text input | Large heading of the Apartments section |
| Section Description | Textarea | Subheading text below the section title |
| Active toggle | Toggle | OFF = hides the entire section from the rental homepage |

---

### → Popup: Overview Section Settings (rental homepage overview cards)

Controls the **Overview section** on the rental homepage (the top cards showing villa types).

| Field | Type | Where it appears |
|---|---|---|
| Badge text | Text input | Small tag above the overview heading |
| Title 1 | Text input | First part of the heading |
| Title 2 | Text input | Second part of the heading (styled differently) |
| Description 1 | Textarea | First description paragraph |
| Description 2 | Textarea | Second description paragraph |
| Cards (up to 4) | Repeatable — Title, Description, Image upload | Each overview card on the homepage |
| Active toggle | Toggle | OFF = hides the entire overview section |

---

## 9. Services — Every Field & Every Popup

**URL:** `/admin/services`

Controls all massage services listed on the **massage/booking website** at `https://zenyourlife.be`.

---

### Where Each Field Appears on the Website

Services appear in **3 places** on the massage website:
1. **Services grid page** — list of all services
2. **Booking modal Step 1** — customer selects a service when booking
3. **Individual service detail page** — full page for one service

---

### → Popup: Add / Edit Service

Click **+ Add Service** or the **Edit** icon on any service card.

At the top: **Language tabs: EN | FR | DE | NL | ES**

> Always fill EN tab first. Auto-translation triggers on Save.

---

#### Core Fields

| Field | Type | Required | Where it appears on website |
|---|---|---|---|
| Service Title | Text input | Yes | Heading on the service card; page title on detail page; shown to customer during booking |
| Description | Textarea | Yes | Text on the service card; hero text on detail page. Translatable. |
| Category | Dropdown | Yes | Used for grouping. Options: Massage, Facial, PMU, Therapy. |
| Duration | Number (minutes) | Yes | Shows as "60 min" with a clock icon on the service card and booking step |
| Price | Number (€) | Yes | Shows as "€65" on the card and booking step |
| Active / Inactive toggle | Toggle | Yes | OFF = service is hidden from website and NOT shown in the booking form |

---

#### Service Image

| Field | Type | Notes | Where it appears |
|---|---|---|---|
| Preset image tiles | 9 tiles (m1.png – m9.png) | Click any to select it | Thumbnail on the service card (services grid page) |
| Upload custom image | Upload button | JPG/PNG from your computer | Same — thumbnail on card |

---

#### Banner Image

| Field | Type | Notes | Where it appears |
|---|---|---|---|
| Banner image URL | Text input | Paste URL | Full-width hero background on the service DETAIL page only |
| Upload banner | Upload button | JPG/PNG from your computer | Same |

> **Difference:** The regular image = small thumbnail on the card. The banner image = large background on the individual service page when you click into it.

---

#### Content Sections (EN only — not translatable from modal)

These are numbered content blocks shown on the service detail page.

| Field | Type | Notes | Where it appears |
|---|---|---|---|
| Section Title | Text input | e.g., "What to expect" | Shown as a numbered section heading on the detail page |
| Section Description | Textarea | Detailed text | Shown as paragraph text under the heading |
| + Add Section button | Click | Adds another content block | |
| Remove (X) | Click X | Removes a section | |

---

#### Gallery Images (max 4)

| Field | Type | Notes | Where it appears |
|---|---|---|---|
| Upload image | Upload button | Up to 4 images | Photo gallery grid on the service detail page |
| Image URL input | Text input | Paste a URL | Same |
| Remove (X) | Click X on thumbnail | Removes from gallery | |

---

#### Benefits (Translatable)

"Benefits You'll Feel" section on the service detail page.

| Field | Type | Notes | Where it appears |
|---|---|---|---|
| Benefit text | Textarea per item | e.g., "Deep muscle relaxation" | Bulleted list in the "Benefits" section on detail page |
| + Add Benefit button | Click (EN only) | Only visible when EN tab is selected | |
| Remove (X) | Click X | Removes a benefit | |

In FR/DE/NL/ES tabs: the benefit text fields show for translation editing.

---

#### Target Audience / Who It's For (Translatable)

"Who It's For" section on the service detail page.

| Field | Type | Notes | Where it appears |
|---|---|---|---|
| Audience text | Textarea per item | e.g., "People with chronic back pain" | List in the "Who It's For" section on detail page |
| + Add item button | Click (EN only) | | |
| Remove (X) | Click X | | |

---

#### Save button
- Saves all fields.
- **Triggers auto-translation** of: Description, Benefits list, Target Audience list → into FR, DE, NL, ES.
- Changes appear on the website **immediately**.

#### Cancel button
- Closes without saving.

---

### → Popup: Delete Service

Click the trash icon on a service card.

- Confirmation popup: "Are you sure you want to delete [Service Name]?"
- **Delete** → permanently removes the service. Existing bookings that used this service still show the service name (stored as text), but this service will no longer appear in the booking form.
- **Cancel** → closes popup.

---

### Visibility Toggle (on each card)

The eye icon on each service card. Click to toggle:
- **Eye open** = Service is visible on the website and available in the booking form.
- **Eye closed** = Service is hidden from the website and cannot be selected by customers. Historical bookings are unaffected.

---

## 10. Testimonials — Every Field & Every Popup

**URL:** `/admin/testimonials`

Controls customer reviews/testimonials shown on **both** the massage website and the rental website.

---

### Tabs at the Top of the Page

- **Massage** tab — shows testimonials for the massage website
- **[Property Name] tabs** — shows testimonials linked to each rental property

---

### Where Testimonials Appear on the Website

| Category | Where on website |
|---|---|
| Massage testimonials | Testimonials section on the massage website homepage |
| Rental testimonials (by property) | Testimonials section on each property detail page |

---

### → Popup: Add / Edit Testimonial

Click **+ Add Testimonial** or the **Edit** icon on any testimonial card.

At the top: **Language tabs: EN | FR | DE | NL | ES**

---

| Field | Type | Required | Where it appears |
|---|---|---|---|
| Name | Text input | Yes | Author name shown under the review. Not translatable. |
| Role | Text input | Yes | Subtitle under the name (e.g., "Regular Client", "@handle", "Guest from France"). Translatable. |
| Property | Dropdown | Yes | "General (Massage)" = massage site. Select a property name = shows on that property's detail page. |
| Testimonial Text | Textarea (3 rows) | Yes | The actual review text. Translatable. |
| Rating | Star selector (1–5) | Yes | Shown as stars (e.g., ★★★★★). Displayed as "X/5" |
| Avatar | 4 preset avatar tiles | Yes | Profile picture next to the review. Click to select. |
| Photo URL | Text input | No | Optional — paste a URL to override the avatar with a real photo |
| Active / Inactive toggle | Toggle | Yes | OFF = testimonial hidden from the website |

**What happens when you Save:**
- Testimonial is saved.
- **Auto-translates**: Role text and Testimonial Text into FR, DE, NL, ES.
- Appears on the website immediately.

**Cancel button** — closes without saving.

---

### → Popup: Delete Testimonial

Click trash icon → confirmation popup → **Delete** or **Cancel**.

---

### Visibility Eye Icon (on each card)

- **Eye open** = Testimonial is visible on website.
- **Eye closed** = Hidden from website. Still exists in admin.

---

## 11. FAQ — Every Field & Every Popup

**URL:** `/admin/faq`

Controls the FAQ accordion sections on both websites.

---

### Tabs at Top

- **Rental** tab — FAQs shown on the rental website FAQ section
- **Massage** tab — FAQs shown on the massage website FAQ section

---

### Where FAQs Appear on the Website

| Category | Where on website |
|---|---|
| Massage FAQs | FAQ accordion section on the massage website homepage |
| Rental FAQs | FAQ accordion section on the rental website homepage |

FAQs are displayed as numbered expandable accordion items (01, 02, 03…). Clicking a question expands the answer.

---

### → Popup: Add / Edit FAQ

Click **+ Add FAQ** or the **Edit** icon on any FAQ.

At the top: **Language tabs: EN | FR | DE | NL | ES**

---

| Field | Type | Required | Where it appears |
|---|---|---|---|
| Question | Text input | Yes | The accordion header — the question customers click on. Translatable. |
| Answer | Textarea (5 rows) | Yes | The text that appears when the question is expanded. Translatable. |
| Active / Inactive toggle | Toggle | Yes | OFF = FAQ hidden from website |

**In FR/DE/NL/ES tabs:** Both Question and Answer fields appear for that language. You can review and manually correct the auto-translation.

**What happens when you Save:**
- FAQ is saved.
- **Auto-translates** both Question and Answer into FR, DE, NL, ES.
- Appears on the website immediately.

**Cancel button** — closes without saving.

---

### → Popup: Delete FAQ

Click trash icon → confirmation popup → **Delete** or **Cancel**.

---

### Visibility Eye Icon

- **Eye open** = FAQ visible on website.
- **Eye closed** = Hidden from website.

---

### Filter & Search

- Filter by Status: All / Active / Inactive
- Search bar: Filters by question text

---

## 12. Users

**URL:** `/admin/users`

**Read-only.** Shows all customers who have ever made a massage booking.

**List view shows:** Name, email, phone, country, gender, total bookings, first booking date, last booking date.

**Click any customer** → opens a detail panel:

| Section | What it shows |
|---|---|
| Profile info | Full name, email, phone, country, gender |
| Stats | Total bookings, Completed bookings, Pending bookings, Cancelled bookings |
| Booking history | List of all bookings with: ID, service name, date, time, status |

**Search bar:** Filter by name or email.

---

## 13. How Language Translations Work

The website shows content in **5 languages**: English (EN), French (FR), German (DE), Dutch (NL), Spanish (ES).

Website visitors pick a language using the language selector in the site navigation. The website then fetches translated content from the database.

### Automatic Translation (DeepL API)

Every time you **Save** a Service, Property, Testimonial, or FAQ in English, the system:
1. Sends the English text to the **DeepL API** (external translation service)
2. Gets back translations in FR, DE, NL, ES
3. Stores all translations in the database
4. From now on, no API call is needed — the website reads stored translations

### What Gets Auto-Translated

| Section | Fields translated |
|---|---|
| Services | Description, Benefits list, Target Audience list |
| Properties | Description, Price Unit, Parking info, Cleanliness description, Location description, Overview descriptions |
| Testimonials | Review text, Role |
| FAQs | Question, Answer |

### What Is Never Translated

- Service Title (always shown in English)
- Property Name (always shown in English)
- Customer/Testimonial Name (always shown in English)
- Prices and numbers
- Image filenames
- Technical fields (category, duration, etc.)

### How to Manually Edit a Translation

1. Open the Edit popup for any Service, Property, Testimonial, or FAQ.
2. Click the language tab (FR, DE, NL, or ES) at the top of the modal.
3. The translatable fields appear with the current translation pre-filled.
4. Edit the translation as needed.
5. Click **Save**.

> A coloured border and a banner in the modal remind you that you are editing a translation and not the English original.

---

## 14. Images — How to Change or Upload

### Service Images (Massage services)

**Preset options:** m1.png through m9.png — 9 preset massage photos.

To change: Edit service → click any preset tile → Save.

**Note:** The preset images are bundled into the application code. If you want a completely different custom image, use the Upload button.

**Upload custom image:**
- In the service edit modal, click **Upload Image**.
- Select a photo from your computer (JPG, PNG, WebP up to 5 MB).
- The image uploads to the server at `/backend/uploads/`.
- It is served publicly at `https://zenyourlife.be/uploads/[filename]`.

### Banner Image (Service detail page only)

This is a **separate image** from the thumbnail. It is the large background on the individual service page.
- Use the Upload button next to "Banner Image" in the service edit modal.
- Or paste a direct image URL.

### Service Gallery Images (Detail page gallery)

- In service edit, scroll to Gallery Images.
- Upload up to 4 images.
- Click X to remove any image.
- These appear as a photo grid on the service detail page.

### Property Images (Rental)

**Preset options:** Apat1.png, Apat2.png, Villa1.png, Villa2.png.

**Custom upload (main image):**
- In property edit, click **Upload Image** next to the image section.
- Saves to server, appears as main card image and detail page hero.

**Gallery images (detail page slider):**
- Upload multiple photos.
- Click X to remove.
- These are shown as a photo slider on the property detail page.

### Testimonial Profile Photos

**Preset avatars:** profile1.png through profile4.png (4 colored avatar circles).

**Custom photo:**
- In testimonial edit, click **Upload Photo**.
- Or paste a photo URL in the "Photo URL" field.
- Custom photo overrides the avatar.

### Where Files Are Stored on the Server

All uploaded images live at:
```
/backend/uploads/
```

Accessible at:
```
https://zenyourlife.be/uploads/[filename]
```

---

## 15. Email & SMS Reminders — Full System Explained

### How the Scheduler Works

Every day at **exactly 9:00 AM Belgian time** (Europe/Brussels timezone), the server automatically runs two checks:

1. **Customer reminder check** — finds all bookings scheduled for tomorrow, sends each customer a reminder.
2. **Admin reminder check** — finds all bookings scheduled for tomorrow, sends a reminder to the admin.

This runs automatically — you do not need to do anything.

### Customer Reminder Email (sent day before, 9 AM)

**Sent to:** Customer's email (the one they entered when booking)
**Triggered by:** 9 AM daily scheduler

**Email contents:**
- Header: "Appointment Reminder — Your massage session is tomorrow!"
- A "Don't Forget!" highlight box with the customer's name
- Appointment date (full format, e.g., Monday, 15 April 2026)
- Appointment time (with "Belgian time" note)
- Service name
- Location: Schapenbaan 45, 1731 Relegem
- Note: "Please arrive 5 minutes before your appointment time."
- "Need to reschedule? Please contact us as soon as possible."

### Customer SMS Reminder (sent day before, 9 AM)

**Sent to:** Customer's phone (only if they chose SMS or Both during booking)
**Via:** Twilio

The customer selects their reminder preference in the booking form:
- **Email only** (default) — only email reminder
- **Both** — email + SMS reminder

### Admin Reminder Email (sent day before, 9 AM)

**Sent to:** The `ADMIN_EMAIL` address set in server environment
**Subject:** `STARTING IN 15 MIN - [Customer Name] - [Service Name]`

> Despite the subject line saying "15 min", the email is actually sent at 9 AM the day before. The subject is just a template message for the admin's attention.

**Email contents:**
- Header: "Appointment Tomorrow!" with Booking ID
- Appointment time (large, prominent display)
- Customer: Name, Phone, Email, Gender
- Service name
- Special requests (if any were entered by customer)

### Admin SMS Reminder (sent day before, 9 AM)

**Sent to:** Admin phone configured in Twilio settings.
**Via:** Twilio

### Booking Confirmation Email (instant — sent the moment a customer books)

**Triggered by:** Customer submitting the booking form on the website
**Sent to:** Customer's email

**Email contents:**
- Header: "Booking Confirmed!"
- Customer name + "Your massage appointment is confirmed"
- Service booked
- Date and time
- Location: Schapenbaan 45, 1731 Relegem
- "Please arrive 5 minutes before your appointment"
- Reminder that a 1-day-before reminder will come
- "If you need to reschedule or cancel, please contact us at least 24 hours in advance."

**Admin notification email (instant):** Simultaneously, an email is sent to the admin when a new booking is made, showing all booking details.

---

## 16. Emails Sent Automatically — Complete List

| When it happens | Sent to | What it says |
|---|---|---|
| Customer submits a booking on the website | Customer | "Booking Confirmed" with service, date, time, location |
| Customer submits a booking on the website | Admin | "New Booking" notification with all customer and booking details |
| 9:00 AM Belgian time, day before each appointment | Customer | "Appointment Reminder — your massage is tomorrow" |
| 9:00 AM Belgian time, day before each appointment | Admin | Appointment reminder with customer name, service, time, phone |
| Admin clicks Send Message → Email | Customer | Custom message you type in the modal |
| Admin clicks Send Message → SMS | Customer phone | Custom message you type, sent via Twilio |

---

## 17. Which Email Address Sends Everything

All emails are sent **from** the Gmail account configured in the server `.env` file.

| Environment Variable | What it controls |
|---|---|
| `EMAIL_USER` | The Gmail address that sends all emails (e.g., `bookings@gmail.com`) |
| `EMAIL_PASSWORD` | The Gmail **App Password** (not the regular Gmail password — a special 16-character code) |
| `ADMIN_EMAIL` | Where admin notification and reminder emails are **received** |
| `TWILIO_ACCOUNT_SID` | Twilio account ID for SMS |
| `TWILIO_AUTH_TOKEN` | Twilio secret key for SMS |
| `TWILIO_PHONE_NUMBER` | The Twilio number SMS messages are sent FROM |

### To change the sending email:
Contact your developer. They will:
1. Update `EMAIL_USER` in the server `.env` file.
2. Generate a new Gmail App Password (Google Account → Security → 2-Step Verification → App Passwords).
3. Update `EMAIL_PASSWORD`.
4. Restart the server.

### To change where admin reminders are received:
Contact your developer to update `ADMIN_EMAIL` in the `.env` file.

---

## 18. Master Map — What Admin Section Controls What on the Website

### Massage Website (https://zenyourlife.be)

| Section on website | Admin section that controls it | Field/action |
|---|---|---|
| Services grid page — all cards | Services | Each service card (title, description, image, price, duration) |
| Service card visibility | Services | Active/Inactive toggle (eye icon) |
| Service detail page — hero banner | Services | Banner Image field |
| Service detail page — content blocks | Services | Content Sections (numbered blocks) |
| Service detail page — photo gallery | Services | Gallery Images (up to 4) |
| Service detail page — benefits list | Services | Benefits repeatable field |
| Service detail page — "Who It's For" list | Services | Target Audience repeatable field |
| Booking form — Step 1 service selection | Services | Only Active services appear here |
| Booking form — Step 2 date/time picker | Booking Management → Schedule | Working days + time slots per day |
| Booking form — blocked/unavailable dates | Booking Management → Blocked Dates | Blocked date entries |
| Testimonials section on homepage | Testimonials (Massage tab) | Active massage testimonials |
| FAQ accordion on homepage | FAQ (Massage tab) | Active massage FAQs |
| New booking notification to admin (email) | Automatic | Triggered by every new customer booking |
| Booking reminder emails | Automatic | Runs daily at 9 AM Belgian time |

---

### Rental Website (https://zenyourlife.be/rental)

| Section on website | Admin section that controls it | Field/action |
|---|---|---|
| Overview section cards (top of rental home) | Properties → Overview Section Settings popup | Badge, titles, descriptions, up to 4 cards with images |
| Apartments listing section heading | Properties → Section Settings popup | Badge, title, description |
| Property cards in apartments section | Properties | Name, Description, Price, Guests, Bedrooms, Parking, Map, Image, Cleanliness, Amenities |
| Property card visibility | Properties | Active/Inactive toggle |
| "View on Map" link on card | Properties | Map URL field |
| Amenity pills on property card | Properties | Amenities checkboxes |
| "Meet the host" link on card | Properties | Host Name field |
| Property detail page — full info | Properties | All detail page fields (Overview, Location, Gallery, Features) |
| Property detail page — photo slider | Properties | Gallery Images |
| Property detail page — testimonials | Testimonials (property tab) | Testimonials linked to that property |
| FAQ accordion on rental home | FAQ (Rental tab) | Active rental FAQs |

---

### Both Websites

| Thing | Controlled by |
|---|---|
| Language translations of all content | Auto-translated on Save (DeepL API) |
| Manual translation corrections | Edit popup → language tabs (FR/DE/NL/ES) |
| Contact form messages from visitors | Inquiries section |
| All customer records | Users section |
| Custom messages to customers | Massage Appointments → Message button |

---

## Quick Tips for the Admin

1. **Always write content in English first.** Auto-translation reads the English version. If you write in French, the French translation will be French-to-French (wrong).

2. **Saving any item triggers translation immediately.** You don't need to do anything extra.

3. **Check translations after saving.** Click the language tabs (FR, DE, NL, ES) in the edit popup to review. Fix anything that looks wrong.

4. **Hiding vs Deleting:** Use the eye icon (hide) instead of delete when you're not sure. Hidden items can be restored. Deleted items are gone permanently.

5. **Blocked dates work instantly.** The moment you block a date, customers on the website cannot book that day.

6. **The Dashboard does not update in real-time.** Refresh the page to see the latest data.

7. **SMS requires Twilio balance.** If SMS messages stop sending, the Twilio account may need to be topped up. Contact your developer.

8. **All times are Belgian time.** The reminder scheduler, the booking calendar, and all timestamps use the Europe/Brussels timezone.

9. **Images are uploaded to the server.** If you upload an image and later the site is redeployed, the developer must ensure image persistence is configured (Docker volumes or similar).

10. **The contact info in emails (address, phone) is hardcoded** as Schapenbaan 45, 1731 Relegem. To change it, contact the developer.

---

*Last updated: March 2026 | ZenYourLife Admin Portal*
