import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSession } from "../../lib/session";
import { useT } from "../i18n";
import { AuthFrame } from "./parts";

export function SignOut() {
  const { t } = useT();
  const { staff, signOut } = useSession();
  const [params] = useSearchParams();
  const why = params.get("raison");

  useEffect(() => {
    if (staff) signOut();
    document.title = `${t("auth.outTitle")}, Chairside`;
  }, [staff, signOut, t]);

  return (
    <AuthFrame>
      <section className="auth__step" aria-labelledby="out-title">
        <h1 id="out-title">{t("auth.outTitle")}</h1>
        <p role="status">{why === "supprime" ? t("auth.outDeleted") : why === "partout" ? t("auth.outAll") : t("auth.outBody")}</p>
        <p className="app-quiet">{t("auth.outShared")}</p>
        <div className="rebook">
          <Link className="ui-btn ui-btn--primary" to="/connexion">
            {t("auth.signInAgain")}
          </Link>
          <Link className="ui-btn ui-btn--quiet" to="/">
            {t("auth.backSite")}
          </Link>
        </div>
      </section>
    </AuthFrame>
  );
}
