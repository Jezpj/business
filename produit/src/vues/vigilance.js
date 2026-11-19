import { html, euros } from '../ui/html.js';
import { enTete, champ, zone, liste, radios, caseACocher, cases, bouton, boutonsDocument, encadre } from '../ui/composants.js';
import { calculerClassification } from '../moteur/risques.js';
import { evaluerFiche, nouvelleFiche, nouvellePartie, nouveauBeneficiaire, peutCloturer, nomPartie, TYPES_OPERATION, ROLES, PIECES, MODES_VERIF, ORIGINES_FONDS } from '../moteur/vigilance.js';
import { SIGNAUX } from '../contenus/signaux.js';
import { listePays, libelleRisquePays } from '../contenus/pays.js';
import { LIENS } from '../contenus/textes.js';
import { formatDate } from '../moteur/dates.js';
import { journaliser } from '../etat.js';

const optionsPays = () => listePays().map((p) => ({ v: p.code, libelle: p.nom + (libelleRisquePays(p.code) ? ` ⚠ ${libelleRisquePays(p.code)}` : '') }));
const NIV = { standard: 1, renforcee: 2, bloquee: 3 };
const ROLES_PAR_TYPE = { vente: ['vendeur', 'acquereur'], recherche: ['vendeur', 'acquereur'], fondsCommerce: ['cedant', 'cessionnaire'], location: ['bailleur', 'preneur'] };

function contexteCls(app) {
  const e = app.etat;
  return calculerClassification(e.profil, e.ajustements, e.seuils);
}

export function rendreListe(app) {
  const cls = contexteCls(app);
  const filtre = app.session.filtreFiches || 'enCours';
  const toutes = app.etat.vigilances.slice().sort((a, b) => (a.dateOuverture < b.dateOuverture ? 1 : a.dateOuverture > b.dateOuverture ? -1 : (a.reference < b.reference ? 1 : -1)));
  const fiches = toutes.filter((f) => filtre === 'toutes' || (filtre === 'cloturees' ? f.statut === 'cloturee' : f.statut !== 'cloturee'));
  return html`
${enTete('Fiches de vigilance', 'Une fiche par opération, ouverte dès le mandat et complétée avant l’avant-contrat.', html`${boutonsDocument('registreVigilance')} ${bouton('Nouvelle fiche', 'nouvelleFiche', { variante: 'primaire', icone: '＋' })}`)}
<div class="onglets" role="tablist" aria-label="Filtrer les fiches">
  ${[['enCours', 'En cours'], ['cloturees', 'Clôturées'], ['toutes', 'Toutes']].map(([v, l]) => html`<button type="button" role="tab" aria-selected="${filtre === v}" class="onglet ${filtre === v ? 'actif' : ''}" data-action="filtrerFiches" data-filtre="${v}">${l}</button>`)}
</div>
<section class="carte">
  ${fiches.length ? html`<div class="table-defilante"><table class="tableau">
    <thead><tr><th scope="col">Référence</th><th scope="col">Opération</th><th scope="col">Parties</th><th scope="col">Niveau</th><th scope="col">Complétude</th><th scope="col"><span class="visuellement-cache">Actions</span></th></tr></thead>
    <tbody>${fiches.map((f) => { const ev = evaluerFiche(f, { situations: cls.situations, seuils: cls.seuils }); return html`<tr>
      <td><a href="#/vigilance/${f.id}"><strong>${f.reference}</strong></a><br><span class="aide">ouverte le ${formatDate(f.dateOuverture)}</span></td>
      <td>${TYPES_OPERATION.find((t) => t.v === f.type)?.libelle}<br><span class="aide">${f.bien?.adresse || ''} ${f.type === 'location' ? euros(f.bien?.loyer) : euros(f.bien?.prix)}</span></td>
      <td>${(f.parties || []).map((p) => nomPartie(p)).join(' / ')}</td>
      <td><span class="badge badge-${NIV[ev.niveau]}">${ev.libelle}</span></td>
      <td>${f.statut === 'cloturee' ? html`Clôturée le ${formatDate(f.dateCloture)}` : ev.complet ? html`<span class="statut statut-ok">✓ Complète</span>` : html`<span class="statut statut-attention">${ev.manquants.length} point(s) manquant(s)</span>`}</td>
      <td class="actions-ligne"><a class="btn btn-secondaire" href="#/vigilance/${f.id}">Ouvrir</a> ${boutonsDocument('fiche', { id: f.id })}</td></tr>`; })}</tbody></table></div>`
    : html`<p>Aucune fiche ${filtre === 'cloturees' ? 'clôturée' : filtre === 'enCours' ? 'en cours' : ''}. Ouvrez une fiche à chaque nouveau mandat.</p>`}
</section>`;
}

