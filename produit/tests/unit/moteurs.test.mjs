import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculerClassification } from '../../src/moteur/risques.js';
import { evaluerFiche, nouvelleFiche, nouvellePartie, nouveauBeneficiaire, peutCloturer } from '../../src/moteur/vigilance.js';
import { contexte, sectionsPour, questionsPour, corriger, statutFormation, finConservation, planFormation, periodiciteMois } from '../../src/moteur/formation.js';
import { evaluer, pointsDiagnostic, preremplir } from '../../src/moteur/autocontrole.js';
import { ajouterMois, ajouterAns, estDateIso, formatDate, joursEntre } from '../../src/moteur/dates.js';
import { risquePays, LISTES_PAYS, nomPays } from '../../src/contenus/pays.js';
import { FACTEURS } from '../../src/contenus/questions-profil.js';
import { QUESTIONS, SECTIONS } from '../../src/contenus/formation.js';

// Profils types ------------------------------------------------------------
const profilRural = Object.fromEntries(FACTEURS.map((f) => [f.id, f.type === 'pays' ? [] : f.options[0].v]));
const profilVille = { ...profilRural, prixMoyen: 'moyen', fondsCommerce: 'occasionnel', comptant: 'moyenne', fondsEtrangers: 'parfois', distance: 'parfois', agentsCommerciaux: 'peu', personnesMorales: 'regulier' };
const profilLuxe = { ...profilVille, prixMoyen: 'haut', prestige: 'forte', comptant: 'forte', fondsEtrangers: 'souvent', nonResidents: 'forte', structuresComplexes: 'parfois', ppe: 'oui', zone: 'prestige', paysRisque: ['RU', 'LB'], offshore: 'parfois' };

test('dates : ajout de mois, fins de mois, années bissextiles', () => {
  assert.equal(ajouterMois('2026-01-31', 1), '2026-02-28');
  assert.equal(ajouterMois('2028-02-29', 12), '2029-02-28');
  assert.equal(ajouterAns('2026-11-19', 5), '2031-11-19');
  assert.equal(ajouterMois('2026-11-19', -12), '2025-11-19');
  assert.equal(estDateIso('2026-02-30'), false);
  assert.equal(formatDate('2026-04-24'), '24/04/2026');
  assert.equal(joursEntre('2026-01-01', '2026-12-31'), 364);
});

test('pays : listes GAFI et UE, niveaux et noms français', () => {
  assert.equal(risquePays('IR').niveau, 'tres-eleve');
  assert.equal(risquePays('RU').niveau, 'eleve');      // liste UE
  assert.equal(risquePays('KW').niveau, 'eleve');      // liste grise GAFI (oct. 2026)
  assert.equal(risquePays('MC').niveau, 'eleve');      // encore sur la liste UE
  assert.equal(risquePays('FR').niveau, null);
  assert.equal(risquePays('BG').niveau, null);          // retirée de la liste grise en oct. 2026
  assert.equal(LISTES_PAYS.gafiGrise.pays.length, 18);
  assert.equal(LISTES_PAYS.ue.pays.length, 26);
  assert.equal(nomPays('DE'), 'Allemagne');
});

test('classification : profil rural → faible ; ville → modéré ; luxe → élevé', () => {
  const rural = calculerClassification(profilRural);
  assert.equal(rural.complet, true);
  assert.equal(rural.global.niveau, 1);
  assert.equal(rural.indice, 0);
  const ville = calculerClassification(profilVille);
  assert.equal(ville.global.niveau, 2);
  assert.ok(ville.axes.every((a) => a.niveau >= 1));
  const luxe = calculerClassification(profilLuxe);
  assert.equal(luxe.global.niveau, 3);
  assert.ok(luxe.indice >= 80);
  assert.ok(luxe.situations.some((s) => s.id === 'prestige'));
  assert.ok(luxe.situations.some((s) => s.id === 'structures'));
});

test('classification : un axe prend le niveau de son facteur le plus élevé', () => {
  const c = calculerClassification({ ...profilRural, locationHaut: 'oui' });
  assert.equal(c.axes.find((a) => a.id === 'produits').niveau, 3);
  assert.equal(c.global.niveau, 2);
});

