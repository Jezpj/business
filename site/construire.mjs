// Construit le site statique prêt à déployer :
//   Tout est écrit dans site/public/ (le seul dossier à publier).
//   - diagnostic.html (diagnostic gratuit, moteur partagé avec le produit, JS intégré)
//   - app/index.html  (copie de l'application produit/dist/probant.html)
//   - assets/captures/*.webp et exemples/*.pdf (copiés depuis produit/exemples)
// Usage : node site/construire.mjs   (après « npm run build » et « npm run exemples » dans produit/)
import { readFile, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ici = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(ici, 'public');
const produit = path.join(ici, '..', 'produit');
const { build } = await import(pathToFileURL(path.join(produit, 'node_modules', 'esbuild', 'lib', 'main.js')).href);

// 1. Diagnostic
const res = await build({ entryPoints: [path.join(ici, 'src', 'diagnostic.js')], bundle: true, format: 'iife', target: ['es2020'], minify: true, write: false, legalComments: 'none' });
const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const gabarit = await readFile(path.join(ici, 'src', 'diagnostic.html'), 'utf8');
await writeFile(path.join(pub, 'diagnostic.html'), gabarit.replace('/*__JS__*/', () => js));
console.log('✔ diagnostic.html');

// 2. Application
await mkdir(path.join(pub, 'app'), { recursive: true });
await copyFile(path.join(produit, 'dist', 'probant.html'), path.join(pub, 'app', 'index.html'));
console.log('✔ app/index.html');

// 3. Exemples PDF
await mkdir(path.join(pub, 'exemples'), { recursive: true });
for (const f of ['01-classification-des-risques.pdf', '02-procedures-internes.pdf', '05-attestation-de-formation.pdf', '08-fiche-de-vigilance.pdf']) {
  await copyFile(path.join(produit, 'exemples', f), path.join(pub, 'exemples', f));
}
console.log('✔ exemples/*.pdf');

// 4. Captures en WebP (1440 px de large) — nécessite Python + Pillow ; sinon les fichiers existants sont conservés.
await mkdir(path.join(pub, 'assets', 'captures'), { recursive: true });
const src = path.join(produit, 'exemples', 'captures');
if (existsSync(src)) {
  const fichiers = (await readdir(src)).filter((f) => f.endsWith('.png'));
  try {
    execFileSync('python3', ['-I', '-c', `
import sys
from PIL import Image
src, dst, noms = sys.argv[1], sys.argv[2], sys.argv[3:]
for n in noms:
    im = Image.open(f"{src}/{n}").convert("RGB")
    im = im.resize((1440, round(im.height * 1440 / im.width)), Image.LANCZOS)
    im.save(f"{dst}/{n[:-4]}.webp", "WEBP", quality=82, method=6)
`, src, path.join(pub, 'assets', 'captures'), ...fichiers]);
    console.log(`✔ assets/captures/*.webp (${fichiers.length})`);
  } catch (e) {
    console.warn('⚠ Conversion WebP impossible (Python/Pillow absents) : captures existantes conservées.');
  }
}
