# Chairside — rules for coding sessions

Frontend only: Vite + React + TypeScript on sample data, no backend. Product plan: `PLAN.md`. Locked design system: `DESIGN.md`. How to run and the code map: `README.md`.

## Commands

- `npm run dev` (http://localhost:5173), `npm test`, `npm run typecheck`, `npm run build`.
- The scripts call `node` directly because the folder path contains `&`, which breaks npm's Windows shims. Keep it that way.

## Design floor (PLAN.md 17.4, from Hallmark)

- Every colour and font goes through a token on `:root` (`src/styles/tokens.css`). No literal colours in components.
- Never `transition: all`; never animate `width`, `height`, `top`, `left`.
- Every interactive element has a visible `:focus-visible` style.
- Every animation respects `prefers-reduced-motion`.
- No invented numbers, testimonials or logos anywhere.
- No uppercase tracked "eyebrow" labels, no emoji as icons, no purple-to-blue gradients, no card inside a card.
- `overflow-x: clip` on `html` and `body`. Containers are capped and centred on wide screens.

## Project rules

- **Logical CSS properties only** (`margin-inline-start`, `inset-inline-start`, `padding-inline`), so Arabic right to left works without extra CSS.
- **Tap targets at least 44px.**
- **Barber mode keeps its high-contrast, big-text option.**
- Every app screen handles **empty, loading, error** states through `Region` / `useDataState` in `src/ui/kit.tsx` (`?state=loading|empty|error`), and offline where it applies.
- **Money always shows its currency** (`useFormat().money`, minor units). **Times always use the location's time zone** (`useFormat().time/day`). Never format by hand.
- **No hard-coded UI text.** Client-facing pages use `useLang().t` (`src/lib/i18n.tsx`); the business app uses `useT()` (`src/app/i18n.ts`). Add the English string to the catalogue first; the catalogue tests fail on missing or extra keys. Use the plural form (`tp`) whenever a count is shown.
- Shop data (service names, offers) is not UI text: client pages show it through `useLang().s`.
- After UI changes, check with `sloplint` (command in `README.md`) and update the frontend column in `PLAN.md` sections 6, 17.6 and 22.
