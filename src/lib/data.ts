import { zonedIso } from "./zone";

/* Sample data for the frontend. Every value reads as a sample: Barbier Exemple, round amounts.
   Amounts are minor units (millimes for TND). Times are ISO with the shop's offset. */

/** The sample shop's zone; it matches the default in settings. */
export const SAMPLE_TIME_ZONE = "Africa/Tunis";
export const TODAY = "2026-12-12"; // a Saturday
export const at = (hhmm: string, date = TODAY) => zonedIso(date, hhmm, SAMPLE_TIME_ZONE);
export const NOW = at("10:42");

export type Staff = {
  id: string;
  name: string;
  slug: string;
  role: "Owner" | "Barber" | "Stylist" | "Front desk";
  pay: "commission" | "booth rent" | "owner" | "salary";
  commission?: number;
  rentMinor?: number;
  hours: string;
  services: string[];
  photo?: string;
};

export const STAFF: Staff[] = [
  { id: "karim", name: "Karim", slug: "karim", role: "Owner", pay: "owner", hours: "Du mardi au dimanche, 10:00 à 20:00", services: ["fade", "fadebeard", "beard", "kids", "shave", "buzz"], photo: "/sample/haircut.jpg" },
  { id: "mehdi", name: "Mehdi", slug: "mehdi", role: "Barber", pay: "commission", commission: 0.5, hours: "Du mardi au samedi, 11:00 à 21:00", services: ["fade", "fadebeard", "beard", "kids", "buzz"], photo: "/sample/razor-trim.jpg" },
  { id: "hana", name: "Hana", slug: "hana", role: "Stylist", pay: "booth rent", rentMinor: 300000, hours: "Du mardi au vendredi, 10:00 à 18:00", services: ["cutdry", "colour", "fringe", "kids"], photo: "/sample/stylist-at-work.jpg" },
  { id: "salma", name: "Salma", slug: "salma", role: "Front desk", pay: "salary", hours: "Du mardi au dimanche, 10:00 à 19:00", services: [] },
];
export const BOOKABLE = STAFF.filter((s) => s.services.length > 0);

export type Service = {
  id: string;
  name: string;
  category: "Hair" | "Beard" | "Colour" | "Kids";
  minutes: number;
  priceMinor: number;
  description: string;
  /** work / wait segments: the stylist is free during wait */
  segments?: { kind: "work" | "wait"; minutes: number }[];
  deposit?: boolean;
  /** minutes the chair is busy before and after, without the client: mixing colour, changing towels */
  bufferBefore?: number;
  bufferAfter?: number;
  /** a photo for the booking page; the samples are Unsplash pictures in public/sample */
  photo?: string;
};

export const SERVICES: Service[] = [
  { id: "fade", name: "Dégradé à blanc", category: "Hair", minutes: 30, priceMinor: 20000, description: "Tondeuse à blanc, ciseaux sur le dessus.", photo: "/sample/thinning-shears.jpg" },
  { id: "fadebeard", name: "Dégradé et barbe", category: "Hair", minutes: 45, priceMinor: 30000, description: "Dégradé avec contour de barbe.", photo: "/sample/beard-scissors.jpg" },
  { id: "buzz", name: "Coupe tondeuse", category: "Hair", minutes: 15, priceMinor: 12000, description: "Un seul sabot partout.", photo: "/sample/haircut.jpg" },
  { id: "beard", name: "Taille de barbe", category: "Beard", minutes: 20, priceMinor: 10000, description: "Forme, contour et serviette chaude.", photo: "/sample/beard-scissors.jpg" },
  { id: "shave", name: "Rasage à la serviette chaude", category: "Beard", minutes: 30, priceMinor: 15000, description: "Coupe-chou, deux serviettes chaudes.", bufferAfter: 10, photo: "/sample/razor-trim.jpg" },
  { id: "kids", name: "Coupe enfant", category: "Kids", minutes: 20, priceMinor: 12000, description: "Moins de 12 ans.", photo: "/sample/barber-chair-client.jpg" },
  { id: "cutdry", name: "Coupe et brushing", category: "Hair", minutes: 60, priceMinor: 40000, description: "Shampooing, coupe et brushing.", photo: "/sample/blow-dry.jpg" },
  { id: "fringe", name: "Coupe de frange", category: "Hair", minutes: 15, priceMinor: 8000, description: "Entre deux coupes.", photo: "/sample/hair-styling.jpg" },
  {
    id: "colour",
    name: "Couleur, racines",
    category: "Colour",
    minutes: 90,
    priceMinor: 80000,
    description: "Couleur racines avec temps de pose.",
    segments: [
      { kind: "work", minutes: 30 },
      { kind: "wait", minutes: 40 },
      { kind: "work", minutes: 20 },
    ],
    deposit: true,
    bufferBefore: 10,
    photo: "/sample/salon-chair-mirror.jpg",
  },
];
export const serviceById = (id: string) => SERVICES.find((s) => s.id === id)!;
export const staffById = (id: string) => STAFF.find((s) => s.id === id)!;

