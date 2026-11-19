// Composants d'interface. Chaque champ lié porte data-champ (chemin) et, si besoin, data-cible (objet de rattachement).
import { html } from './html.js';
import { lire } from '../etat.js';

const idDe = (cible, champ, suffixe = '') => `c-${cible || 'e'}-${champ}${suffixe ? '-' + suffixe : ''}`.replace(/[^a-zA-Z0-9_-]/g, '-');

export function champ({ app, cible, champ: chemin, libelle, type = 'text', aide, placeholder, requis, autocomplete, min, max, pas, classe = '' }) {
  const base = cible ? app.cibles[cible] : app.etat;
  const valeur = lire(base, chemin) ?? '';
  const id = idDe(cible, chemin);
  return html`<div class="champ ${classe}">
    <label for="${id}">${libelle}${requis ? html` <span class="requis" aria-hidden="true">*</span>` : ''}</label>
    <input id="${id}" type="${type}" value="${valeur}" data-champ="${chemin}" ${cible ? html`data-cible="${cible}"` : ''}
      ${placeholder ? html`placeholder="${placeholder}"` : ''} ${requis ? html`aria-required="true"` : ''}
      ${autocomplete ? html`autocomplete="${autocomplete}"` : html`autocomplete="off"`} ${min !== undefined ? html`min="${min}"` : ''} ${max !== undefined ? html`max="${max}"` : ''} ${pas !== undefined ? html`step="${pas}"` : ''}
      ${aide ? html`aria-describedby="${id}-aide"` : ''}>
    ${aide ? html`<p class="aide" id="${id}-aide">${aide}</p>` : ''}
  </div>`;
}

export function zone({ app, cible, champ: chemin, libelle, aide, lignes = 4, placeholder }) {
  const base = cible ? app.cibles[cible] : app.etat;
  const id = idDe(cible, chemin);
  return html`<div class="champ champ-large">
    <label for="${id}">${libelle}</label>
    <textarea id="${id}" rows="${lignes}" data-champ="${chemin}" ${cible ? html`data-cible="${cible}"` : ''} ${placeholder ? html`placeholder="${placeholder}"` : ''} ${aide ? html`aria-describedby="${id}-aide"` : ''}>${lire(base, chemin) ?? ''}</textarea>
    ${aide ? html`<p class="aide" id="${id}-aide">${aide}</p>` : ''}
  </div>`;
}

export function liste({ app, cible, champ: chemin, libelle, options, aide, vide = 'Choisir…', classe = '' }) {
  const base = cible ? app.cibles[cible] : app.etat;
  const valeur = lire(base, chemin) ?? '';
  const id = idDe(cible, chemin);
  return html`<div class="champ ${classe}">
    <label for="${id}">${libelle}</label>
    <select id="${id}" data-champ="${chemin}" ${cible ? html`data-cible="${cible}"` : ''} ${aide ? html`aria-describedby="${id}-aide"` : ''}>
      ${vide !== null ? html`<option value="">${vide}</option>` : ''}
      ${options.map((o) => html`<option value="${o.v}" ${String(o.v) === String(valeur) ? 'selected' : ''}>${o.libelle}</option>`)}
    </select>
    ${aide ? html`<p class="aide" id="${id}-aide">${aide}</p>` : ''}
  </div>`;
}

export function radios({ app, cible, champ: chemin, libelle, options, aide, enLigne = false, nombre = false }) {
  const base = cible ? app.cibles[cible] : app.etat;
  const valeur = lire(base, chemin);
  const nom = idDe(cible, chemin);
  return html`<fieldset class="groupe-choix ${enLigne ? 'en-ligne' : ''}">
    <legend>${libelle}</legend>
    ${aide ? html`<p class="aide">${aide}</p>` : ''}
    <div class="choix">
      ${options.map((o) => { const id = idDe(cible, chemin, String(o.v)); return html`<label class="option" for="${id}">
        <input type="radio" id="${id}" name="${nom}" value="${o.v}" data-champ="${chemin}" ${cible ? html`data-cible="${cible}"` : ''} ${nombre ? 'data-nombre' : ''} ${valeur !== undefined && String(valeur) === String(o.v) ? 'checked' : ''}>
        <span>${o.libelle}</span></label>`; })}
    </div>
  </fieldset>`;
}

export function caseACocher({ app, cible, champ: chemin, libelle, aide }) {
  const base = cible ? app.cibles[cible] : app.etat;
  const id = idDe(cible, chemin);
  return html`<div class="champ champ-case">
    <label class="option" for="${id}"><input type="checkbox" id="${id}" data-champ="${chemin}" ${cible ? html`data-cible="${cible}"` : ''} ${lire(base, chemin) ? 'checked' : ''}> <span>${libelle}</span></label>
    ${aide ? html`<p class="aide">${aide}</p>` : ''}
  </div>`;
}

export function cases({ app, cible, champ: chemin, libelle, options, colonnes = 2 }) {
  const base = cible ? app.cibles[cible] : app.etat;
  const valeurs = lire(base, chemin) || [];
  return html`<fieldset class="groupe-choix">
    <legend>${libelle}</legend>
    <div class="choix grille-${colonnes}">
      ${options.map((o) => { const id = idDe(cible, chemin, String(o.v)); return html`<label class="option" for="${id}">
        <input type="checkbox" id="${id}" value="${o.v}" data-champ="${chemin}" data-liste ${cible ? html`data-cible="${cible}"` : ''} ${valeurs.includes(o.v) ? 'checked' : ''}>
        <span>${o.libelle}</span></label>`; })}
    </div>
  </fieldset>`;
}

export const badge = (niveau, libelle) => html`<span class="badge badge-${niveau}">${libelle}</span>`;

export function etat(ok, texteOk, texteKo, attention = false) {
  const cls = ok ? 'ok' : attention ? 'attention' : 'ko';
  const icone = ok ? '✓' : attention ? '!' : '○';
  return html`<span class="statut statut-${cls}"><span class="icone" aria-hidden="true">${icone}</span>${ok ? texteOk : texteKo}</span>`;
}

export function bouton(libelle, action, { variante = 'secondaire', donnees = {}, desactive = false, titre, icone } = {}) {
  const attrs = Object.entries(donnees).map(([k, v]) => html` data-${k}="${v}"`);
  return html`<button type="button" class="btn btn-${variante}" data-action="${action}"${attrs} ${desactive ? 'disabled' : ''} ${titre ? html`title="${titre}"` : ''}>${icone ? html`<span aria-hidden="true">${icone}</span> ` : ''}${libelle}</button>`;
}

export function boutonsDocument(type, donnees = {}) {
  const d = { type, ...donnees };
  return html`<span class="groupe-btn">${bouton('Aperçu', 'apercu', { donnees: d, icone: '👁' })}${bouton('PDF', 'imprimer', { donnees: d })}${bouton('Word', 'word', { donnees: d })}</span>`;
}

export function enTete(titre, sousTitre, actions = '') {
  return html`<header class="entete-vue"><div><h1>${titre}</h1>${sousTitre ? html`<p class="sous-titre">${sousTitre}</p>` : ''}</div>${actions ? html`<div class="actions-entete">${actions}</div>` : ''}</header>`;
}

export function encadre(contenu, type = 'info') {
  return html`<div class="encadre encadre-${type}" role="${type === 'alerte' ? 'alert' : 'note'}">${contenu}</div>`;
}
