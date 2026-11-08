import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SiteFooter, SiteNav } from "./Chrome";

type Article = { topic: string; q: string; a: string; link?: { to: string; label: string } };

const ARTICLES: Article[] = [
  { topic: "Getting started", q: "How long does setting up take?", a: "About ten minutes: pick barbershop or salon, untick the services you do not offer, set your hours and add your team. Your booking link works straight away.", link: { to: "/setup", label: "Open the setup" } },
  { topic: "Getting started", q: "Can I bring my clients from another app?", a: "Yes. Export a CSV from your current app, then import it. Clients are matched by phone number, so nobody is added twice.", link: { to: "/switch", label: "How switching works" } },
  { topic: "Getting started", q: "Which countries and currencies work?", a: "Any. Each shop sets its own currency, time zone, week start and tax. Egypt, Tunisia, Italy, France and Germany fill these in for you." },
  { topic: "Bookings", q: "How do clients book?", a: "From your shop’s page, a barber's personal link, or a link you send on WhatsApp. They pick services, a barber or anyone, a time, and give a name and phone." },
  { topic: "Bookings", q: "What stops no-shows?", a: "Reminders a day and two hours before, a deposit on long services, and an automatic deposit for clients with two or more no-shows." },
  { topic: "Bookings", q: "Can a stylist take another client while colour develops?", a: "Yes. Mark the processing time on the service, and the calendar lets you book someone into it." },
  { topic: "Walk-ins", q: "How does the walk-in queue work?", a: "Clients join from a QR code on your window, a tablet at the door, or your website. The TV board shows who is next, and their phone gets a message when they are second." },
  { topic: "Walk-ins", q: "Do appointments and walk-ins clash?", a: "No. Bookings keep their times, and walk-ins fill the gaps between them." },
  { topic: "Money", q: "Do you take a cut of bookings?", a: "No. You pay the monthly price and nothing per booking, new clients included.", link: { to: "/pricing", label: "See the prices" } },
  { topic: "Money", q: "How do deposits reach me?", a: "Straight into your own Stripe, Paymob or Konnect account. We never hold your money." },
  { topic: "Money", q: "Does it replace my fiscal till?", a: "Not yet. Where the law asks for a certified till (Germany, France, Italy), keep giving receipts from it until our connection for your country is ready." },
  { topic: "Your data", q: "What happens if I leave?", a: "Download your clients, bookings and sales in one file from Settings. They are yours." },
  { topic: "Your data", q: "Who can see my clients?", a: "Only your team, with the permissions you give each role. Other shops never see them, even when a client books at both." },
];

const TOPICS = Array.from(new Set(ARTICLES.map((a) => a.topic)));

export function HelpPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  useEffect(() => {
    document.title = "Help, Chairside";
  }, []);
  const hits = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? ARTICLES.filter((a) => `${a.q} ${a.a}`.toLowerCase().includes(needle)) : ARTICLES;
  }, [q]);

  return (
    <>
      <SiteNav />
      <main id="main">
        <section className="page-hero" aria-labelledby="help-title">
          <div className="container">
            <h1 id="help-title">Running your shop on Chairside</h1>
            <label className="help__search">
              <span>Search the answers</span>
              <input className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="deposits, walk-ins, import" />
            </label>
          </div>
        </section>

        <section className="help" aria-label="Answers">
          <div className="container">
            {hits.length === 0 ? (
              <p className="help__none" role="status">
                Nothing matches “{q}”. Try a shorter word, or ask us on WhatsApp.
              </p>
            ) : (
              TOPICS.filter((t) => hits.some((h) => h.topic === t)).map((t) => (
                <div key={t} className="help__group">
                  <h2>{t}</h2>
                  <div className="help__list">
                    {hits
                      .filter((h) => h.topic === t)
                      .map((h) => (
                        <details key={h.q} className="help__item" open={!!q.trim() || !!open[h.q]} onToggle={(e) => setOpen((o) => ({ ...o, [h.q]: (e.target as HTMLDetailsElement).open }))}>
                          <summary>{h.q}</summary>
                          {(!!q.trim() || open[h.q]) && (
                            <>
                              <p>{h.a}</p>
                              {h.link && (
                                <Link className="help__link" to={h.link.to}>
                                  {h.link.label}
                                </Link>
                              )}
                            </>
                          )}
                        </details>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
