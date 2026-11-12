# Barbershop SaaS — Master Plan

> Working name: **Chairside** (placeholder; check trademark and domain availability before using it).
> Status: planning. Date: 8 November 2026.
> Scope of this document: the product, the competitors, the features, the architecture (frontend and backend), the design approach with Hallmark, the international setup, pricing, the roadmap and the risks.

---

## Frontend progress

Updated 9 November 2026. The frontend is a **Vite + React + TypeScript** app (not Next.js yet) running on sample data with no backend; see `README.md` to run it. It lives in this folder: `src/site` (marketing pages and help centre), `src/app` (business app), `src/shop` (shop site and booking), `src/account` (client account), `src/modes` (barber mode, kiosk, TV board) and `src/admin` (platform admin). Client pages work in English, Arabic (right to left) and French. Changes are kept in the browser, the code is split per area, barber mode works offline, and `npm test` covers the slot finder, money, time zones and the CSV reader. The design system is locked in `DESIGN.md`, and the code is in git. Section 6 has a frontend column, and sections 17.2, 17.6 and 22 are marked ✅ done or ◐ partial.

## Table of contents

1. [The one-paragraph pitch](#1-the-one-paragraph-pitch)
2. [Who it is for](#2-who-it-is-for)
3. [Competitor research](#3-competitor-research)
4. [What competitors get wrong (our openings)](#4-what-competitors-get-wrong-our-openings)
5. [Killer features (our differentiators)](#5-killer-features-our-differentiators)
6. [Full feature map](#6-full-feature-map)
7. [The four surfaces of the product](#7-the-four-surfaces-of-the-product)
8. [Going global: language, currency, time zone, tax, law](#8-going-global-language-currency-time-zone-tax-law)
9. [Payments strategy by country](#9-payments-strategy-by-country)
10. [Fiscal and receipt compliance by country](#10-fiscal-and-receipt-compliance-by-country)
11. [Tech stack](#11-tech-stack)
12. [System architecture](#12-system-architecture)
13. [Multi-tenancy](#13-multi-tenancy)
14. [Data model](#14-data-model)
15. [The booking engine (the heart of the product)](#15-the-booking-engine-the-heart-of-the-product)
16. [Notifications and messaging](#16-notifications-and-messaging)
17. [Frontend plan and design with Hallmark](#17-frontend-plan-and-design-with-hallmark)
18. [Security, privacy and reliability](#18-security-privacy-and-reliability)
19. [Testing strategy](#19-testing-strategy)
20. [Our own SaaS business: plans, pricing, billing](#20-our-own-saas-business-plans-pricing-billing)
21. [Go-to-market](#21-go-to-market)
22. [Roadmap](#22-roadmap)
23. [Running costs estimate](#23-running-costs-estimate)
24. [Risks and how we handle them](#24-risks-and-how-we-handle-them)
25. [Open decisions for you](#25-open-decisions-for-you)
26. [Sources](#26-sources)

---

## 1. The one-paragraph pitch

An all-in-one platform for barbershops and hair salons, for men and women, in any country. The shop owner gets a calendar, staff schedules, a checkout, payments, simple accounting and reports. Their clients get a booking page, a small account to see and change their bookings, offers and loyalty rewards. Every shop also gets its own mini website with photos, services, prices, opening hours and a map. It works in the shop's language, currency and time zone. We charge a flat monthly fee and **never take a commission on a shop's own clients**, which is the main complaint about the biggest competitors.

---

## 2. Who it is for

### Customer segments (the people who pay us)

| Segment | Size | What they need most | Plan |
|---|---|---|---|
| Solo barber or stylist (renting a chair, or own small room) | 1 chair | Booking link for Instagram, reminders, no-shows handled, see earnings | Solo |
| Small shop | 2 to 6 chairs | Shared calendar, walk-ins plus appointments, staff commissions, daily cash count | Shop |
| Busy shop or salon | 6 to 15 chairs | Queue for walk-ins, front desk mode, roles and permissions, inventory, reports | Pro |
| Small chain | 2+ locations | Locations, central reports, staff moving between shops, brand site | Multi |

### Shop types we support from day one

- **Men's barbershop:** short services (15 to 45 min), many walk-ins, beard work, kids' cuts, fast turnover, cash heavy in some markets.
- **Women's salon:** long services (1 to 4 hours), colour with **processing time** (the stylist is free during it), consultations, patch tests before colour, packages (bridal), more deposits.
- **Unisex salon:** both of the above in one calendar.

### End users (the people who use it, but do not pay us)

- **Owner / manager** — runs the business, sees money.
- **Barber / stylist** — sees their own day, clients, earnings.
- **Front desk / receptionist** — books, checks in, takes payment.
- **Client** — books, reschedules, pays deposits, collects rewards.

---

## 3. Competitor research

> Most public material about these products comes from vendors or their competitors. Prices below are as reported by third-party sites in 2026 and should be checked on each vendor's own pricing page before quoting them.

### 3.1 The main players

| Product | Focus | Model (as reported) | Strengths | Weaknesses we can attack |
|---|---|---|---|---|
| **Booksy** | Barbers and beauty, US and Europe, strong consumer app | About $29.99/month base, about $20 per extra staff, 14-day trial, plus card fees and "Boost" marketplace commissions | Consumer marketplace brings new clients, mobile-first | Price increases, customer-service complaints, extra fees, marketplace shows clients other shops |
| **Fresha** | Salons, barbers, spas worldwide | Moved from "free" to a paid subscription (reported $19.95 solo, $14.95 per team member in the US); **20% commission on a new client's first marketplace booking** (min $6); card fees | Huge marketplace, polished app, deposits, memberships, gift cards, client wallet | "New client fee" seen as unfair, fees creeping up, extra SMS charges, reported weak walk-in queue, some reports of no-show protection being bypassed with invalid cards |
| **Squire** | Barbershops only (US focus) | Tiered, roughly $30 to $250/month across plans (sources disagree) | Built for barbers: booking, POS, payments, loyalty, payroll, commission management, branded site | Expensive, features locked behind tiers, rigid fixed staff permissions |
| **Square Appointments** | General appointments | Free tier plus paid plans, tied to Square payments | Good if the shop already uses Square POS | Not barber-specific, calendar complaints, limited outside Square countries |
| **Vagaro** | Salons, spas, fitness | Subscription plus add-ons and marketplace | Feature-rich | Complex, also takes marketplace commission |
| **Zenoti** | Enterprise, multi-location, walk-in queues | Custom pricing | Strong walk-in queue and chain management | Too big and expensive for small shops |
| **Boulevard** | Premium salons, multi-location | Premium pricing | Polished experience | US-focused, expensive |
| **GlossGenius** | Solo beauty pros | Flat subscription | Simple, pretty | Solo-oriented, US-focused |
| **Treatwell + Treatwell Connect / Salonized** | Europe (reported 13 to 15 countries) | Software plus marketplace | Big European reach, unlimited staff, daily payouts, Salonized has a German till-law (KassenSichV) integration | Marketplace dependence |
| **Planity** | France first, also Belgium, Germany (about 50,000 businesses reported) | Reported no commission | Marketplace plus software, deposits, NF525-certified till, stock, accounting export | France-centred |
| **Salonkee** | Luxembourg, France, Belgium, Germany | Marketplace plus software | Regional strength | Small footprint |
| **Waitwhile, Qwaiting, eWAIT, NextMe** | Walk-in queue only | Subscriptions | Virtual queue with QR code, SMS "you're next", wait-time estimates, unified queue of walk-ins and bookings | Not a full shop system |
| **AI receptionist tools** (many small vendors) | Answering WhatsApp, Instagram DMs, calls | $19 to $89+/month add-ons | 24/7 booking via chat | Bolted on; often no deposits, need a separate booking system |

### 3.2 What every serious competitor has (table stakes)

If we ship without these, shops will not switch:

- Online booking page and booking link
- Calendar with day / week view per staff member
- Services with duration and price, staff-specific prices and durations
- Staff working hours, breaks, time off
- Automatic reminders (SMS, email, app push; WhatsApp in our markets)
- Client profiles with history and notes
- Checkout (POS): services, products, tips, discounts, split payment
- Card payments, deposits and no-show / late cancellation fees
- Gift cards, packages, memberships
- Reports: sales, staff performance, client retention
- Staff commissions and payroll summary
- Promo codes and simple marketing messages
- Reviews and ratings
- Mobile app (or a very good mobile web app)
- Waitlist

### 3.3 Things fewer competitors do well (where we can win)

- A real **walk-in queue** merged with appointments (reported weak in Fresha; strong only in enterprise tools like Zenoti or separate apps like Waitwhile)
- **WhatsApp-first** booking and reminders (most are SMS-first, built for the US and UK)
- **Local payment methods** for Egypt and Tunisia (Stripe does not serve shops there; see section 9)
- **Ramadan hours, local holidays, Arabic right-to-left** interface
- **Flexible roles and permissions** (Squire's fixed permissions are a complaint)
- **No commission on any client**, including new ones
- **Easy switching**: import clients and services from Booksy, Fresha and spreadsheets

---

## 4. What competitors get wrong (our openings)

From reviews and comparisons, the recurring complaints are:

1. **Commissions on "new" clients.** Fresha's 20% first-booking fee and Booksy's Boost fees feel like the platform taxing the shop's own marketing. → **We charge zero commission. The client list belongs to the shop.**
2. **Prices creeping up and surprise fees** (SMS, per-staff, add-ons). → **Flat, published prices. A monthly message allowance is included; extra messages are sold at cost plus a small margin, shown up front.**
3. **Marketplace sends clients to competitors.** The shop's booking page on Booksy or Fresha sits inside a marketplace next to other shops. → **The shop's page is the shop's own site, on its own subdomain or domain, with no other shops on it.**
4. **Poor support.** → **Support in the shop's language, in the app and on WhatsApp, with a public response-time promise.**
5. **Rigid permissions.** → **Custom roles with checkboxes per permission.**
6. **Calendars that are hard to read** (for example, no colour by service). → **Colour by service, by staff, or by status, chosen in settings.**
7. **No-show protection that can be bypassed** with invalid cards. → **Card checked with a real authorisation (zero or small amount) before a protected booking is confirmed.**
8. **Built for one country.** US-first products treat languages, currencies, Arabic and cash as afterthoughts. → **Global from the data model up (section 8).**

---

## 5. Killer features (our differentiators)

These are the features to put on the landing page. Each one answers a real complaint or an unmet need.

### 5.1 "Your clients, your money" — 0% commission
No marketplace fees, ever. Exports always available. If a shop leaves, it takes its full client list with it in one click.

### 5.2 One line for walk-ins and appointments
- Walk-in clients join the queue at the shop on a tablet (kiosk mode), by scanning a QR code on the window, or from the shop website ("Join the queue from home").
- The system estimates wait time from the services in the queue and each barber's real speed (learned from history).
- The client gets a WhatsApp or SMS message when they are 2nd in line ("Leave now, you're up in about 15 minutes").
- A **TV screen mode** shows the queue in the shop ("Ahmed — next with Karim").
- Appointments and walk-ins live on the same calendar, so a barber never gets double-booked.

### 5.3 WhatsApp-first
- Booking confirmations, reminders, "running late" alerts, rebooking nudges and review requests go out on WhatsApp where it is the main channel (Egypt, Tunisia, Italy, much of Europe), with SMS and email as fallbacks.
- Clients can reply "cancel" or "change" and get a link to do it.
- Later: an AI assistant that books through WhatsApp chat (section 22, phase 3).

### 5.4 The shop's own website, included
- A one-page site per shop: hero photo, services with prices, team, gallery, opening hours, Google Maps embed and directions link, phone and WhatsApp buttons, Instagram link, reviews, and the booking button.
- Free subdomain (`shopname.chairside.app`) or the shop's own domain on paid plans.
- Designed with Hallmark-built themes so it does not look like a template (section 17).

### 5.5 Personal booking link for every barber
`chairside.app/b/karim` — barbers put it in their Instagram bio. The booking flow is pre-filtered to that barber. Great for barbers who build their own following.

### 5.6 No-show protection that works
- Choose per service or per client: no protection, card on file, deposit (fixed or %), or full prepayment.
- A **client reliability score**: clients with past no-shows automatically need a deposit; trusted regulars do not.
- Clear cancellation policy shown before booking, accepted with a checkbox (needed for EU consumer law).

### 5.7 Smart gap filling
- When someone cancels, the freed slot is offered automatically to people on the waitlist for that day, first come first served, by WhatsApp.
- Optional "last-minute offer" (for example, 15% off a slot that opens in the next 3 hours).

### 5.8 "Book again" built in
- At checkout, the barber taps "Rebook in 3 weeks" and the client gets a confirmed slot before leaving.
- **Recurring bookings**: "Every 2 weeks, Saturday 10:00, with Karim."
- A "time for a fresh cut?" message when a client is past their usual interval.

### 5.9 Haircut memory
- Each client profile stores notes ("#2 on the sides, scissors on top, no beard line-up"), product allergies, and **before/after photos** (only with the client's consent, stored privately).
- The barber sees this on their phone the moment the client checks in.

### 5.10 Family and group booking
One booking for a father and two sons, back-to-back or in parallel with different barbers. Brides plus bridesmaids for salons.

### 5.11 Women's salon features done properly
- **Processing time**: a colour service can be "30 min work, 40 min wait, 20 min work"; the stylist's calendar is free during the wait so another client can be booked.
- **Patch test reminders** before colour services.
- **Consultation step** before booking expensive services.
- **Staff gender preference filter** and an optional **women-only staff mode**, which matters for many clients in Egypt and Tunisia.
- Photo privacy controls (no client photos in the public gallery without written consent).

### 5.12 Chair rental, commission, or both
Supports employees on commission, booth renters paying weekly rent, and mixed shops. Commission rules per service category, product sales, and tips. Rent invoices for booth renters. Each barber sees their own earnings live.

### 5.13 Local rhythm
- Public holidays per country loaded automatically.
- **Seasonal schedules**: Ramadan hours, summer hours, Eid rush days with extended hours.
- Week start day, date format, 12/24-hour clock per locale.

### 5.14 Switch in 10 minutes
- Import clients, services and future appointments from CSV exports of Booksy, Fresha, Square and Google Sheets.
- A setup wizard with **ready service templates** (men's barber, women's salon, unisex) with typical durations, edited in seconds.

### 5.15 Simple money view (not an accounting system)
- Daily cash-up: what came in by cash, card, wallet; what the drawer should hold.
- Expenses (rent, products, bills) with photo of the receipt.
- A monthly profit and loss summary and an **export for the accountant** (CSV first; DATEV format for Germany later).

### 5.16 Works when the internet does not
The staff app is a PWA that keeps working offline for viewing the day and checking in clients, then syncs. Important in markets with unreliable connections.

---

## 6. Full feature map

Legend: **MVP** = first paid version. **V1** = within about 3 months of MVP. **V2** = later.

**Frontend column** (updated 9 November 2026): ✅ done = the screen is built and works with sample data in the browser, with no backend. ◐ partial = some of it is built; the note says what is missing. Nothing in this column means the backend exists.

### 6.1 Booking and calendar

| Feature | Phase | Frontend |
|---|---|---|
| Services: name, description, duration, price, category, photo, buffer before/after | MVP | ◐ partial: Settings › Services edits names, minutes and deposits; no photo or buffers |
| Staff-specific price and duration overrides | MVP | ✅ done: /app/team/:id |
| Staff working hours, breaks, time off, exceptions | MVP | ✅ done: Team › Hours (two shifts a day, seasonal) and Time off |
| Shop opening hours, holidays, closed days | MVP | ✅ done: Settings › Holidays plus setup wizard hours |
| Calendar: day / week / staff columns, drag to move, colour modes | MVP | ✅ done: /app/calendar |
| Online booking: pick service(s) → barber or "anyone" → slot → details → confirm | MVP | ✅ done: /s/example-barbers/book |
| Booking rules: minimum notice, maximum days ahead, slot step, cancellation window | MVP | ✅ done: Settings › Booking rules |
| Multiple services in one booking (cut + beard) | MVP | ✅ done |
| Reschedule / cancel by client via link | MVP | ✅ done: /s/example-barbers/manage/:id |
| Manual booking by staff (phone, walk-in) | MVP | ✅ done: Calendar › New booking, Queue › Add a walk-in |
| Blocked time (personal, training) | MVP | ✅ done: Calendar › New › Blocked time |
| Waitlist for a full day | V1 | ✅ done: clients join from a full day in the booking flow; Queue › Waitlist offers freed times |
| Walk-in queue (kiosk, QR, remote join, TV screen) | V1 | ✅ done: /app/queue, /kiosk, /tv, /s/example-barbers/queue |
| Recurring bookings | V1 | ✅ done: repeat every 2, 3 or 4 weeks in Calendar › New |
| Processing time / gaps inside a service | V1 | ✅ done: drawn on the calendar block and bookable |
| Group and family bookings | V1 | ◐ partial: one extra person in the online booking flow |
| Resources (chairs, wash stations, rooms) as constraints | V1 | not yet |
| Smart gap filling and last-minute offers | V2 | not yet |
| Reserve with Google / Instagram "Book" button integrations (need partner approval) | V2 | not yet |
| Two-way sync with Google Calendar / Apple Calendar for staff | V1 | not yet (clients get an .ics file after booking) |

### 6.2 Clients (CRM)

| Feature | Phase | Frontend |
|---|---|---|
| Client profiles: name, phone, email, birthday, language, notes, tags | MVP | ✅ done |
| Visit history, spend, no-show count | MVP | ✅ done: /app/clients/:id |
| Duplicate detection and merge (by phone number) | MVP | ✅ done: notice and merge on /app/clients |
| Haircut notes and before/after photos with consent | V1 | ◐ partial: notes done and shown in barber mode; photos wait for uploads |
| Reliability score and automatic deposit rules | V1 | ◐ partial: rule toggle in Settings, deposit note on the profile |
| Allergies and patch test records | V1 | not yet (free-text notes only) |
| Import from CSV / competitors | MVP | ✅ done: /app/clients/import reads the file in the browser |
| Client segments (lapsed, VIP, new) | V1 | ✅ done: filters on /app/clients |
| Blocklist | MVP | ✅ done: profile toggle; the booking flow refuses the number |

### 6.3 Checkout, payments and money

| Feature | Phase | Frontend |
|---|---|---|
| Checkout: services, products, discounts, tips, notes | MVP | ✅ done: /app/checkout |
| Payment methods: cash, card (external terminal, recorded manually), other | MVP | ✅ done: cash, card, wallet |
| Split payment (part cash, part card) and split between barbers | MVP | ◐ partial: split across methods done; not between barbers |
| Online payments: deposits, prepayment, card on file | V1 | ◐ partial: deposit shown at booking and taken off at checkout; no payment form |
| No-show and late cancellation fees | V1 | not yet |
| Refunds | V1 | ✅ done: Money › Sales, with a reason and a confirmation |
| In-person card payments through an integrated terminal (Stripe Terminal in EU) | V2 | not yet |
| Digital tips (fixed % buttons) | V1 | ✅ done |
| Gift cards (digital, with code and balance) | V1 | ✅ done: sold in Marketing or at checkout, paid with at checkout |
| Packages ("5 cuts for the price of 4") | V1 | ◐ partial: created in Marketing and sold at checkout; visits left are not tracked yet |
| Memberships / subscriptions ("unlimited cuts €49/month") | V2 | ◐ partial: Marketing › Memberships lists and creates plans; no monthly charging |
| Daily cash-up and drawer count | MVP | ✅ done: Money › Cash-up |
| Expenses with receipt photo | V1 | ✅ done: Money › Expenses |
| P&L summary, accountant export | V1 | ✅ done: Money › Profit and loss (export button not wired) |
| Fiscal receipts integrations (Germany, Italy, France, Egypt) | V2 (see section 10) | not yet |
| Invoices for business clients with VAT details | V1 | not yet |

### 6.4 Staff

| Feature | Phase | Frontend |
|---|---|---|
| Staff profiles, photo, bio, services they do | MVP | ✅ done without photos: /app/team/:id |
| Roles: owner, manager, front desk, barber; **custom roles** | MVP (fixed), V1 (custom) | ✅ done: Team › Roles permission grid |
| Barber's own app view: my day, my clients, my earnings | MVP | ✅ done: /me |
| Commission rules (per service category, products, tips) | V1 | ◐ partial: per-person % and tips; no per-category rules |
| Booth rent tracking and invoices | V1 | ◐ partial: rent shown in Team › Pay; no invoices |
| Payroll summary per period | V1 | ✅ done: Team › Pay |
| Time off requests and approval | V1 | ✅ done: Team › Time off |
| Clock in / clock out | V2 | ◐ partial: barber mode clock in and out; no timesheet yet |
| Staff performance (rebook rate, average ticket, utilisation) | V1 | ◐ partial: Money › Reports shows clients, takings, average ticket and chair use; no rebook rate |

### 6.5 Marketing and loyalty

| Feature | Phase | Frontend |
|---|---|---|
| Offers shown on the shop page and client dashboard | MVP | ✅ done: Marketing › Offers, shop site, client account |
| Promo codes | MVP | ✅ done |
| Loyalty: digital punch card (e.g. 10th cut free) or points | V1 | ✅ done: Marketing › Loyalty, client account |
| Referral rewards ("give 20%, get 20%") | V2 | not yet |
| Review requests after a visit; push 5-star reviews to Google | V1 | ◐ partial: toggle and empty state |
| Campaigns by WhatsApp / SMS / email to segments, with consent tracking | V2 | ✅ done: Marketing › Campaigns with consent counts and an opt-out check (sending not connected) |
| Birthday messages | V1 | ✅ done: Marketing › Messages toggle |
| Win-back messages for lapsed clients | V1 | ✅ done: Marketing › Messages, 'Time for a fresh cut' |

### 6.6 Inventory

| Feature | Phase | Frontend |
|---|---|---|
| Retail products with stock, cost and price | V1 | ✅ done: Money › Products |
| Professional stock (used in services) | V2 | not yet |
| Low-stock alerts, suppliers, purchase orders | V2 | ◐ partial: low-stock notice only |

### 6.7 Reports

| Feature | Phase | Frontend |
|---|---|---|
| Today dashboard: bookings, revenue, who is in, queue | MVP | ✅ done: /app |
| Sales by day / service / staff / payment method | MVP | ◐ partial: by day and payment method |
| Client retention, new vs returning, rebook rate | V1 | ◐ partial: returning share in Money › Reports |
| Utilisation (how full each chair is) | V1 | ✅ done: Money › Reports |
| No-show rate and money lost / recovered | V1 | ◐ partial: rate only |
| Multi-location comparison | V2 | not yet |

### 6.8 Shop website

| Feature | Phase | Frontend |
|---|---|---|
| One-page site from shop data (services, team, hours, gallery, map, contact) | MVP | ◐ partial: done without a gallery; the map is a Google Maps link |
| 3 to 5 design presets + accent colour + logo + photos | MVP | ◐ partial: 3 presets, 4 accents, logo upload; no photos |
| Subdomain | MVP | ◐ partial: shown in the editor; not live |
| Custom domain with automatic SSL | V1 | ◐ partial: Website shows the DNS record to add; nothing checks it yet |
| SEO: schema.org local business markup (see note), sitemap, multi-language pages | MVP | ◐ partial: HairSalon JSON-LD, robots.txt and a sitemap for the marketing pages; shop pages switch language but share one URL |
| Embeddable booking widget for an existing website | V1 | ✅ done: Website › embed code, `?embed=1` |
| Gallery of work (Instagram-style), with consent | MVP | not yet (no photos, by request) |

> Note: schema.org has `HairSalon` and `BeautySalon` under `HealthAndBeautyBusiness`; check the current vocabulary when building.

### 6.9 Platform (our admin)

| Feature | Phase | Frontend |
|---|---|---|
| Super-admin: tenants, plans, usage, impersonate for support (logged) | MVP | ✅ done: /admin |
| Feature flags per tenant / plan | MVP | ✅ done: /admin › Features |
| Message credits and usage metering | MVP | ◐ partial: credit meter in Marketing › Messages |
| In-app support chat | V1 | not yet |
| Status page | V1 | not yet |

---

## 7. The four surfaces of the product

### 7.1 Marketing site (ours) — `chairside.app`
Sells the product to shop owners. Pages: home, features, pricing (per region), for barbers, for salons, switch from Booksy/Fresha, help centre, blog, legal. Multilingual.

### 7.2 Business app (owner, manager, staff, front desk) — `app.chairside.app`
The internal tool. Desktop and tablet first for the front desk; phone first for barbers.

Main areas:
- **Today**: who is in the chair, who is next, the queue, today's revenue
- **Calendar**
- **Queue** (walk-ins)
- **Clients**
- **Checkout / Sales**
- **Money**: cash-up, expenses, reports, payouts
- **Team**: staff, schedules, commissions, payroll
- **Marketing**: offers, promo codes, loyalty, reviews, campaigns
- **Website**: edit the shop's site
- **Settings**: business details, locations, services, booking rules, payments, notifications, language, currency, time zone, taxes, roles, billing (their subscription to us)

Special modes:
- **Kiosk mode** (tablet at the door for walk-in check-in, locked down)
- **TV mode** (queue display)
- **Barber mode** (phone, only "my day")

### 7.3 Client side — shop site + booking + client account
- **Shop website** (`shopname.chairside.app` or own domain)
- **Booking flow** (also embeddable)
- **Client account** (passwordless login with a one-time code by WhatsApp, SMS or email):
  - upcoming and past bookings, reschedule, cancel
  - offers from this shop
  - loyalty progress, gift card balance, packages left
  - saved card, receipts
  - preferences: language, notifications, favourite barber
  - **one client account works across all shops on the platform**, but each shop only sees its own relationship with the client (privacy by design)

### 7.4 Platform admin (us) — `admin.chairside.app`
Tenants, plans, billing, support tools, feature flags, metrics, abuse handling.

---

## 8. Going global: language, currency, time zone, tax, law

The rule: **nothing about a country is hard-coded.** Every country-specific behaviour comes from settings or a country profile.

### 8.1 Languages (i18n)

- **Launch with English**, but build every string through the translation system from the first line of code. No hard-coded text, ever.
- Next languages in likely order: **Arabic, French, Italian, German**, then Spanish and Turkish.
- Three separate language choices:
  1. The **staff interface** language (per user)
  2. The shop's **public site and booking** languages (a shop can offer several; the client picks)
  3. **Message** language (per client, defaults to the language they booked in)
- Use ICU message format for plurals and gender ("1 slot" / "2 slots"; Arabic has six plural forms).
- **Right-to-left (Arabic) from day one in the CSS**: use logical properties (`margin-inline-start`, not `margin-left`), `dir="rtl"` on the root, mirrored icons where direction matters. Retro-fitting RTL later is painful.
- Service names and descriptions are **translatable fields** in the database (the shop types "Skin fade" in English and "Dégradé" in French).
- Translation workflow: source strings in English in the repo → a translation platform (Crowdin, Tolgee or Lokalise) → machine-translate first draft → native speaker review for each launch language.

### 8.2 Currency and money

- Each shop has **one base currency** (EUR, EGP, TND, …). Multi-location chains in different countries have one currency per location.
- Store money as **integers in the smallest unit** plus the currency code (`price_minor = 2500`, `currency = 'EUR'`). Never floats.
- **Watch out: TND has 3 decimal places** (millimes), not 2. Use the ISO 4217 minor-unit table, not "×100".
- Format with `Intl.NumberFormat(locale, { style: 'currency', currency })`. The locale decides "€25,00" vs "€25.00" vs "25,00 €".
- Rounding rules per currency (some countries round cash to 0.05).

### 8.3 Time zones and time

- Each location has an **IANA time zone** (`Europe/Rome`, `Africa/Cairo`, `Africa/Tunis`).
- Store all instants in **UTC** (`timestamptz`). Store opening hours and staff schedules as **local wall-clock times** ("09:00 to 19:00 in Europe/Berlin") and convert when computing slots.
- **Daylight saving time** is the classic bug: a 09:00 schedule must stay 09:00 after the clock change. Egypt has had DST on and off in recent years, so rely on the time-zone database, never on fixed offsets.
- The client always sees times in the **shop's** time zone (with a note if their device is in a different one, for tourists).
- Locale-aware: 12h / 24h, week starts Monday or Sunday or Saturday, date formats.

### 8.4 Tax (VAT and others)

- Prices can be **tax-inclusive** (normal in Europe, Egypt, Tunisia for consumers) or **tax-exclusive** (common in the US). Setting per shop.
- Tax rates per service / product category (some countries tax services and products differently).
- A country profile ships default rates; the shop can override. **We do not give tax advice**; we show defaults with a "check with your accountant" note.
- Receipts and invoices carry the legally required details per country (business name, address, tax ID, sequential number, tax breakdown).

### 8.5 Phone numbers and addresses

- Store phone numbers in **E.164** format (`+201001234567`), validated with `libphonenumber`.
- Phone number is the main client identifier (more reliable than email in our markets).
- Address formats differ per country; use a flexible address model and Google Places autocomplete.

### 8.6 Privacy law

| Region | Law | What it means for us |
|---|---|---|
| EU (Italy, France, Germany, …) | GDPR | We are a **processor** for the shop's client data; sign a DPA with every shop; host EU data in the EU; data export and deletion on request; record consent for marketing messages; cookie consent on the shop sites if we use non-essential cookies |
| Egypt | Personal Data Protection Law No. 151 of 2020 | Licensing and consent rules; get local legal advice before launch |
| Tunisia | Organic Law 2004-63 on personal data | Declaration to the national authority (INPDP) may be needed; get local advice |
| Everywhere | WhatsApp Business policy | Only send template messages the client agreed to receive; marketing needs opt-in |

**Data residency plan**: one database region per legal area. Start with **EU (Frankfurt)** for all customers; it satisfies GDPR and is close enough for Egypt and Tunisia. Add regions only when a law requires it.

### 8.7 Country profile (a config object, not code)

```ts
// packages/core/src/countries/it.ts
export const IT: CountryProfile = {
  code: "IT",
  defaultCurrency: "EUR",
  defaultLocale: "it-IT",
  defaultTimeZone: "Europe/Rome",
  weekStartsOn: 1,
  pricesIncludeTax: true,
  taxRates: [{ id: "standard", rate: 0.22, label: "IVA 22%" }],
  publicHolidaysSource: "nager-date:IT",
  paymentProviders: ["stripe", "cash"],
  fiscal: { required: true, provider: "fiskaly-it", status: "planned" },
  messagingChannels: ["whatsapp", "sms", "email"],
  legalTexts: { dpa: "eu-gdpr", terms: "eu" },
};
```

Adding a new country = adding one profile file + translations + checking payments and fiscal rules.

---

## 9. Payments strategy by country

Two completely different money flows. Do not mix them up.

1. **Shops pay us** (our SaaS subscription) — see section 20.
2. **Clients pay shops** (deposits, prepayments, checkout) — this section.

### 9.1 Principle: we never hold the shop's money

Clients pay **directly into the shop's own payment account**. We only connect to it. This keeps us out of payment-licensing rules (being a "payment facilitator" needs licences in most countries) and avoids chargeback risk on our side.

### 9.2 Providers by market

| Market | Online payments provider | How the shop connects | In-person card | Notes |
|---|---|---|---|---|
| Italy, France, Germany, most of EU | **Stripe Connect** (Standard accounts) | "Connect with Stripe" button; Stripe handles shop verification | Stripe Terminal (V2) or keep their existing terminal | Cards, Apple Pay, Google Pay, SEPA, iDEAL, Bancontact; supports **card holds and off-session charges** for no-show fees (PSD2/SCA rules apply) |
| Egypt | **Paymob** (verify current marketplace/API terms) | Shop gets its own Paymob merchant account; enters API keys in our settings (BYO keys) | Their existing POS terminal | Cards, Meeza, mobile wallets; Paymob's docs list Egypt, UAE, KSA, Oman |
| Tunisia | **Konnect** or **Flouci** (verify APIs and merchant onboarding) | BYO keys | Existing terminal | Research did not confirm API details; needs a direct check |
| Everywhere | **Cash** and **"pay at the shop"** | Default, no setup | — | Must be first-class, not an afterthought |
| Later | Adyen, Mollie (EU), Mercado Pago (LATAM), etc. | Same adapter | — | Added per market demand |

> Stripe card acceptance is **not available to merchants in Egypt or Tunisia**. Some payout features list those countries, but that is a different product. Confirm on Stripe's official country list.

### 9.3 Payment adapter design

All providers sit behind one interface so the rest of the code never knows which one is used:

```ts
interface PaymentProvider {
  id: "stripe" | "paymob" | "konnect" | "flouci" | "cash";
  capabilities: {
    deposits: boolean;
    cardOnFile: boolean;     // save card for no-show fees
    offSessionCharge: boolean;
    refunds: boolean;
    partialRefunds: boolean;
    terminal: boolean;
  };
  createCheckout(input: CheckoutInput): Promise<CheckoutSession>;
  saveCard?(input: SaveCardInput): Promise<SavedCard>;
  chargeSavedCard?(input: ChargeInput): Promise<Charge>;
  refund?(input: RefundInput): Promise<Refund>;
  verifyWebhook(req: Request): Promise<PaymentEvent>;
}
```

The UI reads `capabilities` and hides features the shop's provider cannot do (for example, "card on file" in a market where the provider does not support it).

---

## 10. Fiscal and receipt compliance by country

Several of our target countries require **certified cash register systems** or **real-time electronic receipts**. Getting this wrong exposes shops to fines, and is a reason shops reject software.

| Country | Rule (simplified) | Our approach |
|---|---|---|
| **Germany** | KassenSichV: electronic cash registers must use a certified technical security module (TSE); receipts need specific data (signature counter, check value, etc.) | V2: integrate a **cloud TSE** (fiskaly SIGN DE or fiskaltrust). Salonized already does this, so it is expected |
| **France** | Software recording cash payments from consumers must be certified (NF525 or equivalent) | V2: either get certification (cost and audit) or integrate a certified partner. Planity already advertises NF525 |
| **Italy** | Daily electronic transmission of receipts (corrispettivi) through a "registratore telematico" (RT) or approved software; from 2026 the payment terminal must be linked to the RT | V2: integrate a provider (for example fiskaly's Italian product or a local RT vendor) |
| **Egypt** | ETA e-receipt system for B2C sales by taxpayers named in rollout decisions; each receipt is submitted and validated in real time | V2: integrate the ETA e-receipt API once Egyptian shops in scope ask for it |
| **Tunisia** | Not researched yet | Check with a local accountant before launch |

**MVP stance (stated clearly in the product and the terms):** Chairside records sales for management. In countries with fiscal-till laws, the shop keeps issuing legal receipts from its certified till until our integration for that country is live. Once integrated, the receipt is issued and signed from our checkout.

> This area needs a local accountant or tax lawyer per country before we sell checkout there. The table is a starting point, not legal advice.

---

## 11. Tech stack

Chosen for a small team (you + Claude Code), fast shipping, global scale, and low cost at the start.

| Layer | Choice | Why |
|---|---|---|
| Language | **TypeScript** everywhere | One language for frontend, backend, scripts |
| Monorepo | **pnpm + Turborepo** | Shared packages (database, booking engine, UI, translations) |
| Web framework | **Next.js (App Router)** | Marketing site, business app, shop sites and booking in one deploy; server rendering for SEO on shop sites |
| API | **tRPC** for the web app, plus a small **REST API** (route handlers with OpenAPI from Zod) for webhooks, the embeddable widget and a future native app | Type-safe end to end, public API when needed |
| Validation | **Zod** | Shared schemas between client and server |
| Database | **PostgreSQL on Neon** (EU region) | Serverless Postgres, branching for previews, point-in-time restore; you already have the Neon connector set up |
| ORM | **Drizzle ORM** | SQL-like, fast, good migrations, works well with Postgres features we need (ranges, exclusion constraints, RLS) |
| Auth | **Better Auth** (organizations plugin, phone/email OTP, magic links) | Multi-tenant orgs and roles built in, self-hosted, no per-user fees |
| Background jobs | **Inngest** (or Trigger.dev) | Reminders, queued messages, retries, scheduled jobs, webhooks fan-out |
| Email | **Resend** | Simple API, React email templates |
| SMS + WhatsApp | **WhatsApp Cloud API** (Meta, direct) + **Twilio** for SMS fallback | WhatsApp direct is cheaper than through a reseller; SMS fallback where WhatsApp is not used |
| Payments | **Stripe Connect**, **Paymob**, **Konnect/Flouci** behind an adapter | See section 9 |
| Our subscriptions | **Paddle** (merchant of record) or Stripe Billing + Stripe Tax | See section 20 |
| File storage | **Cloudflare R2** (S3-compatible, no egress fees) + image resizing | Shop photos, gallery, receipt photos, client photos (private bucket) |
| Maps | **Google Maps Embed** + Places Autocomplete | Map on shop site, address entry |
| i18n | **next-intl** (ICU messages) + **Tolgee** or **Crowdin** | Translations, RTL |
| Dates | **Temporal API** (polyfill) or **date-fns-tz** | Safe time-zone maths |
| UI | **Tailwind CSS v4** with design tokens + **Radix UI** primitives (accessible) | Tokens come from the Hallmark-locked design system (section 17) |
| Calendar UI | Custom on top of a virtualised grid (or a licensed scheduler component if speed matters) | The calendar is the most used screen; we want full control |
| Forms | React Hook Form + Zod | |
| Client state | TanStack Query (comes with tRPC) | Caching, optimistic updates on the calendar |
| Realtime | **Pusher / Ably** or Postgres `LISTEN/NOTIFY` via a small worker | Live calendar and queue updates across devices |
| Offline | PWA with service worker + IndexedDB cache for "today" | Barber and front desk keep working offline |
| Hosting | **Vercel** (EU region functions) | Easy custom domains for shop sites via the Vercel Domains API |
| Bot protection | **Cloudflare Turnstile** on public booking forms | Stops fake bookings |
| Monitoring | **Sentry** (errors), **Axiom** or **Better Stack** (logs), **PostHog** (product analytics, EU host) | |
| Testing | **Vitest**, **fast-check** (property tests), **Playwright** (end-to-end) | Section 19 |
| CI/CD | GitHub Actions + Vercel previews + Neon branch per pull request | |
| Native app (later) | **Expo / React Native** sharing packages from the monorepo | Barber app and client app in app stores (phase 3) |

### Why not microservices?

One deployable app with clear internal modules is right until we have a real team. The booking engine, payments and messaging are separate **packages** with clean interfaces, so they can become services later if needed.

---

## 12. System architecture

```
                         ┌────────────────────────────────────────┐
  Clients (web, PWA) ──► │  Vercel Edge / Middleware              │
  Staff (web, PWA)       │  - resolves tenant from host           │
  Shop sites (domains)   │    (shop.chairside.app / custom domain)│
                         │  - locale detection, auth cookies      │
                         └───────────────┬────────────────────────┘
                                         │
                         ┌───────────────▼────────────────────────┐
                         │  Next.js app (monorepo apps/web)        │
                         │  ├─ (marketing)  chairside.app          │
                         │  ├─ (app)        app.chairside.app      │
                         │  ├─ (site)       shop sites + booking   │
                         │  ├─ (admin)      admin.chairside.app    │
                         │  └─ api/         tRPC + REST + webhooks │
                         └──┬──────────┬───────────┬──────────────┘
                            │          │           │
              ┌─────────────▼──┐  ┌────▼──────┐  ┌─▼─────────────────┐
              │ Postgres (Neon) │  │ Inngest   │  │ Realtime (Ably)   │
              │ RLS per tenant  │  │ jobs      │  │ calendar + queue  │
              └─────────────────┘  └────┬──────┘  └───────────────────┘
                                        │
         ┌──────────────┬───────────────┼───────────────┬──────────────┐
         ▼              ▼               ▼               ▼              ▼
   WhatsApp Cloud    Twilio SMS      Resend email   Payments        Fiscal (V2)
   API                                              Stripe/Paymob/   fiskaly /
                                                    Konnect          fiskaltrust / ETA
```

### Monorepo layout

```
chairside/
├─ apps/
│  ├─ web/                    # Next.js: marketing, business app, shop sites, admin, API
│  └─ mobile/                 # (phase 3) Expo app
├─ packages/
│  ├─ db/                     # Drizzle schema, migrations, RLS policies, seed
│  ├─ core/                   # domain logic, NO framework code
│  │  ├─ booking/             # availability engine, booking rules
│  │  ├─ queue/               # walk-in queue + wait estimates
│  │  ├─ money/               # Money type, currency rules, tax calc
│  │  ├─ commission/          # commission and rent rules
│  │  └─ countries/           # country profiles
│  ├─ payments/               # provider adapter + implementations
│  ├─ messaging/              # WhatsApp/SMS/email adapter, templates
│  ├─ fiscal/                 # (V2) fiscal adapters per country
│  ├─ i18n/                   # message catalogs, locale utils
│  ├─ ui/                     # design tokens + components (from Hallmark system)
│  ├─ api/                    # tRPC routers
│  └─ config/                 # eslint, tsconfig, tailwind preset
├─ DESIGN.md                  # locked design system (Hallmark), see section 17
├─ .hallmark/                 # Hallmark logs, preflight cache, screenshots
└─ turbo.json
```

The `core` package has **no database and no framework imports**. It is pure functions with heavy tests. That is where bugs cost the most (double bookings, wrong money, wrong time zones).

---

## 13. Multi-tenancy

### 13.1 Model: shared database, tenant column, row-level security

- One Postgres database. Every tenant-owned table has `tenant_id`.
- **Postgres Row-Level Security (RLS)** policies on every tenant table: a request sets `app.tenant_id` at the start of its transaction, and Postgres refuses to return or change rows from other tenants, even if the application code has a bug.
- Cheapest to run, easiest to migrate, and the RLS safety net makes cross-tenant leaks very unlikely.

### 13.2 Hierarchy

```
Tenant (the business, the one paying us)
 └─ Location (a physical shop; has its own address, currency, time zone, hours)
     └─ Staff assignments, resources, services offered here
```

A solo barber is a tenant with one location. A chain is one tenant with many locations.

### 13.3 Routing

| Host | Serves |
|---|---|---|
| `chairside.app` | Marketing site |
| `app.chairside.app` | Business app (tenant chosen after login; users can belong to several tenants) |
| `{slug}.chairside.app` | Shop website + booking |
| `book.example-barber.com` (custom) | Same, via custom domain mapped to the tenant |
| `chairside.app/b/{staff-slug}` | Personal barber booking link |
| `admin.chairside.app` | Our admin |

Middleware looks up the host in a cached `domains` table → tenant + location → rewrites to the `(site)` route group.

### 13.4 Tenant isolation checklist

- RLS on every table with `tenant_id` (enforced by a migration test that fails if a table is missing a policy)
- File storage paths prefixed by tenant ID; signed URLs only
- Background jobs carry `tenant_id` and set it before touching the database
- Search indexes, caches and realtime channels namespaced by tenant
- Support impersonation is logged and visible to the tenant

---

## 14. Data model

Key tables (simplified; every tenant table also has `tenant_id`, `created_at`, `updated_at`).

```
tenants            id, name, slug, country, plan_id, status, billing_customer_id
locations          id, tenant_id, name, slug, address (json), lat, lng, time_zone,
                   currency, locale_default, locales_enabled[], phone, whatsapp,
                   google_maps_url, tax_profile_id
domains            id, tenant_id, location_id, host, verified_at

users              id, email, phone, name, locale, avatar         (global, not per tenant)
memberships        id, tenant_id, user_id, role_id, status        (user ↔ tenant)
roles              id, tenant_id, name, permissions jsonb         (custom roles)
staff              id, tenant_id, user_id?, display_name, slug, bio, photo,
                   employment_type (employee|booth_renter|owner), gender?,
                   color, bookable
staff_locations    staff_id, location_id

schedules          id, staff_id, location_id, weekday, start_local, end_local,
                   valid_from, valid_to, label (e.g. "Ramadan")
schedule_breaks    id, schedule_id, start_local, end_local
time_off           id, staff_id, starts_at, ends_at, reason, status
location_hours     id, location_id, weekday, open_local, close_local, valid_from, valid_to
closures           id, location_id, date, reason   (holidays, imported per country)

service_categories id, tenant_id, name (i18n jsonb), sort
services           id, tenant_id, category_id, name (i18n), description (i18n),
                   duration_min, price_minor, currency, tax_rate_id,
                   buffer_before_min, buffer_after_min,
                   segments jsonb  -- [{type:"work",min:30},{type:"wait",min:40},{type:"work",min:20}]
                   deposit_rule jsonb, online_bookable, gender_target?, photo
staff_services     staff_id, service_id, price_minor?, duration_min?   (overrides)
resources          id, location_id, type (chair|basin|room), name
service_resources  service_id, resource_type, quantity

clients            id, tenant_id, global_client_id?, name, phone_e164, email,
                   locale, birthday, notes, tags[], marketing_consent jsonb,
                   reliability_score, blocked
client_media       id, client_id, url, kind (before|after), consent_at
global_clients     id, phone_e164, email, auth_user_id   (one login across shops)

bookings           id, tenant_id, location_id, client_id, status
                   (pending|confirmed|checked_in|in_service|completed|cancelled|no_show),
                   source (online|staff|walk_in|whatsapp|import),
                   starts_at, ends_at, notes, recurrence_id?, group_id?
booking_items      id, booking_id, service_id, staff_id, resource_id?,
                   starts_at, ends_at, price_minor, duration_min
staff_busy         id, staff_id, period tstzrange, booking_item_id?  -- see section 15
                   EXCLUDE USING gist (staff_id WITH =, period WITH &&)
recurrences        id, rule (RRULE), client_id, template jsonb
waitlist_entries   id, location_id, client_id, service_ids[], staff_id?, date, window
queue_entries      id, location_id, client_id?, name, service_ids[], staff_pref?,
                   status (waiting|called|serving|done|left), joined_at, eta_at, channel

sales              id, tenant_id, location_id, client_id?, booking_id?, number,
                   status, subtotal_minor, tax_minor, discount_minor, tip_minor,
                   total_minor, currency, fiscal_status, fiscal_ref
sale_lines         id, sale_id, kind (service|product|gift_card|package|membership|fee),
                   ref_id, staff_id?, qty, unit_price_minor, tax_rate, total_minor
payments           id, sale_id?, booking_id?, provider, method (cash|card|wallet|...),
                   amount_minor, currency, status, provider_ref, kind (deposit|payment|fee|refund)
cash_sessions      id, location_id, opened_by, opened_at, opening_float, closed_at,
                   counted_minor, expected_minor
expenses           id, location_id, category, amount_minor, receipt_url, date

gift_cards         id, tenant_id, code, initial_minor, balance_minor, expires_at
packages / client_packages, memberships / client_memberships
loyalty_programs, loyalty_ledger (client_id, points, reason, ref)
promo_codes        id, code, rule jsonb, valid_from, valid_to, max_uses
offers             id, location_id, title (i18n), body (i18n), image, valid_from, valid_to

commission_rules   id, tenant_id, staff_id?, category_id?, kind (percent|fixed|tiered), params
rent_agreements    id, staff_id, amount_minor, period (weekly|monthly), next_due

products, stock_movements, suppliers           (V1/V2)
reviews            id, booking_id, client_id, rating, text, published, google_pushed_at

messages           id, tenant_id, client_id, channel, template, locale, status,
                   provider_ref, cost_minor, sent_at
message_credits    tenant_id, balance, ledger
audit_log          id, tenant_id, actor_user_id, action, entity, entity_id, diff jsonb, at
```

**i18n fields** are stored as JSONB: `{"en": "Skin fade", "fr": "Dégradé", "ar": "تدريج"}`, with a fallback to the shop's default language.

---

## 15. The booking engine (the heart of the product)

If this is wrong, nothing else matters. It lives in `packages/core/booking` as pure functions with very heavy tests.

### 15.1 Inputs

- Requested services (in order) and optional staff preference ("anyone" or a specific barber)
- Location, date range
- Booking rules: minimum notice, maximum days ahead, slot step (e.g. every 15 min), buffers
- For each candidate staff member: working schedule (local times + time zone), breaks, time off, closures, existing busy periods
- Resource constraints (chairs, basins)
- Service segments (work / wait) for processing time

### 15.2 Algorithm (per staff member, per day)

1. Take the staff schedule for that local date → convert to UTC intervals using the location's time zone (correct on DST days).
2. Subtract breaks, time off, closures and existing busy periods → **free intervals**.
3. For a multi-service booking, build the **demand pattern**: the sequence of segments with their durations, where `wait` segments do not occupy the staff member (but may occupy a resource like a chair).
4. Slide the pattern across the free intervals in steps of the slot size; keep start times where every `work` segment fits in staff free time and every resource-needing segment fits in resource free time.
5. Apply minimum notice and maximum advance.
6. For "anyone": merge results across staff; choose staff per slot by a strategy (least busy that day, or round-robin, or the client's favourite).
7. Return slots grouped by day, in the location's local time.

### 15.3 Preventing double booking (the database is the final judge)

- When a booking is created, insert one row per `work` segment into `staff_busy` with a `tstzrange`.
- A Postgres **exclusion constraint** `EXCLUDE USING gist (staff_id WITH =, period WITH &&)` makes it **impossible** for two overlapping periods to exist for the same staff member, even if two clients click the same slot in the same millisecond. The second insert fails and that client sees "That time was just taken, here are the nearest times."
- The same pattern applies to resources (`resource_busy`).
- Online bookings that need a deposit get a **short hold** (e.g. 10 minutes) on the slot while the client pays; an Inngest job releases it if payment does not complete.

### 15.4 Walk-in queue engine

- Each barber has a **live timeline**: current client's expected finish (from service duration × that barber's learned speed factor), then booked appointments, then free gaps.
- Walk-ins are placed into gaps that fit their services, respecting appointments (appointments always win their time).
- ETA = when the next fitting gap opens for any eligible barber (or the preferred one).
- Recomputed on every event (check-in, start, finish, cancellation) and pushed to screens and clients in real time.
- "Speed factor" per barber per service = rolling median of actual / planned duration (from check-in → done timestamps).

### 15.5 Performance

- Availability is computed on request, scoped to one location and a date window (normally 7 to 14 days). This is cheap with the right indexes.
- Cache per location + date for a few seconds; invalidate on any booking or schedule change for that location.

---

## 16. Notifications and messaging

### 16.1 Events that send messages

| Event | To | Default channel |
|---|---|---|
| Booking confirmed | Client | WhatsApp → SMS → email |
| Reminder (24h and 2h before; configurable) | Client | WhatsApp → SMS → email |
| Booking changed / cancelled | Client, staff | WhatsApp / push |
| Running late (staff taps "10 min late") | Next clients | WhatsApp |
| Queue: you're next / it's your turn | Walk-in client | WhatsApp / SMS |
| Slot freed (waitlist) | Waitlisted clients | WhatsApp |
| Review request (after visit) | Client | WhatsApp / email |
| Rebook nudge (past usual interval) | Client (with consent) | WhatsApp |
| Birthday | Client (with consent) | WhatsApp / email |
| New online booking | Staff | Push / in-app |
| Daily summary | Owner | Email / push |

### 16.2 Design

- One `messaging` package with a `send(template, to, locale, vars)` interface and **channel fallback rules per location**.
- Templates per language; WhatsApp templates must be pre-approved by Meta, so keep a fixed approved set with variables.
- **Each shop can connect its own WhatsApp Business number** (Meta embedded signup) so messages come from the shop's name; otherwise a shared platform number with the shop name in the message.
- All sends go through Inngest jobs (retries, rate limits, quiet hours, deduplication).
- Every message costs money → **message credits**: plans include a monthly allowance; top-ups charged at cost plus margin; usage shown live.
- Marketing messages only to clients with recorded consent; every message includes an opt-out.

---

## 17. Frontend plan and design with Hallmark

You asked for the Hallmark design approach, not generic AI-looking UI. Hallmark is now installed globally in Claude Code (`~/.claude/skills/hallmark`), with browser checks working.

### 17.1 How Hallmark fits this project

Hallmark is built for **new pages and app screens**. It has three behaviours that matter here:

1. **Pre-flight reads the project first.** If a `DESIGN.md` exists at the repo root, Hallmark treats it as a **locked design system** and every new page follows it. This is how we keep one consistent look across dozens of screens.
2. **App screens are a separate scope.** A screen someone works in (a dashboard, a calendar, settings) is built as an app screen, not a landing page.
3. **It refuses fake content.** It never invents metrics, testimonials or logos. This matters for the marketing site (no fake "10,000 barbers trust us") and for shop sites (only real reviews and real photos).

### 17.2 Order of design work

| Step | What | How | Status |
|---|---|---|---|
| 1 | **Lock the product design system** | Run `/hallmark` for the business app's first key screen (the **Today** dashboard), in the Next.js repo so pre-flight reads Tailwind and fonts. Answer the 4 questions (material, audience, use, tone). Pick the theme it deals that fits a working tool. Then ask Hallmark to write **`DESIGN.md`** (its `design-md` step) so the system is locked. | ✅ done: `DESIGN.md` locks the Wayfind system (from the landing page run, not a Today run) |
| 2 | **Turn the system into code** | Put Hallmark's tokens (colours, type, spacing, radii, motion) into `packages/ui/tokens.css` and the Tailwind preset. Build base components (button, input, select, dialog, sheet, tabs, toast, data table, empty state) with Radix primitives, styled only through tokens. | ✅ done: `src/styles/tokens.css`, `src/ui/kit.tsx` and `src/app/styles/app.css`; plain React and CSS instead of Tailwind and Radix |
| 3 | **Business app screens** | For each main screen (Calendar, Queue, Clients, Checkout, Money, Team, Settings), run `/hallmark <screen description>` with real sample data. Hallmark follows `DESIGN.md`. | ✅ done: every screen in 17.6, checked with `sloplint --scope app` |
| 4 | **Booking flow and client account** | `/hallmark` for the booking flow (mobile first; it is the most-used public screen) and the client account. Same locked system, or a lighter variant of it. | ✅ done |
| 5 | **Shop website presets** | Build **3 to 5 shop site presets** with separate Hallmark runs (each a different dealt theme: for example an editorial one, a bold barber one, a soft salon one). Each preset is a set of tokens + section layouts. Shops pick a preset, then their accent colour, logo and photos override tokens at runtime. | ✅ done: 3 presets (Board, Paper, Signal) and 4 accents; shop photos still to come |
| 6 | **Our marketing site** | Built **last**, once the product exists, so Hallmark can capture **real product screenshots** (it runs the app with `capture.mjs`) instead of placeholders. Genre: modern-minimal (SaaS). | ◐ partial: home, pricing, switch-from and help pages are done; prices are in euros only and product pictures are still built samples |

### 17.3 Prompts to use (starting points)

> Business app, step 1:
> `/hallmark Today dashboard for a barbershop management app. Front desk on a tablet and owner on a laptop. Shows who is in each chair now, who is next, the walk-in queue with wait times, today's bookings and today's revenue by payment method. Tone: utilitarian. Real sample data: 4 barbers (Karim, Youssef, Marco, Lena), 23 bookings today, 3 walk-ins waiting.`

> Booking flow:
> `/hallmark Mobile booking flow for a barbershop: choose services, choose a barber or "anyone", pick a day and time, enter name and phone, confirm. Must work in English and Arabic (right to left). The one action: book.`

> Shop site preset:
> `/hallmark One-page website for a neighbourhood barbershop: hero photo, services with prices, team, gallery, opening hours, map and directions, WhatsApp and call buttons, book button. The job: book. Tone: <editorial | brutalist | luxury | playful>.`

> Marketing site (last):
> `/hallmark Landing page for Chairside, booking and management software for barbershops and salons in any country. Audience: shop owners frustrated with marketplace commissions. The one action: start free trial. Material: real product screenshots from the running app at localhost:3000.`

### 17.4 Rules that carry over into all our frontend code

From Hallmark's non-negotiable floor, adopted as project rules (put them in `CLAUDE.md` so every coding session follows them):

- Every colour and font goes through a token on `:root`. No literal colours in components.
- Never `transition: all`; never animate `width`, `height`, `top`, `left`.
- Every interactive element has a visible `:focus-visible` style.
- Every animation respects `prefers-reduced-motion`.
- No invented numbers, testimonials or logos anywhere.
- No uppercase tracked "eyebrow" labels, no emoji as icons, no purple-to-blue gradients, no card inside a card.
- `overflow-x: clip` on `html` and `body`.
- Containers are capped and centred on wide screens.

Plus our own:

- **Logical CSS properties only** (`ms-4` / `me-4`, `start-0`, `inline-start`) so Arabic RTL works for free.
- **Tap targets at least 44px** (barbers use phones with wet or gloved hands).
- **High contrast and big text option** in barber mode (shops are bright, screens are far away).
- Every screen designed for **empty, loading, error and offline** states.
- Never show money without its currency; never show a time without the location's time zone context.

### 17.5 Quality checks

- Run Hallmark's linter on built pages before merging UI changes:
  `node ~/.claude/skills/hallmark/scripts/sloplint.mjs <page.html or URL> --render`
- Add it to CI later against the preview deployment URLs of key pages (shop site preset, booking flow, marketing home).
- Playwright visual snapshots of key screens in LTR and RTL, at 375px, 768px and 1440px.
- Accessibility: axe-core in Playwright tests; target WCAG 2.2 AA.

### 17.6 Key screens list (for design and build)

Frontend status as of 9 November 2026 (✅ done, ◐ partial). All run on sample data; see the frontend column in section 6.

**Business app**
1. Sign up / onboarding wizard (shop type → services template → hours → staff → booking page live) — ✅ `/inscription` (name, Tunisian mobile, salon, city, one-time code) then `/setup`; staff sign in at `/connexion` (mobile or email and a code, or a sample account per role), sign out at `/deconnexion`, and manage their profile, language, notifications and devices at `/app/compte`. Staff screens need a session; each role sees only its screens
2. Today — ✅ `/app`
3. Calendar (day by staff columns; week for one staff; drag and drop; colour modes) — ✅ `/app/calendar`
4. Booking drawer (create / edit / check in / checkout) — ✅ side panel in the calendar
5. Queue (walk-ins) + kiosk mode + TV mode — ✅ `/app/queue`, `/kiosk`, `/tv`
6. Checkout / POS — ✅ `/app/checkout`
7. Clients list + client profile (history, notes, photos, spend, loyalty) — ◐ `/app/clients`; photos wait for uploads
8. Money: sales, cash-up, expenses, reports — ✅ `/app/money`
9. Team: staff list, staff profile, schedules editor, commissions, payroll — ✅ `/app/team`, `/app/team/:id`
10. Marketing: offers, promo codes, loyalty, reviews, campaigns — ✅ `/app/marketing`, plus gift cards, packages and memberships
11. Website editor (preset, colours, photos, sections, domain) — ◐ `/app/website`; no photo upload
12. Settings (business, locations, services, booking rules, payments, messages, language/currency/time zone, taxes, roles, subscription) — ◐ `/app/settings`; no locations or message templates (messages live in Marketing, roles in Team)
13. Barber mode (phone): my day, next client card with haircut notes, my earnings — ✅ `/me`

**Public / client**
14. Shop website (per preset) — ◐ `/s/example-barbers`, 3 presets; no gallery or photos
15. Booking flow (5 steps, one per screen on mobile) — ✅ 4 steps
16. Booking confirmation + add to calendar — ✅ with a real .ics calendar file
17. Manage booking (from link) — ✅
18. Join the queue (QR / remote) — ✅ `/s/example-barbers/queue`
19. Client login (one-time code) — ✅ `/account/login`, matched to the client by phone or email, with sign out (no code is sent yet)
20. Client account: bookings, offers, loyalty, gift cards, receipts, settings — ✅ `/account`, in English, Arabic and French

**Marketing**
21. Home, features, pricing (by region), switch-from pages, help centre — ◐ `/`, `/pricing`, `/switch`, `/help`; the home page carries the features, and prices are in euros only

---

## 18. Security, privacy and reliability

### Security
- RLS tenant isolation (section 13) + application-level checks (defence in depth)
- Role-based permissions checked on the server for every action, never only in the UI
- Rate limiting on login, OTP and public booking endpoints; Turnstile on public forms
- OTP codes: short expiry, limited attempts, hashed at rest
- Webhooks verified by signature (Stripe, Paymob, WhatsApp)
- Secrets in Vercel environment variables / a secrets manager; never in the repo
- Private file bucket for client photos and receipts; short-lived signed URLs
- Audit log for sensitive actions (refunds, price changes, deleting clients, exporting data, impersonation)
- Dependency scanning (GitHub Dependabot) and a security review before launch
- Two-factor authentication for owners (required for owners on paid plans)

### Privacy
- DPA template for shops (EU); privacy policy and terms per region
- Client data export and deletion tools for shops (to answer client requests)
- Consent records for marketing messages and client photos
- Data minimisation: we only ask clients for name and phone by default

### Reliability
- Neon point-in-time restore + daily logical backups to separate storage
- Idempotent webhooks and jobs (safe to retry)
- Status page; uptime monitoring on booking pages
- Graceful degradation: if messaging is down, bookings still work and messages queue

---

## 19. Testing strategy

| Area | Test type | What we prove |
|---|---|---|
| Booking engine | Unit + **property-based tests** (fast-check) | No overlaps ever; slots respect schedules, breaks, time off, buffers; DST days produce correct local times in `Europe/Berlin`, `Africa/Cairo`, `America/New_York` |
| Double booking | Integration test with parallel inserts against real Postgres | Exclusion constraint rejects every conflicting insert |
| Money | Unit tests per currency | TND 3 decimals, rounding, tax inclusive/exclusive, splits sum exactly to the total |
| Commission | Unit tests | Every rule type, tips handling, refunds reversing commission |
| RLS | Integration test that loops over all tables | Every tenant table has policies; tenant A can never read tenant B |
| Payments | Provider sandbox tests + webhook replay | Deposits, holds, refunds, failure paths |
| i18n | Snapshot of every locale; missing-key check in CI | No untranslated strings; RTL layout does not break |
| UI | Playwright end-to-end: onboarding, book online, check in, checkout, cancel | Critical paths work on mobile and desktop |
| Design | Hallmark `sloplint --render`, axe accessibility | No design regressions, AA contrast |

---

## 20. Our own SaaS business: plans, pricing, billing

### 20.1 Pricing principles

- **Flat monthly price per location**, no commission on bookings, ever
- **Price by number of bookable staff bands**, not per head (owners hate per-seat surprises)
- **Regional pricing** (purchasing-power adjusted): Europe price, Egypt price, Tunisia price, in local currency
- **Free trial** (14 days, no card needed) and a small **free forever** solo tier with limits (good for word of mouth among barbers)
- Messages: monthly allowance included; extra usage sold as credits at a visible price
- Card fees are the payment provider's, charged to the shop directly (not through us)

### 20.2 Starting price hypothesis (to test, not final)

| Plan | Who | Europe (per location / month) | Egypt / Tunisia | Includes |
|---|---|---|---|---|
| **Free** | 1 barber | €0 | 0 | Booking page, calendar, 50 messages/month, Chairside branding |
| **Solo** | 1 bookable staff | €15 | local equivalent, lower | Everything for one barber, own site, 300 messages |
| **Shop** | up to 6 staff | €39 | lower | Queue, deposits, loyalty, gift cards, commissions, reports, 1,500 messages |
| **Pro** | up to 15 staff | €79 | lower | Custom roles, inventory, campaigns, custom domain, priority support, 4,000 messages |
| **Multi** | chains | from €69 per location | lower | Central reports, cross-location staff, API access |

For comparison, Booksy reportedly lands around $110/month for a five-barber shop, and Fresha's per-member pricing plus 20% new-client commission adds up quickly for busy shops. Our story: **lower and predictable.**

### 20.3 Collecting our subscription money

Important practical issue: **you are based in Egypt, and Stripe does not onboard Egyptian businesses directly.** Options:

| Option | How | Pros | Cons |
|---|---|---|---|
| **A. Paddle as merchant of record** | Paddle sells the subscription on our behalf and handles VAT/sales tax worldwide | Global VAT handled for us; one integration | Higher fee (around 5% + fixed, check current); confirm Paddle accepts sellers in our situation |
| **B. Company in a Stripe country** (e.g. US LLC via Stripe Atlas, Estonia e-Residency, or an EU company) + Stripe Billing + Stripe Tax | Full control, lower fees | Company setup, accounting and VAT registrations are our job |
| **C. Local billing for Egypt/Tunisia** | Paymob (Egypt) / Konnect (Tunisia) recurring payments or manual invoices + bank transfer / InstaPay | Shops pay in local currency with local methods | Separate system to manage |

**Recommendation:** Start with **A (Paddle)** for card-paying customers worldwide plus **C (local)** for Egypt and Tunisia. Revisit B when revenue justifies a foreign company. Get an accountant's advice on where the company should sit.

### 20.4 Plan limits and feature flags

- Plans defined in config (`plans.ts`) as feature flags + limits (staff, locations, messages)
- Server checks limits on every relevant action; UI shows "upgrade to unlock" with the exact plan
- Grace period on failed payments (7 days), then read-only mode (never delete data; never break the public booking page without warning)

---

## 21. Go-to-market

### 21.1 Beachhead market

**Recommendation: start in Egypt (and Tunisia second), in English + Arabic, then expand to Italy, France and Germany.**

Why:
- You are there: you can visit shops, sign them up in person, get feedback weekly.
- WhatsApp-first, cash-heavy, local payments, Ramadan schedules: big competitors are weak exactly here.
- No fiscal-till integration needed on day one for most small shops (check ETA scope), while Germany, France and Italy need fiscal work before we can offer checkout properly.
- Lower acquisition cost, faster learning. Then take a proven product to Europe.

If you prefer Europe first, start with **Italy**: barbershop culture is strong, WhatsApp is widely used, and Booksy/Fresha/Treatwell are present but not dominant everywhere. Plan the RT (fiscal) integration early.

### 21.2 Getting the first 50 shops

1. **10 design-partner shops**, free for 6 months, in exchange for weekly feedback and a real testimonial (with their permission; we never invent one).
2. **Barber-to-barber referrals**: one free month per referred shop, for both.
3. **Instagram and TikTok**: short videos of the product solving real moments (no-show, walk-in rush, cash-up in 30 seconds). Barbers live on Instagram.
4. **Product suppliers and barber academies**: partnerships; they talk to hundreds of shops.
5. **"Switch from Booksy/Fresha" pages** with an import tool and a cost calculator.
6. **Free tier** spreads through clients seeing "Powered by Chairside" on booking pages.

### 21.3 Metrics to watch

- Activation: % of signups that publish a booking page and get the first online booking within 7 days
- Weekly active shops; bookings per shop per week
- No-show rate change after 30 days (our core value story)
- Trial → paid conversion; monthly churn (target under 3%)
- Messages cost per shop vs. plan revenue (margin)

---

## 22. Roadmap

Assuming one developer working with Claude Code full time. Adjust if part time.

### Phase 0 — Foundations (2 weeks)
- Monorepo, CI, Vercel, Neon (EU) with branch-per-PR, Sentry, PostHog
- Auth with organizations, roles, phone/email OTP
- Tenant + location model, RLS policies + RLS test
- i18n setup (English, plus Arabic stub to prove RTL works), money and time utilities — frontend ◐: Intl money and time utilities and a right-to-left preview toggle; no translation catalogue yet
- Country profiles (EG, TN, IT, FR, DE) — frontend ✅ as presets in `src/lib/settings.tsx`
- **Hallmark step 1–2**: lock `DESIGN.md`, tokens, base components — ✅ done
- `CLAUDE.md` with project rules (section 17.4)

### Phase 1 — MVP (8 to 10 weeks) → first design-partner shops
- Services, staff, schedules, time off, opening hours, holidays — frontend ✅ (Settings › Holidays)
- **Booking engine** with exclusion constraint, full tests
- Calendar (staff columns, drag and drop) — frontend ✅
- Online booking flow + manage-booking links — frontend ✅
- Shop website (2 to 3 presets), subdomain, Google Maps, gallery — frontend ◐ (3 presets, Maps link; no gallery)
- Client accounts (OTP login), client profiles, notes, import from CSV — frontend ✅ (`/app/clients/import`; no code is sent at login yet)
- Reminders: WhatsApp + email (+ SMS fallback)
- Checkout recording (cash/card/other), tips, discounts, daily cash-up — frontend ✅
- Offers and promo codes on site and client account — frontend ✅
- Today dashboard, basic sales reports — frontend ✅
- Settings: language, currency, time zone, tax-inclusive prices — frontend ✅
- Our billing (Paddle + manual local invoicing), free trial, plans
- Onboarding wizard with service templates (barber / salon / unisex) — frontend ✅
- Platform admin (tenants, impersonation with logging)

### Phase 2 — V1 (about 3 months after MVP) → paid launch in first market
- Walk-in queue: kiosk, QR join, remote join, TV mode, live ETA — frontend ✅ (the wait is an estimate from sample data)
- Online payments: Stripe Connect (EU), Paymob (EG), Konnect/Flouci (TN); deposits, card on file, no-show fees, refunds
- Reliability score and automatic deposit rules
- Waitlist, recurring bookings, group bookings, processing time, resources
- Loyalty, gift cards, packages, review requests (+ Google review push) — frontend ◐ (loyalty and gift cards done; packages do not track visits left; reviews are a toggle only)
- Commissions, booth rent, payroll summary, custom roles — frontend ✅
- Expenses, P&L, accountant export — frontend ✅
- Retail products and stock
- Custom domains, embeddable booking widget — frontend ◐ (widget done; domain is the DNS step only)
- Barber mode PWA with offline "today" — frontend ✅ (service worker and manifest)
- Arabic and French translations live — frontend ◐ (every client-facing page; the business app is English)
- Google Calendar sync for staff

### Phase 3 — V2 (6 to 12 months) → Europe expansion
- **Fiscal integrations**: Germany (cloud TSE), Italy (RT / approved software), France (NF525 path), Egypt (ETA e-receipt) — each gated by a local legal check
- Italian and German translations
- Memberships / subscriptions for clients — frontend ◐ (plans, no charging)
- Campaigns and segments, referrals, win-back automation — frontend ◐ (campaigns and win-back; no referrals)
- Smart gap filling, last-minute offers
- **AI WhatsApp receptionist**: books, reschedules and answers FAQs through chat, using the same booking engine; hands off complaints and complex requests to staff
- Multi-location features, central reports
- Native apps (Expo): barber app and client app
- Stripe Terminal for in-person card payments in the EU
- Public API and webhooks; Zapier/Make integration
- Reserve with Google integration (requires partner approval)

### Phase 4 — Later ideas
- Optional **directory** of shops (with **no commission**), only if shops ask for discovery
- Supplier marketplace (shops reorder products in-app; we earn from suppliers, not shops)
- Training / academy features for barber schools
- Benchmarking ("your rebook rate vs. similar shops in your city", anonymised)

---

## 23. Running costs estimate

Rough monthly costs at small scale (prices change; check each vendor):

| Item | Early stage (0–50 shops) | Notes |
|---|---|---|
| Vercel Pro | about $20 per team member | Plus usage |
| Neon | free → about $19–69 | Grows with storage/compute |
| Inngest | free tier → paid | By job runs |
| Resend | free tier → about $20 | |
| Cloudflare R2 | a few dollars | |
| Sentry, PostHog | free tiers at first | |
| Ably / Pusher | free tier at first | |
| Domain + email | about $10–20 | |
| **WhatsApp / SMS** | **variable, the biggest cost** | Meta charges per conversation/message by country; SMS is much more expensive in Europe. Must be covered by plan allowances and credits |
| Paddle fees | % of subscription revenue | |
| Legal (DPA, terms, privacy per region) | one-off | Budget for a lawyer per launch country |
| Fiscal integration providers | per device/transaction (later) | fiskaly / fiskaltrust pricing |

---

## 24. Risks and how we handle them

| Risk | Impact | Mitigation |
|---|---|---|
| Double bookings or time-zone bugs | Lose trust instantly | Database exclusion constraint, property tests, DST test suite |
| Fiscal law non-compliance in DE/FR/IT | Fines for shops, legal risk for us | Clear MVP stance, legal review per country, integrate certified providers before selling checkout there |
| Messaging costs eat margin | Unprofitable shops | Allowances per plan, credits, WhatsApp before SMS, cost monitoring per tenant |
| Payment provider limits in EG/TN | Can't offer deposits there | BYO-keys model with local providers; cash first; deposits as optional |
| Big competitors copy "no commission" | Weaker message | Win on local fit (WhatsApp, Arabic, cash, queue, Ramadan), support, and speed |
| Building too much before selling | Burn time | Design partners from week 1; ship MVP to 10 shops before Phase 2 |
| Cross-tenant data leak | Catastrophic | RLS + automated tests + audit + security review |
| WhatsApp policy changes | Messages blocked | Templates approved, opt-ins stored, SMS/email fallback |
| Solo founder bandwidth | Slow progress | Monorepo + strong typing + Claude Code; keep scope tight; buy, don't build, for non-core (auth, email, jobs) |

---

## 25. Open decisions for you

1. **Product name** (Chairside is a placeholder): check domains, trademarks and how it sounds in Arabic, French, Italian, German.
2. **First market**: Egypt-first (recommended) or Italy-first?
3. **Company location** for collecting subscription money (affects Stripe vs. Paddle; talk to an accountant).
4. **Free tier**: yes (growth) or trial only (simpler)?
5. **Women's salon features in MVP**, or barbershops first and salons in V1? (Recommended: barbershops first, but data model ready for salons from day one, since processing time and resources affect the booking engine.)
6. **Native app timing**: PWA only until Phase 3 (recommended), or app stores earlier for credibility?
7. **Design partners**: do you already know 5 to 10 shops who would try it?

---

## 26. Sources

Competitor research (much of it vendor or competitor-written; verify prices directly):

- Zenoti — [Best booking app for barbers 2026](https://zenoti.com/blog/best-barber-booking-apps), [Best barbershop software 2026](https://zenoti.com/thecheckin/best-barbershop-software-2026), [Barbershop scheduling and walk-ins](https://www.zenoti.com/barbershop-software/scheduling)
- Squire — [Squire vs Booksy comparison](https://getsquire.com/compare/squire-vs-booksy), [Booth rental vs commission](https://getsquire.com/business-edge/booth-rental-vs-commission-barbershop)
- Capterra — [Booksy Biz vs Squire](https://www.capterra.com/compare/142741-153899/Booksy-vs-Squire-Barber-Appointment-App), [Squire pricing](https://www.capterra.com/p/153899/Squire-Barber-Appointment-App/pricing/), [Squire reviews](https://www.capterra.com/p/153899/Squire-Barber-Appointment-App/reviews/), [Fresha reviews](https://www.capterra.com/p/142138/Shedul-com/reviews/), [Booksy reviews](https://www.capterra.com/p/142741/Booksy/reviews/?page=2), [Booksy vs Square Appointments](https://www.capterra.com/compare/142741-170263/Booksy-vs-Square-Appointments), [Treatwell vs Planity](https://www.capterra.co.uk/compare/181827/1027177/treatwell/vs/planity)
- Software Advice — [Squire profile](https://www.softwareadvice.com/barbershop/squire-profile/), [Booksy vs Fresha](https://www.softwareadvice.com/barbershop/booksy-profile/vs/shedul/)
- Fresha — [Features](https://www.fresha.com/for-business/features), [Pricing](https://fresha.com/pricing), [Deposits launch (Salon Today)](https://www.salontoday.com/1080582/fresha-launches-new-deposits-feature)
- Fresha pricing analysis — [Pabau](https://pabau.com/blog/fresha-pricing/), [CostBench hidden costs](https://www.costbench.com/software/salon-spa/fresha/hidden-costs/), [SchedulingKit](https://schedulingkit.com/pricing-guides/fresha-pricing)
- Booksy pricing analysis — [Pabau](https://pabau.com/blog/booksy-pricing/), [SchedulingKit](https://schedulingkit.com/pricing-guides/booksy-pricing), [GlossGenius](https://glossgenius.com/blog/booksy-price)
- Booksy complaints — [The Digital Merchant](https://thedigitalmerchant.com/?p=67365)
- Europe — [Alteg.io: best booking software in Europe 2026](https://alteg.io/en/blog/13-best-online-booking-software-for-beauty-businesses-in-europe-in-2026/), [European Purpose: Planity](https://europeanpurpose.com/tool/planity), [Salonized](https://europeanpurpose.com/tool/salonized)
- Walk-in queues — [Waitwhile](https://waitwhile.com/llms.txt), [Qwaiting barbershop queue](https://qwaiting.com/industries/barbershop-queue-system), [NextMe](https://nextmeapp.com/blog/retail/how-salons-and-barbershops-can-use-queue-management-to-serve-more-clients/)
- AI receptionist and WhatsApp booking — [Callmissed implementation guide](https://www.callmissed.com/blog/ai-receptionist-salons-2026-phone-whatsapp-implementation), [Aurora Inbox WhatsApp appointments guide](https://www.aurorainbox.com/en/sistema-citas-whatsapp-barberias-salones/), [Stork: AI receptionists for salons](https://www.stork.ai/blog/ai-receptionist-for-salons-2026)
- Commission and booth rent — [Yocale](https://www.yocale.com/blog/barbershop-commission-agreement), [Slick: automating chair renter commissions](https://getslick.com/blog/automating-chair-renter-commissions), [Vagaro](https://www.vagaro.com/en-au/learn/commission-vs-booth-rental-for-barbers-which-model-actually-pays-more-in-2026)

Payments:
- [Stripe feature availability by country](https://support.stripe.com/questions/stripe-feature-availability-by-country), [Stripe global payouts recipient countries](https://docs.stripe.com/global-payouts/recipient-countries), [Polar supported countries (Stripe Connect Express)](https://polar.sh/docs/merchant-of-record/supported-countries)
- [Paymob developer docs](https://developers.paymob.com/paymob-docs), [Odoo: Paymob provider](https://www.odoo.com/documentation/master/applications/finance/payment_providers/paymob.html)

Fiscal compliance:
- [fiskaly: regulatory requirements by country](https://workspace.fiskaly.com/reference/regulatory-requirements/), [fiskaly: fiscalisation in Europe](https://www.fiskaly.com/fiscalisation), [fiskaltrust](https://fiskaltrust.eu/en-de), [Reservio: fiscalization in the EU](https://www.reservio.com/blog/tips/fiscalization-in-europe), [Salonized: KassenSichV](https://help.salonized.com/en/articles/4231062-implementation-of-the-german-cash-register-security-regulation-kassensichv)
- Italy — [Assolombarda: POS-RT guide Feb 2026](https://www.assolombarda.it/servizi/fisco/documenti/guida-operativa-pos-rt-agenzia-entrate-febbraio-2026), [Centro Fiscale: corrispettivi 2026](https://centrofiscale.com/corrispettivi-elettronici-telematici-guida-2026/), [Studio Pizzano: software roadmap to 2027](https://www.studiopizzano.it/corrispettivi-telematici-via-software-la-road-map-verso-il-2027-e-confermata/)
- Egypt — [Avalara: e-invoicing in Egypt](https://www.avalara.com/vatlive/en/country-guides/africa-and-middle-east/egypt-vat/egyptian-e-invoicing.html), [VATit: Egypt e-invoicing mandate](https://vatit.com/e-invoicing-guide/egypt/), [Egypt e-receipt requirements](https://invoicedataextraction.com/blog/egypt-e-receipt-requirements)

Design:
- [Hallmark on GitHub](https://github.com/nutlope/hallmark)

### Not yet researched (do before launch)
- Local competitors in Egypt and Tunisia
- Konnect and Flouci API capabilities (Tunisia)
- Tunisia fiscal receipt rules
- WhatsApp Business messaging prices per country (current Meta pricing)
- Paddle's seller eligibility for an Egypt-based founder
- Exact schema.org types for barbershops
