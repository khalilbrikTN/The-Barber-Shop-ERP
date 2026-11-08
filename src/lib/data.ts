/* Sample data for the frontend. Every value reads as a sample: Example Barbers, round amounts.
   Amounts are minor units (piastres for EGP). Times are ISO with the shop's offset. */

export const TODAY = "2026-12-12"; // a Saturday
export const NOW = `${TODAY}T10:42:00+02:00`;
export const at = (hhmm: string, date = TODAY) => `${date}T${hhmm}:00+02:00`;

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
};

export const STAFF: Staff[] = [
  { id: "karim", name: "Karim", slug: "karim", role: "Owner", pay: "owner", hours: "Sat to Thu, 10:00 to 20:00", services: ["fade", "fadebeard", "beard", "kids", "shave", "buzz"] },
  { id: "marco", name: "Marco", slug: "marco", role: "Barber", pay: "commission", commission: 0.5, hours: "Sat to Wed, 11:00 to 21:00", services: ["fade", "fadebeard", "beard", "kids", "buzz"] },
  { id: "hana", name: "Hana", slug: "hana", role: "Stylist", pay: "booth rent", rentMinor: 300000, hours: "Sat to Tue, 10:00 to 18:00", services: ["cutdry", "colour", "fringe", "kids"] },
  { id: "salma", name: "Salma", slug: "salma", role: "Front desk", pay: "salary", hours: "Sat to Thu, 10:00 to 19:00", services: [] },
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
};

