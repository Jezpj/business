import { html } from '../ui/html.js';
import { enTete, champ, liste, bouton, boutonsDocument, encadre, badge } from '../ui/composants.js';
import { FONCTIONS } from '../contenus/formation.js';
import { statutFormation, periodiciteMois, libelleFonction, finConservation } from '../moteur/formation.js';
import { calculerClassification } from '../moteur/risques.js';
import { formatDate } from '../moteur/dates.js';
import { journaliser } from '../etat.js';

const BADGE = { aJour: 1, echu: 2, aFormer: 3, parti: 0 };
const nouveauMembre = (auj) => ({ prenom: '', nom: '', fonction: 'negociateur', dateArrivee: auj });

export function rendre(app) {
  const e = app.etat;
  const auj = app.aujourdhui();
  const cls = calculerClassification(e.profil, e.ajustements, e.seuils);
  app.session.nouveauMembre ||= nouveauMembre(auj);
  app.cibles.nouveau = app.session.nouveauMembre;
  const fonctions = FONCTIONS.map((f) => ({ v: f.id, libelle: f.libelle }));
  return html`
${enTete('Équipe et formation', 'Décret n° 2026-310 : formation à l’embauche puis régulière, adaptée aux risques et aux fonctions, preuves conservées 5 ans après le départ.', html`${boutonsDocument('plan')} ${boutonsDocument('registreFormations')}`)}
${!e.classification.dateValidation ? encadre(html`La formation est construite à partir de votre classification des risques. <a href="#/classification">Validez-la d’abord</a> pour que les modules correspondent à votre profil.`, 'attention') : encadre(html`Profil ${badge(cls.global.niveau, cls.global.libelle.toLowerCase())} : formation à renouveler tous les <strong>${periodiciteMois(cls.global.niveau, 'negociateur')} mois</strong> (${periodiciteMois(cls.global.niveau, 'assistant')} mois pour les fonctions support).`)}
<section class="carte" aria-labelledby="t-equipe">
  <h2 id="t-equipe">Collaborateurs (${e.equipe.length})</h2>
  ${e.equipe.length ? html`<div class="table-defilante"><table class="tableau">
    <thead><tr><th scope="col">Collaborateur</th><th scope="col">Fonction</th><th scope="col">Statut</th><th scope="col">Dernière formation</th><th scope="col">Échéance</th><th scope="col"><span class="visuellement-cache">Actions</span></th></tr></thead>
    <tbody>${e.equipe.map((m) => {
      app.cibles[`m-${m.id}`] = m;
      const st = statutFormation(m, { periodicite: periodiciteMois(cls.global.niveau, m.fonction), aujourdhui: auj });
      const derniere = st.derniere;
      return html`<tr>
        <td><strong>${[m.prenom, m.nom].filter(Boolean).join(' ') || '(sans nom)'}</strong><br><span class="aide">Arrivée ${formatDate(m.dateArrivee) || '—'}${m.dateDepart ? ' · départ ' + formatDate(m.dateDepart) : ''}</span></td>
        <td>${libelleFonction(m.fonction)}</td>
        <td>${st.etat === 'parti' ? html`<span class="badge badge-0">Parti</span>` : badge(BADGE[st.etat], st.libelle)}</td>
        <td>${derniere ? html`${formatDate(derniere.date)} · ${derniere.score} %` : '—'}</td>
        <td>${st.prochaine ? formatDate(st.prochaine) : finConservation(m) ? html`<span class="aide">Preuves conservées jusqu’au ${formatDate(finConservation(m))}</span>` : '—'}</td>
        <td class="actions-ligne">
          ${st.etat !== 'parti' ? bouton(st.etat === 'aJour' ? 'Refaire' : 'Former maintenant', 'former', { variante: st.etat === 'aJour' ? 'secondaire' : 'primaire', donnees: { id: m.id } }) : ''}
          ${derniere ? boutonsDocument('attestation', { id: m.id, formation: derniere.id }) : ''}
          <details class="edition"><summary>Modifier</summary>
            <div class="grille-champs">
              ${champ({ app, cible: `m-${m.id}`, champ: 'prenom', libelle: 'Prénom' })}
              ${champ({ app, cible: `m-${m.id}`, champ: 'nom', libelle: 'Nom' })}
              ${liste({ app, cible: `m-${m.id}`, champ: 'fonction', libelle: 'Fonction', options: fonctions, vide: null })}
              ${champ({ app, cible: `m-${m.id}`, champ: 'dateArrivee', libelle: 'Date d’arrivée', type: 'date' })}
              ${champ({ app, cible: `m-${m.id}`, champ: 'dateDepart', libelle: 'Date de départ', type: 'date', aide: 'Les preuves de formation sont conservées 5 ans après cette date.' })}
            </div>
            ${(m.formations || []).length ? '' : bouton('Supprimer ce collaborateur', 'supprimerMembre', { variante: 'danger', donnees: { id: m.id } })}
          </details>
        </td></tr>`;
    })}</tbody></table></div>` : html`<p>Aucun collaborateur. Ajoutez toutes les personnes qui participent aux opérations : dirigeant, négociateurs, agents commerciaux, assistants…</p>`}
</section>
<form class="carte formulaire" onsubmit="return false" aria-labelledby="t-ajout">
  <h2 id="t-ajout">Ajouter un collaborateur</h2>
  <div class="grille-champs">
    ${champ({ app, cible: 'nouveau', champ: 'prenom', libelle: 'Prénom' })}
    ${champ({ app, cible: 'nouveau', champ: 'nom', libelle: 'Nom', requis: true })}
    ${liste({ app, cible: 'nouveau', champ: 'fonction', libelle: 'Fonction', options: fonctions, vide: null })}
    ${champ({ app, cible: 'nouveau', champ: 'dateArrivee', libelle: 'Date d’arrivée', type: 'date' })}
  </div>
  ${bouton('Ajouter', 'ajouterMembre', { variante: 'primaire', icone: '＋' })}
</form>
<section class="carte" aria-labelledby="t-supports">
  <h2 id="t-supports">Supports pédagogiques par fonction</h2>
  <p class="aide">À conserver avec les attestations : ils prouvent le contenu de la formation suivie (art. D. 561-38-1-1 CMF).</p>
  <ul class="liste-docs">${FONCTIONS.map((f) => html`<li><span>${f.libelle}</span>${boutonsDocument('support', { fonction: f.id })}</li>`)}</ul>
</section>`;
}

