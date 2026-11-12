import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { STAFF } from "./data";
import { samePhone } from "./tunisia";

/* Who is signed in, kept in this browser until the server issues real sessions (PLAN.md section 18).
   Staff sign in with a one-time code; a new owner's shop is "ready" once the setup wizard is done.
   Clients have their own, separate session for their account pages. */

export type StaffRole = "Owner" | "Barber" | "Stylist" | "Front desk";
export type StaffLang = "fr" | "en";

export type StaffSession = {
  /** a team member's id, or "owner" for someone who just signed up */
  userId: string;
  name: string;
  phone: string;
  email?: string;
  role: StaffRole;
  lang: StaffLang;
  shopReady: boolean;
  since: string;
  notify: Record<string, boolean>;
};

export type ClientSession = { clientId: string; since: string };

const STAFF_KEY = "chairside.tn.session";
const CLIENT_KEY = "chairside.tn.client";
/** the owner who signed up in this browser, so they can sign back in after signing out */
const OWNER_KEY = "chairside.tn.owner";

export const DEFAULT_NOTIFY = { booking: true, cancel: true, queue: false, summary: true };

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked: the session lasts for this tab only */
  }
}

export type Account = Pick<StaffSession, "userId" | "name" | "phone" | "email" | "role" | "shopReady">;

/** Everyone who can sign in here: the sample team, and the owner who created a salon in this browser. */
export function knownAccounts(): Account[] {
  const team: Account[] = STAFF.map((m) => ({ userId: m.id, name: m.name, phone: m.phone, email: m.email, role: m.role, shopReady: true }));
  const owner = read<Account>(OWNER_KEY);
  return owner ? [owner, ...team] : team;
}

export function findAccount(by: "phone" | "email", value: string) {
  const v = value.trim().toLowerCase();
  return knownAccounts().find((a) => (by === "phone" ? samePhone(a.phone, v) : a.email?.toLowerCase() === v));
}

type Ctx = {
  staff: StaffSession | null;
  client: ClientSession | null;
  signIn: (s: Omit<StaffSession, "since" | "notify" | "lang"> & Partial<Pick<StaffSession, "lang" | "notify">>) => void;
  updateStaff: (patch: Partial<StaffSession>) => void;
  signOut: () => void;
  signInClient: (clientId: string) => void;
  signOutClient: () => void;
};

const SessionContext = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffSession | null>(() => read<StaffSession>(STAFF_KEY));
  const [client, setClient] = useState<ClientSession | null>(() => read<ClientSession>(CLIENT_KEY));

  useEffect(() => write(STAFF_KEY, staff), [staff]);
  useEffect(() => write(CLIENT_KEY, client), [client]);
  useEffect(() => {
    if (staff?.userId === "owner") {
      const { userId, name, phone, email, role, shopReady } = staff;
      write(OWNER_KEY, { userId, name, phone, email, role, shopReady });
    }
  }, [staff]);

  const value = useMemo<Ctx>(
    () => ({
      staff,
      client,
      signIn: (s) => setStaff({ lang: "fr", notify: DEFAULT_NOTIFY, ...s, since: new Date().toISOString() }),
      updateStaff: (patch) => setStaff((s) => (s ? { ...s, ...patch } : s)),
      signOut: () => setStaff(null),
      signInClient: (clientId) => setClient({ clientId, since: new Date().toISOString() }),
      signOutClient: () => setClient(null),
    }),
    [staff, client],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession outside SessionProvider");
  return ctx;
}

/** The staff language without requiring the provider, for components that also render in tests. */
export function useStaffLang(): StaffLang {
  return useContext(SessionContext)?.staff?.lang ?? "fr";
}

/** Where someone lands after signing in: barbers and stylists on their phone view, everyone else on Today. */
export const homeFor = (role: StaffRole) => (role === "Barber" || role === "Stylist" ? "/me" : "/app");

/** Forgets the owner who signed up here, when they delete their salon. */
export function forgetOwner() {
  write(OWNER_KEY, null);
}

/** The shop's web address from its name: "Barbier Exemple" → "barbier-exemple". */
export function slugify(name: string) {
  const s = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // accents off: "Gabès" → "gabes"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "mon-salon";
}
