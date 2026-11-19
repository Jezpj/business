// Moteur des fiches de vigilance par opération (art. L. 561-5 à L. 561-12 CMF). Fonctions pures.
import { risquePays, libelleRisquePays, nomPays } from '../contenus/pays.js';
import { SIGNAUX } from '../contenus/signaux.js';
import { REF } from '../contenus/textes.js';
import { seuilsValides } from './risques.js';
import { ajouterAns, estDateIso } from './dates.js';

export const TYPES_OPERATION = [
  { v: 'vente', libelle: 'Vente — mandat du vendeur' },
  { v: 'recherche', libelle: 'Achat — mandat de recherche de l’acquéreur' },
  { v: 'fondsCommerce', libelle: 'Cession de fonds de commerce ou de parts' },
  { v: 'location', libelle: 'Location (loyer mensuel ≥ 10 000 €)' },
];

export const ROLES = {
  vendeur: 'Vendeur', acquereur: 'Acquéreur', cedant: 'Cédant', cessionnaire: 'Cessionnaire', bailleur: 'Bailleur', preneur: 'Preneur',
};

export const PIECES = [
  { v: 'cni', libelle: 'Carte nationale d’identité' },
  { v: 'passeport', libelle: 'Passeport' },
  { v: 'titreSejour', libelle: 'Titre de séjour' },
  { v: 'permis', libelle: 'Permis de conduire (format carte, UE)' },
  { v: 'kbis', libelle: 'Extrait d’immatriculation (moins de 3 mois)' },
  { v: 'registreEtranger', libelle: 'Extrait de registre étranger (moins de 3 mois)' },
];

export const MODES_VERIF = [
  { v: 'presentiel', libelle: 'En présence de la personne (original de la pièce)' },
  { v: 'eidas', libelle: 'À distance, moyen d’identification électronique certifié' },
  { v: 'distanceComplementaire', libelle: 'À distance, avec une mesure complémentaire (seconde pièce, premier paiement…)' },
  { v: 'distanceSimple', libelle: 'À distance, copie de pièce seulement' },
];

export const ORIGINES_FONDS = [
  { v: 'epargne', libelle: 'Épargne personnelle' },
  { v: 'venteBien', libelle: 'Vente d’un bien immobilier' },
  { v: 'donation', libelle: 'Donation' },
  { v: 'succession', libelle: 'Succession' },
  { v: 'pretFamilial', libelle: 'Prêt familial ou d’un tiers' },
  { v: 'cession', libelle: 'Cession d’entreprise ou de titres' },
  { v: 'revenusEtrangers', libelle: 'Revenus ou avoirs à l’étranger' },
  { v: 'crypto', libelle: 'Crypto-actifs' },
  { v: 'especes', libelle: 'Espèces' },
  { v: 'autre', libelle: 'Autre' },
];

const nouvelId = () => Math.random().toString(36).slice(2, 10);

export function nouvellePartie(role, estClient = false) {
  return {
    id: nouvelId(), role, estClient, nature: 'PP',
    nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', nationalite: 'FR', residence: 'FR', profession: '',
    denomination: '', forme: '', numeroRegistre: '', paysImmatriculation: 'FR', representant: '',
    verification: { piece: '', numero: '', expiration: '', date: '', par: '', mode: 'presentiel' },
    beneficiaires: [], ppe: '', ppeDetail: '', gel: { date: '', resultat: '' }, structureComplexe: false, identiteImpossible: false,
  };
}

export function nouveauBeneficiaire() {
  return { id: nouvelId(), nom: '', prenom: '', dateNaissance: '', nationalite: 'FR', residence: 'FR', detention: '', ppe: '', gel: { date: '', resultat: '' } };
}

export function nouvelleFiche({ numero = 1, date }) {
  return {
    id: nouvelId(),
    reference: `V-${String(date || '').slice(0, 4)}-${String(numero).padStart(3, '0')}`,
    dateOuverture: date,
    type: 'vente',
    bien: { adresse: '', nature: 'appartement', prix: '', loyer: '' },
    objet: '',
    parties: [nouvellePartie('vendeur', true), nouvellePartie('acquereur', false)],
    financement: { pret: '', montantPret: '', apport: '', origines: [], paysFonds: 'FR', justificatifs: '', justificatifsRecus: false, tiersPayeur: false, tiersDetail: '' },
    signaux: {},
    analyse: '',
    validation: { nom: '', date: '' },
    alerteDeclarant: { transmise: false, date: '' },
    dateCloture: '',
    statut: 'enCours',
  };
}