export type Client = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  visits: number;
  spentMinor: number;
  noShows: number;
  lastVisit?: string;
  favourite?: string;
  notes?: string;
  tags: string[];
  marketing: boolean;
  punches: number;
  birthday?: string;
  language?: string;
  blocked?: boolean;
  /** before and after photos, kept only with the client's agreement */
  photos?: { src: string; kind: "before" | "after"; date: string }[];
};

export const CLIENTS: Client[] = [
  { id: "c1", name: "Skander", phone: "+216 20 000 101", visits: 14, spentMinor: 420000, noShows: 0, lastVisit: "2026-11-21", favourite: "karim", notes: "Sabot 2 sur les côtés, ciseaux sur le dessus. Pas de contour.", tags: ["Regular"], marketing: true, punches: 4 },
  { id: "c2", name: "Yosra", phone: "+216 20 000 102", email: "yosra@example.com", visits: 6, spentMinor: 310000, noShows: 0, lastVisit: "2026-11-14", favourite: "hana", notes: "Test d’allergie fait le 01/11/2026. Tons cendrés.", tags: ["Colour"], marketing: true, punches: 6 },
  { id: "c3", name: "Wassim", phone: "+216 20 000 103", visits: 3, spentMinor: 36000, noShows: 1, lastVisit: "2026-10-30", tags: [], marketing: false, punches: 3 },
  { id: "c4", name: "Hamza", phone: "+216 20 000 104", visits: 22, spentMinor: 770000, noShows: 0, lastVisit: "2026-11-28", favourite: "karim", notes: "Dégradé à blanc, 0,5 en bas. Aime court.", tags: ["Regular", "VIP"], marketing: true, punches: 2 },
  { id: "c5", name: "Mariem", phone: "+216 20 000 105", email: "mariem@example.com", visits: 9, spentMinor: 810000, noShows: 0, lastVisit: "2026-11-07", favourite: "hana", tags: ["Colour"], marketing: true, punches: 9 },
  { id: "c6", name: "Aymen", phone: "+216 20 000 106", visits: 1, spentMinor: 15000, noShows: 0, lastVisit: "2026-11-30", tags: ["New"], marketing: false, punches: 1 },
  { id: "c7", name: "Bilel", phone: "+216 20 000 107", visits: 11, spentMinor: 330000, noShows: 2, lastVisit: "2026-09-19", favourite: "mehdi", tags: ["Lapsed"], marketing: true, punches: 1 },
  { id: "c8", name: "Nesrine", phone: "+216 20 000 108", email: "nesrine@example.com", visits: 4, spentMinor: 180000, noShows: 0, lastVisit: "2026-11-24", favourite: "hana", tags: [], marketing: true, punches: 4 },
  { id: "c9", name: "Sarra", phone: "+216 20 000 109", visits: 2, spentMinor: 70000, noShows: 0, lastVisit: "2026-11-02", tags: ["New"], marketing: true, punches: 2 },
  { id: "c10", name: "Firas", phone: "+216 20 000 110", visits: 17, spentMinor: 595000, noShows: 1, lastVisit: "2026-12-05", favourite: "mehdi", notes: "Barbe : garder la longueur, dégager les joues.", tags: ["Regular"], marketing: true, punches: 7 },
  { id: "c11", name: "Rim", phone: "+216 20 000 111", visits: 5, spentMinor: 240000, noShows: 0, lastVisit: "2026-11-11", tags: [], marketing: false, punches: 5 },
  { id: "c12", name: "Slim", phone: "+216 20 000 112", visits: 30, spentMinor: 900000, noShows: 0, lastVisit: "2026-12-07", favourite: "karim", tags: ["Regular", "VIP"], marketing: true, punches: 0 },
  /* A likely duplicate of Skander (same phone), to show the merge flow */
  { id: "c13", name: "Skander B.", phone: "+216 20 000 101", visits: 1, spentMinor: 25000, noShows: 0, lastVisit: "2026-06-02", tags: [], marketing: false, punches: 1 },
];
export const clientById = (id: string) => CLIENTS.find((c) => c.id === id);

