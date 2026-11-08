import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";

type Item = { label: string; hint: string; to: string };

const SCREENS: Item[] = [
  { label: "Today", hint: "Screen", to: "/app" },
  { label: "Calendar", hint: "Screen", to: "/app/calendar" },
  { label: "New booking", hint: "Action", to: "/app/calendar?new=1" },
  { label: "Queue", hint: "Screen", to: "/app/queue" },
  { label: "Clients", hint: "Screen", to: "/app/clients" },
  { label: "Import clients", hint: "Action", to: "/app/clients/import" },
  { label: "Checkout", hint: "Screen", to: "/app/checkout" },
  { label: "Cash-up", hint: "Money", to: "/app/money" },
  { label: "Reports", hint: "Money", to: "/app/money?tab=reports" },
  { label: "Team", hint: "Screen", to: "/app/team" },
  { label: "Marketing", hint: "Screen", to: "/app/marketing" },
  { label: "Website", hint: "Screen", to: "/app/website" },
  { label: "Settings", hint: "Screen", to: "/app/settings" },
  { label: "TV board", hint: "Mode", to: "/tv" },
  { label: "Kiosk", hint: "Mode", to: "/kiosk" },
  { label: "Barber mode", hint: "Mode", to: "/me" },
];

/** Ctrl+K (or ⌘K) opens a search over screens and clients, for a front desk that lives on the keyboard. */
export function QuickFind() {
  const navigate = useNavigate();
  const { clients } = useStore();
  const dialog = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const items = useMemo(() => {
    const all: Item[] = [...SCREENS, ...clients.map((c) => ({ label: c.name, hint: c.phone, to: `/app/clients/${c.id}` }))];
    const needle = q.trim().toLowerCase();
    const digits = needle.replace(/\D/g, "");
    return (needle ? all.filter((i) => i.label.toLowerCase().includes(needle) || (digits.length > 2 && i.hint.replace(/\D/g, "").includes(digits))) : SCREENS).slice(0, 8);
  }, [q, clients]);

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
        Find <kbd>Ctrl K</kbd>
      </button>
      <dialog ref={dialog} className="quickfind" aria-label="Find a client or screen">
        <form method="dialog" onSubmit={(e) => (e.preventDefault(), go(items[active]))}>
          <label className="visually-hidden" htmlFor="qf-input">
            Search
          </label>
          <input
            id="qf-input"
            className="ui-input"
            autoFocus
            autoComplete="off"
            placeholder="Name, phone or screen"
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
            {items.length === 0 && <li className="quickfind__none">Nothing matches. Try a phone number.</li>}
            {items.map((i, n) => (
              <li key={i.to} id={`qf-${n}`} role="option" aria-selected={n === active} onMouseEnter={() => setActive(n)} onClick={() => go(i)}>
                <strong>{i.label}</strong>
                <span>{i.hint}</span>
              </li>
            ))}
          </ul>
          <p className="quickfind__help">Arrow keys to move, Enter to open, Esc to close.</p>
        </form>
      </dialog>
    </>
  );
}
