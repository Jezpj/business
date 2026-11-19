// Utilitaires de dates sur des chaînes ISO « AAAA-MM-JJ » (aucun fuseau horaire en jeu).

export function aujourdHui(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function estDateIso(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [a, m, j] = s.split('-').map(Number);
  const d = new Date(Date.UTC(a, m - 1, j));
  return d.getUTCFullYear() === a && d.getUTCMonth() === m - 1 && d.getUTCDate() === j;
}

/** Ajoute des mois ; au 31 d'un mois plus court, on retient le dernier jour du mois (29/02 + 12 mois = 28/02). */
export function ajouterMois(iso, mois) {
  if (!estDateIso(iso)) return null;
  const [a, m, j] = iso.split('-').map(Number);
  const totalMois = (m - 1) + mois;
  const annee = a + Math.floor(totalMois / 12);
  const moisCible = ((totalMois % 12) + 12) % 12;
  const dernierJour = new Date(Date.UTC(annee, moisCible + 1, 0)).getUTCDate();
  const p = (n) => String(n).padStart(2, '0');
  return `${annee}-${p(moisCible + 1)}-${p(Math.min(j, dernierJour))}`;
}

export const ajouterAns = (iso, ans) => ajouterMois(iso, ans * 12);

export function comparer(a, b) { return a < b ? -1 : a > b ? 1 : 0; }

export function joursEntre(a, b) {
  if (!estDateIso(a) || !estDateIso(b)) return null;
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
}

export function formatDate(iso) {
  if (!estDateIso(iso)) return '';
  const [a, m, j] = iso.split('-');
  return `${j}/${m}/${a}`;
}

export function formatDateLongue(iso) {
  if (!estDateIso(iso)) return '';
  const [a, m, j] = iso.split('-').map(Number);
  const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return `${j === 1 ? '1er' : j} ${mois[m - 1]} ${a}`;
}
