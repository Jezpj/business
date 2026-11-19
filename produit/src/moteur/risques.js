// Moteur de classification des risques (art. L. 561-4-1 CMF). Fonctions pures.
import { AXES, FACTEURS, NIVEAUX, SEUILS_DEFAUT } from '../contenus/questions-profil.js';
import { risquePays, nomPays } from '../contenus/pays.js';
import { REF } from '../contenus/textes.js';

export function evaluerFacteur(facteur, reponses = {}) {
  const valeur = reponses[facteur.id];
  if (facteur.type === 'pays') {
    if (valeur === undefined) return { niveau: null, constat: 'Non renseigné', repondu: false };
    const pays = Array.isArray(valeur) ? valeur.filter(Boolean) : [];
    if (pays.length === 0) return { niveau: 1, constat: 'Aucun pays inscrit sur les listes GAFI ou UE n’a été rencontré', repondu: true };
    const noire = pays.some((p) => risquePays(p).niveau === 'tres-eleve');
    return {
      niveau: 3,
      constat: `Pays rencontrés : ${pays.map(nomPays).join(', ')}${noire ? ' (dont un pays sous appel à l’action du GAFI)' : ''}`,
      repondu: true,
    };
  }
  const option = facteur.options.find((o) => o.v === valeur);
  if (!option) return { niveau: null, constat: 'Non renseigné', repondu: false };
  return { niveau: option.niveau, constat: option.libelle, repondu: true };
}

/**
 * Calcule la classification complète.
 * @param {object} reponses   réponses au questionnaire { idFacteur: valeur }
 * @param {object} ajustements { idFacteur: { niveau: 1|2|3, justification: string } } — ajustements motivés par l'agence
 * @param {object} seuils     seuils internes (voir SEUILS_DEFAUT)
 */
/** Seuils internes normalisés : une valeur vide, négative ou non numérique reprend la valeur par défaut. */
export function seuilsValides(seuils = {}) {
  const s = { ...SEUILS_DEFAUT };
  for (const k of Object.keys(SEUILS_DEFAUT)) {
    const brut = seuils?.[k];
    const v = Number(typeof brut === 'string' ? brut.replace(/\s/g, '').replace(',', '.') : brut);
    if (brut !== '' && brut !== null && brut !== undefined && Number.isFinite(v) && v >= 0) s[k] = v;
  }
  return s;
}

export function calculerClassification(reponses = {}, ajustements = {}, seuils = {}) {
  const s = seuilsValides(seuils);
  const facteurs = FACTEURS.map((f) => {
    const base = evaluerFacteur(f, reponses);
    const aj = ajustements[f.id];
    const nivAj = Number(aj?.niveau);
    const ajustementValide = Boolean(aj) && [1, 2, 3].includes(nivAj) && typeof aj.justification === 'string' && aj.justification.trim().length >= 10;
    const niveau = ajustementValide ? nivAj : base.niveau;
    return {
      id: f.id,
      axe: f.axe,
      question: f.question,
      constat: base.constat,
      repondu: base.repondu,
      niveauCalcule: base.niveau,
      niveau,
      ajuste: Boolean(ajustementValide && nivAj !== base.niveau),
      justification: ajustementValide ? aj.justification.trim() : '',
      libelleNiveau: niveau ? NIVEAUX[niveau].libelle : '—',
      mesure: niveau && niveau >= 2 ? f.mesure : null,
    };
  });

  const axes = AXES.map((a) => {
    const fs = facteurs.filter((f) => f.axe === a.id && f.niveau);
    // Règle prudente et explicable : un axe prend le niveau de son facteur le plus élevé.
    const niveau = fs.length ? Math.max(...fs.map((f) => f.niveau)) : null;
    return { ...a, niveau, libelleNiveau: niveau ? NIVEAUX[niveau].libelle : '—', nbFacteurs: fs.length };
  });

  const repondus = facteurs.filter((f) => f.repondu).length;
  const complet = repondus === FACTEURS.length;
  const niveauxAxes = axes.map((a) => a.niveau || 1);
  const points = niveauxAxes.reduce((t, n) => t + n, 0); // de 5 à 15
  const axesEleves = axes.filter((a) => a.niveau === 3).length;
  let niveauGlobal = 1;
  if (axesEleves >= 2 || points >= 11) niveauGlobal = 3;
  else if (axesEleves === 1 || points >= 7) niveauGlobal = 2;
  const indice = Math.round(((points - 5) / 10) * 100);

  const n = (id) => facteurs.find((f) => f.id === id)?.niveau || 1;
  const euros = (x) => new Intl.NumberFormat('fr-FR').format(x) + ' €';
  const situations = [
    { id: 'ppe', texte: 'Partie ou bénéficiaire effectif qui est une personne politiquement exposée, ou un membre de sa famille ou un proche associé', ref: REF.L561_10, active: true },
    { id: 'pays', texte: 'Partie, bénéficiaire effectif ou fonds liés à un pays inscrit sur une liste du GAFI ou sur la liste UE des pays tiers à haut risque', ref: REF.L561_10, active: true },
    { id: 'complexe', texte: 'Opération particulièrement complexe, d’un montant inhabituellement élevé ou sans justification économique apparente', ref: REF.L561_10_2, active: true },
    { id: 'fonds', texte: 'Origine des fonds non justifiée, ou incohérente avec le profil du client', ref: REF.L561_10_2, active: true },
    { id: 'comptant', texte: `Acquisition sans prêt bancaire d’un montant de ${euros(s.comptantRenforce)} ou plus`, ref: REF.L561_4_1, active: true },
    { id: 'prestige', texte: `Bien de prestige (prix de ${euros(s.prixPrestige)} ou plus)`, ref: REF.L561_4_1, active: n('prestige') >= 2 || n('prixMoyen') === 3 },
    { id: 'structures', texte: 'Partie personne morale étrangère, trust, fiducie ou structure à plusieurs niveaux de détention', ref: REF.L561_4_1, active: n('structuresComplexes') === 3 || n('personnesMorales') === 3 },
    { id: 'distance', texte: 'Partie identifiée exclusivement à distance, sans moyen d’identification électronique certifié', ref: REF.R561_5, active: n('distance') >= 2 || n('plateformes') >= 2 },
    { id: 'reventes', texte: 'Revente moins de 2 ans après l’acquisition, avec une plus-value significative', ref: REF.L561_4_1, active: n('reventesRapides') === 3 },
    { id: 'fondsCommerce', texte: 'Cession d’un fonds de commerce à forte intensité d’espèces', ref: REF.L561_4_1, active: n('fondsCommerce') >= 2 },
    { id: 'locationHaut', texte: 'Location dont le loyer mensuel atteint 10 000 €, payée d’avance, par un tiers ou depuis l’étranger', ref: REF.L561_2, active: n('locationHaut') === 3 },
    { id: 'apporteurs', texte: 'Client présenté par un apporteur d’affaires ou un intermédiaire', ref: REF.L561_4_1, active: n('apporteurs') >= 2 },
  ];

  return {
    facteurs,
    axes,
    global: { niveau: niveauGlobal, libelle: NIVEAUX[niveauGlobal].libelle },
    indice,
    complet,
    repondus,
    total: FACTEURS.length,
    situations: situations.filter((x) => x.active),
    seuils: s,
    ajustements: facteurs.filter((f) => f.ajuste),
  };
}

export function niveauFacteur(classification, id) {
  return classification?.facteurs?.find((f) => f.id === id)?.niveau || 1;
}

export function reponseFacteur(reponses, id) {
  return reponses ? reponses[id] : undefined;
}