test('classification : ajustement pris en compte seulement s’il est motivé', () => {
  const sans = calculerClassification(profilRural, { prixMoyen: { niveau: 3, justification: 'court' } });
  assert.equal(sans.facteurs.find((f) => f.id === 'prixMoyen').niveau, 1);
  const avec = calculerClassification(profilRural, { prixMoyen: { niveau: 3, justification: 'Deux ventes au-dessus de 2 M€ prévues en 2027.' } });
  const f = avec.facteurs.find((x) => x.id === 'prixMoyen');
  assert.equal(f.niveau, 3);
  assert.equal(f.ajuste, true);
  assert.equal(avec.ajustements.length, 1);
});

test('classification incomplète détectée', () => {
  const c = calculerClassification({ prixMoyen: 'bas' });
  assert.equal(c.complet, false);
  assert.equal(c.repondus, 1);
});

// Fiches de vigilance --------------------------------------------------------
function ficheComplete() {
  const f = nouvelleFiche({ numero: 1, date: '2026-11-19' });
  f.objet = 'Résidence principale';
  f.bien.prix = '320000';
  f.financement = { pret: 'oui', montantPret: '290000', apport: '30000', origines: ['epargne'], paysFonds: 'FR', justificatifs: '', justificatifsRecus: false, tiersPayeur: false, tiersDetail: '' };
  for (const p of f.parties) {
    Object.assign(p, { nom: 'Martin', prenom: 'Claire', dateNaissance: '1980-05-02', lieuNaissance: 'Lyon', ppe: 'non' });
    p.verification = { piece: 'cni', numero: 'X', expiration: '2030-01-01', date: '2026-11-19', par: 'S. Dupont', mode: 'presentiel' };
    p.gel = { date: '2026-11-19', resultat: 'aucune' };
  }
  return f;
}

test('vigilance : fiche standard complète', () => {
  const ev = evaluerFiche(ficheComplete(), {});
  assert.equal(ev.niveau, 'standard');
  assert.deepEqual(ev.manquants, []);
  assert.equal(ev.complet, true);
});

test('vigilance : fiche vide → manquants listés', () => {
  const ev = evaluerFiche(nouvelleFiche({ numero: 2, date: '2026-11-19' }), {});
  assert.equal(ev.complet, false);
  assert.ok(ev.manquants.length >= 8);
});

test('vigilance : PPE → renforcée, exige examen écrit et validation du dirigeant', () => {
  const f = ficheComplete();
  f.parties[1].ppe = 'oui';
  const ev = evaluerFiche(f, {});
  assert.equal(ev.niveau, 'renforcee');
  assert.ok(ev.manquants.some((m) => m.includes('Examen renforcé')));
  assert.ok(ev.manquants.some((m) => m.includes('Validation')));
  f.analyse = 'Ancien ministre étranger ; fonds issus de la vente de sa résidence, acte de vente fourni et cohérent.';
  f.validation = { nom: 'S. Dupont', date: '2026-11-19' };
  assert.equal(evaluerFiche(f, {}).complet, true);
});

test('vigilance : pays de la liste UE / noire GAFI', () => {
  const f = ficheComplete();
  f.parties[1].residence = 'RU';
  assert.equal(evaluerFiche(f, {}).niveau, 'renforcee');
  f.parties[1].residence = 'IR';
  const ev = evaluerFiche(f, {});
  assert.ok(ev.alertes.some((a) => a.includes('appel à l’action')));
});

test('vigilance : correspondance registre des gels → bloquée et non clôturable', () => {
  const f = ficheComplete();
  f.parties[0].gel.resultat = 'correspondance';
  f.dateCloture = '2026-12-01';
  const ev = evaluerFiche(f, {});
  assert.equal(ev.niveau, 'bloquee');
  assert.equal(peutCloturer(f, ev).ok, false);
});

test('vigilance : personne morale sans bénéficiaire effectif → manquant ; avec BE PPE → renforcée', () => {
  const f = ficheComplete();
  const pm = nouvellePartie('acquereur', false);
  Object.assign(pm, { nature: 'PM', denomination: 'SCI Les Tilleuls', numeroRegistre: '912345678', representant: 'J. Bernard', ppe: 'non' });
  pm.verification = { piece: 'kbis', date: '2026-11-19', par: 'S. Dupont', mode: 'presentiel' };
  pm.gel = { date: '2026-11-19', resultat: 'aucune' };
  f.parties[1] = pm;
  assert.ok(evaluerFiche(f, {}).manquants.some((m) => m.includes('bénéficiaire(s) effectif(s)')));
  const be = nouveauBeneficiaire();
  Object.assign(be, { nom: 'Bernard', prenom: 'Jean', dateNaissance: '1970-01-01', detention: '60 %', ppe: 'proche', gel: { date: '2026-11-19', resultat: 'aucune' } });
  pm.beneficiaires.push(be);
  assert.equal(evaluerFiche(f, {}).niveau, 'renforcee');
});

