import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";
import { useLang } from "../lib/i18n";

export function NotFound({ inApp = false }: { inApp?: boolean }) {
  const { t, lang, dir } = useLang();
  return (
    <main className="app-root errorpage" id="main" lang={lang} dir={dir}>
      <p className="errorpage__code num">404</p>
      <h1>{t("err.404")}</h1>
      <p>{t("err.404Body")}</p>
      <div className="rebook">
        <Link className="ui-btn ui-btn--primary" to={inApp ? "/app" : "/"}>
          {inApp ? t("err.backToday") : t("err.home")}
        </Link>
        <Link className="ui-btn ui-btn--quiet" to="/s/example-barbers">
          {t("err.shop")}
        </Link>
      </div>
    </main>
  );
}

export function RouteError() {
  const err = useRouteError();
  const { t, lang, dir } = useLang();
  if (isRouteErrorResponse(err) && err.status === 404) return <NotFound />;
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  return (
    <main className="app-root errorpage" id="main" role="alert" lang={lang} dir={dir}>
      <p className="errorpage__code num">{offline ? t("err.offline") : t("err.error")}</p>
      <h1>{offline ? t("err.needsNet") : t("err.stopped")}</h1>
      <p>{offline ? t("err.offlineBody") : t("err.stoppedBody")}</p>
      <div className="rebook">
        <button type="button" className="ui-btn ui-btn--primary" onClick={() => window.location.reload()}>
          {t("err.reload")}
        </button>
        <Link className="ui-btn ui-btn--quiet" to="/app">
          {t("err.backToday")}
        </Link>
      </div>
    </main>
  );
}
