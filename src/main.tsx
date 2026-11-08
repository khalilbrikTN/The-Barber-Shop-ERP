import { ComponentType, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider, useParams } from "react-router-dom";
import { SettingsProvider } from "./lib/settings";
import { StoreProvider } from "./lib/store";
import { LangProvider } from "./lib/i18n";
import { NotFound, RouteError } from "./ui/Errors";
import "./styles/page.css";
import "./styles/pages.css";
import "./app/styles/app.css";

const SHOP = "/s/example-barbers";

/* Each area loads its own code, so a client opening a shop's booking page never downloads the business app. */
const page = <T,>(load: () => Promise<T>, pick: (m: T) => ComponentType) => async () => ({ Component: pick(await load()) });

const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      { path: "/", lazy: page(() => import("./site/Landing"), (m) => m.default) },
      { path: "/pricing", lazy: page(() => import("./site/PricingPage"), (m) => m.PricingPage) },
      { path: "/switch", lazy: page(() => import("./site/SwitchPage"), (m) => m.SwitchPage) },
      { path: "/help", lazy: page(() => import("./site/HelpPage"), (m) => m.HelpPage) },
      {
        path: "/app",
        lazy: page(() => import("./app/AppShell"), (m) => m.AppShell),
        children: [
          { index: true, lazy: page(() => import("./app/screens/Today"), (m) => m.Today) },
          { path: "calendar", lazy: page(() => import("./app/screens/Calendar"), (m) => m.Calendar) },
          { path: "queue", lazy: page(() => import("./app/screens/Queue"), (m) => m.Queue) },
          { path: "clients", lazy: page(() => import("./app/screens/Clients"), (m) => m.Clients) },
          { path: "clients/import", lazy: page(() => import("./app/screens/ClientImport"), (m) => m.ClientImport) },
          { path: "clients/:id", lazy: page(() => import("./app/screens/ClientProfile"), (m) => m.ClientProfile) },
          { path: "checkout", lazy: page(() => import("./app/screens/Checkout"), (m) => m.Checkout) },
          { path: "money", lazy: page(() => import("./app/screens/Money"), (m) => m.Money) },
          { path: "team", lazy: page(() => import("./app/screens/Team"), (m) => m.Team) },
          { path: "team/:id", lazy: page(() => import("./app/screens/StaffProfile"), (m) => m.StaffProfile) },
          { path: "marketing", lazy: page(() => import("./app/screens/Marketing"), (m) => m.Marketing) },
          { path: "website", lazy: page(() => import("./app/screens/Website"), (m) => m.Website) },
          { path: "settings", lazy: page(() => import("./app/screens/Settings"), (m) => m.SettingsScreen) },
          { path: "*", element: <NotFound inApp /> },
        ],
      },
      { path: "/setup", lazy: page(() => import("./app/screens/Setup"), (m) => m.Setup) },
      { path: "/me", lazy: page(() => import("./modes/BarberMode"), (m) => m.BarberMode) },
      { path: "/kiosk", lazy: page(() => import("./modes/Kiosk"), (m) => m.Kiosk) },
      { path: "/tv", lazy: page(() => import("./modes/TV"), (m) => m.TV) },
      { path: SHOP, lazy: page(() => import("./shop/ShopSite"), (m) => m.ShopSite) },
      { path: `${SHOP}/book`, lazy: page(() => import("./shop/Book"), (m) => m.Book) },
      { path: `${SHOP}/booked/:id`, lazy: page(() => import("./shop/Booked"), (m) => m.Booked) },
      { path: `${SHOP}/manage/:id`, lazy: page(() => import("./shop/Manage"), (m) => m.Manage) },
      { path: `${SHOP}/queue`, lazy: page(() => import("./shop/JoinQueue"), (m) => m.JoinQueue) },
      { path: "/b/:staff", element: <BarberLink /> },
      { path: "/account/login", lazy: page(() => import("./account/Login"), (m) => m.Login) },
      { path: "/account", lazy: page(() => import("./account/Account"), (m) => m.Account) },
      { path: "/admin", lazy: page(() => import("./admin/Admin"), (m) => m.Admin) },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function BarberLink() {
  const { staff } = useParams();
  return <Navigate to={`${SHOP}/book?staff=${staff ?? ""}`} replace />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SettingsProvider>
      <StoreProvider>
        <LangProvider>
          <RouterProvider router={router} />
        </LangProvider>
      </StoreProvider>
    </SettingsProvider>
  </StrictMode>,
);

/* Barber mode and the day's screens keep working on a flaky shop connection once loaded. */
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline support is a bonus; the app works without it */
    });
  });
}