test('vigilance : origine des fonds exigée au-delà du seuil ; achat comptant important → renforcée', () => {
  const f = ficheComplete();
  f.financement = { pret: 'non', montantPret: '', apport: '', origines: [], paysFonds: 'FR', justificatifsRecus: false };
  f.bien.prix = '450000';
  const ev = evaluerFiche(f, { seuils: { comptantRenforce: 300000 } });
  assert.equal(ev.niveau, 'renforcee');
  assert.ok(ev.manquants.some((m) => m.includes('Justificatifs de l’origine des fonds')));
  assert.ok(ev.manquants.some((m) => m.includes('Origine des fonds')));
});

test('vigilance : signal fort → transmission au déclarant requise', () => {
  const f = ficheComplete();
  f.signaux = { pretenom: true };
  const ev = evaluerFiche(f, {});
  assert.equal(ev.transmissionRecommandee, true);
  assert.ok(ev.manquants.some((m) => m.includes('déclarant')));
  assert.ok(ev.recommandation.includes('sans en informer le client'));
});

test('vigilance : location sous 10 000 € → hors champ ; conservation = clôture + 5 ans', () => {
  const f = ficheComplete();
  f.type = 'location'; f.bien.loyer = '2500';
  assert.equal(evaluerFiche(f, {}).horsChamp, true);
  const g = ficheComplete();
  g.dateCloture = '2027-03-15';
  const ev = evaluerFiche(g, {});
  assert.equal(ev.conservationJusquau, '2032-03-15');
  assert.equal(peutCloturer(g, ev).ok, true);
});

test('vigilance : pièce expirée à la date de vérification', () => {
  const f = ficheComplete();
  f.parties[0].verification.expiration = '2025-01-01';
  assert.ok(evaluerFiche(f, {}).manquants.some((m) => m.includes('expirée')));
});

