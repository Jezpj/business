// Construit l'application Probant en UN SEUL fichier HTML autonome (CSS et JS intégrés),
// utilisable hébergé (https) comme en local (file://), sans aucune dépendance réseau.
//
//   node build.mjs              -> dist/probant.html (clé publique de production : cle-publique.json)
//   node build.mjs --cle-test   -> dist-test/probant.html (clé de test éphémère, pour les tests E2E)
import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.dirname(fileURLToPath(import.meta.url));
const modeTest = process.argv.includes('--cle-test');
const { version } = JSON.parse(await readFile(path.join(racine, 'package.json'), 'utf8'));

async function clePublique() {
  if (modeTest) {
    // Paire de clés éphémère : la clé privée sert uniquement aux tests (fichier ignoré par git).
    const paire = await webcrypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    const pub = await webcrypto.subtle.exportKey('jwk', paire.publicKey);
    const priv = await webcrypto.subtle.exportKey('jwk', paire.privateKey);
    await writeFile(path.join(racine, 'tests', '.cle-test.json'), JSON.stringify({ pub, priv }, null, 2));
    return pub;
  }
  const fichier = path.join(racine, 'cle-publique.json');
  if (existsSync(fichier)) return JSON.parse(await readFile(fichier, 'utf8'));
  console.warn('⚠  cle-publique.json absent : les licences ne pourront pas être activées sur ce build (mode démo uniquement).');
  console.warn('   Exécutez « npm run licence:init » puis relancez « npm run build ».');
  return null;
}

async function construire({ entree, gabarit, sortie, titre }) {
  const cle = await clePublique();
  const resultat = await build({
    entryPoints: [path.join(racine, entree)],
    bundle: true,
    format: 'iife',
    target: ['es2020'],
    minify: !modeTest,
    write: false,
    legalComments: 'none',
    define: {
      __CLE_PUBLIQUE__: JSON.stringify(cle),
      __VERSION__: JSON.stringify(version),
      __DATE_BUILD__: JSON.stringify(new Date().toISOString().slice(0, 10)),
    },
  });
  const js = resultat.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  const css = await readFile(path.join(racine, 'src', 'styles.css'), 'utf8');
  let html = await readFile(path.join(racine, gabarit), 'utf8');
  html = html
    .replace('/*__CSS__*/', () => css)
    .replace('/*__JS__*/', () => js)
    .replaceAll('__TITRE__', titre)
    .replaceAll('__VERSION__', version);
  await mkdir(path.dirname(sortie), { recursive: true });
  await writeFile(sortie, html);
  const ko = (Buffer.byteLength(html) / 1024).toFixed(0);
  console.log(`✔ ${path.relative(racine, sortie)} (${ko} Ko)${cle ? '' : ' — sans clé de licence'}`);
}

const dossier = modeTest ? 'dist-test' : 'dist';
await construire({
  entree: 'src/main.js',
  gabarit: 'src/index.html',
  sortie: path.join(racine, dossier, 'probant.html'),
  titre: 'Probant — Dossier LCB-FT de l’agence',
});
