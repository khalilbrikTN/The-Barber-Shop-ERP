import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useSettings } from "../lib/settings";
import { resetSampleData } from "../lib/store";

const NAV = [
  { to: "/app", label: "Today", end: true },
  { to: "/app/calendar", label: "Calendar" },
  { to: "/app/queue", label: "Queue" },
  { to: "/app/clients", label: "Clients" },
  { to: "/app/checkout", label: "Checkout" },
  { to: "/app/money", label: "Money" },
  { to: "/app/team", label: "Team" },
  { to: "/app/marketing", label: "Marketing" },
  { to: "/app/website", label: "Website" },
  { to: "/app/settings", label: "Settings" },
];

const MODES = [
  { to: "/me", label: "Barber mode" },
  { to: "/kiosk", label: "Kiosk" },
  { to: "/tv", label: "TV board" },
  { to: "/s/example-barbers", label: "Shop website" },
  { to: "/admin", label: "Platform admin" },
];

export function AppShell() {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <div className="app-root app-shell">
      <a className="skip" href="#app-main">
        Skip to content
      </a>
      <aside className="app-side" data-open={open || undefined}>
        <div className="app-side__top">
          <Link to="/app" className="app-side__shop">
            {settings.shopName}
          </Link>
          <button type="button" className="ui-btn ui-btn--quiet app-side__menu" aria-expanded={open} aria-controls="app-nav" onClick={() => setOpen((o) => !o)}>
            {open ? "Close" : "Menu"}
          </button>
        </div>
        <nav id="app-nav" className="app-side__nav" aria-label="App">
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.end} className="app-side__link">
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <p className="app-side__group">Other screens</p>
          <ul>
            {MODES.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="app-side__link app-side__link--quiet">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="app-side__foot">
            <p>Sample data. Preview a screen’s data states:</p>
            <p className="app-side__states">
              <Link to="?">Full</Link>
              <Link to="?state=loading">Loading</Link>
              <Link to="?state=empty">Empty</Link>
              <Link to="?state=error">Error</Link>
            </p>
            <button type="button" className="app-side__reset" onClick={resetSampleData}>
              Reset sample data
            </button>
          </div>
        </nav>
      </aside>
      <main id="app-main" className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