export type BookingStatus = "confirmed" | "checked in" | "in the chair" | "done" | "no-show" | "cancelled" | "blocked";
export type Booking = {
  id: string;
  clientId: string;
  staffId: string;
  serviceIds: string[];
  start: string;
  end: string;
  status: BookingStatus;
  source: "online" | "phone" | "walk-in" | "WhatsApp";
  deposit?: number;
  note?: string;
  /** blocked time: what the barber is doing instead */
  label?: string;
  groupId?: string;
  repeatId?: string;
};

const b = (id: string, clientId: string, staffId: string, serviceIds: string[], from: string, minutes: number, status: BookingStatus, source: Booking["source"], extra: Partial<Booking> = {}): Booking => {
  const start = at(from);
  const end = new Date(new Date(start).getTime() + minutes * 60000).toISOString();
  return { id, clientId, staffId, serviceIds, start, end, status, source, ...extra };
};

export const BOOKINGS: Booking[] = [
  b("b1", "c12", "karim", ["fade"], "10:00", 30, "done", "online"),
  b("b2", "c1", "karim", ["fadebeard"], "10:30", 45, "in the chair", "WhatsApp"),
  b("b3", "c4", "karim", ["fade"], "11:30", 30, "confirmed", "online"),
  b("b4", "c10", "mehdi", ["beard"], "11:00", 20, "checked in", "phone"),
  b("b5", "c7", "mehdi", ["fadebeard"], "12:00", 45, "confirmed", "online"),
  b("b6", "c2", "hana", ["cutdry"], "10:00", 60, "in the chair", "online"),
  b("b7", "c5", "hana", ["colour"], "11:30", 90, "confirmed", "online", { deposit: 20000 }),
  b("b8", "c8", "hana", ["fringe"], "14:00", 15, "confirmed", "WhatsApp"),
  b("b9", "c9", "mehdi", ["kids"], "14:30", 20, "confirmed", "online"),
  b("b10", "c11", "karim", ["shave"], "15:00", 30, "confirmed", "phone"),
  b("b11", "c3", "mehdi", ["buzz"], "16:00", 15, "confirmed", "online"),
  b("b12", "c6", "karim", ["kids"], "17:00", 20, "confirmed", "online"),
];

export type QueueEntry = { id: string; name: string; serviceId: string; staffId?: string; joined: string; via: "QR" | "kiosk" | "front desk" | "website"; phone?: string };

export const QUEUE: QueueEntry[] = [
  { id: "q1", name: "Ghassen", serviceId: "beard", joined: at("10:31"), via: "QR" },
  { id: "q2", name: "Achraf", serviceId: "fade", staffId: "mehdi", joined: at("10:36"), via: "kiosk" },
  { id: "q3", name: "Houssem", serviceId: "buzz", joined: at("10:40"), via: "website" },
];

