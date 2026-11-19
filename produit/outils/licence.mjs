#!/usr/bin/env node
// Outil d'administration des licences Probant (à exécuter sur le poste du fondateur).
//
//   node outils/licence.mjs init                       crée la paire de clés (une seule fois)
//   node outils/licence.mjs emettre --agence "Nom" [--siren 123456789] [--plan agence|multi] [--mois 12] [--debut AAAA-MM-JJ]
//   node outils/licence.mjs verifier "PRB1.…"
//
// cle-publique.json est intégrée à l'application au build (non secrète).
// cle-privee.json est SECRÈTE : jamais versionnée (voir .gitignore), à sauvegarder dans un coffre-fort de mots de passe.
import { webcrypto } from 'node:crypto';
import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { signerLicence, verifierLicence, PLANS } from '../src/licence.js';
import { ajouterMois, aujourdHui } from '../src/moteur/dates.js';

if (!globalThis.crypto) globalThis.crypto = webcrypto;
const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FICHIER_PUB = path.join(racine, 'cle-publique.json');
const FICHIER_PRIV = path.join(racine, 'cle-privee.json');
const REGISTRE = path.join(racine, 'licences-emises.csv');

function options(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  return o;
}

async function init(o) {
  if (existsSync(FICHIER_PRIV) && !o.forcer) {
    console.error('Une clé privée existe déjà (cle-privee.json). Utilisez --forcer pour la remplacer :');
    console.error('toutes les licences déjà émises deviendraient invalides sur les nouveaux builds.');
    process.exit(1);
  }
  const paire = await webcrypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  await writeFile(FICHIER_PUB, JSON.stringify(await webcrypto.subtle.exportKey('jwk', paire.publicKey), null, 2) + '\n');
  await writeFile(FICHIER_PRIV, JSON.stringify(await webcrypto.subtle.exportKey('jwk', paire.privateKey), null, 2) + '\n', { mode: 0o600 });
  console.log('✔ cle-publique.json créée (à versionner, intégrée au build).');
  console.log('✔ cle-privee.json créée — SECRÈTE : sauvegardez-la dans votre coffre-fort de mots de passe, ne la partagez jamais.');
  console.log('→ Relancez maintenant « npm run build » pour intégrer la clé publique à l’application.');
}

async function emettre(o) {
  if (!existsSync(FICHIER_PRIV)) { console.error('cle-privee.json introuvable : exécutez d’abord « npm run licence:init ».'); process.exit(1); }
  if (!o.agence || o.agence === true) { console.error('Indiquez --agence "Raison sociale".'); process.exit(1); }
  const plan = o.plan || 'agence';
  if (!PLANS[plan]) { console.error(`Plan inconnu : ${plan} (agence ou multi).`); process.exit(1); }
  const debut = o.debut || aujourdHui();
  const mois = Number(o.mois || 12);
  const annee = debut.slice(0, 4);
  let rang = 1;
  if (existsSync(REGISTRE)) rang = (await readFile(REGISTRE, 'utf8')).split('\n').filter((l) => l.startsWith(`LIC-${annee}-`)).length + 1;
  const donnees = {
    v: 1, id: o.id || `LIC-${annee}-${String(rang).padStart(4, '0')}`, agence: String(o.agence).trim(),
    ...(o.siren && o.siren !== true ? { siren: String(o.siren) } : {}), plan, etablissements: PLANS[plan].etablissements,
    emis: debut, exp: ajouterMois(debut, mois),
  };
  const cle = await signerLicence(donnees, JSON.parse(await readFile(FICHIER_PRIV, 'utf8')));
  if (!existsSync(REGISTRE)) await writeFile(REGISTRE, 'id;agence;siren;plan;emis;exp\n');
  await appendFile(REGISTRE, `${donnees.id};"${donnees.agence.replace(/"/g, '""')}";${donnees.siren || ''};${plan};${donnees.emis};${donnees.exp}\n`);
  console.log(`✔ Licence ${donnees.id} — ${donnees.agence} — ${PLANS[plan].libelle} — jusqu’au ${donnees.exp}\n`);
  console.log(cle);
}

async function verifier(cle) {
  const pub = JSON.parse(await readFile(FICHIER_PUB, 'utf8'));
  const r = await verifierLicence(cle, pub, aujourdHui());
  console.log(r.valide ? `✔ Valide : ${JSON.stringify(r.donnees)}` : `✗ ${r.raison}`);
  process.exit(r.valide ? 0 : 1);
}

const [commande, ...reste] = process.argv.slice(2);
if (commande === 'init') await init(options(reste));
else if (commande === 'emettre') await emettre(options(reste));
else if (commande === 'verifier') await verifier(reste[0]);
else { console.log('Commandes : init | emettre --agence "Nom" [--siren …] [--plan agence|multi] [--mois 12] | verifier "PRB1.…"'); process.exit(1); }
