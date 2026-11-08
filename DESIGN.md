# Design: Chairside

The locked system. Every Hallmark run reads this first and pages share it. Change it on purpose; the file is the rule.

## System
- Genre: modern-minimal
- Shape of the first page: Stat-Led (marketing landing); app screens follow the app scope
- Theme: Wayfind (colourway: platform)
- Axes: light/mono/cool · posture: committed

## Tokens
`src/styles/tokens.css` is the source of truth. The roles:
```css
:root {
  --color-paper: oklch(95.5% 0.006 250);  --color-paper-2: oklch(91% 0.009 250);  --color-paper-3: oklch(99.5% 0.005 250);
  --color-ink: oklch(16% 0.014 262);  --color-ink-2: oklch(29% 0.014 262);  --color-muted: oklch(47% 0.016 260);  --color-rule: oklch(80% 0.011 250);
  --color-accent: oklch(51% 0.22 264);  --color-accent-2: oklch(81% 0.16 82);  --color-accent-ink: oklch(99.5% 0.003 250);  --color-focus: oklch(51% 0.22 264);
  --font-display: "Chivo Mono", ui-monospace, monospace;  --font-body: var(--font-display);  --font-outlier: var(--font-body);
  --radius-card: 0;  --radius-pill: 999px;  --rule-hair: 1px;  --rule-bar: 2px;  --shadow-card: 0 24px 40px -24px oklch(8% 0.01 260 / 0.6);
  --color-swatch-green: oklch(50% 0.13 150);  --color-swatch-red: oklch(52% 0.19 27);  --color-swatch-amber: oklch(72% 0.15 75);  /* calendar categories and shop accents only */
}
```
The spacing scale, the easings and the durations are the scaffold's and live in `tokens.css`. Marketing pages use the fluid type scale in `tokens.css`; app screens (`.app-root`) override it with the fixed 1.2 scale in `src/app/styles/app.css`.

## Rules
- Chivo Mono everywhere, 400 / 500 / 800. Never a proportional face.
- Square corners, 2px ink borders on surfaces and controls, 1px rules between rows.
- Cobalt (`--color-accent`) marks what is live: the primary action, the current selection, the current time. Amber (`--color-accent-2`) colours figures on ink, or fills a plate under ink text; never amber text on paper.
- Logical CSS properties only (`margin-inline-start`, `inset-inline-end`) so right-to-left languages work.
- Money is formatted with `Intl.NumberFormat` from minor units and the shop's currency; times with `Intl.DateTimeFormat` in the shop's time zone.
- Sample data reads as sample (Example Barbers, round amounts); never a figure a visitor could take as a claim.

## Controls
- Primary: cobalt fill · square · 52px on marketing, 40px in the app (44px hit target)
- Secondary: transparent with a 2px ink border · same radius and height
- On ink: transparent with a 2px paper border

## Motion
- Character: severe. Colour changes in `steps(1)` at `--dur-micro`; rows update in place; no reveal on scroll; a live dot blinks once when a row changes. Under reduced motion everything ends at once.

## Exports
`src/styles/tokens.css` in this project. Tailwind, DTCG or shadcn blocks are added here on request, per `export-formats.md`.
