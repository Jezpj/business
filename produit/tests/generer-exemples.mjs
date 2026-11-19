// Génère les exemples de documents (PDF) et les captures d'écran à partir d'une agence FICTIVE complète.
//   npm run exemples   → produit/exemples/*.pdf et produit/exemples/captures/*.png
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { etatExemple } from '../src/exemple.js';
import { calculerClassification } from '../src/moteur/risques.js';
import { contexte, sectionsPour, enregistrementFormation, questionsPour, corriger } from '../src/moteur/formation.js';
import { empreinteClassification } from '../src/vues/bilan.js';
import { QUESTIONS } from '../src/contenus/formation.js';
import { signerLicence } from '../src/licence.js';

const require = createRequire(import.meta.url);
const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let playwright;
try { playwright = require('playwright'); } catch { playwright = require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); }
const DATE = '2026-11-19';
const sortie = path.join(racine, 'exemples');
await mkdir(path.join(sortie, 'captures'), { recursive: true });

// État d'exemple complet et cohérent
const e = etatExemple(DATE);
e.classification = { dateValidation: '2026-11-18', validePar: 'Sophie Exemple', version: 1 };
e.classification.empreinte = empreinteClassification(e);
Object.assign(e.procedures, { dateValidation: '2026-11-18', validePar: 'Sophie Exemple', versionClassification: 1, archivage: 'dossier numérique par opération, sauvegardé chaque semaine' });
Object.assign(e.tracfin, { ermesEnregistre: true, dateEnregistrement: '2026-11-18', dateDesignation: '2026-11-18' });
const cls = calculerClassification(e.profil, e.ajustements, e.seuils);
const c = contexte({ agence: e.agence, classification: cls, reponses: e.profil, seuils: e.seuils, tracfin: e.tracfin });
let rang = 0;
for (const m of e.equipe.slice(0, 3)) {
  const sections = sectionsPour(m.fonction, c);
  const qs = questionsPour(sections.map((s) => s.id), `${m.id}-1`);
  const rep = Object.fromEntries(qs.map((q, i) => [q.id, i === 3 ? (q.c + 1) % q.o.length : q.c]));
  const r = corriger(qs, rep);
  m.formations.push(enregistrementFormation({ date: '2026-11-18', sections, resultat: r, rang: ++rang }));
}
e.compteurs.attestations = rang;
const f = e.vigilances[0];
const be = f.parties[1].beneficiaires[0];
be.ppe = 'non'; be.gel = { date: DATE, resultat: 'aucune' };
Object.assign(f.financement, { origines: ['revenusEtrangers', 'venteBien'], justificatifs: 'Acte de vente du 03/06/2026 (Genève), relevés UBS mai-octobre 2026', justificatifsRecus: true });
f.analyse = 'Acquéreur personne morale détenue à 100 % par un résident suisse. Fonds issus de la vente d’un appartement à Genève (acte fourni) et d’épargne ; virements depuis un compte suisse au nom du bénéficiaire effectif. Prix cohérent avec les références du secteur. Aucune incohérence relevée.';
f.validation = { nom: 'Sophie Exemple', date: DATE };
e.autocontroles = [{ id: 'ac-ex', date: DATE, par: 'Sophie Exemple', score: 0, reponses: { ac01: 'oui', ac02: 'oui', ac03: 'oui', ac04: 'oui', ac05: 'oui', ac06: 'partiel', ac07: 'oui', ac08: 'oui', ac09: 'oui', ac10: 'oui', ac11: 'oui', ac12: 'partiel', ac13: 'oui', ac14: 'oui', ac15: 'partiel', ac16: 'partiel', ac17: 'oui', ac18: 'oui', ac19: 'oui', ac20: 'oui' } }];
e.derniereSauvegarde = DATE;

// Licence d'exemple signée avec la clé de TEST (les exemples restent marqués « fictif »)
const { priv } = JSON.parse(await readFile(path.join(racine, 'tests', '.cle-test.json'), 'utf8'));
e.licence.cle = await signerLicence({ v: 1, id: 'LIC-EXEMPLE', agence: 'Agence Exemple du Lac (fictive)', plan: 'agence', emis: DATE, exp: '2027-11-19' }, priv);

const navigateur = await playwright.chromium.launch();
const ctx = await navigateur.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'fr-FR' });
const page = await ctx.newPage();
await page.addInitScript(([d, s]) => { window.__PROBANT_DATE__ = d; if (!localStorage.getItem('probant:v1')) localStorage.setItem('probant:v1', s); }, [DATE, JSON.stringify(e)]);
const url = pathToFileURL(path.join(racine, 'dist-test', 'probant.html')).href;
await page.goto(url);
await page.waitForSelector('html[data-pret="oui"]');

// Documents → PDF
const aExporter = [
  ['classification', {}, '01-classification-des-risques'],
  ['procedures', {}, '02-procedures-internes'],
  ['tracfin', {}, '03-designation-tracfin'],
  ['plan', {}, '04-plan-de-formation'],
  ['attestation', { id: e.equipe[1].id, formation: e.equipe[1].formations[0].id }, '05-attestation-de-formation'],
  ['registreFormations', {}, '06-registre-des-formations'],
  ['support', { fonction: 'negociateur' }, '07-support-formation-negociateur'],
  ['fiche', { id: f.id }, '08-fiche-de-vigilance'],
  ['registreVigilance', {}, '09-registre-des-fiches'],
  ['autocontrole', { id: 'ac-ex' }, '10-rapport-auto-controle'],
];
const pdfPage = await ctx.newPage();
for (const [type, donnees, nom] of aExporter) {
  const html = await page.evaluate(([t, d]) => {
    const b = document.createElement('button');
    b.dataset.type = t; Object.entries(d).forEach(([k, v]) => { b.dataset[k] = v; }); b.dataset.action = 'apercu';
    document.body.appendChild(b); b.click(); b.remove();
    return document.querySelector('.modale-cadre').srcdoc;
  }, [type, donnees]);
  await page.click('#fermer-modale');
  await pdfPage.setContent(html);
  await writeFile(path.join(sortie, `${nom}.pdf`), await pdfPage.pdf({ format: 'A4', preferCSSPageSize: true }));
  console.log('✔', nom + '.pdf');
}

// Captures d'écran de l'application
const captures = [['tableau', '01-tableau-de-bord'], ['classification', '02-classification'], [`vigilance/${f.id}`, '03-fiche-de-vigilance'], [`formation/${e.equipe[3].id}`, '04-formation'], ['documents', '05-documents']];
for (const [r, nom] of captures) {
  await page.evaluate((x) => { location.hash = '#/' + x; }, r);
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(sortie, 'captures', `${nom}.png`) });
  console.log('✔', nom + '.png');
}
await navigateur.close();