export type Sale = { id: string; time: string; clientId?: string; staffId: string; lines: { label: string; minor: number }[]; tipMinor: number; method: "cash" | "card" | "wallet"; refunded?: { at: string; reason: string } };

export const SALES: Sale[] = [
  { id: "s1", time: at("10:31"), clientId: "c12", staffId: "karim", lines: [{ label: "Dégradé à blanc", minor: 20000 }], tipMinor: 5000, method: "cash" },
  { id: "s2", time: at("09:58", "2026-12-11"), clientId: "c10", staffId: "mehdi", lines: [{ label: "Dégradé et barbe", minor: 30000 }, { label: "Huile à barbe", minor: 18000 }], tipMinor: 0, method: "card" },
];

export const WEEK_SALES = [
  { day: "2026-12-06", cash: 610000, card: 420000, wallet: 90000, bookings: 41 },
  { day: "2026-12-07", cash: 380000, card: 300000, wallet: 40000, bookings: 27 },
  { day: "2026-12-08", cash: 350000, card: 260000, wallet: 60000, bookings: 25 },
  { day: "2026-12-09", cash: 0, card: 0, wallet: 0, bookings: 0 },
  { day: "2026-12-10", cash: 420000, card: 350000, wallet: 70000, bookings: 31 },
  { day: "2026-12-11", cash: 520000, card: 410000, wallet: 80000, bookings: 36 },
];

export type Expense = { id: string; date: string; category: string; label: string; minor: number };
export const EXPENSES: Expense[] = [
  { id: "e1", date: "2026-12-01", category: "Rent", label: "Loyer du salon, décembre", minor: 1500000 },
  { id: "e2", date: "2026-12-03", category: "Products", label: "Lames de tondeuse et bandes de cou", minor: 120000 },
  { id: "e3", date: "2026-12-05", category: "Bills", label: "Électricité (STEG)", minor: 85000 },
  { id: "e4", date: "2026-12-09", category: "Products", label: "Stock de couleur", minor: 260000 },
];

export type Product = { id: string; name: string; priceMinor: number; costMinor: number; stock: number; low: number };
export const PRODUCTS: Product[] = [
  { id: "p1", name: "Huile à barbe", priceMinor: 18000, costMinor: 9000, stock: 12, low: 5 },
  { id: "p2", name: "Cire mate", priceMinor: 22000, costMinor: 11000, stock: 3, low: 5 },
  { id: "p3", name: "Shampooing", priceMinor: 16000, costMinor: 7000, stock: 9, low: 4 },
];

export type Offer = { id: string; title: string; body: string; until: string; code?: string; live: boolean };
export const OFFERS: Offer[] = [
  { id: "o1", title: "Père et fils", body: "Un dégradé et une coupe enfant ensemble, 15 % de remise.", until: "2026-12-31", live: true },
  { id: "o2", title: "Matins de semaine", body: "10 % sur toute prestation du mardi au jeudi avant midi.", until: "2027-01-31", code: "MATIN10", live: true },
  { id: "o3", title: "Essai mariée", body: "Réservez un essai avec Hana, acompte demandé à la réservation.", until: "2027-03-01", live: false },
];

export const PROMO_CODES = [
  { code: "MATIN10", rule: "10 % avant 12:00, du mardi au jeudi", uses: 0, max: 200 },
  { code: "BIENVENUE", rule: "5 DT de remise sur une première visite", uses: 0, max: 100 },
];

/* No reviews in the sample: a review is a testimonial, and the screen shows its empty state until real ones arrive. */
export const REVIEWS: { id: string; clientId: string; rating: number; text: string; date: string }[] = [];

/** A client waiting for a time. Staff wrote `window` by hand; the booking page stores the day and barber instead, so staff read it in their own language. */
export type WaitEntry = { id: string; clientId: string; serviceId: string; window?: string; day?: string; staffId?: string };
export const WAITLIST: WaitEntry[] = [
  { id: "w1", clientId: "c3", serviceId: "fade", window: "N’importe quand après 15:00" },
  { id: "w2", clientId: "c8", serviceId: "cutdry", window: "Avant 13:00, Hana uniquement" },
];

