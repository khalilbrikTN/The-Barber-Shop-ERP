const dt = new Intl.NumberFormat("fr-TN", { style: "currency", currency: "TND", maximumFractionDigits: 0 });

function Reminder() {
  return (
    <div className="screen">
      <p className="screen__from">Votre salon</p>
      <p className="screen__title">Samedi, 14:30 avec Karim</p>
      <p className="screen__body">Dégradé et barbe, 45 min. À tout à l’heure.</p>
      <div className="screen__actions">
        <span className="screen__btn screen__btn--fill">Confirmer</span>
        <span className="screen__btn">Changer l’heure</span>
      </div>
      <p className="screen__meta">Envoyé sur WhatsApp à 09:00</p>
    </div>
  );
}

function Queue() {
  return (
    <div className="screen">
      <p className="screen__from">Votre salon, file d’attente</p>
      <p className="screen__figure num">3e</p>
      <p className="screen__title">Environ 25 min</p>
      <p className="screen__body">Nous vous écrirons quand vous serez deuxième.</p>
      <div className="screen__actions">
        <span className="screen__btn">Quitter la file</span>
      </div>
      <p className="screen__meta">Inscrit par QR code à 11:40</p>
    </div>
  );
}

function Refill() {
  return (
    <div className="screen">
      <p className="screen__from">Accueil</p>
      <p className="screen__title">14:30 avec Karim est libre</p>
      <p className="screen__body">Hamza a annulé à 14:12. Proposé à 3 personnes en liste d’attente.</p>
      <dl className="screen__rows">
        <div>
          <dt>Wassim</dt>
          <dd>L’a pris, 14:15</dd>
        </div>
        <div>
          <dt>Nesrine</dt>
          <dd>Prévenue, déjà pris</dd>
        </div>
      </dl>
    </div>
  );
}

function CashUp() {
  return (
    <div className="screen">
      <p className="screen__from">Clôture, samedi</p>
      <dl className="screen__rows">
        <div>
          <dt>Espèces</dt>
          <dd className="num">{dt.format(680)}</dd>
        </div>
        <div>
          <dt>Carte</dt>
          <dd className="num">{dt.format(430)}</dd>
        </div>
        <div>
          <dt>Portefeuille</dt>
          <dd className="num">{dt.format(120)}</dd>
        </div>
      </dl>
      <div className="screen__plate">
        <span>La caisse doit contenir</span>
        <strong className="num">{dt.format(780)}</strong>
      </div>
      <p className="screen__meta">Fond de caisse de {dt.format(100)} compris</p>
    </div>
  );
}

export const SCREENS = [Reminder, Queue, Refill, CashUp];
