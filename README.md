# Chairside (working name)

Booking, walk-in queue and shop management for barbershops and hair salons in any country. This repository is the **frontend**: it runs entirely in the browser on sample data, with no backend yet. The product plan is in [PLAN.md](PLAN.md); the locked design system is in [DESIGN.md](DESIGN.md).

## Run it

Node 18 or later.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # slot finder, money, time zones, CSV reader
npm run build      # type-check, then a production build in dist/
npm run preview    # serve the production build
```

The scripts call `node` directly, so they work even though the folder path contains `&` (which breaks npm's Windows shims).

## What is where

| URL | What it is | Code |
| --- | --- | --- |
| `/` | Marketing home page | `src/site/Landing.tsx` |
| `/pricing`, `/switch`, `/help` | Pricing, switching from another app, help centre | `src/site/` |
| `/setup` | New shop setup wizard | `src/app/screens/Setup.tsx` |
| `/app` | Business app: today, calendar, queue, clients, checkout, money, team, marketing, website, settings | `src/app/` |
| `/me` | Barber mode on a phone (works offline once loaded) | `src/modes/BarberMode.tsx` |
| `/kiosk`, `/tv` | Walk-in tablet at the door, queue board on the shop's TV | `src/modes/` |
| `/s/example-barbers` | The shop's own website, booking flow, queue and manage-booking pages | `src/shop/` |
| `/account` | The client's account (one-time-code sign-in) | `src/account/` |
| `/admin` | Platform admin for the Chairside team | `src/admin/Admin.tsx` |

Client-facing pages (`/s/...`, `/account`) switch between **English, Arabic and French** from the shop footer; Arabic lays out right to left. The business app is in English at launch.

## How the preview behaves

- **Sample data** lives in `src/lib/data.ts` (Example Barbers, Cairo, EGP). Changes you make are kept in this browser (`localStorage`); **Reset sample data** at the foot of the app sidebar puts everything back.
- **Nothing is sent anywhere.** Messages, payments, fiscal receipts and sign-in codes are not connected; every screen that would send something says so.
- **Data states:** add `?state=loading`, `?state=empty` or `?state=error` to any app screen (links at the foot of the sidebar) to see those states.
- **Settings › Language and region** changes currency, time zone and formats everywhere, with country presets for Egypt, Tunisia, Italy, France and Germany.

## Code map

- `src/lib/store.tsx`: the in-browser store (bookings, clients, queue, sales, stock, gift cards). The backend replaces it.
- `src/lib/availability.ts`: the frontend stand-in for the booking engine (PLAN.md section 15): free slots, minimum notice, processing time.
- `src/lib/format.ts`: money from minor units with each currency's decimals (TND has 3), times in the shop's time zone.
- `src/lib/i18n.tsx`: client-facing translations and the shop's own translated text.
- `src/ui/kit.tsx`: shared controls, tabs, fields and the four data states.
- Styles: `src/styles/tokens.css` (design tokens), `page.css` and `pages.css` (marketing), `src/app/styles/app.css` (app, shop and modes).

## Design checks

The UI was built with the Hallmark design skill. To re-check a page with the dev server running:

```bash
node ~/.claude/skills/hallmark/scripts/sloplint.mjs src/app/styles --scope app --render --url http://localhost:5173/app
```

Every stylesheet starts with its Hallmark stamp, and any rule set aside is recorded there with its reason.