function blocPartie(app, f, p, i) {
  const base = `parties.${i}`;
  const c = (o) => champ({ app, cible: 'fiche', ...o, champ: `${base}.${o.champ}` });
  const pays = optionsPays();
  return html`<section class="carte partie" aria-labelledby="t-partie-${i}">
    <h3 id="t-partie-${i}">${ROLES[p.role] || 'Partie'} — ${nomPartie(p)} ${p.estClient ? html`<span class="tag">Client de l’agence</span>` : html`<span class="tag">Cocontractant</span>`}</h3>
    <div class="grille-champs">
      ${liste({ app, cible: 'fiche', champ: `${base}.role`, libelle: 'Rôle', options: Object.entries(ROLES).map(([v, l]) => ({ v, libelle: l })), vide: null })}
      ${radios({ app, cible: 'fiche', champ: `${base}.nature`, libelle: 'Nature', options: [{ v: 'PP', libelle: 'Personne physique' }, { v: 'PM', libelle: 'Personne morale' }], enLigne: true })}
      ${caseACocher({ app, cible: 'fiche', champ: `${base}.estClient`, libelle: 'Client (mandant) de l’agence' })}
    </div>
    ${p.nature === 'PM' ? html`<div class="grille-champs">
      ${c({ champ: 'denomination', libelle: 'Dénomination' })}${c({ champ: 'forme', libelle: 'Forme', placeholder: 'SCI, SAS…' })}
      ${c({ champ: 'numeroRegistre', libelle: 'N° d’immatriculation (SIREN…)' })}
      ${liste({ app, cible: 'fiche', champ: `${base}.paysImmatriculation`, libelle: 'Pays d’immatriculation', options: pays, vide: null })}
      ${c({ champ: 'representant', libelle: 'Représentant (nom, qualité)', classe: 'champ-large' })}
      ${caseACocher({ app, cible: 'fiche', champ: `${base}.structureComplexe`, libelle: 'Structure complexe ou étrangère (holding étrangère, trust, plusieurs niveaux de détention)' })}
    </div>
    <h4>Bénéficiaires effectifs <span class="aide">(plus de 25 % du capital ou des droits de vote, ou contrôle)</span></h4>
    ${(p.beneficiaires || []).map((b, j) => { const bb = `${base}.beneficiaires.${j}`; return html`<div class="sous-bloc">
      <div class="grille-champs">
        ${champ({ app, cible: 'fiche', champ: `${bb}.prenom`, libelle: 'Prénom' })}${champ({ app, cible: 'fiche', champ: `${bb}.nom`, libelle: 'Nom' })}
        ${champ({ app, cible: 'fiche', champ: `${bb}.dateNaissance`, libelle: 'Date de naissance', type: 'date' })}
        ${liste({ app, cible: 'fiche', champ: `${bb}.nationalite`, libelle: 'Nationalité', options: pays, vide: null })}
        ${liste({ app, cible: 'fiche', champ: `${bb}.residence`, libelle: 'Pays de résidence', options: pays, vide: null })}
        ${champ({ app, cible: 'fiche', champ: `${bb}.detention`, libelle: 'Détention ou contrôle', placeholder: '60 % des parts, gérant…' })}
        ${liste({ app, cible: 'fiche', champ: `${bb}.ppe`, libelle: 'Personne politiquement exposée ?', options: [{ v: 'non', libelle: 'Non' }, { v: 'oui', libelle: 'Oui' }, { v: 'proche', libelle: 'Famille ou proche associé' }] })}
        ${champ({ app, cible: 'fiche', champ: `${bb}.gel.date`, libelle: 'Registre des gels consulté le', type: 'date' })}
        ${liste({ app, cible: 'fiche', champ: `${bb}.gel.resultat`, libelle: 'Résultat', options: [{ v: 'aucune', libelle: 'Aucune correspondance' }, { v: 'homonymieLevee', libelle: 'Homonymie levée' }, { v: 'correspondance', libelle: 'Correspondance confirmée' }] })}
      </div>
      ${bouton('Retirer ce bénéficiaire', 'supprimerBeneficiaire', { variante: 'lien', donnees: { partie: i, index: j } })}
    </div>`; })}
    ${bouton('Ajouter un bénéficiaire effectif', 'ajouterBeneficiaire', { donnees: { partie: i }, icone: '＋' })}`
    : html`<div class="grille-champs">
      ${c({ champ: 'prenom', libelle: 'Prénom(s)' })}${c({ champ: 'nom', libelle: 'Nom' })}
      ${c({ champ: 'dateNaissance', libelle: 'Date de naissance', type: 'date' })}${c({ champ: 'lieuNaissance', libelle: 'Lieu de naissance' })}
      ${liste({ app, cible: 'fiche', champ: `${base}.nationalite`, libelle: 'Nationalité', options: pays, vide: null })}
      ${liste({ app, cible: 'fiche', champ: `${base}.residence`, libelle: 'Pays de résidence', options: pays, vide: null })}
      ${c({ champ: 'profession', libelle: 'Profession' })}
    </div>`}
    <h4>Vérification de l’identité</h4>
    <div class="grille-champs">
      ${liste({ app, cible: 'fiche', champ: `${base}.verification.piece`, libelle: 'Pièce vérifiée', options: PIECES })}
      ${c({ champ: 'verification.numero', libelle: 'Numéro de la pièce' })}
      ${c({ champ: 'verification.expiration', libelle: 'Valable jusqu’au', type: 'date' })}
      ${liste({ app, cible: 'fiche', champ: `${base}.verification.mode`, libelle: 'Mode de vérification', options: MODES_VERIF, vide: null })}
      ${c({ champ: 'verification.date', libelle: 'Vérifiée le', type: 'date' })}
      ${c({ champ: 'verification.par', libelle: 'Vérifiée par' })}
    </div>
    <div class="grille-champs">
      ${liste({ app, cible: 'fiche', champ: `${base}.ppe`, libelle: 'Personne politiquement exposée (PPE) ?', options: [{ v: 'non', libelle: 'Non' }, { v: 'oui', libelle: 'Oui' }, { v: 'proche', libelle: 'Membre de la famille ou proche associé' }], aide: 'Fonction publique importante exercée, ou quittée depuis moins d’un an.' })}
      ${c({ champ: 'ppeDetail', libelle: 'Si oui : fonction, pays, source' })}
      ${c({ champ: 'gel.date', libelle: 'Registre des gels consulté le', type: 'date' })}
      ${liste({ app, cible: 'fiche', champ: `${base}.gel.resultat`, libelle: 'Résultat', options: [{ v: 'aucune', libelle: 'Aucune correspondance' }, { v: 'homonymieLevee', libelle: 'Homonymie levée' }, { v: 'correspondance', libelle: 'Correspondance confirmée' }] })}
    </div>
    <p class="aide">Consulter le <a href="${LIENS.gels.url}" target="_blank" rel="noopener noreferrer">${LIENS.gels.libelle}</a>${p.nature === 'PM' ? html` et le <a href="${LIENS.rbe.url}" target="_blank" rel="noopener noreferrer">${LIENS.rbe.libelle}</a>` : ''}.</p>
    ${caseACocher({ app, cible: 'fiche', champ: `${base}.identiteImpossible`, libelle: 'Identité impossible à vérifier (refus, pièces manquantes ou douteuses)' })}
    ${(f.parties || []).length > 2 ? bouton('Retirer cette partie', 'supprimerPartie', { variante: 'lien', donnees: { index: i } }) : ''}
  </section>`;
}