export const SERVICES: Service[] = [
  { id: "fade", name: "Skin fade", category: "Hair", minutes: 30, priceMinor: 25000, description: "Clippers to the skin, scissors on top." },
  { id: "fadebeard", name: "Fade and beard", category: "Hair", minutes: 45, priceMinor: 35000, description: "Skin fade with a beard shape and line-up." },
  { id: "buzz", name: "Buzz cut", category: "Hair", minutes: 15, priceMinor: 15000, description: "One guard all over." },
  { id: "beard", name: "Beard trim", category: "Beard", minutes: 20, priceMinor: 12000, description: "Shape, line-up and hot towel." },
  { id: "shave", name: "Hot towel shave", category: "Beard", minutes: 30, priceMinor: 20000, description: "Straight razor, two hot towels." },
  { id: "kids", name: "Kids cut", category: "Kids", minutes: 20, priceMinor: 15000, description: "Under 12." },
  { id: "cutdry", name: "Cut and blow-dry", category: "Hair", minutes: 60, priceMinor: 45000, description: "Wash, cut and blow-dry." },
  { id: "fringe", name: "Fringe trim", category: "Hair", minutes: 15, priceMinor: 8000, description: "Between full cuts." },
  {
    id: "colour",
    name: "Colour, roots",
    category: "Colour",
    minutes: 90,
    priceMinor: 90000,
    description: "Root colour with processing time.",
    segments: [
      { kind: "work", minutes: 30 },
      { kind: "wait", minutes: 40 },
      { kind: "work", minutes: 20 },
    ],
    deposit: true,
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
};

export const CLIENTS: Client[] = [
  { id: "c1", name: "Omar", phone: "+20 100 000 0101", visits: 14, spentMinor: 420000, noShows: 0, lastVisit: "2026-11-21", favourite: "karim", notes: "#2 on the sides, scissors on top. No line-up.", tags: ["Regular"], marketing: true, punches: 4 },
  { id: "c2", name: "Lina", phone: "+20 100 000 0102", email: "lina@example.com", visits: 6, spentMinor: 310000, noShows: 0, lastVisit: "2026-11-14", favourite: "hana", notes: "Patch test done 2026-11-01. Ash tones.", tags: ["Colour"], marketing: true, punches: 6 },
  { id: "c3", name: "Sami", phone: "+20 100 000 0103", visits: 3, spentMinor: 36000, noShows: 1, lastVisit: "2026-10-30", tags: [], marketing: false, punches: 3 },
  { id: "c4", name: "Youssef", phone: "+20 100 000 0104", visits: 22, spentMinor: 770000, noShows: 0, lastVisit: "2026-11-28", favourite: "karim", notes: "Skin fade, 0.5 at the bottom. Likes it short.", tags: ["Regular", "VIP"], marketing: true, punches: 2 },
  { id: "c5", name: "Amira", phone: "+20 100 000 0105", email: "amira@example.com", visits: 9, spentMinor: 810000, noShows: 0, lastVisit: "2026-11-07", favourite: "hana", tags: ["Colour"], marketing: true, punches: 9 },
  { id: "c6", name: "Jonas", phone: "+20 100 000 0106", visits: 1, spentMinor: 15000, noShows: 0, lastVisit: "2026-11-30", tags: ["New"], marketing: false, punches: 1 },
  { id: "c7", name: "Tarek", phone: "+20 100 000 0107", visits: 11, spentMinor: 330000, noShows: 2, lastVisit: "2026-09-19", favourite: "marco", tags: ["Lapsed"], marketing: true, punches: 1 },
  { id: "c8", name: "Nour", phone: "+20 100 000 0108", email: "nour@example.com", visits: 4, spentMinor: 180000, noShows: 0, lastVisit: "2026-11-24", favourite: "hana", tags: [], marketing: true, punches: 4 },
  { id: "c9", name: "Ines", phone: "+20 100 000 0109", visits: 2, spentMinor: 70000, noShows: 0, lastVisit: "2026-11-02", tags: ["New"], marketing: true, punches: 2 },
  { id: "c10", name: "Adam", phone: "+20 100 000 0110", visits: 17, spentMinor: 595000, noShows: 1, lastVisit: "2026-12-05", favourite: "marco", notes: "Beard: keep the length, clean the cheeks.", tags: ["Regular"], marketing: true, punches: 7 },
  { id: "c11", name: "Rania", phone: "+20 100 000 0111", visits: 5, spentMinor: 240000, noShows: 0, lastVisit: "2026-11-11", tags: [], marketing: false, punches: 5 },
  { id: "c12", name: "Hassan", phone: "+20 100 000 0112", visits: 30, spentMinor: 900000, noShows: 0, lastVisit: "2026-12-07", favourite: "karim", tags: ["Regular", "VIP"], marketing: true, punches: 0 },
  /* A likely duplicate of Omar (same phone), to show the merge flow */
  { id: "c13", name: "Omar A.", phone: "+20 100 000 0101", visits: 1, spentMinor: 25000, noShows: 0, lastVisit: "2026-06-02", tags: [], marketing: false, punches: 1 },
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
  b("b4", "c10", "marco", ["beard"], "11:00", 20, "checked in", "phone"),
  b("b5", "c7", "marco", ["fadebeard"], "12:00", 45, "confirmed", "online"),
  b("b6", "c2", "hana", ["cutdry"], "10:00", 60, "in the chair", "online"),
  b("b7", "c5", "hana", ["colour"], "11:30", 90, "confirmed", "online", { deposit: 20000 }),
  b("b8", "c8", "hana", ["fringe"], "14:00", 15, "confirmed", "WhatsApp"),
  b("b9", "c9", "marco", ["kids"], "14:30", 20, "confirmed", "online"),
  b("b10", "c11", "karim", ["shave"], "15:00", 30, "confirmed", "phone"),
  b("b11", "c3", "marco", ["buzz"], "16:00", 15, "confirmed", "online"),
  b("b12", "c6", "karim", ["kids"], "17:00", 20, "confirmed", "online"),
];

export type QueueEntry = { id: string; name: string; serviceId: string; staffId?: string; joined: string; via: "QR" | "kiosk" | "front desk" | "website"; phone?: string };

export const QUEUE: QueueEntry[] = [
  { id: "q1", name: "Ziad", serviceId: "beard", joined: at("10:31"), via: "QR" },
  { id: "q2", name: "Mostafa", serviceId: "fade", staffId: "marco", joined: at("10:36"), via: "kiosk" },
  { id: "q3", name: "Khaled", serviceId: "buzz", joined: at("10:40"), via: "website" },
];

export type Sale = { id: string; time: string; clientId?: string; staffId: string; lines: { label: string; minor: number }[]; tipMinor: number; method: "cash" | "card" | "wallet"; refunded?: { at: string; reason: string } };

export const SALES: Sale[] = [
  { id: "s1", time: at("10:31"), clientId: "c12", staffId: "karim", lines: [{ label: "Skin fade", minor: 25000 }], tipMinor: 5000, method: "cash" },
  { id: "s2", time: at("09:58", "2026-12-11"), clientId: "c10", staffId: "marco", lines: [{ label: "Fade and beard", minor: 35000 }, { label: "Beard oil", minor: 18000 }], tipMinor: 0, method: "card" },
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
  { id: "e1", date: "2026-12-01", category: "Rent", label: "Shop rent, December", minor: 1500000 },
  { id: "e2", date: "2026-12-03", category: "Products", label: "Clipper blades and neck strips", minor: 120000 },
  { id: "e3", date: "2026-12-05", category: "Bills", label: "Electricity", minor: 85000 },
  { id: "e4", date: "2026-12-09", category: "Products", label: "Colour stock", minor: 260000 },
];

export type Product = { id: string; name: string; priceMinor: number; costMinor: number; stock: number; low: number };
export const PRODUCTS: Product[] = [
  { id: "p1", name: "Beard oil", priceMinor: 18000, costMinor: 9000, stock: 12, low: 5 },
  { id: "p2", name: "Matte clay", priceMinor: 22000, costMinor: 11000, stock: 3, low: 5 },
  { id: "p3", name: "Shampoo", priceMinor: 16000, costMinor: 7000, stock: 9, low: 4 },
];

export type Offer = { id: string; title: string; body: string; until: string; code?: string; live: boolean };
export const OFFERS: Offer[] = [
  { id: "o1", title: "Father and son", body: "A fade and a kids cut together, 15% off.", until: "2026-12-31", live: true },
  { id: "o2", title: "Weekday mornings", body: "10% off any service Sunday to Wednesday before noon.", until: "2027-01-31", code: "MORNING10", live: true },
  { id: "o3", title: "Bridal trial", body: "Book a trial with Hana, deposit taken at booking.", until: "2027-03-01", live: false },
];

export const PROMO_CODES = [
  { code: "MORNING10", rule: "10% off before 12:00, Sun to Wed", uses: 0, max: 200 },
  { code: "WELCOME", rule: "50 off a first visit", uses: 0, max: 100 },
];

/* No reviews in the sample: a review is a testimonial, and the screen shows its empty state until real ones arrive. */
export const REVIEWS: { id: string; clientId: string; rating: number; text: string; date: string }[] = [];

export const WAITLIST = [
  { id: "w1", clientId: "c3", serviceId: "fade", window: "Any time after 15:00" },
  { id: "w2", clientId: "c8", serviceId: "cutdry", window: "Before 13:00, Hana only" },
];

export const SCHEDULE_HOURS = { open: 10 * 60, close: 21 * 60 };

/* Gift cards, packages, holidays and the platform's own tenants, all sample values. */

export type GiftCard = { code: string; initialMinor: number; balanceMinor: number; buyer: string; to: string; expires: string };
export const GIFT_CARDS: GiftCard[] = [
  { code: "GIFT-7KQ2", initialMinor: 50000, balanceMinor: 50000, buyer: "Rania", to: "Her brother", expires: "2027-12-01" },
  { code: "GIFT-3MX9", initialMinor: 100000, balanceMinor: 35000, buyer: "Hassan", to: "Adam", expires: "2027-09-15" },
];

export type Package = { id: string; name: string; serviceId: string; visits: number; priceMinor: number; sold: number };
export const PACKAGES: Package[] = [
  { id: "pk1", name: "5 skin fades", serviceId: "fade", visits: 5, priceMinor: 100000, sold: 0 },
  { id: "pk2", name: "4 beard trims", serviceId: "beard", visits: 4, priceMinor: 40000, sold: 0 },
];

export const HOLIDAYS_EG_2027 = [
  { date: "2027-01-07", name: "Coptic Christmas" },
  { date: "2027-01-25", name: "Revolution Day" },
  { date: "2027-03-10", name: "Eid al-Fitr (estimated)" },
  { date: "2027-04-25", name: "Sinai Liberation Day" },
  { date: "2027-05-01", name: "Labour Day" },
  { date: "2027-05-17", name: "Eid al-Adha (estimated)" },
  { date: "2027-06-30", name: "June 30 Revolution" },
  { date: "2027-07-23", name: "Revolution Day" },
  { date: "2027-10-06", name: "Armed Forces Day" },
];

export type Tenant = { id: string; name: string; country: string; plan: "Free" | "Solo" | "Shop" | "Pro"; staff: number; status: "trial" | "active" | "past due"; messages: number; allowance: number; since: string };
export const TENANTS: Tenant[] = [
  { id: "t1", name: "Example Barbers", country: "Egypt", plan: "Shop", staff: 3, status: "trial", messages: 412, allowance: 1500, since: "2026-11-30" },
  { id: "t2", name: "Example Salon", country: "Tunisia", plan: "Pro", staff: 7, status: "active", messages: 2210, allowance: 4000, since: "2026-10-12" },
  { id: "t3", name: "Example Barbiere", country: "Italy", plan: "Solo", staff: 1, status: "active", messages: 96, allowance: 300, since: "2026-09-03" },
  { id: "t4", name: "Example Friseur", country: "Germany", plan: "Shop", staff: 4, status: "past due", messages: 1180, allowance: 1500, since: "2026-08-21" },
  { id: "t5", name: "Example Coiffure", country: "France", plan: "Free", staff: 1, status: "active", messages: 31, allowance: 50, since: "2026-11-02" },
];

export const FLAGS = ["Walk-in queue", "Online deposits", "WhatsApp messages", "Custom domain", "AI receptionist (beta)"];
