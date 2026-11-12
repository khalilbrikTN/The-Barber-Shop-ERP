/* Tunisian mobile numbers: 8 digits after +216, starting with 2, 4, 5 or 9 (Ooredoo, Orange, Tunisie Telecom).
   Codes go out on WhatsApp or SMS, so a landline (7x) cannot sign in. */

/** The 8 national digits, whether typed as "20 000 001", "+216 20000001" or "0021620000001". */
export function tnDigits(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("00216")) return d.slice(5);
  if (d.startsWith("216") && d.length === 11) return d.slice(3);
  return d;
}

export const isTnMobile = (raw: string) => /^[2459]\d{7}$/.test(tnDigits(raw));

/** "+216 20 000 001" */
export function formatTn(raw: string) {
  const d = tnDigits(raw);
  return d.length === 8 ? `+216 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}` : raw.trim();
}

/** Same number, however it was written. */
export const samePhone = (a: string, b: string) => tnDigits(a) === tnDigits(b);

/** Where most salons are; the last entry is for everywhere else. */
export const TN_CITIES = ["Tunis", "Ariana", "Ben Arous", "La Manouba", "La Marsa", "Nabeul", "Hammamet", "Bizerte", "Sousse", "Monastir", "Mahdia", "Kairouan", "Sfax", "Gabès", "Djerba", "Gafsa"];
