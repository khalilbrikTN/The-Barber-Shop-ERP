const QA = [
  { q: "Chaque barbier a-t-il son propre lien de réservation ?", a: "Oui. Chacun en a un pour sa bio Instagram." },
  { q: "Puis-je reprendre mes clients d’une autre application ?", a: "Oui, depuis un export CSV." },
  { q: "Ça marche avec les espèces ?", a: "Oui. Les espèces apparaissent dans la clôture de caisse du soir." },
  { q: "Comment les clients paient-ils les acomptes ?", a: "Directement sur votre compte, via une passerelle de paiement tunisienne comme Konnect." },
];

export function Questions() {
  return (
    <section className="questions" id="questions" aria-labelledby="questions-title">
      <div className="container questions__grid">
        <h2 id="questions-title">Avant de vous lancer</h2>
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