export function rendreFiche(app, id) {
  const f = app.etat.vigilances.find((x) => x.id === id);
  if (!f) return html`${enTete('Fiche introuvable', '')}${encadre(html`Cette fiche n’existe pas ou a été supprimée. <a href="#/vigilance">Retour aux fiches</a>.`, 'attention')}`;
  app.cibles.fiche = f;
  const cls = contexteCls(app);
  const ev = evaluerFiche(f, { situations: cls.situations, seuils: cls.seuils });
  const cloture = peutCloturer(f, ev);
  const fermee = f.statut === 'cloturee';
  const c = (o) => champ({ app, cible: 'fiche', ...o });
  return html`
<p class="fil"><a href="#/vigilance">Fiches de vigilance</a> › ${f.reference}</p>
${enTete(`Fiche ${f.reference}`, fermee ? `Clôturée le ${formatDate(f.dateCloture)} — conservation jusqu’au ${formatDate(ev.conservationJusquau)}` : `Ouverte le ${formatDate(f.dateOuverture)}`, boutonsDocument('fiche', { id: f.id }))}
${fermee ? encadre(html`Fiche clôturée : elle est conservée telle quelle. ${bouton('Rouvrir la fiche', 'rouvrirFiche', { variante: 'lien' })}`, 'succes') : ''}
<div class="disposition-deux">
  <div class="${fermee ? 'lecture-seule' : ''}">
    <section class="carte formulaire" aria-labelledby="t-op">
      <h2 id="t-op">1. Opération</h2>
      <div class="grille-champs">
        ${liste({ app, cible: 'fiche', champ: 'type', libelle: 'Type d’opération', options: TYPES_OPERATION, vide: null })}
        ${c({ champ: 'dateOuverture', libelle: 'Date d’ouverture', type: 'date' })}
        ${c({ champ: 'bien.adresse', libelle: 'Adresse du bien', classe: 'champ-large' })}
        ${liste({ app, cible: 'fiche', champ: 'bien.nature', libelle: 'Nature du bien', options: [['appartement', 'Appartement'], ['maison', 'Maison'], ['terrain', 'Terrain'], ['immeuble', 'Immeuble de rapport'], ['local', 'Local commercial ou professionnel'], ['fonds', 'Fonds de commerce'], ['autre', 'Autre']].map(([v, l]) => ({ v, libelle: l })), vide: null })}
        ${f.type === 'location' ? c({ champ: 'bien.loyer', libelle: 'Loyer mensuel (€)', type: 'number', min: 0 }) : c({ champ: 'bien.prix', libelle: 'Prix (€)', type: 'number', min: 0, pas: 1000 })}
        ${zone({ app, cible: 'fiche', champ: 'objet', libelle: 'Objet et nature de l’opération (pour chaque partie)', lignes: 2, placeholder: 'Résidence principale, investissement locatif, revente, transmission…' })}
      </div>
    </section>
    <h2 class="titre-section">2. Parties</h2>
    ${(f.parties || []).map((p, i) => blocPartie(app, f, p, i))}
    <p>${bouton('Ajouter une partie (co-acquéreur, indivisaire…)', 'ajouterPartie', { icone: '＋' })}</p>
    ${f.type !== 'location' ? html`<section class="carte formulaire" aria-labelledby="t-fin">
      <h2 id="t-fin">3. Financement et origine des fonds</h2>
      <div class="grille-champs">
        ${radios({ app, cible: 'fiche', champ: 'financement.pret', libelle: 'Recours à un prêt bancaire ?', options: [{ v: 'oui', libelle: 'Oui' }, { v: 'partiel', libelle: 'Partiel' }, { v: 'non', libelle: 'Non' }], enLigne: true })}
        ${f.financement.pret !== 'non' ? c({ champ: 'financement.montantPret', libelle: 'Montant du prêt (€)', type: 'number', min: 0, pas: 1000 }) : ''}
        ${c({ champ: 'financement.apport', libelle: 'Apport personnel (€)', type: 'number', min: 0, pas: 1000, aide: 'Laisser vide : calculé à partir du prix et du prêt.' })}
        ${liste({ app, cible: 'fiche', champ: 'financement.paysFonds', libelle: 'Pays de provenance des fonds', options: optionsPays(), vide: null })}
      </div>
      ${cases({ app, cible: 'fiche', champ: 'financement.origines', libelle: 'Origine de l’apport', options: ORIGINES_FONDS, colonnes: 3 })}
      <div class="grille-champs">
        ${c({ champ: 'financement.justificatifs', libelle: 'Justificatifs obtenus (nature, date)', classe: 'champ-large', placeholder: 'Acte de vente du 12/03, relevés de compte de mai…' })}
        ${caseACocher({ app, cible: 'fiche', champ: 'financement.justificatifsRecus', libelle: 'Les justificatifs de l’origine des fonds sont reçus et cohérents' })}
        ${caseACocher({ app, cible: 'fiche', champ: 'financement.tiersPayeur', libelle: 'Un tiers participe au financement (parent, associé, prêteur privé…)' })}
        ${f.financement.tiersPayeur ? c({ champ: 'financement.tiersDetail', libelle: 'Tiers : identité, lien, nature de l’apport', classe: 'champ-large' }) : ''}
      </div>
    </section>` : ''}
    <section class="carte formulaire" aria-labelledby="t-sig">
      <h2 id="t-sig">${f.type !== 'location' ? '4' : '3'}. Signaux d’alerte</h2>
      <p class="aide">Cochez chaque élément constaté. Un signal fort non expliqué, ou deux signaux, imposent de transmettre au déclarant.</p>
      <div class="choix grille-2">${SIGNAUX.map((s) => { const idc = `c-fiche-signal-${s.id}`; return html`<label class="option ${s.fort ? 'fort' : ''}" for="${idc}"><input type="checkbox" id="${idc}" data-champ="signaux.${s.id}" data-cible="fiche" ${f.signaux?.[s.id] ? 'checked' : ''}><span>${s.libelle}${s.fort ? html` <strong class="tag tag-fort">fort</strong>` : ''}</span></label>`; })}</div>
    </section>
    <section class="carte formulaire" aria-labelledby="t-exam">
      <h2 id="t-exam">${f.type !== 'location' ? '5' : '4'}. Examen et décision</h2>
      ${zone({ app, cible: 'fiche', champ: 'analyse', libelle: 'Examen de l’opération (obligatoire en vigilance renforcée)', lignes: 4, aide: 'Décrivez les vérifications faites et pourquoi l’opération est cohérente, ou pourquoi elle ne l’est pas.' })}
      <div class="grille-champs">
        ${c({ champ: 'validation.nom', libelle: 'Poursuite validée par (dirigeant)' })}
        ${c({ champ: 'validation.date', libelle: 'Date de validation', type: 'date' })}
        ${caseACocher({ app, cible: 'fiche', champ: 'alerteDeclarant.transmise', libelle: 'Dossier transmis au déclarant Tracfin pour analyse' })}
        ${c({ champ: 'alerteDeclarant.date', libelle: 'Date de transmission', type: 'date' })}
      </div>
      <p class="aide">La décision du déclarant et une éventuelle déclaration de soupçon ne figurent pas dans cette fiche : elles sont conservées à part, de façon confidentielle.</p>
    </section>
  </div>
  <aside class="panneau-collant" aria-label="Évaluation de la fiche">
    <div class="carte evaluation niveau-${ev.niveau}" aria-live="polite">
      <p class="libelle-niveau">${ev.libelle}</p>
      <p>${ev.recommandation}</p>
      ${ev.alertes.length ? html`<ul class="liste-alertes">${ev.alertes.map((a) => html`<li>${a}</li>`)}</ul>` : ''}
      ${ev.motifs.length ? html`<h3>Motifs</h3><ul class="liste-compacte">${ev.motifs.map((m) => html`<li>${m}</li>`)}</ul>` : ''}
      <h3>${ev.complet ? '✓ Fiche complète' : `${ev.manquants.length} point(s) à compléter`}</h3>
      ${ev.manquants.length ? html`<ul class="liste-compacte manquants">${ev.manquants.map((m) => html`<li>${m}</li>`)}</ul>` : ''}
      ${ev.horsChamp ? html`<p class="aide">Location sous 10 000 €/mois : hors champ LCB-FT.</p>` : ''}
      ${!fermee ? html`<div class="cloture">
        ${champ({ app, cible: 'fiche', champ: 'dateCloture', libelle: 'Date de clôture (acte ou fin de mandat)', type: 'date' })}
        ${bouton('Clôturer la fiche', 'cloturerFiche', { variante: 'primaire', desactive: !cloture.ok, titre: cloture.raison || '' })}
        ${!cloture.ok ? html`<p class="aide">${cloture.raison}</p>` : ''}
      </div>` : ''}
      <p class="aide">Conservation : 5 ans après la clôture${ev.conservationJusquau ? html`, jusqu’au <strong>${formatDate(ev.conservationJusquau)}</strong>` : ''}.</p>
    </div>
    ${bouton('Supprimer la fiche', 'supprimerFiche', { variante: 'danger' })}
  </aside>
</div>`;
}

