export type Photo = { src: string; alt: string };

export type SiteConfig = {
  preset: "board" | "paper" | "signal";
  logo?: string;
  /** the wide photo under the header */
  hero?: string;
  /** the shop's work; every client in it agreed to be shown */
  gallery: Photo[];
  accent: "cobalt" | "green" | "red" | "ink";
  area: string;
  about: string;
  /** the shop's own line in Arabic and French; empty falls back to the line above */
  aboutAr?: string;
  aboutFr?: string;
  sections: { services: boolean; team: boolean; offers: boolean; gallery: boolean; hours: boolean; find: boolean };
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
  hero: "/sample/chair-brick.jpg",
  gallery: [
    { src: "/sample/thinning-shears.jpg", alt: "A fade finished with thinning shears" },
    { src: "/sample/razor-trim.jpg", alt: "A line-up with a straight razor" },
    { src: "/sample/beard-scissors.jpg", alt: "A beard shaped with scissors" },
    { src: "/sample/blow-dry.jpg", alt: "A blow-dry" },
    { src: "/sample/barber-chair-client.jpg", alt: "A client in the chair" },
    { src: "/sample/tools.jpg", alt: "Clippers, scissors and combs" },
  ],
  sections: { services: true, team: true, offers: true, gallery: true, hours: true, find: true },
  whatsapp: "+20 100 000 0000",
  phone: "+20 100 000 0000",
  address: "Example Street, Cairo",
  instagram: "example.barbers",
};

const KEY = "chairside.site";

export function loadSite(): SiteConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<SiteConfig>;
      return { ...DEFAULT_SITE, ...saved, sections: { ...DEFAULT_SITE.sections, ...saved.sections } };
    }
  } catch {
    /* storage blocked */
  }
  return DEFAULT_SITE;
}

/** False when the browser would not keep it, usually because the photos filled its storage. */
export function saveSite(c: SiteConfig) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
    return true;
  } catch {
    return false;
  }
}
