import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  Booking,
  BookingStatus,
  BOOKINGS,
  Client,
  CLIENTS,
  GIFT_CARDS,
  GiftCard,
  Product,
  PRODUCTS,
  QUEUE,
  QueueEntry,
  Sale,
  SALES,
  serviceById,
  WAITLIST,
  WaitEntry,
} from "./data";

type NewClient = { name: string; phone: string; email?: string; notes?: string };

type Store = {
  bookings: Booking[];
  queue: QueueEntry[];
  sales: Sale[];
  clients: Client[];
  waitlist: WaitEntry[];
  products: Product[];
  giftCards: GiftCard[];
  setStatus: (id: string, status: BookingStatus) => void;
  moveBooking: (id: string, staffId: string, start: string) => void;
  addBooking: (b: Omit<Booking, "id" | "end"> & { minutes?: number }) => Booking;
  addToQueue: (q: Omit<QueueEntry, "id">) => void;
  callFromQueue: (id: string) => void;
  removeFromQueue: (id: string) => void;
  addSale: (s: Omit<Sale, "id">) => void;
  refundSale: (id: string, reason: string) => void;
  addClient: (c: NewClient) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  mergeClients: (keepId: string, dropId: string) => void;
  importClients: (rows: NewClient[]) => { added: number; matched: number };
  removeWaitlist: (id: string) => void;
  addWaitlist: (w: Omit<WaitEntry, "id">) => void;
  adjustStock: (id: string, by: number) => void;
  addProduct: (p: Omit<Product, "id">) => void;
  addGiftCard: (g: Omit<GiftCard, "code">) => GiftCard;
  redeemGiftCard: (code: string, minor: number) => void;
  restoreQueue: (entry: QueueEntry, index: number) => void;
};

const StoreContext = createContext<Store | null>(null);

export const bookingMinutes = (serviceIds: string[]) => serviceIds.reduce((m, id) => m + serviceById(id).minutes, 0);
const digits = (x: string) => x.replace(/\D/g, "");
let seq = 0;
const uid = (p: string) => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

/* The preview keeps what you change in this browser, so a reload does not throw your edits away.
   The server replaces all of this later. */
// ".tn" keys: the Tunisian sample never reads data saved by another edition of the preview
const DATA_KEY = "chairside.tn.data.v1";
type Saved = { bookings: Booking[]; queue: QueueEntry[]; sales: Sale[]; clients: Client[]; waitlist: WaitEntry[]; products: Product[]; giftCards: GiftCard[] };

function loadSaved(): Partial<Saved> {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    return raw ? (JSON.parse(raw) as Partial<Saved>) : {};
  } catch {
    return {};
  }
}

