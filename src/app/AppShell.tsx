import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { StaffRole, useSession } from "../lib/session";
import { useSettings } from "../lib/settings";
import { resetSampleData } from "../lib/store";
import { TextKey, useT } from "./i18n";
import { QuickFind } from "./QuickFind";
import { Region } from "../ui/kit";

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

/** Screens each role opens; the owner opens all of them. Matches the grid in Team, Roles. */
const ALLOWED: Record<Exclude<StaffRole, "Owner">, string[]> = {
  "Front desk": ["/app", "/app/calendar", "/app/queue", "/app/clients", "/app/checkout", "/app/money", "/app/compte", "/me", "/kiosk", "/tv", "/s/"],
  Barber: ["/app", "/app/calendar", "/app/queue", "/app/clients", "/app/checkout", "/app/compte", "/me", "/s/"],
  Stylist: ["/app", "/app/calendar", "/app/queue", "/app/clients", "/app/checkout", "/app/compte", "/me", "/s/"],
};

export function canOpen(role: StaffRole, path: string) {
  if (role === "Owner") return true;
  return ALLOWED[role].some((p) => (p === "/app" ? path === "/app" || path === "/app/" : path === p || path.startsWith(p.endsWith("/") ? p : `${p}/`)));
}

const MODES: { to: string; label: TextKey }[] = [
  { to: "/me", label: "nav.barberMode" },
  { to: "/kiosk", label: "nav.kiosk" },
  { to: "/tv", label: "nav.tv" },
  { to: "/s/barbier-exemple", label: "nav.shopSite" },
  { to: "/admin", label: "nav.admin" },
];

export function AppShell() {
  const { settings } = useSettings();
  const { t, label } = useT();
  const { staff } = useSession();
  const role = staff?.role ?? "Owner";
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    document.title = `${settings.shopName}, Chairside`;
  }, [settings.shopName]);

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
            {NAV.filter((n) => canOpen(role, n.to)).map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.end} className="app-side__link">
                  {t(n.label)}
                </NavLink>
              </li>
            ))}
          </ul>
          <p className="app-side__group">{t("nav.other")}</p>
          <ul>
            {MODES.filter((n) => canOpen(role, n.to)).map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="app-side__link app-side__link--quiet">
                  {t(n.label)}
                </Link>
              </li>
            ))}
          </ul>
          {staff && (
            <div className="app-side__me">
              <strong>{staff.name}</strong>
              <span>{label("role", staff.role)}</span>
              <p className="app-side__me-links">
                <Link to="/app/compte">{t("shell.account")}</Link>
                <Link to="/deconnexion">{t("shell.signOut")}</Link>
              </p>
            </div>
          )}
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
        {canOpen(role, location.pathname) ? (
          <Outlet />
        ) : (
          <Region state="empty" label={t("shell.noAccess")} empty={{ title: t("shell.noAccess"), body: t("shell.noAccessBody"), action: <Link className="ui-btn ui-btn--quiet" to="/app">{t("common.backToday")}</Link> }}>
            {null}
          </Region>
        )}
      </main>
    </div>
  );
}
