import { html } from '../ui/html.js';
import { enTete, radios, liste, zone, badge, bouton, boutonsDocument, encadre } from '../ui/composants.js';
import { AXES, FACTEURS } from '../contenus/questions-profil.js';
import { LISTES_PAYS, nomPays, libelleRisquePays } from '../contenus/pays.js';
import { calculerClassification } from '../moteur/risques.js';
import { formatDate } from '../moteur/dates.js';
import { journaliser } from '../etat.js';
import { empreinteClassification, bilan } from './bilan.js';

const PAYS_LISTES = [...new Set([...Object.keys(LISTES_PAYS.gafiNoire.pays), ...LISTES_PAYS.gafiGrise.pays, ...LISTES_PAYS.ue.pays])]
  .map((code) => ({ code, nom: nomPays(code) })).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));

function facteurPays(app, f, ev) {
  const choisis = app.etat.profil.paysRisque;
  return html`<fieldset class="groupe-choix">
    <legend>${f.question}</legend>
    <p class="aide">${f.aide}</p>
    <p>${bouton(Array.isArray(choisis) && choisis.length === 0 ? '✓ Aucun de ces pays' : 'Aucun de ces pays', 'paysAucun', { variante: Array.isArray(choisis) && choisis.length === 0 ? 'primaire' : 'secondaire' })}</p>
    <details ${Array.isArray(choisis) && choisis.length ? 'open' : ''}><summary>Sélectionner des pays (${Array.isArray(choisis) ? choisis.length : 0} sélectionné(s))</summary>
      <div class="choix grille-3">${PAYS_LISTES.map((p) => { const id = `c-pays-${p.code}`; return html`<label class="option" for="${id}"><input type="checkbox" id="${id}" value="${p.code}" data-champ="profil.paysRisque" data-liste ${Array.isArray(choisis) && choisis.includes(p.code) ? 'checked' : ''}><span>${p.nom} <small>${libelleRisquePays(p.code)}</small></span></label>`; })}</div>
    </details>
    <p class="niveau-facteur">${ev.niveau ? badge(ev.niveau, ev.libelleNiveau) : html`<span class="aide">Non renseigné</span>`}</p>
  </fieldset>`;
}

function blocFacteur(app, f, ev) {
  const corps = f.type === 'pays'
    ? facteurPays(app, f, ev)
    : html`${radios({ app, champ: `profil.${f.id}`, libelle: f.question, options: f.options.map((o) => ({ v: o.v, libelle: o.libelle })) })}
      <p class="niveau-facteur">${ev.niveau ? html`${badge(ev.niveau, ev.libelleNiveau)}${ev.ajuste ? html` <span class="aide">ajusté (calculé : ${['', 'faible', 'modéré', 'élevé'][ev.niveauCalcule]})</span>` : ''}` : html`<span class="aide">Non renseigné</span>`}</p>`;
  return html`<div class="facteur" id="facteur-${f.id}">
    ${corps}
    ${ev.mesure ? html`<p class="mesure"><strong>Mesure :</strong> ${ev.mesure}</p>` : ''}
    <details class="ajustement"><summary>Ajuster le niveau (motif obligatoire)</summary>
      <div class="grille-champs">
        ${liste({ app, champ: `ajustements.${f.id}.niveau`, libelle: 'Niveau retenu', options: [{ v: 1, libelle: 'Faible' }, { v: 2, libelle: 'Modéré' }, { v: 3, libelle: 'Élevé' }], vide: 'Niveau calculé' })}
        ${zone({ app, champ: `ajustements.${f.id}.justification`, libelle: 'Motif (10 caractères minimum)', lignes: 2 })}
      </div>
    </details>
  </div>`;
}

export function rendre(app) {
  const e = app.etat;
  const cls = calculerClassification(e.profil, e.ajustements, e.seuils);
  const { clsModifiee } = bilan(app);
  const v = e.classification;
  const pct = Math.round((cls.repondus / cls.total) * 100);
  return html`
${enTete('Classification des risques', 'Article L. 561-4-1 du Code monétaire et financier : 5 axes, 22 facteurs, environ 10 minutes.', boutonsDocument('classification'))}
${v.dateValidation ? encadre(html`Classification <strong>v${v.version}</strong> validée le ${formatDate(v.dateValidation)} par ${v.validePar}.${clsModifiee ? html` <strong>Elle a été modifiée depuis : validez la nouvelle version.</strong>` : ''}`, clsModifiee ? 'attention' : 'succes') : encadre('Répondez selon l’activité réelle des 12 derniers mois. Chaque réponse produit un niveau motivé. Vous pouvez ajuster un niveau en justifiant votre choix : c’est ce qui rend la classification propre à votre agence.')}
<div class="disposition-deux">
  <div>
    ${AXES.map((a) => html`<section class="carte axe" aria-labelledby="axe-${a.id}">
      <h2 id="axe-${a.id}"><span class="lettre">${a.lettre}</span> ${a.titre} ${cls.axes.find((x) => x.id === a.id).niveau ? badge(cls.axes.find((x) => x.id === a.id).niveau, cls.axes.find((x) => x.id === a.id).libelleNiveau) : ''}</h2>
      ${FACTEURS.filter((f) => f.axe === a.id).map((f) => blocFacteur(app, f, cls.facteurs.find((x) => x.id === f.id)))}
    </section>`)}
  </div>
  <aside class="panneau-collant" aria-label="Résultat de la classification">
    <div class="carte">
      <h2>Résultat</h2>
      <div class="progression" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Questionnaire complété"><span style="width:${pct}%"></span></div>
      <p class="aide">${cls.repondus}/${cls.total} facteurs renseignés</p>
      <ul class="axes-mini">${cls.axes.map((a) => html`<li><span>${a.lettre}. ${a.titre}</span>${a.niveau ? badge(a.niveau, a.libelleNiveau) : html`<span class="aide">—</span>`}</li>`)}</ul>
      <p class="resultat-global">Profil global : ${badge(cls.global.niveau, cls.global.libelle)}<br><span class="aide">Indice d’exposition ${cls.indice}/100</span></p>
      <h3>Vigilance renforcée si…</h3>
      <ul class="liste-compacte">${cls.situations.map((s) => html`<li>${s.texte}</li>`)}</ul>
      ${bouton(cls.complet ? (v.dateValidation && !clsModifiee ? 'Revalider (nouvelle version)' : 'Valider la classification') : `Encore ${cls.total - cls.repondus} facteur(s) à renseigner`, 'validerClassification', { variante: 'primaire', desactive: !cls.complet })}
    </div>
  </aside>
</div>`;
}

export const actions = {
  paysAucun(app) {
    app.etat.profil.paysRisque = [];
    app.sauver(); app.rendre();
  },
  validerClassification(app) {
    const e = app.etat;
    const cls = calculerClassification(e.profil, e.ajustements, e.seuils);
    if (!cls.complet) return;
    const nom = [e.agence.dirigeantPrenom, e.agence.dirigeantNom].filter(Boolean).join(' ') || 'Le dirigeant';
    e.classification = { dateValidation: app.aujourdhui(), validePar: nom, version: (e.classification.version || 0) + 1, empreinte: empreinteClassification(e) };
    journaliser(e, `Classification des risques v${e.classification.version} validée (profil ${cls.global.libelle.toLowerCase()})`);
    app.sauver(); app.rendre();
    app.annoncer(`Classification v${e.classification.version} validée. Étape suivante : les procédures internes.`);
  },
};
