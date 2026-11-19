// Tests de bout en bout : pilotent Chromium sur le fichier construit (dist-test/probant.html).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { QUESTIONS } from '../../src/contenus/formation.js';
import { FACTEURS } from '../../src/contenus/questions-profil.js';
import { signerLicence } from '../../src/licence.js';

const require = createRequire(import.meta.url);
const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let playwright;
try { playwright = require('playwright'); } catch { playwright = require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); }
const URL_APP = pathToFileURL(path.join(racine, 'dist-test', 'probant.html')).href;
const DATE = '2026-11-19';
let navigateur;

before(async () => { navigateur = await playwright.chromium.launch(); });
after(async () => { await navigateur?.close(); });

async function ouvrir({ largeur = 1366, hauteur = 900 } = {}) {
  const contexte = await navigateur.newContext({ viewport: { width: largeur, height: hauteur }, locale: 'fr-FR', acceptDownloads: true });
  const page = await contexte.newPage();
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
  page.on('dialog', (d) => d.accept());
  await page.addInitScript((d) => { window.__PROBANT_DATE__ = d; }, DATE);
  await page.goto(URL_APP);
  await page.waitForSelector('html[data-pret="oui"]');
  return { page, contexte, erreurs };
}

const aller = async (page, route) => { await page.evaluate((r) => { location.hash = '#/' + r; }, route); await page.waitForTimeout(80); };
const etat = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.__probant.etat)));
async function remplir(page, champ, valeur, cible) {
  const sel = cible ? `[data-cible="${cible}"][data-champ="${champ}"]` : `[data-champ="${champ}"]:not([data-cible])`;
  await page.fill(sel, valeur);
  await page.dispatchEvent(sel, 'change');
  await page.waitForTimeout(30);
}
async function choisir(page, champ, valeur, cible) {
  const sel = cible ? `select[data-cible="${cible}"][data-champ="${champ}"]` : `select[data-champ="${champ}"]:not([data-cible])`;
  await page.selectOption(sel, valeur);
  await page.waitForTimeout(30);
}
async function cocher(page, champ, valeur, cible) {
  const base = cible ? `[data-cible="${cible}"][data-champ="${champ}"]` : `[data-champ="${champ}"]:not([data-cible])`;
  await page.check(valeur !== undefined ? `${base}[value="${valeur}"]` : base);
  await page.waitForTimeout(30);
}

