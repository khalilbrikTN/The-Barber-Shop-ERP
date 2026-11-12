/* Our own prices in Tunisia (PLAN.md section 20.2). The plan says Tunisia is "lower" than Europe without
   figures, so the paid plans stay null and the page says they are set before launch: fill them in here
   and both pricing tables pick them up. */

/** Monthly price per location for Gratuit, Solo, Salon and Pro, in dinars, and the per-location price for several locations. */
export const PRICES: { plans: (number | null)[]; multi: number | null } = { plans: [0, null, null, null], multi: null };

export const PLANS = ["Gratuit", "Solo", "Salon", "Pro"];

export function usePrices() {
  const money = (amount: number | null) =>
    amount === null ? "Fixé avant le lancement" : new Intl.NumberFormat("fr-TN", { style: "currency", currency: "TND", maximumFractionDigits: 0 }).format(amount);
  const multi = PRICES.multi === null ? "Plusieurs salons : prix fixé avant le lancement." : `Plusieurs salons : à partir de ${money(PRICES.multi)} chacun.`;
  return { prices: PRICES, money, multi };
}
