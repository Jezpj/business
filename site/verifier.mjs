// Vérification avant mise en ligne du site.
//   Analyse site/public/ (le dossier publié).
//   node site/verifier.mjs              → échoue s'il reste des champs « REMPLACER_… » ou des liens cassés
//   node site/verifier.mjs --brouillon  → signale les champs à remplacer sans échouer
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
const brouillon = process.argv.includes('--brouillon');
const IGNORER = new Set(['src', 'node_modules']);

async function fichiers(dossier) {
  const out = [];
  for (const e of await readdir(dossier, { withFileTypes: true })) {
    if (IGNORER.has(e.name)) continue;
    const p = path.join(dossier, e.name);
    if (e.isDirectory()) out.push(...await fichiers(p)); else out.push(p);
  }
  return out;
}

const tous = await fichiers(racine);
const pages = tous.filter((f) => /\.(html|txt|xml)$/.test(f) || f.endsWith('_headers'));
const aRemplacer = new Map();
const liensCasses = [];
const sansAlt = [];
const aVerifier = [];

for (const f of pages) {
  const texte = await readFile(f, 'utf8');
  const rel = path.relative(racine, f);
  for (const m of texte.matchAll(/REMPLACER_[A-Z_]+/g)) { if (!aRemplacer.has(m[0])) aRemplacer.set(m[0], new Set()); aRemplacer.get(m[0]).add(rel); }
  if (texte.includes('class="a-completer"')) aVerifier.push(rel);
  if (!f.endsWith('.html') || rel.startsWith('app/')) continue;
  for (const m of texte.matchAll(/(?:href|src)="([^"#][^"]*)"/g)) {
    const cible = m[1];
    if (/^(https?:|mailto:|tel:|data:|REMPLACER_)/.test(cible)) continue;
    const propre = cible.split('#')[0].split('?')[0];
    const chemin = propre.startsWith('/') ? path.join(racine, propre) : path.resolve(path.dirname(f), propre);
    const existe = existsSync(chemin) && ((await stat(chemin)).isFile() || existsSync(path.join(chemin, 'index.html')));
    if (!existe) liensCasses.push(`${rel} → ${cible}`);
  }
  for (const m of texte.matchAll(/<img\b[^>]*>/g)) if (!/\balt="[^"]+"/.test(m[0])) sansAlt.push(`${rel} : ${m[0].slice(0, 60)}`);
}

let poidsTotal = 0;
for (const f of tous) poidsTotal += (await stat(f)).size;

console.log(`Pages analysées : ${pages.length} · poids total du site : ${(poidsTotal / 1024 / 1024).toFixed(2)} Mo`);
console.log(liensCasses.length ? `✗ Liens internes cassés :\n  ${liensCasses.join('\n  ')}` : '✔ Aucun lien interne cassé');
console.log(sansAlt.length ? `✗ Images sans texte alternatif :\n  ${sansAlt.join('\n  ')}` : '✔ Toutes les images ont un texte alternatif');
if (aRemplacer.size) {
  console.log(`${brouillon ? '⚠' : '✗'} Champs à remplacer avant mise en ligne :`);
  for (const [k, v] of aRemplacer) console.log(`  ${k}  (${[...v].join(', ')})`);
} else console.log('✔ Aucun champ « REMPLACER_… » restant');
const pagesProjet = [...new Set(aVerifier)];
if (pagesProjet.length) console.log(`${brouillon ? '⚠' : '✗'} Pages légales encore à l’état de projet (champs surlignés) : ${pagesProjet.join(', ')}`);

const echec = liensCasses.length || sansAlt.length || (!brouillon && (aRemplacer.size || pagesProjet.length));
process.exit(echec ? 1 : 0);
