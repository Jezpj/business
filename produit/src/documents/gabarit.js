// Gabarit commun des documents imprimables (A4) et exportables vers Word.
import { html, esc } from '../ui/html.js';
import { AVERTISSEMENT, VERSION_CONTENUS } from '../contenus/textes.js';
import { formatDate } from '../moteur/dates.js';

// Chaîne CSS sûre : guillemets, antislash et chevrons échappés (empêche toute sortie de la balise <style>).
const chaineCss = (s) => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/</g, '\\3c ').replace(/>/g, '\\3e ').replace(/[\r\n]+/g, ' ') + '"';

export const CSS_DOCUMENT = `
@page { size: A4; margin: 16mm 15mm 20mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 10pt; line-height: 1.5; color: #14213d; background: #fff; }
.page { max-width: 180mm; margin: 0 auto; padding: 8mm 0 0; }
.bandeau { width: 100%; border-collapse: collapse; margin: 0 0 10pt; border-bottom: 2.5pt solid #14213d; }
.bandeau td { border: 0; padding: 0 0 8pt; vertical-align: bottom; }
.bandeau .marque { font-size: 8pt; letter-spacing: .08em; text-transform: uppercase; color: #5b6475; }
.bandeau .agence { font-size: 11pt; font-weight: 700; }
.bandeau .droite { text-align: right; font-size: 8.5pt; color: #5b6475; }
h1 { font-size: 19pt; line-height: 1.2; margin: 6pt 0 2pt; letter-spacing: -.01em; }
.sous-titre { margin: 0 0 12pt; color: #3c4a66; font-size: 10.5pt; }
h2 { font-size: 12.5pt; margin: 16pt 0 6pt; padding-bottom: 3pt; border-bottom: 1pt solid #c9cfdb; break-after: avoid; }
h3 { font-size: 10.5pt; margin: 10pt 0 4pt; break-after: avoid; }
p { margin: 0 0 6pt; }
ul, ol { margin: 0 0 8pt; padding-left: 16pt; }
li { margin: 0 0 3pt; }
table.t { width: 100%; border-collapse: collapse; margin: 4pt 0 10pt; font-size: 9pt; }
table.t th, table.t td { border: .75pt solid #c9cfdb; padding: 4pt 5pt; vertical-align: top; text-align: left; }
table.t th { background: #eef1f6; font-weight: 600; }
table.t tr { break-inside: avoid; }
table.meta { width: 100%; border-collapse: collapse; margin: 0 0 12pt; font-size: 9pt; }
table.meta td { border: .75pt solid #c9cfdb; padding: 4pt 6pt; }
table.meta td.l { width: 32%; background: #f6f7fa; color: #3c4a66; }
.niv { display: inline-block; padding: 1pt 6pt; border-radius: 8pt; font-weight: 600; font-size: 8.5pt; white-space: nowrap; }
.niv-1 { background: #e3f2e8; color: #1b5e34; } .niv-2 { background: #fff1cc; color: #7a4f00; } .niv-3 { background: #fde0de; color: #9b1c14; }
.niv-standard { background: #e3f2e8; color: #1b5e34; } .niv-renforcee { background: #fff1cc; color: #7a4f00; } .niv-bloquee { background: #fde0de; color: #9b1c14; }
.encadre { border: 1pt solid #c9cfdb; border-left: 3pt solid #14213d; padding: 6pt 9pt; margin: 6pt 0 10pt; background: #f8f9fb; break-inside: avoid; }
.alerte { border-left-color: #b3261e; background: #fdf3f2; }
.barre { height: 7pt; background: #e8ebf1; border-radius: 4pt; overflow: hidden; }
.barre span { display: block; height: 100%; background: #14213d; }
.petit { font-size: 8.5pt; color: #5b6475; }
.signatures { width: 100%; border-collapse: collapse; margin-top: 18pt; break-inside: avoid; }
.signatures td { width: 50%; vertical-align: top; padding: 0 10pt 0 0; border: 0; }
.signatures .cadre { border-top: .75pt solid #14213d; padding-top: 4pt; height: 52pt; font-size: 9pt; }
.pied-doc { margin-top: 16pt; padding-top: 6pt; border-top: .75pt solid #c9cfdb; font-size: 7.5pt; color: #5b6475; }
.demo-bandeau { border: 1pt dashed #b3261e; color: #9b1c14; padding: 4pt 8pt; font-size: 8.5pt; margin: 0 0 8pt; }
.filigrane { position: fixed; top: 38%; left: -10%; right: -10%; text-align: center; transform: rotate(-28deg); font-size: 48pt; font-weight: 800; color: rgba(179, 38, 30, .10); letter-spacing: .05em; pointer-events: none; z-index: 0; }
.saut { break-before: page; }
@media screen { body { background: #e9ecf2; } .page { background: #fff; padding: 14mm 15mm 16mm; margin: 0 auto; box-shadow: 0 1px 4px rgba(20,33,61,.15); } }
`;

