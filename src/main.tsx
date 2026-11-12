import { ComponentType, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, Outlet, RouterProvider, ScrollRestoration, useParams } from "react-router-dom";
import { SettingsProvider } from "./lib/settings";
import { StoreProvider } from "./lib/store";
import { LangProvider } from "./lib/i18n";
import { SessionProvider } from "./lib/session";
import { StaffOnly } from "./app/auth/StaffOnly";
import { NotFound, RouteError } from "./ui/Errors";
import "./styles/page.css";
import "./styles/pages.css";
import "./app/styles/app.css";

const SHOP = "/s/barbier-exemple";

/* Each area loads its own code, so a client opening a shop's booking page never downloads the business app. */
const page = <T,>(load: () => Promise<T>, pick: (m: T) => ComponentType) => async () => ({ Component: pick(await load()) });

/** Every page starts at the top; back and forward return to where you were. */
function Root() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <RouteError />,
    children: [
      { path: "/", lazy: page(() => import("./site/Landing"), (m) => m.default) },
      { path: "/pricing", lazy: page(() => import("./site/PricingPage"), (m) => m.PricingPage) },
      { path: "/switch", lazy: page(() => import("./site/SwitchPage"), (m) => m.SwitchPage) },
      { path: "/help", lazy: page(() => import("./site/HelpPage"), (m) => m.HelpPage) },
      { path: "/conditions", lazy: page(() => import("./site/TermsPage"), (m) => m.TermsPage) },
      { path: "/connexion", lazy: page(() => import("./app/auth/SignIn"), (m) => m.SignIn) },
      { path: "/inscription", lazy: page(() => import("./app/auth/SignUp"), (m) => m.SignUp) },
      { path: "/deconnexion", lazy: page(() => import("./app/auth/SignOut"), (m) => m.SignOut) },
      { path: "/login", element: <Navigate to="/connexion" replace /> },
      { path: "/signup", element: <Navigate to="/inscription" replace /> },
      { path: "/logout", element: <Navigate to="/deconnexion" replace /> },
      {
        /* everything the team uses needs someone signed in */
        element: <StaffOnly />,
        children: [
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
              { path: "compte", lazy: page(() => import("./app/screens/MyAccount"), (m) => m.MyAccount) },
              { path: "*", element: <NotFound inApp /> },
            ],
          },
          { path: "/setup", lazy: page(() => import("./app/screens/Setup"), (m) => m.Setup) },
          { path: "/me", lazy: page(() => import("./modes/BarberMode"), (m) => m.BarberMode) },
          { path: "/kiosk", lazy: page(() => import("./modes/Kiosk"), (m) => m.Kiosk) },
          { path: "/tv", lazy: page(() => import("./modes/TV"), (m) => m.TV) },
        ],
      },
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
        <SessionProvider>
          <LangProvider>
            <RouterProvider router={router} />
          </LangProvider>
        </SessionProvider>
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
