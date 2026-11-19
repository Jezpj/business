// Moteur de l'auto-contrôle annuel et du diagnostic gratuit. Fonctions pures.
import { POINTS, GROUPES, REPONSES } from '../contenus/autocontrole.js';
import { ajouterMois } from './dates.js';

export function pointsDiagnostic() { return POINTS.filter((p) => p.diag); }

export function evaluer(reponses = {}, points = POINTS) {
  let total = 0;
  let obtenu = 0;
  const repondus = [];
  for (const p of points) {
    const r = REPONSES.find((x) => x.v === reponses[p.id]);
    total += p.poids;
    if (r) { obtenu += p.poids * r.valeur; repondus.push(p.id); }
  }
  const score = total ? Math.round((obtenu / total) * 100) : 0;
  const priorites = points
    .filter((p) => reponses[p.id] !== 'oui')
    .map((p) => ({ ...p, reponse: reponses[p.id] || null }))
    .sort((a, b) => (Number(Boolean(b.critique)) - Number(Boolean(a.critique))) || (b.poids - a.poids) || ((a.reponse === 'non' ? 0 : 1) - (b.reponse === 'non' ? 0 : 1)));
  const critiquesManquants = priorites.filter((p) => p.critique && p.reponse !== 'partiel');
  let appreciation;
  if (score >= 85 && critiquesManquants.length === 0) appreciation = { niveau: 'bon', texte: 'Dispositif solide : maintenez la traçabilité et la mise à jour annuelle.' };
  else if (score >= 60) appreciation = { niveau: 'moyen', texte: 'Dispositif partiel : plusieurs points régulièrement sanctionnés restent à traiter.' };
  else appreciation = { niveau: 'faible', texte: 'Dispositif insuffisant : en cas de contrôle, des manquements seraient très probablement relevés.' };
  const parGroupe = GROUPES.map((g) => {
    const ps = points.filter((p) => p.groupe === g.id);
    if (!ps.length) return null;
    const t = ps.reduce((s, p) => s + p.poids, 0);
    const o = ps.reduce((s, p) => s + p.poids * (REPONSES.find((x) => x.v === reponses[p.id])?.valeur || 0), 0);
    return { ...g, score: Math.round((o / t) * 100) };
  }).filter(Boolean);
  return { score, priorites, critiquesManquants, appreciation, parGroupe, complet: repondus.length === points.length, repondus: repondus.length, total: points.length };
}

/** Pré-remplit l'auto-contrôle à partir de l'état réel du dossier Probant (l'utilisateur confirme ou corrige). */
export function preremplir(etat, { aujourdhui, statutsEquipe = [] } = {}) {
  const r = {};
  const t = etat.tracfin || {};
  if (t.declarant?.nom && t.correspondant?.nom) r.ac02 = t.ermesEnregistre ? 'oui' : 'partiel';
  if (t.responsable?.nom || t.declarant?.nom) r.ac01 = 'oui';
  const c = etat.classification || {};
  if (c.dateValidation) {
    r.ac03 = 'oui';
    r.ac04 = ajouterMois(c.dateValidation, 12) > aujourdhui ? 'oui' : 'non';
  }
  if (etat.procedures?.dateValidation) { r.ac05 = 'oui'; r.ac14 = 'oui'; }
  const actifs = statutsEquipe.filter((s) => s.etat !== 'parti');
  if (actifs.length) {
    const formes = actifs.filter((s) => s.etat === 'aJour').length;
    r.ac16 = formes === actifs.length ? 'oui' : formes > 0 ? 'partiel' : 'non';
    if (formes > 0) { r.ac17 = 'oui'; r.ac18 = 'oui'; }
  }
  const fiches = etat.vigilances || [];
  if (fiches.length) r.ac19 = 'oui';
  return r;
}