/**
 * Assemble un document HTML complet.
 * @param {object} d  { titre, sousTitre, corps (Html), meta: [[libellé, valeur]], signatures: [libellés] }
 * @param {object} c  contexte : { nomAgence, licence: {valide, donnees}, aujourdhui }
 */
export function documentComplet(d, c) {
  const demo = !c.licence?.valide;
  const ligneLicence = demo
    ? 'Version de démonstration — document non valable'
    : `Licence ${c.licence.donnees.id} — ${c.licence.donnees.agence} — valable jusqu’au ${formatDate(c.licence.donnees.exp)}`;
  const pied = `${c.nomAgence || 'Agence'} · ${d.titre} · ${demo ? 'Démonstration — non valable' : 'Licence ' + c.licence.donnees.id}`;
  const cssPage = `@page { @bottom-left { content: ${chaineCss(pied)}; font-size: 7pt; color: #5b6475; font-family: 'Segoe UI', Roboto, Arial, sans-serif; } @bottom-right { content: "Page " counter(page) " / " counter(pages); white-space: nowrap; font-size: 7pt; color: #5b6475; font-family: 'Segoe UI', Roboto, Arial, sans-serif; } }`;
  const corps = html`
<div class="page">
  ${demo ? html`<div class="filigrane">DÉMONSTRATION</div><div class="demo-bandeau">Document produit en mode démonstration : il n’est pas nominatif et n’a pas de valeur de preuve. Activez une licence pour obtenir la version définitive.</div>` : ''}
  <table class="bandeau"><tr>
    <td><div class="marque">Dispositif LCB-FT</div><div class="agence">${c.nomAgence || 'Agence (identité à compléter)'}</div></td>
    <td class="droite">Édité le ${formatDate(c.aujourdhui)}<br>Contenus réglementaires v${VERSION_CONTENUS}</td>
  </tr></table>
  <h1>${d.titre}</h1>
  ${d.sousTitre ? html`<p class="sous-titre">${d.sousTitre}</p>` : ''}
  ${d.meta?.length ? html`<table class="meta">${d.meta.map(([l, v]) => html`<tr><td class="l">${l}</td><td>${v}</td></tr>`)}</table>` : ''}
  ${d.corps}
  ${d.signatures?.length ? html`<table class="signatures"><tr>${d.signatures.map((s) => html`<td><div class="cadre">${s}<br><span class="petit">Date et signature</span></div></td>`)}</tr></table>` : ''}
  <div class="pied-doc">${ligneLicence}. ${AVERTISSEMENT}</div>
</div>`;
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(d.titre)} — ${esc(c.nomAgence || '')}</title><style>${CSS_DOCUMENT}${cssPage}</style></head><body>${corps}</body></html>`;
}

export const badgeNiveau = (n, libelle) => html`<span class="niv niv-${n}">${libelle}</span>`;
