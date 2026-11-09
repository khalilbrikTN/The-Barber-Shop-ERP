import { ReactNode, useId } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useT } from "../app/i18n";

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
  const { t } = useT();
  if (state === "loading" && skeleton)
    return (
      <div role="status" aria-label={t("kit.loading", { label })}>
        {skeleton}
      </div>
    );
  if (state === "loading")
    return (
      <div className="ui-skeleton" role="status" aria-label={t("kit.loading", { label })}>
        {Array.from({ length: rows }, (_, i) => (
          <span key={i} className="ui-skeleton__row" />
        ))}
      </div>
    );
  if (state === "error")
    return (
      <div className="ui-note ui-note--error" role="alert">
        <p className="ui-note__title">{t("kit.failed", { label })}</p>
        <p>{error ?? t("kit.failedBody")}</p>
        <Link className="ui-btn ui-btn--quiet" to="?">
          {t("kit.retry")}
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
  const { t } = useT();
  return (
    <div className="ui-tabs" role="tablist" aria-label={t("kit.sections")}>
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

/** A status chip. Known statuses (bookings, tenants) are translated; anything else shows as given. */
export function Status({ value, label }: { value: string; label?: string }) {
  const { label: dataLabel } = useT();
  return <span className={`ui-status ui-status--${value.replace(/\s+/g, "-")}`}>{label ?? dataLabel("status", value)}</span>;
}

/** A translated string with <b>bold</b> parts, without injecting HTML. */
export function Rich({ text }: { text: string }) {
  return <>{text.split(/(<b>.*?<\/b>)/g).map((part, i) => (part.startsWith("<b>") ? <strong key={i}>{part.slice(3, -4)}</strong> : part))}</>;
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
  const { t } = useT();
  return <p className="ui-notconnected">{t("kit.notConnected", { what })}</p>;
}
