import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type Settings = {
  shopName: string;
  locale: string;
  currency: string;
  timeZone: string;
  hour12: boolean;
  weekStartsOn: 0 | 1 | 6;
  pricesIncludeTax: boolean;
  taxRate: number;
  dir: "ltr" | "rtl";
};

export const DEFAULT_SETTINGS: Settings = {
  shopName: "Barbier Exemple",
  locale: "fr-TN",
  currency: "TND",
  timeZone: "Africa/Tunis",
  hour12: false,
  weekStartsOn: 1,
  pricesIncludeTax: true,
  taxRate: 0.19,
  dir: "ltr",
};

export const COUNTRY_PRESETS: Record<string, Partial<Settings>> = {
  Tunisia: { locale: "fr-TN", currency: "TND", timeZone: "Africa/Tunis", weekStartsOn: 1, taxRate: 0.19 },
  Egypt: { locale: "en-EG", currency: "EGP", timeZone: "Africa/Cairo", weekStartsOn: 6, taxRate: 0.14 },
  Italy: { locale: "it-IT", currency: "EUR", timeZone: "Europe/Rome", weekStartsOn: 1, taxRate: 0.22 },
  France: { locale: "fr-FR", currency: "EUR", timeZone: "Europe/Paris", weekStartsOn: 1, taxRate: 0.2 },
  Germany: { locale: "de-DE", currency: "EUR", timeZone: "Europe/Berlin", weekStartsOn: 1, taxRate: 0.19 },
};

type Ctx = { settings: Settings; update: (patch: Partial<Settings>) => void };
const SettingsContext = createContext<Ctx | null>(null);

const KEY = "chairside.tn.settings";

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    /* storage blocked: defaults */
  }
  return DEFAULT_SETTINGS;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
    document.documentElement.dir = settings.dir;
  }, [settings]);

  const value = useMemo(() => ({ settings, update: (p: Partial<Settings>) => setSettings((s) => ({ ...s, ...p })) }), [settings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings outside SettingsProvider");
  return ctx;
}
