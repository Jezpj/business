import { html } from '../ui/html.js';
import { enTete, boutonsDocument, encadre, etat as statut } from '../ui/composants.js';
import { FONCTIONS } from '../contenus/formation.js';
import { formatDate } from '../moteur/dates.js';
import { bilan } from './bilan.js';

export function rendre(app) {
  const e = app.etat;
  const b = bilan(app);
  const ok = (id) => b.etapes.find((x) => x.id === id);
  const attestations = e.equipe.flatMap((m) => (m.formations || []).filter((f) => f.reussi).map((f) => ({ m, f })));
  const ligne = (titre, type, etape, donnees = {}) => html`<li><span>${titre}${etape ? html` ${statut(etape.ok, 'prêt', 'à finaliser', etape.attention)}` : ''}</span>${boutonsDocument(type, donnees)}</li>`;
  return html`
${enTete('Documents', 'Tout ce qu’un inspecteur peut vous demander, au même endroit. PDF : choisissez « Enregistrer au format PDF » dans la fenêtre d’impression.')}
${!app.licence.valide ? encadre(html`Mode démonstration : les documents portent un filigrane et ne sont pas nominatifs. <a href="#/parametres">Activer une licence</a>.`, 'attention') : ''}
<div class="grille-docs">
  <section class="carte"><h2>Dispositif</h2><ul class="liste-docs">
    ${ligne('Classification des risques', 'classification', ok('classification'))}
    ${ligne('Procédures internes', 'procedures', ok('procedures'))}
    ${ligne('Désignation déclarant / correspondant Tracfin', 'tracfin', ok('tracfin'))}
  </ul></section>
  <section class="carte"><h2>Formation</h2><ul class="liste-docs">
    ${ligne('Plan de formation', 'plan', null)}
    ${ligne('Registre des formations', 'registreFormations', ok('equipe'))}
    ${FONCTIONS.map((f) => ligne(`Support — ${f.libelle}`, 'support', null, { fonction: f.id }))}
  </ul></section>
  <section class="carte"><h2>Attestations (${attestations.length})</h2>
    ${attestations.length ? html`<ul class="liste-docs">${attestations.map(({ m, f }) => html`<li><span>${f.numero} — ${[m.prenom, m.nom].join(' ')} — ${formatDate(f.date)}</span>${boutonsDocument('attestation', { id: m.id, formation: f.id })}</li>`)}</ul>` : html`<p class="aide">Aucune attestation : les attestations sont créées automatiquement à la réussite d’une formation.</p>`}
  </section>
  <section class="carte"><h2>Opérations</h2><ul class="liste-docs">
    ${ligne('Registre des fiches de vigilance', 'registreVigilance', ok('vigilance'))}
    ${e.vigilances.slice(-8).reverse().map((f) => ligne(`Fiche ${f.reference}`, 'fiche', null, { id: f.id }))}
    ${e.autocontroles.map((a) => ligne(`Auto-contrôle du ${formatDate(a.date)}`, 'autocontrole', null, { id: a.id }))}
  </ul></section>
</div>`;
}

export const actions = {};