test('parcours complet : dossier « prêt pour le contrôle » à 100 % et persistant', async () => {
  const { page, contexte, erreurs } = await ouvrir();
  // 1. Agence
  await aller(page, 'agence');
  for (const [c, v] of [['agence.raisonSociale', 'Agence Test Immobilier'], ['agence.siren', '123456789'], ['agence.adresse', '10 rue du Test'], ['agence.codePostal', '69001'], ['agence.ville', 'Lyon'], ['agence.dirigeantPrenom', 'Alice'], ['agence.dirigeantNom', 'Durand']]) await remplir(page, c, v);
  // 2. Classification : on répond à chaque facteur
  await aller(page, 'classification');
  for (const f of FACTEURS) {
    if (f.type === 'pays') { await page.click('[data-action="paysAucun"]'); await page.waitForTimeout(40); continue; }
    await cocher(page, `profil.${f.id}`, f.options[f.options.length > 2 ? 1 : 0].v);
  }
  await page.click('[data-action="validerClassification"]');
  await page.waitForTimeout(100);
  let e = await etat(page);
  assert.equal(e.classification.version, 1);
  assert.equal(e.classification.dateValidation, DATE);
  // 3. Tracfin
  await aller(page, 'tracfin');
  await page.click('[data-action="dirigeantPartout"]');
  await page.waitForTimeout(60);
  await cocher(page, 'tracfin.ermesEnregistre');
  // 4. Procédures
  await aller(page, 'procedures');
  await page.click('[data-action="validerProcedures"]');
  await page.waitForTimeout(60);
  // 5. Équipe et formation
  await aller(page, 'equipe');
  await remplir(page, 'prenom', 'Bruno', 'nouveau');
  await remplir(page, 'nom', 'Martin', 'nouveau');
  await choisir(page, 'fonction', 'negociateur', 'nouveau');
  await page.click('[data-action="ajouterMembre"]');
  await page.waitForTimeout(80);
  e = await etat(page);
  assert.equal(e.equipe.length, 1);
  await page.click('[data-action="former"]');
  await page.waitForTimeout(80);
  await page.click('[data-action="formationEtape"][data-etape="section"]');
  for (let i = 0; i < 40; i++) {
    const versQuiz = await page.$('[data-action="formationEtape"][data-etape="quiz"]');
    if (versQuiz) { await versQuiz.click(); break; }
    await page.click('[data-action="formationEtape"].btn-primaire');
    await page.waitForTimeout(30);
  }
  const qids = await page.$$eval('fieldset.question', (fs) => fs.map((f) => f.dataset.qid));
  assert.equal(qids.length, 12);
  for (const qid of qids) {
    const q = QUESTIONS.find((x) => x.id === qid);
    await page.check(`#q-${qid}-${q.c}`);
    await page.waitForTimeout(20);
  }
  await page.click('[data-action="formationCorriger"]');
  await page.waitForTimeout(100);
  assert.match(await page.textContent('.resultat .score'), /100/);
  e = await etat(page);
  const f = e.equipe[0].formations[0];
  assert.equal(f.reussi, true);
  assert.equal(f.numero, 'F-2026-001');
  assert.ok(f.sections.some((s) => s.id === 'sanctions'));
  // 6. Fiche de vigilance standard complète, puis clôture
  await aller(page, 'vigilance');
  await page.click('[data-action="nouvelleFiche"]');
  await page.waitForTimeout(100);
  await remplir(page, 'objet', 'Résidence principale', 'fiche');
  await remplir(page, 'bien.adresse', '5 place Bellecour, Lyon', 'fiche');
  await remplir(page, 'bien.prix', '280000', 'fiche');
  for (const i of [0, 1]) {
    for (const [c, v] of [['nom', 'Lefèvre'], ['prenom', i ? 'Marc' : 'Julie'], ['dateNaissance', '1985-06-15'], ['lieuNaissance', 'Lyon'], ['verification.numero', 'AB123'], ['verification.date', DATE], ['verification.par', 'Bruno Martin'], ['gel.date', DATE]]) await remplir(page, `parties.${i}.${c}`, v, 'fiche');
    await choisir(page, `parties.${i}.verification.piece`, 'cni', 'fiche');
    await choisir(page, `parties.${i}.ppe`, 'non', 'fiche');
    await choisir(page, `parties.${i}.gel.resultat`, 'aucune', 'fiche');
  }
  await cocher(page, 'financement.pret', 'oui', 'fiche');
  await remplir(page, 'financement.montantPret', '250000', 'fiche');
  await page.waitForTimeout(100);
  assert.match(await page.textContent('.evaluation'), /Vigilance standard/);
  assert.match(await page.textContent('.evaluation'), /Fiche complète/);
  await remplir(page, 'dateCloture', '2026-12-15', 'fiche');
  await page.click('[data-action="cloturerFiche"]');
  await page.waitForTimeout(80);
  e = await etat(page);
  assert.equal(e.vigilances[0].statut, 'cloturee');
  // 7. Auto-contrôle
  await aller(page, 'autocontrole');
  await page.click('[data-action="appliquerSuggestions"]');
  await page.waitForTimeout(60);
  const points = await page.$$eval('input[type=radio][data-champ^="autocontroleEnCours."]', (els) => [...new Set(els.map((x) => x.dataset.champ))]);
  for (const p of points) { if (!(await page.isChecked(`input[data-champ="${p}"][value="oui"]`)) && !(await page.isChecked(`input[data-champ="${p}"][value="partiel"]`))) await page.check(`input[data-champ="${p}"][value="oui"]`); }
  await page.waitForTimeout(60);
  await page.click('[data-action="enregistrerAutocontrole"]');
  await page.waitForTimeout(80);
  // 8. Tableau de bord : 100 %
  await aller(page, 'tableau');
  assert.match(await page.textContent('.jauge-texte'), /100/);
  // 9. Persistance après rechargement
  await page.waitForTimeout(300);
  await page.reload();
  await page.waitForSelector('html[data-pret="oui"]');
  e = await etat(page);
  assert.equal(e.agence.raisonSociale, 'Agence Test Immobilier');
  assert.equal(e.vigilances.length, 1);
  assert.ok(e.journal.length >= 6, 'journal de traçabilité alimenté');
  assert.deepEqual(erreurs, []);
  await contexte.close();
});