const nombre = (x) => {
  if (x === '' || x === null || x === undefined) return null;
  const v = Number(String(x).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(v) ? v : null;
};

export function nomPartie(p) {
  if (!p) return '';
  if (p.nature === 'PM') return p.denomination || '(personne morale sans dénomination)';
  return [p.prenom, p.nom].filter(Boolean).join(' ') || '(personne sans nom)';
}

function libelleRole(p) { return ROLES[p.role] || p.role; }

/**
 * Évalue une fiche de vigilance.
 * @returns {{niveau:'standard'|'renforcee'|'bloquee', libelle, motifs, manquants, mesures, alertes, recommandation, complet, horsChamp, conservationJusquau}}
 */
export function evaluerFiche(fiche, { situations = [], seuils = {} } = {}) {
  const s = seuilsValides(seuils);
  const actives = new Set(situations.map((x) => x.id));
  const motifs = [];
  const manquants = [];
  const alertes = [];
  let bloquee = false;
  let renforcee = false;
  const renforcer = (motif) => { renforcee = true; if (!motifs.includes(motif)) motifs.push(motif); };

  const prix = nombre(fiche.bien?.prix);
  const loyer = nombre(fiche.bien?.loyer);
  const horsChamp = fiche.type === 'location' && loyer !== null && loyer < 10000;

  if (!fiche.objet || fiche.objet.trim().length < 3) manquants.push('Objet et nature de l’opération (résidence, investissement, revente…)');
  if (fiche.type === 'location' ? loyer === null : prix === null) manquants.push(fiche.type === 'location' ? 'Loyer mensuel' : 'Prix de l’opération');

  const parties = fiche.parties || [];
  if (parties.length < 2) manquants.push('Les deux parties à l’opération');

  const verifierPays = (code, quoi) => {
    const r = risquePays(code);
    if (r.niveau) {
      renforcer(`${quoi} : ${nomPays(code)} (${libelleRisquePays(code)})`);
      if (r.niveau === 'tres-eleve') alertes.push(`${quoi} lié à ${nomPays(code)}, pays sous appel à l’action du GAFI : examen au cas par cas par le dirigeant, avec transmission au déclarant.`);
    }
  };

  for (const p of parties) {
    const qui = `${libelleRole(p)} — ${nomPartie(p)}`;
    if (p.nature === 'PM') {
      if (!p.denomination) manquants.push(`${libelleRole(p)} : dénomination`);
      if (!p.numeroRegistre) manquants.push(`${qui} : numéro d’immatriculation`);
      if (!p.representant) manquants.push(`${qui} : identité du représentant`);
      verifierPays(p.paysImmatriculation, `${qui} — pays d’immatriculation`);
      const bes = p.beneficiaires || [];
      if (bes.length === 0) manquants.push(`${qui} : bénéficiaire(s) effectif(s) (${REF.R561_1})`);
      for (const be of bes) {
        const nomBe = [be.prenom, be.nom].filter(Boolean).join(' ') || 'bénéficiaire sans nom';
        if (!be.nom || !be.prenom || !be.dateNaissance) manquants.push(`${qui} : identité complète du bénéficiaire effectif ${nomBe}`);
        if (!be.ppe) manquants.push(`${qui} : statut PPE du bénéficiaire effectif ${nomBe}`);
        if (be.ppe === 'oui' || be.ppe === 'proche') renforcer(`Bénéficiaire effectif PPE ou proche de PPE (${nomBe})`);
        if (!be.gel?.date || !be.gel?.resultat) manquants.push(`${qui} : consultation du registre des gels pour ${nomBe}`);
        if (be.gel?.resultat === 'correspondance') { bloquee = true; alertes.push(`Correspondance avec le registre des gels pour ${nomBe} : aucune opération, information sans délai de la DG Trésor.`); }
        verifierPays(be.nationalite, `Bénéficiaire ${nomBe} — nationalité`);
        verifierPays(be.residence, `Bénéficiaire ${nomBe} — résidence`);
      }
      if (p.structureComplexe) renforcer(`${qui} : structure complexe ou étrangère (examen renforcé, ${REF.L561_10_2})`);
    } else {
      if (!p.nom || !p.prenom) manquants.push(`${libelleRole(p)} : nom et prénom`);
      if (!p.dateNaissance || !p.lieuNaissance) manquants.push(`${qui} : date et lieu de naissance`);
      verifierPays(p.nationalite, `${qui} — nationalité`);
      verifierPays(p.residence, `${qui} — résidence`);
    }
    const v = p.verification || {};
    if (!v.piece || !v.date || !v.par) manquants.push(`${qui} : vérification de l’identité (pièce, date, vérificateur)`);
    if (v.expiration && estDateIso(v.expiration) && v.date && estDateIso(v.date) && v.expiration < v.date) {
      manquants.push(`${qui} : la pièce était expirée à la date de vérification`);
    }
    if (v.mode === 'distanceSimple') renforcer(`${qui} : identification à distance sur simple copie (mesure complémentaire requise, ${REF.R561_5})`);
    else if (v.mode === 'distanceComplementaire' && actives.has('distance')) renforcer(`${qui} : relation à distance (situation retenue par la classification)`);
    if (!p.ppe) manquants.push(`${qui} : statut PPE`);
    if (p.ppe === 'oui' || p.ppe === 'proche') renforcer(`${qui} : personne politiquement exposée ou proche (${REF.L561_10})`);
    if (!p.gel?.date || !p.gel?.resultat) manquants.push(`${qui} : consultation du registre des gels`);
    if (p.gel?.resultat === 'correspondance') { bloquee = true; alertes.push(`Correspondance avec le registre des gels pour ${nomPartie(p)} : aucune opération, information sans délai de la DG Trésor.`); }
    if (p.identiteImpossible) { bloquee = true; alertes.push(`Identité de ${nomPartie(p)} impossible à vérifier : l’opération ne doit pas être réalisée (${REF.L561_8}).`); }
  }

  // Financement et origine des fonds (opérations d'acquisition)
  const f = fiche.financement || {};
  if (fiche.type !== 'location' && !horsChamp) {
    if (!f.pret) manquants.push('Plan de financement : recours ou non à un prêt bancaire');
    const montantPret = nombre(f.montantPret) || 0;
    const apportSaisi = nombre(f.apport);
    const apport = apportSaisi !== null ? apportSaisi : (prix !== null ? Math.max(0, prix - (f.pret === 'non' ? 0 : montantPret)) : null);
    const partSansPret = prix ? Math.round(((apport || 0) / prix) * 100) : 0;
    const justificationRequise = apport !== null && (apport >= s.origineFondsMontant || partSansPret >= s.origineFondsPart);
    if (justificationRequise) {
      if (!f.origines || f.origines.length === 0) manquants.push('Origine des fonds (nature de l’apport)');
      if (!f.justificatifsRecus) manquants.push(`Justificatifs de l’origine des fonds (apport de ${new Intl.NumberFormat('fr-FR').format(apport)} € ≥ seuil interne)`);
    }
    if (f.pret === 'non' && prix !== null && prix >= s.comptantRenforce) renforcer(`Acquisition sans prêt bancaire d’un montant de ${new Intl.NumberFormat('fr-FR').format(prix)} € (seuil interne : ${new Intl.NumberFormat('fr-FR').format(s.comptantRenforce)} €)`);
    verifierPays(f.paysFonds, 'Provenance des fonds');
    if ((f.origines || []).includes('crypto')) renforcer('Fonds issus de crypto-actifs : traçabilité de l’origine à établir');
    if ((f.origines || []).includes('especes')) { renforcer('Fonds en espèces proposés'); alertes.push('Des espèces sont mentionnées dans le financement : paiements en espèces plafonnés (art. L. 112-6 CMF), à signaler au déclarant.'); }
    if (f.tiersPayeur) {
      if (!f.tiersDetail || f.tiersDetail.trim().length < 3) manquants.push('Identité du tiers payeur, lien avec l’acquéreur et nature de l’apport');
    }
    if (prix !== null && prix >= s.prixPrestige && actives.has('prestige')) renforcer(`Bien de prestige (${new Intl.NumberFormat('fr-FR').format(prix)} €)`);
  }
  if (fiche.type === 'fondsCommerce' && actives.has('fondsCommerce')) renforcer('Cession de fonds de commerce (situation retenue par la classification)');
  if (fiche.type === 'location' && !horsChamp && actives.has('locationHaut')) renforcer('Location ≥ 10 000 €/mois (situation retenue par la classification)');

  // Signaux d'alerte
  const coches = SIGNAUX.filter((sg) => fiche.signaux?.[sg.id]);
  const forts = coches.filter((sg) => sg.fort);
  for (const sg of coches) alertes.push(`Signal d’alerte : ${sg.libelle}`);
  if (coches.length) renforcer(`${coches.length} signal(s) d’alerte relevé(s)`);
  const transmissionRecommandee = forts.length >= 1 || coches.length >= 2 || bloquee;

  // Exigences du niveau renforcé
  if (renforcee && !bloquee) {
    if (!fiche.analyse || fiche.analyse.trim().length < 40) manquants.push(`Examen renforcé écrit de l’opération (${REF.L561_10_2})`);
    if (!fiche.validation?.nom || !fiche.validation?.date) manquants.push('Validation de la poursuite de l’opération par le dirigeant (nom et date)');
  }
  if (transmissionRecommandee && !fiche.alerteDeclarant?.transmise) manquants.push('Transmission de l’alerte au déclarant Tracfin pour analyse');

  const niveau = bloquee ? 'bloquee' : renforcee ? 'renforcee' : 'standard';
  const libelle = { standard: 'Vigilance standard', renforcee: 'Vigilance renforcée', bloquee: 'Opération à ne pas réaliser' }[niveau];

  const mesures = [
    { texte: 'Identifier et vérifier l’identité de chaque partie sur pièce probante', ref: REF.L561_5 },
    { texte: 'Identifier les bénéficiaires effectifs des personnes morales et consulter le registre des bénéficiaires effectifs', ref: REF.R561_1 },
    { texte: 'Recueillir l’objet et la nature de l’opération', ref: REF.L561_5_1 },
    { texte: 'Déterminer le statut PPE de chaque partie et de chaque bénéficiaire effectif', ref: REF.R561_18 },
    { texte: 'Consulter le registre national des gels pour chaque partie et chaque bénéficiaire effectif', ref: REF.L562_1 },
    { texte: `Documenter le financement et justifier l’origine des fonds au-delà du seuil interne (${new Intl.NumberFormat('fr-FR').format(s.origineFondsMontant)} € ou ${s.origineFondsPart} % du prix)`, ref: REF.L561_4_1 },
    { texte: 'Conserver la fiche et les pièces 5 ans après la clôture', ref: REF.L561_12 },
  ];
  if (renforcee || bloquee) {
    mesures.push(
      { texte: 'Obtenir des justificatifs complémentaires sur l’origine du patrimoine et des fonds', ref: REF.L561_10 },
      { texte: 'Rédiger un examen renforcé de l’opération', ref: REF.L561_10_2 },
      { texte: 'Faire valider la poursuite de l’opération par le dirigeant', ref: REF.L561_10 },
      { texte: 'Assurer un suivi renforcé jusqu’à la signature de l’acte', ref: REF.L561_6 },
    );
  }

  let recommandation;
  if (bloquee) recommandation = 'Ne pas réaliser l’opération. Transmettre immédiatement au déclarant Tracfin, et informer la DG Trésor en cas de correspondance avec le registre des gels.';
  else if (transmissionRecommandee) recommandation = 'Transmettre le dossier au déclarant Tracfin pour analyse, sans en informer le client. Le déclarant décide d’une éventuelle déclaration de soupçon, si possible avant l’avant-contrat.';
  else if (renforcee) recommandation = 'Poursuivre uniquement après les mesures renforcées, l’examen écrit et la validation du dirigeant.';
  else recommandation = 'Poursuivre avec les mesures de vigilance standard.';

  const conservationJusquau = fiche.dateCloture && estDateIso(fiche.dateCloture) ? ajouterAns(fiche.dateCloture, 5) : null;

  return {
    niveau, libelle, motifs, manquants, mesures, alertes, recommandation,
    transmissionRecommandee, complet: manquants.length === 0, horsChamp, conservationJusquau,
  };
}

/** Une fiche ne peut être clôturée que complète, avec une date de clôture valide. */
export function peutCloturer(fiche, evaluation) {
  if (!evaluation.complet) return { ok: false, raison: 'La fiche est incomplète.' };
  if (evaluation.niveau === 'bloquee') return { ok: false, raison: 'Opération à ne pas réaliser : la fiche reste ouverte pour le déclarant.' };
  if (!fiche.dateCloture || !estDateIso(fiche.dateCloture)) return { ok: false, raison: 'Indiquez la date de clôture (acte authentique ou fin du mandat).' };
  return { ok: true };
}
