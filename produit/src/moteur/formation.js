// Moteur de formation (art. L. 561-34 et D. 561-38-1-1 CMF). Fonctions pures.
import { SECTIONS, QUESTIONS, FONCTIONS } from '../contenus/formation.js';
import { seuilsValides } from './risques.js';
import { ajouterMois, ajouterAns, estDateIso } from './dates.js';
import { VERSION_CONTENUS } from '../contenus/textes.js';

export const SEUIL_REUSSITE = 80; // pourcentage minimal de bonnes réponses
export const NB_QUESTIONS = 12;

export function contexte({ agence = {}, classification, reponses = {}, seuils = {}, tracfin = {} }) {
  const s = seuilsValides(seuils);
  const d = tracfin?.declarant;
  return {
    agence,
    cls: classification,
    seuils: s,
    declarant: d && (d.prenom || d.nom) ? [d.prenom, d.nom].filter(Boolean).join(' ') : '',
    n: (id) => classification?.facteurs?.find((f) => f.id === id)?.niveau || 1,
    r: (id) => reponses?.[id],
  };
}

export function libelleFonction(id) {
  return FONCTIONS.find((f) => f.id === id)?.libelle || id;
}

/** Sections du module d'un collaborateur, dans l'ordre pédagogique, avec leur contenu calculé. */
export function sectionsPour(fonction, c) {
  return SECTIONS
    .filter((s) => {
      if (s.fonctions) return s.fonctions.includes(fonction);
      if (s.socle) return true;
      return typeof s.si === 'function' ? Boolean(s.si(c)) : false;
    })
    .map((s) => ({
      id: s.id,
      titre: s.titre,
      duree: s.duree,
      type: s.fonctions ? 'fonction' : s.socle ? 'socle' : 'risque',
      obligatoire: Boolean(s.obligatoire),
      paragraphes: s.paragraphes(c),
      points: s.points(c),
      pratique: s.pratique ? s.pratique(c) : [],
    }));
}

export function dureeTotale(sections) {
  return sections.reduce((t, s) => t + s.duree, 0) + 8; // + temps du quiz
}

/** Périodicité de mise à jour (en mois), adaptée au profil de risque global et à la fonction. */
export function periodiciteMois(niveauGlobal, fonction) {
  if (niveauGlobal >= 2) return 12;
  return ['assistant', 'support'].includes(fonction) ? 24 : 18;
}

export function planFormation(c) {
  const niveau = c.cls?.global?.niveau || 2;
  return FONCTIONS.map((f) => {
    const sections = sectionsPour(f.id, c);
    return {
      fonction: f.id,
      libelle: f.libelle,
      sections: sections.map((s) => ({ id: s.id, titre: s.titre, type: s.type, duree: s.duree })),
      duree: dureeTotale(sections),
      periodicite: periodiciteMois(niveau, f.id),
    };
  });
}

// Mélange déterministe (même collaborateur → même ordre), pour la reproductibilité et les tests.
function graineDe(texte) {
  let h = 2166136261;
  for (const ch of String(texte)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function melanger(liste, graine) {
  const a = liste.slice();
  let x = graine || 1;
  for (let i = a.length - 1; i > 0; i--) {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
    const j = x % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Sélectionne les questions : 2 sur les sanctions, 1 sur la déclaration, 1 sur la conservation, puis le reste. */
export function questionsPour(sectionIds, graine = 'x', nb = NB_QUESTIONS) {
  const ids = new Set(sectionIds);
  const candidates = melanger(QUESTIONS.filter((q) => q.sections.some((s) => ids.has(s))), graineDe(graine));
  const choisies = [];
  const prendre = (filtre, n) => {
    for (const q of candidates) {
      if (choisies.length >= nb || n <= 0) break;
      if (!choisies.includes(q) && filtre(q)) { choisies.push(q); n--; }
    }
  };
  prendre((q) => q.sections.includes('sanctions'), 2);
  prendre((q) => q.sections.includes('declaration'), 1);
  prendre((q) => q.sections.includes('conservation'), 1);
  // Priorité aux questions propres aux risques et à la fonction (hors socle).
  const socle = new Set(['enjeux', 'obligations', 'beppe', 'fonds', 'signaux', 'declaration', 'conservation', 'sanctions']);
  prendre((q) => q.sections.some((s) => !socle.has(s) && ids.has(s)), nb);
  prendre(() => true, nb);
  return choisies.slice(0, nb);
}

export function corriger(questions, reponses = {}) {
  const details = questions.map((q) => ({ id: q.id, correcte: reponses[q.id] === q.c, reponse: reponses[q.id], attendue: q.c, explication: q.e }));
  const bonnes = details.filter((d) => d.correcte).length;
  const pourcentage = questions.length ? Math.round((bonnes / questions.length) * 100) : 0;
  return { bonnes, total: questions.length, pourcentage, reussi: pourcentage >= SEUIL_REUSSITE, details };
}

/** Statut de formation d'un collaborateur à une date donnée. */
export function statutFormation(membre, { periodicite = 12, aujourdhui }) {
  const reussies = (membre.formations || []).filter((f) => f.reussi && estDateIso(f.date)).sort((a, b) => (a.date < b.date ? 1 : -1));
  const derniere = reussies[0] || null;
  if (membre.dateDepart && estDateIso(membre.dateDepart) && membre.dateDepart <= aujourdhui) {
    return { etat: 'parti', libelle: 'A quitté l’agence', derniere, prochaine: null };
  }
  if (!derniere) return { etat: 'aFormer', libelle: 'Non formé', derniere: null, prochaine: membre.dateArrivee || aujourdhui };
  const prochaine = ajouterMois(derniere.date, periodicite);
  if (prochaine <= aujourdhui) return { etat: 'echu', libelle: 'Formation à renouveler', derniere, prochaine };
  return { etat: 'aJour', libelle: 'À jour', derniere, prochaine };
}

/** Fin de conservation des justificatifs : durée des fonctions, puis 5 ans après le départ (D. 561-38-1-1). */
export function finConservation(membre) {
  if (membre.dateDepart && estDateIso(membre.dateDepart)) return ajouterAns(membre.dateDepart, 5);
  return null;
}

export function numeroAttestation(agenceCode, annee, rang) {
  return `F-${annee}-${String(rang).padStart(3, '0')}${agenceCode ? '-' + agenceCode : ''}`;
}

export function enregistrementFormation({ date, sections, resultat, rang }) {
  return {
    id: Math.random().toString(36).slice(2, 10),
    numero: numeroAttestation('', date.slice(0, 4), rang),
    date,
    versionContenus: VERSION_CONTENUS,
    sections: sections.map((s) => ({ id: s.id, titre: s.titre, duree: s.duree })),
    duree: dureeTotale(sections),
    score: resultat.pourcentage,
    bonnes: resultat.bonnes,
    total: resultat.total,
    reussi: resultat.reussi,
  };
}