test('licence : valide → documents nominatifs ; falsifiée ou expirée → refusée', async () => {
  const { pub, priv } = JSON.parse(await readFile(path.join(racine, 'tests', '.cle-test.json'), 'utf8'));
  assert.ok(pub);
  const valide = await signerLicence({ v: 1, id: 'LIC-TEST-0001', agence: 'Agence Test Immobilier', siren: '123456789', plan: 'agence', emis: DATE, exp: '2027-11-19' }, priv);
  const expiree = await signerLicence({ v: 1, id: 'LIC-TEST-0002', agence: 'Agence Test', plan: 'agence', emis: '2025-01-01', exp: '2026-01-01' }, priv);
  const falsifiee = valide.replace(/\.([^.]+)\./, (m, charge) => '.' + charge.slice(0, -4) + 'AAAA.');
  const { page, contexte, erreurs } = await ouvrir();
  await page.click('[data-action="chargerExemple"]');
  await aller(page, 'parametres');
  for (const [cle, attendu] of [[falsifiee, /Signature invalide|illisible|incomplète/], [expiree, /expirée/]]) {
    await page.fill('#saisie-licence', cle);
    await page.click('[data-action="activerLicence"]');
    await page.waitForTimeout(150);
    assert.match(await page.textContent('#annonce'), attendu);
    assert.equal((await etat(page)).licence.cle, '');
  }
  await page.fill('#saisie-licence', valide);
  await page.click('[data-action="activerLicence"]');
  await page.waitForTimeout(150);
  assert.match(await page.textContent('.agence-courante'), /Licence jusqu’au 19\/11\/2027/);
  await aller(page, 'classification');
  await page.click('[data-action="apercu"][data-type="classification"]');
  await page.waitForTimeout(150);
  const srcdoc = await page.$eval('.modale-cadre', (f) => f.srcdoc);
  assert.ok(srcdoc.includes('LIC-TEST-0001'));
  assert.ok(!srcdoc.includes('class="filigrane"'));
  await page.keyboard.press('Escape');
  assert.equal(await page.$('.modale'), null);
  assert.deepEqual(erreurs, []);
  await contexte.close();
});

test('documents : chaque document s’ouvre, se convertit en PDF A4 et se télécharge en Word', async () => {
  const { page, contexte, erreurs } = await ouvrir();
  await page.click('[data-action="chargerExemple"]');
  await aller(page, 'documents');
  const boutons = await page.$$eval('[data-action="apercu"]', (bs) => bs.map((b) => ({ ...b.dataset })));
  assert.ok(boutons.length >= 12, `${boutons.length} documents`);
  const sortie = path.join(racine, 'tests', 'sorties');
  await mkdir(sortie, { recursive: true });
  const pagePdf = await contexte.newPage();
  for (const d of boutons) {
    const sel = `[data-action="apercu"][data-type="${d.type}"]` + (d.id ? `[data-id="${d.id}"]` : '') + (d.fonction ? `[data-fonction="${d.fonction}"]` : '');
    await page.click(sel);
    await page.waitForSelector('.modale-cadre');
    const srcdoc = await page.$eval('.modale-cadre', (f) => f.srcdoc);
    assert.ok(srcdoc.length > 2000 && !/undefined|NaN|\[object Object\]/.test(srcdoc), d.type);
    await pagePdf.setContent(srcdoc);
    const pdf = await pagePdf.pdf({ format: 'A4', preferCSSPageSize: true });
    assert.ok(pdf.length > 5000, `PDF ${d.type}`);
    await page.click('#fermer-modale');
  }
  const [telechargement] = await Promise.all([page.waitForEvent('download'), page.click('[data-action="word"][data-type="procedures"]')]);
  assert.match(telechargement.suggestedFilename(), /procedures-internes-lcb-ft\.doc$/);
  const contenu = await readFile(await telechargement.path(), 'utf8');
  assert.ok(contenu.includes('urn:schemas-microsoft-com:office:word'));
  assert.deepEqual(erreurs, []);
  await contexte.close();
});