/** Puts every screen back to the original sample. */
export function resetSampleData() {
  try {
    [DATA_KEY, "chairside.tn.settings", "chairside.tn.site"].forEach((k) => localStorage.removeItem(k));
  } catch {
    /* storage blocked: nothing was saved anyway */
  }
  window.location.assign("/app");
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [saved] = useState(loadSaved);
  const [bookings, setBookings] = useState(saved.bookings ?? BOOKINGS);
  const [queue, setQueue] = useState(saved.queue ?? QUEUE);
  const [sales, setSales] = useState(saved.sales ?? SALES);
  const [clients, setClients] = useState(() => {
    const c = saved.clients ?? CLIENTS;
    if (saved.clients) CLIENTS.splice(0, CLIENTS.length, ...c);
    return c;
  });
  const [waitlist, setWaitlist] = useState(saved.waitlist ?? WAITLIST);
  const [products, setProducts] = useState(saved.products ?? PRODUCTS);
  const [giftCards, setGiftCards] = useState(saved.giftCards ?? GIFT_CARDS);

  useEffect(() => {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify({ bookings, queue, sales, clients, waitlist, products, giftCards }));
    } catch {
      /* storage full or blocked: the preview still works for this tab */
    }
  }, [bookings, queue, sales, clients, waitlist, products, giftCards]);

  const value = useMemo<Store>(() => {
    const syncClients = (next: Client[]) => {
      CLIENTS.splice(0, CLIENTS.length, ...next); // keeps clientById() lookups in step with the store
      setClients(next);
    };
    const makeClient = (c: NewClient): Client => ({ id: uid("c"), name: c.name, phone: c.phone, email: c.email, notes: c.notes, visits: 0, spentMinor: 0, noShows: 0, tags: ["New"], marketing: false, punches: 0 });

    return {
      bookings,
      queue,
      sales,
      clients,
      waitlist,
      products,
      giftCards,
      setStatus: (id, status) => setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, status } : b))),
      moveBooking: (id, staffId, start) =>
        setBookings((bs) =>
          bs.map((b) => {
            if (b.id !== id) return b;
            const len = new Date(b.end).getTime() - new Date(b.start).getTime();
            return { ...b, staffId, start, end: new Date(new Date(start).getTime() + len).toISOString() };
          }),
        ),
      addBooking: ({ minutes, ...input }) => {
        const len = minutes ?? bookingMinutes(input.serviceIds);
        const booking = { ...input, id: uid("b"), end: new Date(new Date(input.start).getTime() + len * 60000).toISOString() };
        setBookings((bs) => [...bs, booking]);
        return booking;
      },
      addToQueue: (q) => setQueue((qs) => [...qs, { ...q, id: uid("q") }]),
      callFromQueue: (id) => setQueue((qs) => qs.filter((q) => q.id !== id)),
      removeFromQueue: (id) => setQueue((qs) => qs.filter((q) => q.id !== id)),
      addSale: (s) => setSales((ss) => [{ ...s, id: uid("s") }, ...ss]),
      refundSale: (id, reason) => setSales((ss) => ss.map((x) => (x.id === id ? { ...x, refunded: { at: new Date().toISOString(), reason } } : x))),
      addClient: (c) => {
        const found = clients.find((x) => digits(x.phone) === digits(c.phone));
        if (found) return found;
        const client = makeClient(c);
        syncClients([...clients, client]);
        return client;
      },
      updateClient: (id, patch) => syncClients(clients.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      mergeClients: (keepId, dropId) => {
        const keep = clients.find((c) => c.id === keepId);
        const drop = clients.find((c) => c.id === dropId);
        if (!keep || !drop) return;
        const merged: Client = {
          ...keep,
          visits: keep.visits + drop.visits,
          spentMinor: keep.spentMinor + drop.spentMinor,
          noShows: keep.noShows + drop.noShows,
          punches: keep.punches + drop.punches,
          email: keep.email ?? drop.email,
          tags: Array.from(new Set([...keep.tags, ...drop.tags])),
        };
        syncClients(clients.filter((c) => c.id !== dropId).map((c) => (c.id === keepId ? merged : c)));
        setBookings((bs) => bs.map((b) => (b.clientId === dropId ? { ...b, clientId: keepId } : b)));
      },
      importClients: (rows) => {
        let matched = 0;
        const next = [...clients];
        rows.forEach((r) => {
          if (next.some((c) => digits(c.phone) === digits(r.phone))) matched++;
          else next.push(makeClient(r));
        });
        syncClients(next);
        return { added: next.length - clients.length, matched };
      },
      removeWaitlist: (id) => setWaitlist((w) => w.filter((x) => x.id !== id)),
      addWaitlist: (w) => setWaitlist((all) => [...all, { ...w, id: uid("w") }]),
      adjustStock: (id, by) => setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + by) } : p))),
      addProduct: (p) => setProducts((ps) => [...ps, { ...p, id: uid("p") }]),
      addGiftCard: (g) => {
        const code = `GIFT-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        const card = { ...g, code };
        setGiftCards((gs) => [card, ...gs]);
        return card;
      },
      redeemGiftCard: (code, minor) => setGiftCards((gs) => gs.map((g) => (g.code === code ? { ...g, balanceMinor: Math.max(0, g.balanceMinor - minor) } : g))),
      restoreQueue: (entry, index) =>
        setQueue((qs) => {
          const next = qs.filter((q) => q.id !== entry.id);
          next.splice(Math.min(index, next.length), 0, entry);
          return next;
        }),
    };
  }, [bookings, queue, sales, clients, waitlist, products, giftCards]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore outside StoreProvider");
  return ctx;
}

/** Real bookings only: blocked time is a booking-shaped hold with no client. */
export const isClientBooking = (b: Booking) => b.status !== "blocked";
