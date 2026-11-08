const egp = new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 });

function Reminder() {
  return (
    <div className="screen">
      <p className="screen__from">Your shop</p>
      <p className="screen__title">Saturday, 14:30 with Karim</p>
      <p className="screen__body">Skin fade and beard, 45 min. See you then.</p>
      <div className="screen__actions">
        <span className="screen__btn screen__btn--fill">Confirm</span>
        <span className="screen__btn">Change time</span>
      </div>
      <p className="screen__meta">Sent on WhatsApp at 09:00</p>
    </div>
  );
}

function Queue() {
  return (
    <div className="screen">
      <p className="screen__from">Your shop, queue</p>
      <p className="screen__figure num">3rd</p>
      <p className="screen__title">About 25 min</p>
      <p className="screen__body">We will message you when you are second in line.</p>
      <div className="screen__actions">
        <span className="screen__btn">Leave the queue</span>
      </div>
      <p className="screen__meta">Joined by QR code at 11:40</p>
    </div>
  );
}

function Refill() {
  return (
    <div className="screen">
      <p className="screen__from">Front desk</p>
      <p className="screen__title">14:30 with Karim is free</p>
      <p className="screen__body">Youssef cancelled at 14:12. Offered to 3 people on the waitlist.</p>
      <dl className="screen__rows">
        <div>
          <dt>Sami</dt>
          <dd>Took it, 14:15</dd>
        </div>
        <div>
          <dt>Nour</dt>
          <dd>Told it is gone</dd>
        </div>
      </dl>
    </div>
  );
}

function CashUp() {
  return (
    <div className="screen">
      <p className="screen__from">Cash-up, Saturday</p>
      <dl className="screen__rows">
        <div>
          <dt>Cash</dt>
          <dd className="num">{egp.format(3400)}</dd>
        </div>
        <div>
          <dt>Card</dt>
          <dd className="num">{egp.format(2150)}</dd>
        </div>
        <div>
          <dt>Wallet</dt>
          <dd className="num">{egp.format(600)}</dd>
        </div>
      </dl>
      <div className="screen__plate">
        <span>Drawer should hold</span>
        <strong className="num">{egp.format(3900)}</strong>
      </div>
      <p className="screen__meta">Includes the {egp.format(500)} float</p>
    </div>
  );
}

export const SCREENS = [Reminder, Queue, Refill, CashUp];
