import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

export function NotFound({ inApp = false }: { inApp?: boolean }) {
  return (
    <main className="app-root errorpage" id="main">
      <p className="errorpage__code num">404</p>
      <h1>There is no page here</h1>
      <p>The link may be old, or a letter may be missing from it.</p>
      <div className="rebook">
        <Link className="ui-btn ui-btn--primary" to={inApp ? "/app" : "/"}>
          {inApp ? "Back to Today" : "Go to the home page"}
        </Link>
        <Link className="ui-btn ui-btn--quiet" to="/s/example-barbers">
          Open the shop’s page
        </Link>
      </div>
    </main>
  );
}

export function RouteError() {
  const err = useRouteError();
  if (isRouteErrorResponse(err) && err.status === 404) return <NotFound />;
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  return (
    <main className="app-root errorpage" id="main" role="alert">
      <p className="errorpage__code num">{offline ? "Offline" : "Error"}</p>
      <h1>{offline ? "This screen needs a connection" : "This screen stopped working"}</h1>
      <p>{offline ? "Screens you have opened before still work. Reconnect to load this one." : "Nothing you saved is lost. Reload the page; if it happens again, tell us what you clicked."}</p>
      <div className="rebook">
        <button type="button" className="ui-btn ui-btn--primary" onClick={() => window.location.reload()}>
          Reload
        </button>
        <Link className="ui-btn ui-btn--quiet" to="/app">
          Back to Today
        </Link>
      </div>
    </main>
  );
}
