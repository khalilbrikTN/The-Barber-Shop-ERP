import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { TextKey, useT } from "./i18n";

type Item = { label: string; hint: string; to: string };
type Screen = { label: TextKey; hint: TextKey; to: string };

const SCREENS: Screen[] = [
  { label: "nav.today", hint: "find.screen", to: "/app" },
  { label: "nav.calendar", hint: "find.screen", to: "/app/calendar" },
  { label: "find.newBooking", hint: "find.action", to: "/app/calendar?new=1" },
  { label: "nav.queue", hint: "find.screen", to: "/app/queue" },
  { label: "nav.clients", hint: "find.screen", to: "/app/clients" },
  { label: "find.import", hint: "find.action", to: "/app/clients/import" },
  { label: "nav.checkout", hint: "find.screen", to: "/app/checkout" },
  { label: "find.cashup", hint: "find.money", to: "/app/money" },
  { label: "find.reports", hint: "find.money", to: "/app/money?tab=reports" },
  { label: "nav.team", hint: "find.screen", to: "/app/team" },
  { label: "nav.marketing", hint: "find.screen", to: "/app/marketing" },
  { label: "nav.website", hint: "find.screen", to: "/app/website" },
  { label: "nav.settings", hint: "find.screen", to: "/app/settings" },
  { label: "nav.tv", hint: "find.mode", to: "/tv" },
  { label: "nav.kiosk", hint: "find.mode", to: "/kiosk" },
  { label: "nav.barberMode", hint: "find.mode", to: "/me" },
];

/** Ctrl+K (or ⌘K) opens a search over screens and clients, for a front desk that lives on the keyboard. */
export function QuickFind() {
  const navigate = useNavigate();
  const { clients } = useStore();
  const { t } = useT();
  const dialog = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const items = useMemo(() => {
    const screens: Item[] = SCREENS.map((s) => ({ label: t(s.label), hint: t(s.hint), to: s.to }));
    const all: Item[] = [...screens, ...clients.map((c) => ({ label: c.name, hint: c.phone, to: `/app/clients/${c.id}` }))];
    const needle = q.trim().toLowerCase();
    const digits = needle.replace(/\D/g, "");
    return (needle ? all.filter((i) => i.label.toLowerCase().includes(needle) || (digits.length > 2 && i.hint.replace(/\D/g, "").includes(digits))) : screens).slice(0, 8);
  }, [q, clients, t]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQ("");
        setActive(0);
        dialog.current?.showModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(item?: Item) {
    if (!item) return;
    dialog.current?.close();
    navigate(item.to);
  }

  return (
    <>
      <button
        type="button"
        className="app-side__find"
        onClick={() => {
          setQ("");
          setActive(0);
          dialog.current?.showModal();
        }}
      >
        {t("find.open")} <kbd>Ctrl K</kbd>
      </button>
      <dialog ref={dialog} className="quickfind" aria-label={t("find.title")}>
        <form method="dialog" onSubmit={(e) => (e.preventDefault(), go(items[active]))}>
          <label className="visually-hidden" htmlFor="qf-input">
            {t("find.search")}
          </label>
          <input
            id="qf-input"
            className="ui-input"
            autoFocus
            autoComplete="off"
            placeholder={t("find.placeholder")}
            value={q}
            role="combobox"
            aria-expanded="true"
            aria-controls="qf-list"
            aria-activedescendant={items[active] ? `qf-${active}` : undefined}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, items.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              }
            }}
          />
          <ul id="qf-list" role="listbox" className="quickfind__list">
            {items.length === 0 && <li className="quickfind__none">{t("find.none")}</li>}
            {items.map((i, n) => (
              <li key={i.to} id={`qf-${n}`} role="option" aria-selected={n === active} onMouseEnter={() => setActive(n)} onClick={() => go(i)}>
                <strong>{i.label}</strong>
                <span>{i.hint}</span>
              </li>
            ))}
          </ul>
          <p className="quickfind__help">{t("find.help")}</p>
        </form>
      </dialog>
    </>
  );
}
