import { html } from '../ui/html.js';
import { enTete, liste, champ, bouton, boutonsDocument, encadre, etat as statut } from '../ui/composants.js';
import { formatDate } from '../moteur/dates.js';
import { journaliser } from '../etat.js';
import { bilan } from './bilan.js';

export function rendre(app) {
  const e = app.etat;
  const b = bilan(app);
  const clsOk = b.etapes.find((x) => x.id === 'classification').ok;
  const designes = Boolean(e.tracfin.declarant?.nom);
  const p = e.procedures;
  const aJour = p.dateValidation && p.versionClassification === e.classification.version;
  return html`
${enTete('Procédures internes', 'Article L. 561-32 du CMF : un document de 13 sections et 2 annexes, généré à partir de votre classification.', boutonsDocument('procedures'))}
${p.dateValidation ? encadre(aJour ? html`Procédures validées le ${formatDate(p.dateValidation)} (classification v${p.versionClassification}).` : html`Vos procédures ont été validées sur une ancienne version de la classification : <strong>relisez-les et validez-les à nouveau</strong>.`, aJour ? 'succes' : 'attention') : ''}
<div class="disposition-deux">
  <section class="carte formulaire" aria-labelledby="t-param">
    <h2 id="t-param">Paramètres propres à votre agence</h2>
    <div class="grille-champs">
      ${liste({ app, champ: 'procedures.delaiAlerte', libelle: 'Délai maximal d’alerte du déclarant par un collaborateur', options: ['immédiatement', '24 heures', '48 heures'].map((v) => ({ v, libelle: v })), vide: null })}
      ${liste({ app, champ: 'procedures.delaiAnalyse', libelle: 'Délai d’analyse d’une alerte par le déclarant', options: ['2 jours ouvrés', '5 jours ouvrés', '10 jours ouvrés'].map((v) => ({ v, libelle: v })), vide: null })}
      ${champ({ app, champ: 'procedures.archivage', libelle: 'Mode d’archivage des dossiers', placeholder: 'ex. : dossier numérique sauvegardé + classeur sous clé', classe: 'champ-large' })}
    </div>
    <h3>Ce que contiennent vos procédures</h3>
    <ol class="liste-compacte">
      <li>Objet, champ d’application et références</li><li>Organisation et responsabilités</li><li>Classification des risques</li>
      <li>Identification et vérification (deux parties, bénéficiaires effectifs, PPE)</li><li>Connaissance de l’opération et origine des fonds</li>
      <li>Niveaux de vigilance et mesures renforcées</li><li>Vigilance constante</li><li>Gel des avoirs</li>
      <li>Alerte interne et déclaration de soupçon</li><li>Abstention et refus</li><li>Conservation</li><li>Formation</li><li>Contrôle interne</li>
      <li>Annexes : pièces justificatives, fiche d’alerte interne</li>
    </ol>
  </section>
  <aside class="carte" aria-labelledby="t-prerequis">
    <h2 id="t-prerequis">Avant de valider</h2>
    <ul class="liste-statuts">
      <li>${statut(clsOk, 'Classification validée et à jour', 'Classification à valider', b.clsModifiee)}</li>
      <li>${statut(designes, 'Déclarant Tracfin désigné', 'Déclarant Tracfin à désigner (recommandé)', true)}</li>
    </ul>
    <p class="aide">Lisez le document (bouton « Aperçu ») avant de le valider : il engage votre agence. Vous pouvez l’exporter sous Word pour l’adapter.</p>
    ${bouton(aJour ? 'Valider à nouveau' : 'Valider les procédures', 'validerProcedures', { variante: 'primaire', desactive: !clsOk })}
  </aside>
</div>`;
}

export const actions = {
  validerProcedures(app) {
    const e = app.etat;
    const nom = [e.agence.dirigeantPrenom, e.agence.dirigeantNom].filter(Boolean).join(' ') || 'Le dirigeant';
    Object.assign(e.procedures, { dateValidation: app.aujourdhui(), validePar: nom, versionClassification: e.classification.version });
    journaliser(e, `Procédures internes validées (classification v${e.classification.version})`);
    app.sauver(); app.rendre();
    app.annoncer('Procédures validées. Pensez à les présenter à l’équipe lors de la formation.');
  },
};
