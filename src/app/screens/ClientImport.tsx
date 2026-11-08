import { ChangeEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../lib/store";
import { Field, NotConnected, PageHead } from "../../ui/kit";

/** Small CSV reader: commas or semicolons, quoted fields, doubled quotes. Enough for exports from booking apps and spreadsheets. */
function parseCsv(text: string): string[][] {
  const sep = (text.split("\n")[0].match(/;/g)?.length ?? 0) > (text.split("\n")[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) {
      row.push(cell.trim());
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell.trim());
      if (row.some((c) => c)) rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  row.push(cell.trim());
  if (row.some((c) => c)) rows.push(row);
  return rows;
}

const FIELDS = [
  { id: "name", label: "Name", guess: /name|nom|nome|client/i },
  { id: "phone", label: "Phone", guess: /phone|mobile|tel|cell|whatsapp/i },
  { id: "email", label: "Email", guess: /mail/i },
  { id: "notes", label: "Notes", guess: /note|comment/i },
] as const;
type FieldId = (typeof FIELDS)[number]["id"];

const SAMPLE = 'Name,Mobile,Email,Notes\n"Karim Fathy",+20 100 000 0201,karim.f@example.com,"Short back and sides"\nYoussef,+20 100 000 0104,,"Already a client: matched by phone"\n"Mona S.",+20 100 000 0203,mona@example.com,\n';

export function ClientImport() {
  const { clients, importClients } = useStore();
  const [rows, setRows] = useState<string[][]>([]);
  const [fileName, setFileName] = useState("");
  const [map, setMap] = useState<Record<FieldId, number>>({ name: -1, phone: -1, email: -1, notes: -1 });
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ added: number; matched: number } | null>(null);

  function load(text: string, name: string) {
    const parsed = parseCsv(text);
    if (parsed.length < 2) {
      setError("That file has no rows under its header. Export again with your clients included.");
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
      setError("Choose a .csv file. In Excel or Google Sheets, use Save as or Download as CSV.");
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
      const issue = !get("name") ? "No name" : digits(phone).length < 8 ? "No phone" : clients.some((c) => digits(c.phone) === digits(phone)) ? "Already a client" : "";
      return { name: get("name"), phone, email: get("email"), notes: get("notes"), issue };
    });
  }, [rows, map, clients]);

  const ready = preview.filter((p) => !p.issue || p.issue === "Already a client");
  const canImport = map.name >= 0 && map.phone >= 0 && ready.length > 0;

  return (
    <>
      <PageHead
        title="Import clients"
        sub="From a CSV export of another booking app, or a spreadsheet."
        actions={
          <Link className="ui-btn ui-btn--quiet" to="/app/clients">
            Back to clients
          </Link>
        }
      />

      <div className="app-split">
        <section className="app-section" aria-labelledby="file-title">
          <h2 id="file-title" className="app-h2">
            1. Choose the file
          </h2>
          <div className="rebook">
            <Field label="CSV file">{(id) => <input id={id} className="ui-file" type="file" accept=".csv,text/csv,.txt" onChange={onFile} />}</Field>
          </div>
          <button type="button" className="ui-btn ui-btn--text" onClick={() => load(SAMPLE, "sample.csv")}>
            Try a sample file
          </button>
          {error && (
            <p className="ui-error" role="alert">
              {error}
            </p>
          )}

          {rows.length > 1 && (
            <>
              <h2 className="app-h2 import__step">2. Match the columns in {fileName}</h2>
              <div className="add-row">
                {FIELDS.map((f) => (
                  <Field key={f.id} label={f.label}>
                    {(id) => (
                      <select id={id} className="ui-input" value={map[f.id]} onChange={(e) => setMap((m) => ({ ...m, [f.id]: Number(e.target.value) }))}>
                        <option value={-1}>Not in the file</option>
                        {rows[0].map((h, i) => (
                          <option key={i} value={i}>
                            {h || `Column ${i + 1}`}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                ))}
              </div>

              <h2 className="app-h2 import__step">3. Check before importing</h2>
              <div className="ui-tablewrap">
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Phone</th>
                      <th scope="col">Email</th>
                      <th scope="col">What happens</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 50).map((p, i) => (
                      <tr key={i}>
                        <th scope="row">{p.name || "Missing"}</th>
                        <td className="num">{p.phone || "Missing"}</td>
                        <td>{p.email || "None"}</td>
                        <td data-warn={p.issue === "No name" || p.issue === "No phone" || undefined}>{p.issue === "Already a client" ? "Matched, not duplicated" : p.issue ? `Skipped: ${p.issue.toLowerCase()}` : "Added"}</td>
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
            Summary
          </h2>
          {rows.length < 2 ? (
            <p className="app-quiet">Most booking apps export clients from their settings or client list. Name and phone are enough; email and notes come along if they are there.</p>
          ) : (
            <>
              <dl className="ui-dl">
                <div>
                  <dt>Rows in the file</dt>
                  <dd className="num">{preview.length}</dd>
                </div>
                <div>
                  <dt>New clients</dt>
                  <dd className="num">{preview.filter((p) => !p.issue).length}</dd>
                </div>
                <div>
                  <dt>Already clients</dt>
                  <dd className="num">{preview.filter((p) => p.issue === "Already a client").length}</dd>
                </div>
                <div>
                  <dt>Skipped</dt>
                  <dd className="num">{preview.filter((p) => p.issue === "No name" || p.issue === "No phone").length}</dd>
                </div>
              </dl>
              <button type="button" className="ui-btn ui-btn--primary ui-btn--block import__go" disabled={!canImport || !!result} onClick={() => setResult(importClients(ready))}>
                Import {preview.filter((p) => !p.issue).length} clients
              </button>
              {!canImport && <p className="ui-error">Match at least the name and phone columns.</p>}
              {result && (
                <>
                  <p className="ui-live" role="status">
                    {result.added} added, {result.matched} matched to existing clients.
                  </p>
                  <NotConnected what="the import" />
                  <Link className="app-more" to="/app/clients?segment=New">
                    See the new clients
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
