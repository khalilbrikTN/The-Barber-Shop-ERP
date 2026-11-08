import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { SettingsProvider } from "./lib/settings";
import { StoreProvider } from "./lib/store";
import Landing from "./site/Landing";
import { PricingPage } from "./site/PricingPage";
import { SwitchPage } from "./site/SwitchPage";
import { AppShell } from "./app/AppShell";
import { Today } from "./app/screens/Today";
import { Calendar } from "./app/screens/Calendar";
import { Queue } from "./app/screens/Queue";
import { Clients } from "./app/screens/Clients";
import { ClientProfile } from "./app/screens/ClientProfile";
import { ClientImport } from "./app/screens/ClientImport";
import { Checkout } from "./app/screens/Checkout";
import { Money } from "./app/screens/Money";
import { Team } from "./app/screens/Team";
import { StaffProfile } from "./app/screens/StaffProfile";
import { Marketing } from "./app/screens/Marketing";
import { Website } from "./app/screens/Website";
import { SettingsScreen } from "./app/screens/Settings";
import { Setup } from "./app/screens/Setup";
import { BarberMode } from "./modes/BarberMode";
import { Kiosk } from "./modes/Kiosk";
import { TV } from "./modes/TV";
import { ShopSite } from "./shop/ShopSite";
import { Book } from "./shop/Book";
import { Booked } from "./shop/Booked";
import { Manage } from "./shop/Manage";
import { JoinQueue } from "./shop/JoinQueue";
import { Login } from "./account/Login";
import { Account } from "./account/Account";
import { Admin } from "./admin/Admin";
import "./styles/page.css";
import "./styles/pages.css";
import "./app/styles/app.css";

const SHOP = "/s/example-barbers";

const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/pricing", element: <PricingPage /> },
  { path: "/switch", element: <SwitchPage /> },
  {
    path: "/app",
    element: <AppShell />,
    children: [
      { index: true, element: <Today /> },
      { path: "calendar", element: <Calendar /> },
      { path: "queue", element: <Queue /> },
      { path: "clients", element: <Clients /> },
      { path: "clients/import", element: <ClientImport /> },
      { path: "clients/:id", element: <ClientProfile /> },
      { path: "checkout", element: <Checkout /> },
      { path: "money", element: <Money /> },
      { path: "team", element: <Team /> },
      { path: "team/:id", element: <StaffProfile /> },
      { path: "marketing", element: <Marketing /> },
      { path: "website", element: <Website /> },
      { path: "settings", element: <SettingsScreen /> },
    ],
  },
  { path: "/setup", element: <Setup /> },
  { path: "/me", element: <BarberMode /> },
  { path: "/kiosk", element: <Kiosk /> },
  { path: "/tv", element: <TV /> },
  { path: SHOP, element: <ShopSite /> },
  { path: `${SHOP}/book`, element: <Book /> },
  { path: `${SHOP}/booked/:id`, element: <Booked /> },
  { path: `${SHOP}/manage/:id`, element: <Manage /> },
  { path: `${SHOP}/queue`, element: <JoinQueue /> },
  { path: "/b/:staff", element: <BarberLink /> },
  { path: "/account/login", element: <Login /> },
  { path: "/account", element: <Account /> },
  { path: "/admin", element: <Admin /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);

function BarberLink() {
  const staff = window.location.pathname.split("/").pop();
  return <Navigate to={`${SHOP}/book?staff=${staff}`} replace />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SettingsProvider>
      <StoreProvider>
        <RouterProvider router={router} />
      </StoreProvider>
    </SettingsProvider>
  </StrictMode>,
);
