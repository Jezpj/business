// Gabarit HTML sûr : toute valeur interpolée est échappée, sauf si elle est déjà du HTML produit par html``.

class Html {
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}

export function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function rendu(v) {
  if (v === null || v === undefined || v === false) return '';
  if (v instanceof Html) return v.s;
  if (Array.isArray(v)) return v.map(rendu).join('');
  return esc(v);
}

export function html(chaines, ...valeurs) {
  let out = chaines[0];
  for (let i = 0; i < valeurs.length; i++) out += rendu(valeurs[i]) + chaines[i + 1];
  return new Html(out);
}

/** À n'utiliser que pour du HTML de confiance, écrit dans le code (jamais pour une saisie utilisateur). */
export const brut = (s) => new Html(String(s));

export const euros = (n) => {
  const v = Number(String(n ?? '').replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(v) && String(n ?? '').trim() !== '' ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v) + ' €' : '—';
};
