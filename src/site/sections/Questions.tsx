const QA = [
  { q: "Do barbers get their own booking link?", a: "Yes. Each barber gets one for their Instagram bio." },
  { q: "Can I bring my clients from another app?", a: "Yes, from a CSV export." },
  { q: "Does it work with cash?", a: "Yes. Cash shows up in the evening cash-up." },
  { q: "How do clients pay deposits?", a: "Straight to your account, through Stripe or a local gateway." },
];

export function Questions() {
  return (
    <section className="questions" id="questions" aria-labelledby="questions-title">
      <div className="container questions__grid">
        <h2 id="questions-title">Before you switch</h2>
        <dl className="questions__rows">
          {QA.map((x) => (
            <div key={x.q} className="questions__row">
              <dt>{x.q}</dt>
              <dd>{x.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