// Formation ---------------------------------------------------------------------
test('formation : module adapté aux risques et à la fonction, sanctions toujours incluses', () => {
  const clsRural = calculerClassification(profilRural);
  const clsLuxe = calculerClassification(profilLuxe);
  const cR = contexte({ classification: clsRural, reponses: profilRural });
  const cL = contexte({ classification: clsLuxe, reponses: profilLuxe });
  const rural = sectionsPour('negociateur', cR).map((s) => s.id);
  const luxe = sectionsPour('negociateur', cL).map((s) => s.id);
  assert.ok(rural.includes('sanctions') && luxe.includes('sanctions'));
  assert.ok(!rural.includes('prestige'));
  assert.ok(luxe.includes('prestige') && luxe.includes('etrangers') && luxe.includes('societes'));
  assert.ok(luxe.includes('roleTerrain') && !luxe.includes('roleDirigeant'));
  assert.ok(sectionsPour('dirigeant', cL).some((s) => s.id === 'roleDirigeant'));
  for (const s of sectionsPour('responsable', cL)) {
    assert.ok(s.paragraphes.length > 0 && s.points.length > 0, s.id);
    for (const t of [...s.paragraphes, ...s.points, ...s.pratique]) assert.ok(!/undefined|NaN|\[object/.test(t), `${s.id} : ${t}`);
  }
});

test('formation : quiz de 12 questions avec 2 questions sanctions, déterministe', () => {
  const cls = calculerClassification(profilLuxe);
  const ids = sectionsPour('negociateur', contexte({ classification: cls, reponses: profilLuxe })).map((s) => s.id);
  const q1 = questionsPour(ids, 'membre-1');
  const q2 = questionsPour(ids, 'membre-1');
  assert.equal(q1.length, 12);
  assert.deepEqual(q1.map((q) => q.id), q2.map((q) => q.id));
  assert.ok(q1.filter((q) => q.sections.includes('sanctions')).length >= 2);
  assert.ok(q1.some((q) => q.sections.includes('declaration')));
  assert.equal(new Set(q1.map((q) => q.id)).size, 12);
});

test('formation : correction et seuil de réussite à 80 %', () => {
  const qs = QUESTIONS.slice(0, 10);
  const toutBon = Object.fromEntries(qs.map((q) => [q.id, q.c]));
  assert.equal(corriger(qs, toutBon).reussi, true);
  const deuxFaux = { ...toutBon, [qs[0].id]: (qs[0].c + 1) % qs[0].o.length, [qs[1].id]: (qs[1].c + 1) % qs[1].o.length };
  const r = corriger(qs, deuxFaux);
  assert.equal(r.pourcentage, 80);
  assert.equal(r.reussi, true);
  const troisFaux = { ...deuxFaux, [qs[2].id]: (qs[2].c + 1) % qs[2].o.length };
  assert.equal(corriger(qs, troisFaux).reussi, false);
});

test('formation : statut et conservation des justificatifs (départ + 5 ans)', () => {
  const m = { dateArrivee: '2026-01-10', formations: [] };
  assert.equal(statutFormation(m, { aujourdhui: '2026-11-19' }).etat, 'aFormer');
  m.formations.push({ date: '2025-10-01', reussi: true });
  assert.equal(statutFormation(m, { periodicite: 12, aujourdhui: '2026-11-19' }).etat, 'echu');
  m.formations.push({ date: '2026-11-01', reussi: true });
  const st = statutFormation(m, { periodicite: 12, aujourdhui: '2026-11-19' });
  assert.equal(st.etat, 'aJour');
  assert.equal(st.prochaine, '2027-11-01');
  assert.equal(finConservation({ dateDepart: '2027-06-30' }), '2032-06-30');
  assert.equal(finConservation({}), null);
});

test('formation : plan pour toutes les fonctions et périodicité', () => {
  const cls = calculerClassification(profilVille);
  const plan = planFormation(contexte({ classification: cls, reponses: profilVille }));
  assert.equal(plan.length, 6);
  assert.ok(plan.every((p) => p.duree > 20 && p.periodicite === 12));
  assert.equal(periodiciteMois(1, 'assistant'), 24);
});

test('contenus : chaque question est bien formée et rattachée à une section existante', () => {
  const ids = new Set(SECTIONS.map((s) => s.id));
  for (const q of QUESTIONS) {
    assert.ok(q.o.length >= 3 && q.c >= 0 && q.c < q.o.length, q.id);
    assert.ok(q.sections.every((s) => ids.has(s)), q.id);
  }
  assert.equal(new Set(QUESTIONS.map((q) => q.id)).size, QUESTIONS.length);
});

// Auto-contrôle -----------------------------------------------------------------
test('auto-contrôle : score, priorités critiques en tête, diagnostic à 12 points', () => {
  assert.equal(pointsDiagnostic().length, 12);
  const toutOui = evaluer(Object.fromEntries(pointsDiagnostic().map((p) => [p.id, 'oui'])), pointsDiagnostic());
  assert.equal(toutOui.score, 100);
  assert.equal(toutOui.appreciation.niveau, 'bon');
  const rien = evaluer({}, pointsDiagnostic());
  assert.equal(rien.score, 0);
  assert.equal(rien.appreciation.niveau, 'faible');
  assert.ok(rien.priorites[0].critique);
  const mix = evaluer({ ac03: 'oui', ac05: 'partiel', ac16: 'non' }, pointsDiagnostic());
  assert.ok(mix.score > 0 && mix.score < 50);
});

test('auto-contrôle : pré-remplissage depuis l’état du dossier', () => {
  const etat = {
    tracfin: { declarant: { nom: 'Dupont' }, correspondant: { nom: 'Dupont' }, ermesEnregistre: true },
    classification: { dateValidation: '2026-11-01' },
    procedures: { dateValidation: '2026-11-02' },
    vigilances: [{}],
  };
  const r = preremplir(etat, { aujourdhui: '2026-11-19', statutsEquipe: [{ etat: 'aJour' }, { etat: 'aFormer' }] });
  assert.equal(r.ac02, 'oui');
  assert.equal(r.ac03, 'oui');
  assert.equal(r.ac04, 'oui');
  assert.equal(r.ac05, 'oui');
  assert.equal(r.ac16, 'partiel');
});