test('sauvegarde puis restauration après effacement complet', async () => {
  const { page, contexte } = await ouvrir();
  await page.click('[data-action="chargerExemple"]');
  await aller(page, 'parametres');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-action="exporterDonnees"]')]);
  const fichier = await dl.path();
  await page.click('details summary');
  await page.click('[data-action="toutEffacer"]');
  await page.waitForTimeout(100);
  assert.equal((await etat(page)).agence.raisonSociale, '');
  await aller(page, 'parametres');
  await page.setInputFiles('#fichier-import', fichier);
  await page.waitForTimeout(300);
  const e = await etat(page);
  assert.equal(e.agence.raisonSociale, 'Agence Exemple du Lac (fictive)');
  assert.equal(e.vigilances.length, 1);
  await page.setInputFiles('#fichier-import', { name: 'faux.json', mimeType: 'application/json', buffer: Buffer.from('{"pas":"une sauvegarde"}') });
  await page.waitForTimeout(200);
  assert.match(await page.textContent('#annonce'), /n’est pas une sauvegarde Probant/);
  await contexte.close();
});

test('fiche : correspondance au registre des gels → opération bloquée, clôture impossible', async () => {
  const { page, contexte } = await ouvrir();
  await page.click('[data-action="chargerExemple"]');
  const id = await page.evaluate(() => window.__probant.etat.vigilances[0].id);
  await aller(page, `vigilance/${id}`);
  assert.match(await page.textContent('.libelle-niveau'), /Vigilance renforcée/);
  await choisir(page, 'parties.0.gel.resultat', 'correspondance', 'fiche');
  await page.waitForTimeout(80);
  assert.match(await page.textContent('.libelle-niveau'), /ne pas réaliser/);
  assert.ok(await page.isDisabled('[data-action="cloturerFiche"]'));
  await contexte.close();
});

test('sécurité : une saisie piégée n’est jamais exécutée', async () => {
  const { page, contexte } = await ouvrir();
  await page.evaluate(() => { window.__xss = false; });
  await aller(page, 'agence');
  await remplir(page, 'agence.raisonSociale', '<img src=x onerror="window.__xss=true">"><script>window.__xss=true</script>');
  await aller(page, 'tableau');
  await page.click('[data-action="apercu"]').catch(() => {});
  await aller(page, 'documents');
  await page.click('[data-action="apercu"][data-type="procedures"]');
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => window.__xss), false);
  const cadre = page.frameLocator('.modale-cadre');
  assert.equal(await cadre.locator('img[src="x"]').count(), 0);
  await contexte.close();
});

test('mobile et accessibilité : menu repliable, chaque champ a un libellé', async () => {
  const { page, contexte, erreurs } = await ouvrir({ largeur: 390, hauteur: 844 });
  await page.click('[data-action="chargerExemple"]');
  assert.equal(await page.isVisible('#nav-principale'), false);
  await page.click('[data-action="basculerMenu"]');
  assert.equal(await page.isVisible('#nav-principale'), true);
  const largeurDoc = await page.evaluate(() => document.documentElement.scrollWidth);
  assert.ok(largeurDoc <= 392, `pas de défilement horizontal (${largeurDoc}px)`);
  const id = await page.evaluate(() => window.__probant.etat.vigilances[0].id);
  for (const r of ['agence', 'classification', 'tracfin', 'equipe', `vigilance/${id}`, 'autocontrole', 'parametres']) {
    await aller(page, r);
    const sansLibelle = await page.$$eval('input, select, textarea', (els) => els.filter((el) => {
      if (el.type === 'hidden' || el.classList.contains('visuellement-cache')) return false;
      const lbl = el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      return !lbl && !el.getAttribute('aria-label') && !el.closest('label');
    }).map((el) => el.outerHTML.slice(0, 80)));
    assert.deepEqual(sansLibelle, [], r);
  }
  assert.deepEqual(erreurs, []);
  await contexte.close();
});

test('licence proche de l’échéance : rappel de renouvellement affiché', async () => {
  const { priv } = JSON.parse(await readFile(path.join(racine, 'tests', '.cle-test.json'), 'utf8'));
  const bientot = await signerLicence({ v: 1, id: 'LIC-TEST-0003', agence: 'Agence Test', plan: 'agence', emis: '2025-12-09', exp: '2026-12-09' }, priv);
  const { page, contexte, erreurs } = await ouvrir();
  await aller(page, 'parametres');
  await page.fill('#saisie-licence', bientot);
  await page.click('[data-action="activerLicence"]');
  await page.waitForTimeout(150);
  const bandeau = await page.textContent('main');
  assert.match(bandeau, /Votre licence expire le 09\/12\/2026 \(dans 20 jours\)/);
  assert.deepEqual(erreurs, []);
  await contexte.close();
});