export function rendre(app, params) {
  return params[0] ? rendreFiche(app, params[0]) : rendreListe(app);
}

export const actions = {
  nouvelleFiche(app) {
    const e = app.etat;
    const annee = app.aujourdhui().slice(0, 4);
    const numero = e.vigilances.filter((f) => f.reference.startsWith(`V-${annee}-`)).length + 1;
    const f = nouvelleFiche({ numero, date: app.aujourdhui() });
    e.vigilances.push(f);
    e.compteurs.fiches = (e.compteurs.fiches || 0) + 1;
    journaliser(e, `Fiche de vigilance ${f.reference} ouverte`);
    app.sauver();
    app.naviguer(`vigilance/${f.id}`);
  },
  filtrerFiches(app, el) { app.session.filtreFiches = el.dataset.filtre; app.rendre(); },
  ajouterPartie(app) {
    const f = app.cibles.fiche;
    const roles = ROLES_PAR_TYPE[f.type] || ['acquereur'];
    f.parties.push(nouvellePartie(roles[1], false));
    app.sauver(); app.rendre();
  },
  supprimerPartie(app, el) {
    const f = app.cibles.fiche;
    if (f.parties.length <= 2 || !confirm('Retirer cette partie de la fiche ?')) return;
    f.parties.splice(Number(el.dataset.index), 1);
    app.sauver(); app.rendre();
  },
  ajouterBeneficiaire(app, el) {
    const f = app.cibles.fiche;
    const p = f.parties[Number(el.dataset.partie)];
    (p.beneficiaires ||= []).push(nouveauBeneficiaire());
    app.sauver(); app.rendre();
  },
  supprimerBeneficiaire(app, el) {
    const f = app.cibles.fiche;
    const p = f.parties[Number(el.dataset.partie)];
    p.beneficiaires.splice(Number(el.dataset.index), 1);
    app.sauver(); app.rendre();
  },
  cloturerFiche(app) {
    const f = app.cibles.fiche;
    const cls = contexteCls(app);
    const ev = evaluerFiche(f, { situations: cls.situations, seuils: cls.seuils });
    if (!peutCloturer(f, ev).ok) return;
    f.statut = 'cloturee';
    journaliser(app.etat, `Fiche ${f.reference} clôturée (${ev.libelle.toLowerCase()}), conservation jusqu’au ${formatDate(ev.conservationJusquau)}`);
    app.sauver(); app.rendre();
    app.annoncer(`Fiche ${f.reference} clôturée.`);
  },
  rouvrirFiche(app) {
    const f = app.cibles.fiche;
    f.statut = 'enCours';
    journaliser(app.etat, `Fiche ${f.reference} rouverte`);
    app.sauver(); app.rendre();
  },
  supprimerFiche(app) {
    const f = app.cibles.fiche;
    if (!confirm(`Supprimer définitivement la fiche ${f.reference} ? Une fiche d’opération réalisée doit être conservée 5 ans.`)) return;
    app.etat.vigilances = app.etat.vigilances.filter((x) => x.id !== f.id);
    journaliser(app.etat, `Fiche ${f.reference} supprimée`);
    app.sauver();
    app.naviguer('vigilance');
  },
};