export const actions = {
  ajouterMembre(app) {
    const n = app.session.nouveauMembre;
    if (!n.nom?.trim()) { app.annoncer('Indiquez au moins le nom du collaborateur.', 'erreur'); return; }
    const m = { id: Math.random().toString(36).slice(2, 10), prenom: n.prenom.trim(), nom: n.nom.trim(), fonction: n.fonction, dateArrivee: n.dateArrivee || app.aujourdhui(), dateDepart: '', formations: [] };
    app.etat.equipe.push(m);
    journaliser(app.etat, `Collaborateur ajouté : ${[m.prenom, m.nom].join(' ')} (${libelleFonction(m.fonction)})`);
    app.session.nouveauMembre = nouveauMembre(app.aujourdhui());
    app.sauver(); app.rendre();
    app.annoncer(`${m.prenom || m.nom} ajouté(e). Formez-le ou formez-la dès maintenant.`);
  },
  supprimerMembre(app, el) {
    const m = app.etat.equipe.find((x) => x.id === el.dataset.id);
    if (!m || !confirm(`Supprimer ${[m.prenom, m.nom].join(' ')} ? (Possible seulement sans formation enregistrée.)`)) return;
    app.etat.equipe = app.etat.equipe.filter((x) => x.id !== m.id);
    journaliser(app.etat, `Collaborateur supprimé : ${[m.prenom, m.nom].join(' ')}`);
    app.sauver(); app.rendre();
  },
  former(app, el) { app.session.formation = null; app.naviguer(`formation/${el.dataset.id}`); },
};
