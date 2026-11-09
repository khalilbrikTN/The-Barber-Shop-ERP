import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useSettings } from "../lib/settings";
import { resetSampleData } from "../lib/store";
import { TextKey, useT } from "./i18n";
import { QuickFind } from "./QuickFind";

const NAV: { to: string; label: TextKey; end?: boolean }[] = [
  { to: "/app", label: "nav.today", end: true },
  { to: "/app/calendar", label: "nav.calendar" },
  { to: "/app/queue", label: "nav.queue" },
  { to: "/app/clients", label: "nav.clients" },
  { to: "/app/checkout", label: "nav.checkout" },
  { to: "/app/money", label: "nav.money" },
  { to: "/app/team", label: "nav.team" },
  { to: "/app/marketing", label: "nav.marketing" },
  { to: "/app/website", label: "nav.website" },
  { to: "/app/settings", label: "nav.settings" },
];

const MODES: { to: string; label: TextKey }[] = [
  { to: "/me", label: "nav.barberMode" },
  { to: "/kiosk", label: "nav.kiosk" },
  { to: "/tv", label: "nav.tv" },
  { to: "/s/example-barbers", label: "nav.shopSite" },
  { to: "/admin", label: "nav.admin" },
];

export function AppShell() {
  const { settings } = useSettings();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <div className="app-root app-shell">
      <a className="skip" href="#app-main">
        {t("shell.skip")}
      </a>
      <aside className="app-side" data-open={open || undefined}>
        <div className="app-side__top">
          <Link to="/app" className="app-side__shop">
            {settings.shopName}
          </Link>
          <button type="button" className="ui-btn ui-btn--quiet app-side__menu" aria-expanded={open} aria-controls="app-nav" onClick={() => setOpen((o) => !o)}>
            {open ? t("common.close") : t("shell.menu")}
          </button>
        </div>
        <nav id="app-nav" className="app-side__nav" aria-label={t("shell.nav")}>
          <QuickFind />
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.end} className="app-side__link">
                  {t(n.label)}
                </NavLink>
              </li>
            ))}
          </ul>
          <p className="app-side__group">{t("nav.other")}</p>
          <ul>
            {MODES.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="app-side__link app-side__link--quiet">
                  {t(n.label)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="app-side__foot">
            <p>{t("shell.sample")}</p>
            <p className="app-side__states">
              <Link to="?">{t("shell.full")}</Link>
              <Link to="?state=loading">{t("shell.loading")}</Link>
              <Link to="?state=empty">{t("shell.empty")}</Link>
              <Link to="?state=error">{t("shell.error")}</Link>
            </p>
            <button type="button" className="app-side__reset" onClick={resetSampleData}>
              {t("shell.reset")}
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
