import { html } from '../ui/html.js';
import { enTete, champ, caseACocher, boutonsDocument, encadre, bouton } from '../ui/composants.js';
import { LIENS } from '../contenus/textes.js';
import { journaliser } from '../etat.js';

const personne = (app, base, titre, avecContact = true) => html`
  <h3>${titre}</h3>
  <div class="grille-champs">
    ${champ({ app, champ: `${base}.prenom`, libelle: 'Prénom' })}
    ${champ({ app, champ: `${base}.nom`, libelle: 'Nom' })}
    ${champ({ app, champ: `${base}.fonction`, libelle: 'Fonction dans l’agence' })}
    ${avecContact ? champ({ app, champ: `${base}.email`, libelle: 'E-mail', type: 'email' }) : ''}
    ${avecContact ? champ({ app, champ: `${base}.telephone`, libelle: 'Téléphone', type: 'tel' }) : ''}
  </div>`;

export function rendre(app) {
  const t = app.etat.tracfin;
  return html`
${enTete('Déclarant et correspondant Tracfin', 'Articles R. 561-23 et R. 561-24 du CMF : désignation, puis enregistrement sur la plateforme ERMES.', boutonsDocument('tracfin'))}
${encadre(html`Le <strong>déclarant</strong> transmet les déclarations de soupçon. Le <strong>correspondant</strong> répond aux demandes de Tracfin. Dans une petite agence, c’est souvent le dirigeant qui tient les deux rôles.`)}
<form class="carte formulaire" onsubmit="return false" aria-labelledby="t-desig">
  <h2 id="t-desig">Désignations</h2>
  ${bouton('Désigner le dirigeant pour les deux rôles', 'dirigeantPartout', { variante: 'lien' })}
  ${personne(app, 'tracfin.responsable', 'Responsable du dispositif LCB-FT', false)}
  ${personne(app, 'tracfin.declarant', 'Déclarant Tracfin')}
  ${caseACocher({ app, champ: 'tracfin.memePersonne', libelle: 'Le correspondant est la même personne que le déclarant' })}
  ${t.memePersonne ? '' : personne(app, 'tracfin.correspondant', 'Correspondant Tracfin')}
  <div class="grille-champs">${champ({ app, champ: 'tracfin.dateDesignation', libelle: 'Date de la désignation', type: 'date' })}</div>
</form>
<section class="carte" aria-labelledby="t-ermes">
  <h2 id="t-ermes">Enregistrement sur ERMES</h2>
  <ol class="etapes-simples">
    <li>Imprimez le document de désignation (bouton « PDF » ci-dessus) et faites-le signer par le représentant légal.</li>
    <li>Rendez-vous sur <a href="${LIENS.ermes.url}" target="_blank" rel="noopener noreferrer">${LIENS.ermes.libelle}</a> et demandez l’accès de votre agence.</li>
    <li>Renseignez l’agence et les personnes désignées. Joignez le formulaire signé et un extrait Kbis.</li>
    <li>Conservez la confirmation d’enregistrement avec la désignation.</li>
  </ol>
  <div class="grille-champs">
    ${caseACocher({ app, champ: 'tracfin.ermesEnregistre', libelle: 'Les désignations sont enregistrées sur ERMES' })}
    ${champ({ app, champ: 'tracfin.dateEnregistrement', libelle: 'Date d’enregistrement', type: 'date' })}
  </div>
</section>`;
}

export const actions = {
  dirigeantPartout(app) {
    const a = app.etat.agence;
    const p = { prenom: a.dirigeantPrenom, nom: a.dirigeantNom, fonction: a.dirigeantQualite || 'Gérant(e)' };
    Object.assign(app.etat.tracfin, { responsable: { ...p }, declarant: { ...p, email: a.email, telephone: a.telephone }, memePersonne: true });
    if (!app.etat.tracfin.dateDesignation) app.etat.tracfin.dateDesignation = app.aujourdhui();
    journaliser(app.etat, 'Dirigeant désigné responsable LCB-FT, déclarant et correspondant Tracfin');
    app.sauver(); app.rendre();
    app.annoncer('Le dirigeant est désigné pour les deux rôles.');
  },
};