export const SCHEDULE_HOURS = { open: 10 * 60, close: 21 * 60 };

/* Gift cards, packages, holidays and the platform's own tenants, all sample values. */

export type GiftCard = { code: string; initialMinor: number; balanceMinor: number; buyer: string; to: string; expires: string };
export const GIFT_CARDS: GiftCard[] = [
  { code: "GIFT-7KQ2", initialMinor: 50000, balanceMinor: 50000, buyer: "Rim", to: "Son frère", expires: "2027-12-01" },
  { code: "GIFT-3MX9", initialMinor: 100000, balanceMinor: 35000, buyer: "Slim", to: "Firas", expires: "2027-09-15" },
];

export type Package = { id: string; name: string; serviceId: string; visits: number; priceMinor: number; sold: number };
export const PACKAGES: Package[] = [
  { id: "pk1", name: "5 dégradés à blanc", serviceId: "fade", visits: 5, priceMinor: 90000, sold: 0 },
  { id: "pk2", name: "4 tailles de barbe", serviceId: "beard", visits: 4, priceMinor: 36000, sold: 0 },
];

/* Tunisian public holidays. Religious ones follow the moon, so their dates are estimates. */
export const HOLIDAYS_TN_2027 = [
  { date: "2027-01-01", name: "Jour de l’An" },
  { date: "2027-03-10", name: "Aïd el-Fitr (estimation)" },
  { date: "2027-03-11", name: "Aïd el-Fitr, deuxième jour (estimation)" },
  { date: "2027-03-20", name: "Fête de l’Indépendance" },
  { date: "2027-04-09", name: "Journée des Martyrs" },
  { date: "2027-05-01", name: "Fête du Travail" },
  { date: "2027-05-17", name: "Aïd el-Idha (estimation)" },
  { date: "2027-05-18", name: "Aïd el-Idha, deuxième jour (estimation)" },
  { date: "2027-06-06", name: "Ras el-Am el-Hijri (estimation)" },
  { date: "2027-07-25", name: "Fête de la République" },
  { date: "2027-08-13", name: "Fête de la Femme" },
  { date: "2027-08-15", name: "Mouled (estimation)" },
  { date: "2027-10-15", name: "Fête de l’Évacuation" },
  { date: "2027-12-17", name: "Fête de la Révolution" },
];

export type Tenant = { id: string; name: string; country: string; plan: "Free" | "Solo" | "Shop" | "Pro"; staff: number; status: "trial" | "active" | "past due"; messages: number; allowance: number; since: string };
export const TENANTS: Tenant[] = [
  { id: "t1", name: "Barbier Exemple, Tunis", country: "Tunisie", plan: "Shop", staff: 3, status: "trial", messages: 412, allowance: 1500, since: "2026-11-30" },
  { id: "t2", name: "Salon Exemple, Sfax", country: "Tunisie", plan: "Pro", staff: 7, status: "active", messages: 2210, allowance: 4000, since: "2026-10-12" },
  { id: "t3", name: "Coiffure Exemple, Sousse", country: "Tunisie", plan: "Solo", staff: 1, status: "active", messages: 96, allowance: 300, since: "2026-09-03" },
  { id: "t4", name: "Barbier Exemple, Bizerte", country: "Tunisie", plan: "Shop", staff: 4, status: "past due", messages: 1180, allowance: 1500, since: "2026-08-21" },
  { id: "t5", name: "Coiffure Exemple, Nabeul", country: "Tunisie", plan: "Free", staff: 1, status: "active", messages: 31, allowance: 50, since: "2026-11-02" },
];

export const FLAGS = ["File sans rendez-vous", "Acomptes en ligne", "Messages WhatsApp", "Nom de domaine personnel", "Réceptionniste IA (bêta)"];
