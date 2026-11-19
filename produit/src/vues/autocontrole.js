import { html } from '../ui/html.js';
import { enTete, radios, bouton, boutonsDocument, encadre, badge } from '../ui/composants.js';
import { POINTS, GROUPES, REPONSES } from '../contenus/autocontrole.js';
import { evaluer, preremplir } from '../moteur/autocontrole.js';
import { formatDate } from '../moteur/dates.js';
import { journaliser } from '../etat.js';
import { bilan } from './bilan.js';

export function rendre(app) {
  const e = app.etat;
  const b = bilan(app);
  const suggestions = preremplir(e, { aujourdhui: app.aujourdhui(), statutsEquipe: b.statuts.map((s) => s.st) });
  const reponses = e.autocontroleEnCours;
  const res = evaluer(reponses);
  const historique = e.autocontroles.slice().sort((x, y) => (x.date < y.date ? 1 : -1));
  const niv = { bon: 1, moyen: 2, faible: 3 }[res.appreciation.niveau];
  return html`
${enTete('Auto-contrôle annuel', 'Article L. 561-32 du CMF : 20 points de contrôle, dont 7 régulièrement retenus par la Commission nationale des sanctions.')}
${encadre(html`Les réponses marquées « suggéré » sont déduites de votre dossier Probant. Vérifiez-les : l’auto-contrôle doit refléter la réalité de l’agence, pas seulement l’outil. ${bouton('Appliquer les suggestions', 'appliquerSuggestions', { variante: 'lien' })}`)}
<div class="disposition-deux">
  <div>${GROUPES.map((g) => html`<section class="carte" aria-labelledby="g-${g.id}">
    <h2 id="g-${g.id}">${g.titre}</h2>
    ${POINTS.filter((p) => p.groupe === g.id).map((p) => html`<div class="point-controle">
      ${radios({ app, champ: `autocontroleEnCours.${p.id}`, libelle: p.texte, options: REPONSES.map((r) => ({ v: r.v, libelle: r.libelle })), enLigne: true })}
      <p class="aide">${p.critique ? html`<span class="tag tag-fort">régulièrement sanctionné</span> ` : ''}${suggestions[p.id] ? html`Suggéré : <strong>${REPONSES.find((r) => r.v === suggestions[p.id]).libelle}</strong>` : ''}</p>
    </div>`)}
  </section>`)}</div>
  <aside class="panneau-collant" aria-label="Score de l’auto-contrôle">
    <div class="carte">
      <h2>Score</h2>
      <p class="score">${res.score}<small>/100</small></p>
      <p>${badge(niv, res.appreciation.texte)}</p>
      <p class="aide">${res.repondus}/${res.total} points évalués</p>
      <h3>Priorités</h3>
      <ol class="liste-compacte">${res.priorites.slice(0, 6).map((p) => html`<li>${p.action}${p.module ? html` <a href="#/${p.module}">Ouvrir</a>` : ''}</li>`)}</ol>
      ${bouton(res.complet ? 'Enregistrer l’auto-contrôle' : `Encore ${res.total - res.repondus} point(s) à évaluer`, 'enregistrerAutocontrole', { variante: 'primaire', desactive: !res.complet })}
    </div>
    ${historique.length ? html`<div class="carte"><h2>Historique</h2><ul class="liste-docs">${historique.map((a) => html`<li><span>${formatDate(a.date)} — ${a.score}/100</span>${boutonsDocument('autocontrole', { id: a.id })}</li>`)}</ul></div>` : ''}
  </aside>
</div>`;
}

export const actions = {
  appliquerSuggestions(app) {
    const b = bilan(app);
    const s = preremplir(app.etat, { aujourdhui: app.aujourdhui(), statutsEquipe: b.statuts.map((x) => x.st) });
    Object.assign(app.etat.autocontroleEnCours, s);
    app.sauver(); app.rendre();
    app.annoncer(`${Object.keys(s).length} réponse(s) suggérée(s) appliquée(s). Complétez les autres.`);
  },
  enregistrerAutocontrole(app) {
    const e = app.etat;
    const res = evaluer(e.autocontroleEnCours);
    if (!res.complet) return;
    const par = [e.tracfin.responsable?.prenom, e.tracfin.responsable?.nom].filter(Boolean).join(' ') || [e.agence.dirigeantPrenom, e.agence.dirigeantNom].filter(Boolean).join(' ');
    const ac = { id: Math.random().toString(36).slice(2, 10), date: app.aujourdhui(), reponses: { ...e.autocontroleEnCours }, score: res.score, par };
    e.autocontroles.push(ac);
    journaliser(e, `Auto-contrôle annuel enregistré : ${res.score}/100`);
    app.sauver(); app.rendre();
    app.annoncer(`Auto-contrôle enregistré (${res.score}/100). Le rapport et le plan d’action sont disponibles.`);
  },
};
