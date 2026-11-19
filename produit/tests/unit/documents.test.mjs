import { test } from 'node:test';
import assert from 'node:assert/strict';
import { etatInitial } from '../../src/etat.js';
import { contexteDocument } from '../../src/documents/contexte.js';
import { documentComplet } from '../../src/documents/gabarit.js';
import { docClassification, docProcedures, docTracfin } from '../../src/documents/dispositif.js';
import { docPlanFormation, docAttestation, docRegistreFormations, docSupportFormation } from '../../src/documents/formation.js';
import { docFicheVigilance, docRegistreVigilance, docAutocontrole } from '../../src/documents/operations.js';
import { nouvelleFiche, nouveauBeneficiaire } from '../../src/moteur/vigilance.js';
import { FACTEURS } from '../../src/contenus/questions-profil.js';

export function etatExemple() {
  const e = etatInitial();
  Object.assign(e.agence, { raisonSociale: 'Agence des Tilleuls <script>alert(1)</script>', siren: '912345678', adresse: '3 rue des Lilas', codePostal: '74000', ville: 'Annecy', dirigeantPrenom: 'Sophie', dirigeantNom: 'Morel', dirigeantQualite: 'Gérante' });
  e.profil = Object.fromEntries(FACTEURS.map((f) => [f.id, f.type === 'pays' ? ['CH'] : f.options[1]?.v || f.options[0].v]));
  e.profil.paysRisque = ['LB'];
  e.classification = { dateValidation: '2026-11-18', validePar: 'Sophie Morel', version: 1 };
  e.procedures.dateValidation = '2026-11-18';
  Object.assign(e.tracfin, { declarant: { prenom: 'Sophie', nom: 'Morel', fonction: 'Gérante', email: 'contact@exemple.fr', telephone: '' }, memePersonne: true, ermesEnregistre: true, dateEnregistrement: '2026-11-18', dateDesignation: '2026-11-18' });
  e.equipe = [
    { id: 'm1', prenom: 'Sophie', nom: 'Morel', fonction: 'dirigeant', dateArrivee: '2012-03-01', dateDepart: '', formations: [{ id: 'f1', numero: 'F-2026-001', date: '2026-11-18', versionContenus: '2026.11', sections: [{ id: 'sanctions', titre: 'Les sanctions encourues', duree: 5 }], duree: 52, score: 92, bonnes: 11, total: 12, reussi: true }] },
    { id: 'm2', prenom: 'Lucas', nom: 'Petit', fonction: 'negociateur', dateArrivee: '2026-10-01', dateDepart: '', formations: [] },
    { id: 'm3', prenom: 'Inès', nom: 'Roux', fonction: 'assistant', dateArrivee: '2020-01-06', dateDepart: '2026-06-30', formations: [] },
  ];
  const f = nouvelleFiche({ numero: 1, date: '2026-11-19' });
  f.objet = 'Résidence secondaire';
  f.bien = { adresse: '12 chemin du Lac, Talloires', nature: 'maison', prix: '1450000', loyer: '' };
  f.parties[1].nature = 'PM';
  f.parties[1].denomination = 'SCI Lac & Monts';
  f.parties[1].beneficiaires.push({ ...nouveauBeneficiaire(), nom: 'Keller', prenom: 'Hans', dateNaissance: '1961-04-03', nationalite: 'CH', residence: 'CH', detention: '100 %', ppe: 'non', gel: { date: '2026-11-19', resultat: 'aucune' } });
  f.signaux = { prixAnormal: true };
  e.vigilances = [f];
  e.autocontroles = [{ id: 'a1', date: '2026-11-19', reponses: { ac01: 'oui', ac02: 'oui', ac03: 'oui', ac16: 'partiel' }, score: 0 }];
  return e;
}

const LICENCE = { valide: true, donnees: { id: 'LIC-2026-0001', agence: 'Agence des Tilleuls', exp: '2027-11-19', plan: 'agence' } };

function verifierDocument(d, c, nom) {
  const complet = documentComplet(d, c);
  assert.ok(complet.startsWith('<!doctype html>'), nom);
  assert.ok(!/undefined|NaN|\[object Object\]/.test(complet), `${nom} contient une valeur non rendue`);
  assert.ok(!complet.includes('<script>alert(1)</script>'), `${nom} : saisie non échappée`);
  assert.ok(complet.includes('&lt;script&gt;'), `${nom} : la saisie échappée doit apparaître`);
  return complet;
}

test('tous les documents se génèrent sans valeur manquante et avec échappement', () => {
  const etat = etatExemple();
  const c = contexteDocument(etat, { licence: LICENCE, aujourdhui: '2026-11-19' });
  const docs = {
    classification: docClassification(c),
    procedures: docProcedures(c),
    tracfin: docTracfin(c),
    plan: docPlanFormation(c),
    attestation: docAttestation(c, etat.equipe[0], etat.equipe[0].formations[0]),
    registreF: docRegistreFormations(c),
    support: docSupportFormation(c, 'negociateur'),
    fiche: docFicheVigilance(c, etat.vigilances[0]),
    registreV: docRegistreVigilance(c),
    autocontrole: docAutocontrole(c, etat.autocontroles[0]),
  };
  for (const [nom, d] of Object.entries(docs)) verifierDocument(d, c, nom);
  const proc = documentComplet(docs.procedures, c);
  assert.ok(proc.includes('Annexe B'));
  assert.ok(proc.includes('L. 561-32'));
  const fiche = documentComplet(docs.fiche, c);
  assert.ok(fiche.includes('Vigilance renforcée'), 'bien de prestige + signal → renforcée');
  assert.ok(fiche.includes('Points à compléter'));
  const registre = documentComplet(docs.registreF, c);
  assert.ok(registre.includes('30/06/2031'), 'fin de conservation = départ + 5 ans');
});

test('mode démonstration : filigrane présent ; mode licencié : numéro de licence', () => {
  const etat = etatExemple();
  const demo = documentComplet(docClassification(contexteDocument(etat, { licence: { valide: false }, aujourdhui: '2026-11-19' })), { nomAgence: 'X', licence: { valide: false }, aujourdhui: '2026-11-19' });
  assert.ok(demo.includes('DÉMONSTRATION'));
  const c = contexteDocument(etat, { licence: LICENCE, aujourdhui: '2026-11-19' });
  const lic = documentComplet(docClassification(c), c);
  assert.ok(!lic.includes('class="filigrane"'));
  assert.ok(lic.includes('LIC-2026-0001'));
});

test('documents robustes sur un état vide', () => {
  const etat = etatInitial();
  const c = contexteDocument(etat, { licence: { valide: false }, aujourdhui: '2026-11-19' });
  for (const d of [docClassification(c), docProcedures(c), docTracfin(c), docPlanFormation(c), docRegistreFormations(c), docRegistreVigilance(c)]) {
    const out = documentComplet(d, c);
    assert.ok(!/undefined|NaN|\[object Object\]/.test(out), d.titre);
  }
});
