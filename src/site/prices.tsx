import { useState } from "react";

/* Our own prices by region (PLAN.md section 20.2). Europe is the hypothesis in the plan. The plan says
   Egypt and Tunisia are "lower" without figures, so those stay null and the page says they are set
   before launch: fill them in here and both pricing tables pick them up. */

export type Region = "europe" | "egypt" | "tunisia";

export const REGIONS: { id: Region; label: string; currency: string; currencyName: string }[] = [
  { id: "europe", label: "Europe", currency: "EUR", currencyName: "euros" },
  { id: "egypt", label: "Egypt", currency: "EGP", currencyName: "Egyptian pounds" },
  { id: "tunisia", label: "Tunisia", currency: "TND", currencyName: "Tunisian dinars" },
];

/** Monthly price per location for Free, Solo, Shop and Pro, and the per-location price for several locations. */
export const PRICES: Record<Region, { plans: (number | null)[]; multi: number | null }> = {
  europe: { plans: [0, 15, 39, 79], multi: 69 },
  egypt: { plans: [0, null, null, null], multi: null },
  tunisia: { plans: [0, null, null, null], multi: null },
};

const KEY = "chairside.region";

function guessRegion(): Region {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "europe" || saved === "egypt" || saved === "tunisia") return saved;
  } catch {
    /* storage blocked */
  }
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return zone === "Africa/Cairo" ? "egypt" : zone === "Africa/Tunis" ? "tunisia" : "europe";
}

export function useRegion() {
  const [region, setRegionState] = useState<Region>(guessRegion);
  const setRegion = (r: Region) => {
    setRegionState(r);
    try {
      localStorage.setItem(KEY, r);
    } catch {
      /* storage blocked */
    }
  };
  const meta = REGIONS.find((r) => r.id === region)!;
  const money = (amount: number | null) => (amount === null ? "Set before launch" : new Intl.NumberFormat("en", { style: "currency", currency: meta.currency, maximumFractionDigits: 0 }).format(amount));
  const prices = PRICES[region];
  const multi = prices.multi === null ? "Several locations: priced before launch." : `Several locations: from ${money(prices.multi)} each.`;
  return { region, setRegion, meta, prices, money, multi };
}

export function RegionSwitch({ region, setRegion }: { region: Region; setRegion: (r: Region) => void }) {
  return (
    <div className="region" role="radiogroup" aria-label="Prices for">
      {REGIONS.map((r) => (
        <button key={r.id} type="button" role="radio" aria-checked={region === r.id} className="region__btn" onClick={() => setRegion(r.id)}>
          {r.label}
        </button>
      ))}
    </div>
  );
}
