import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "../../lib/session";

/** Staff screens need someone signed in; a new owner finishes the setup wizard before anything else. */
export function StaffOnly() {
  const { staff } = useSession();
  const location = useLocation();
  if (!staff) return <Navigate to={`/connexion?suite=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (!staff.shopReady && location.pathname !== "/setup") return <Navigate to="/setup" replace />;
  return <Outlet />;
}
