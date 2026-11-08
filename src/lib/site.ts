export type SiteConfig = {
  preset: "board" | "paper" | "signal";
  logo?: string;
  accent: "cobalt" | "green" | "red" | "ink";
  area: string;
  about: string;
  /** the shop's own line in Arabic and French; empty falls back to the line above */
  aboutAr?: string;
  aboutFr?: string;
  sections: { services: boolean; team: boolean; offers: boolean; hours: boolean; find: boolean };
  whatsapp: string;
  phone: string;
  address: string;
  instagram: string;
};

export const DEFAULT_SITE: SiteConfig = {
  preset: "board",
  accent: "cobalt",
  area: "Example Street, Cairo",
  about: "Fades, beards and kids cuts. Walk in or book a chair.",
  sections: { services: true, team: true, offers: true, hours: true, find: true },
  whatsapp: "+20 100 000 0000",
  phone: "+20 100 000 0000",
  address: "Example Street, Cairo",
  instagram: "example.barbers",
};

const KEY = "chairside.site";

export function loadSite(): SiteConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_SITE, ...JSON.parse(raw) };
  } catch {
    /* storage blocked */
  }
  return DEFAULT_SITE;
}

export function saveSite(c: SiteConfig) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* storage blocked */
  }
}
