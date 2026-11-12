import { ChangeEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { parseCsv } from "../../lib/csv";
import { useStore } from "../../lib/store";
import { Field, NotConnected, PageHead } from "../../ui/kit";
import { TextKey, useT } from "../i18n";

const FIELDS = [
  { id: "name", label: "common.name", guess: /name|nom|nome|client/i },
  { id: "phone", label: "common.phone", guess: /phone|mobile|tel|cell|whatsapp/i },
  { id: "email", label: "common.email", guess: /mail/i },
  { id: "notes", label: "imp.notes", guess: /note|comment/i },
] as const satisfies readonly { id: string; label: TextKey; guess: RegExp }[];
type FieldId = (typeof FIELDS)[number]["id"];

const SAMPLE = 'Nom,Mobile,Email,Notes\n"Karim Trabelsi",+216 20 000 201,karim.t@example.com,"Court derrière et sur les côtés"\nHamza,+216 20 000 104,,"Déjà client : reconnu par le téléphone"\n"Amel B.",+216 20 000 203,amel@example.com,\n';

export function ClientImport() {
  const { clients, importClients } = useStore();
  const { t, tp } = useT();
  const [rows, setRows] = useState<string[][]>([]);
  const [fileName, setFileName] = useState("");
  const [map, setMap] = useState<Record<FieldId, number>>({ name: -1, phone: -1, email: -1, notes: -1 });
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ added: number; matched: number } | null>(null);

  function load(text: string, name: string) {
    const parsed = parseCsv(text);
    if (parsed.length < 2) {
      setError(t("imp.errEmpty"));
      setRows([]);
      return;
    }
    setError("");
    setResult(null);
    setFileName(name);
    setRows(parsed);
    const head = parsed[0];
    const guess = {} as Record<FieldId, number>;
    FIELDS.forEach((f) => (guess[f.id] = head.findIndex((h) => f.guess.test(h))));
    setMap(guess);
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.(csv|txt)$/i.test(file.name)) {
      setError(t("imp.errType"));
      return;
    }
    file.text().then((t) => load(t, file.name));
  }

  const digits = (x: string) => x.replace(/\D/g, "");
  const preview = useMemo(() => {
    if (rows.length < 2) return [];
    return rows.slice(1).map((r) => {
      const get = (id: FieldId) => (map[id] >= 0 ? r[map[id]] ?? "" : "");
      const phone = get("phone");
      const issue = !get("name") ? "noName" : digits(phone).length < 8 ? "noPhone" : clients.some((c) => digits(c.phone) === digits(phone)) ? "matched" : "";
      return { name: get("name"), phone, email: get("email"), notes: get("notes"), issue };
    });
  }, [rows, map, clients]);

  const ready = preview.filter((p) => !p.issue || p.issue === "matched");
  const canImport = map.name >= 0 && map.phone >= 0 && ready.length > 0;

  return (
    <>
      <PageHead
        title={t("imp.title")}
        sub={t("imp.sub")}
        actions={
          <Link className="ui-btn ui-btn--quiet" to="/app/clients">
            {t("cp.back")}
          </Link>
        }
      />

      <div className="app-split">
        <section className="app-section" aria-labelledby="file-title">
          <h2 id="file-title" className="app-h2">
            {t("imp.step1")}
          </h2>
          <div className="rebook">
            <Field label={t("imp.file")}>{(id) => <input id={id} className="ui-file" type="file" accept=".csv,text/csv,.txt" onChange={onFile} />}</Field>
          </div>
          <button type="button" className="ui-btn ui-btn--text" onClick={() => load(SAMPLE, "sample.csv")}>
            {t("imp.sample")}
          </button>
          {error && (
            <p className="ui-error" role="alert">
              {error}
            </p>
          )}

          {rows.length > 1 && (
            <>
              <h2 className="app-h2 import__step">{t("imp.step2", { file: fileName })}</h2>
              <div className="add-row">
                {FIELDS.map((f) => (
                  <Field key={f.id} label={t(f.label)}>
                    {(id) => (
                      <select id={id} className="ui-input" value={map[f.id]} onChange={(e) => setMap((m) => ({ ...m, [f.id]: Number(e.target.value) }))}>
                        <option value={-1}>{t("imp.notInFile")}</option>
                        {rows[0].map((h, i) => (
                          <option key={i} value={i}>
                            {h || t("imp.column", { n: i + 1 })}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                ))}
              </div>

              <h2 className="app-h2 import__step">{t("imp.step3")}</h2>
              <div className="ui-tablewrap">
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th scope="col">{t("common.name")}</th>
                      <th scope="col">{t("common.phone")}</th>
                      <th scope="col">{t("common.email")}</th>
                      <th scope="col">{t("imp.what")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 50).map((p, i) => (
                      <tr key={i}>
                        <th scope="row">{p.name || t("imp.missing")}</th>
                        <td className="num">{p.phone || t("imp.missing")}</td>
                        <td>{p.email || t("common.none")}</td>
                        <td data-warn={p.issue === "noName" || p.issue === "noPhone" || undefined}>{p.issue === "matched" ? t("imp.matched") : p.issue === "noName" ? t("imp.skippedName") : p.issue === "noPhone" ? t("imp.skippedPhone") : t("imp.added")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <section className="app-section app-panel" aria-labelledby="sum-title">
          <h2 id="sum-title" className="app-h2">
            {t("imp.summary")}
          </h2>
          {rows.length < 2 ? (
            <p className="app-quiet">{t("imp.howTo")}</p>
          ) : (
            <>
              <dl className="ui-dl">
                <div>
                  <dt>{t("imp.rows")}</dt>
                  <dd className="num">{preview.length}</dd>
                </div>
                <div>
                  <dt>{t("imp.new")}</dt>
                  <dd className="num">{preview.filter((p) => !p.issue).length}</dd>
                </div>
                <div>
                  <dt>{t("imp.already")}</dt>
                  <dd className="num">{preview.filter((p) => p.issue === "matched").length}</dd>
                </div>
                <div>
                  <dt>{t("imp.skipped")}</dt>
                  <dd className="num">{preview.filter((p) => p.issue === "noName" || p.issue === "noPhone").length}</dd>
                </div>
              </dl>
              <button type="button" className="ui-btn ui-btn--primary ui-btn--block import__go" disabled={!canImport || !!result} onClick={() => setResult(importClients(ready))}>
                {tp("imp.go", preview.filter((p) => !p.issue).length)}
              </button>
              {!canImport && <p className="ui-error">{t("imp.needCols")}</p>}
              {result && (
                <>
                  <p className="ui-live" role="status">
                    {t("imp.result", { added: result.added, matched: result.matched })}
                  </p>
                  <NotConnected what={t("imp.thing")} />
                  <Link className="app-more" to="/app/clients?segment=New">
                    {t("imp.seeNew")}
                  </Link>
                </>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
