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
  area: "Rue de l’Exemple, Tunis",
  about: "Dégradés, barbes et coupes enfant. Passez sans rendez-vous ou réservez un fauteuil.",
  hero: "/sample/chair-brick.jpg",
  gallery: [
    { src: "/sample/thinning-shears.jpg", alt: "Un dégradé fini aux ciseaux sculpteurs" },
    { src: "/sample/razor-trim.jpg", alt: "Un contour au coupe-chou" },
    { src: "/sample/beard-scissors.jpg", alt: "Une barbe taillée aux ciseaux" },
    { src: "/sample/blow-dry.jpg", alt: "Un brushing" },
    { src: "/sample/barber-chair-client.jpg", alt: "Un client au fauteuil" },
    { src: "/sample/tools.jpg", alt: "Tondeuses, ciseaux et peignes" },
  ],
  sections: { services: true, team: true, offers: true, gallery: true, hours: true, find: true },
  whatsapp: "+216 20 000 000",
  phone: "+216 71 000 000",
  address: "Rue de l’Exemple, Tunis",
  instagram: "barbier.exemple",
};

const KEY = "chairside.tn.site";

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
