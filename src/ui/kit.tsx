import { ReactNode, useId } from "react";
import { Link, useSearchParams } from "react-router-dom";

export type DataState = "full" | "loading" | "empty" | "error";

/** Every data region previews its four states through ?state= in the URL. */
export function useDataState(): DataState {
  const [params] = useSearchParams();
  const s = params.get("state");
  return s === "loading" || s === "empty" || s === "error" ? s : "full";
}

type RegionProps = {
  state: DataState;
  label: string;
  rows?: number;
  empty: { title: string; body: string; action?: ReactNode };
  error?: string;
  skeleton?: ReactNode;
  children: ReactNode;
};

export function Region({ state, label, rows = 4, empty, error, skeleton, children }: RegionProps) {
  if (state === "loading" && skeleton)
    return (
      <div role="status" aria-label={`Loading ${label}`}>
        {skeleton}
      </div>
    );
  if (state === "loading")
    return (
      <div className="ui-skeleton" role="status" aria-label={`Loading ${label}`}>
        {Array.from({ length: rows }, (_, i) => (
          <span key={i} className="ui-skeleton__row" />
        ))}
      </div>
    );
  if (state === "error")
    return (
      <div className="ui-note ui-note--error" role="alert">
        <p className="ui-note__title">{label} did not load</p>
        <p>{error ?? "The connection dropped. Your data is safe; try again in a moment."}</p>
        <Link className="ui-btn ui-btn--quiet" to="?">
          Try again
        </Link>
      </div>
    );
  if (state === "empty")
    return (
      <div className="ui-note">
        <p className="ui-note__title">{empty.title}</p>
        <p>{empty.body}</p>
        {empty.action}
      </div>
    );
  return <>{children}</>;
}

export function PageHead({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <header className="ui-pagehead">
      <div>
        <h1>{title}</h1>
        {sub && <p className="ui-pagehead__sub">{sub}</p>}
      </div>
      {actions && <div className="ui-pagehead__actions">{actions}</div>}
    </header>
  );
}

export function Tabs({ param = "tab", tabs }: { param?: string; tabs: { id: string; label: string }[] }) {
  const [params, setParams] = useSearchParams();
  const current = params.get(param) ?? tabs[0].id;
  return (
    <div className="ui-tabs" role="tablist" aria-label="Sections">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={current === t.id}
          className="ui-tab"
          onClick={() => {
            const next = new URLSearchParams(params);
            next.set(param, t.id);
            setParams(next, { replace: true });
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function useTab(param = "tab", fallback: string) {
  const [params] = useSearchParams();
  return params.get(param) ?? fallback;
}

type FieldProps = {
  label: string;
  hint?: string;
  children: (id: string, hintId?: string) => ReactNode;
};

export function Field({ label, hint, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="ui-field">
      <label htmlFor={id}>{label}</label>
      {children(id, hintId)}
      {hint && (
        <p className="ui-field__hint" id={hintId}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="ui-stat">
      <span className="ui-stat__label">{label}</span>
      <strong className="ui-stat__value num">{value}</strong>
      {sub && <span className="ui-stat__sub">{sub}</span>}
    </div>
  );
}

export function Status({ value }: { value: string }) {
  return <span className={`ui-status ui-status--${value.replace(/\s+/g, "-")}`}>{value}</span>;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="ui-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function NotConnected({ what }: { what: string }) {
  return <p className="ui-notconnected">Kept in this tab only: {what} is not connected to a server yet.</p>;
}
