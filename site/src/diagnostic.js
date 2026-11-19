// Diagnostic LCB-FT gratuit (page publique). Réutilise le moteur d'auto-contrôle du produit.
// Aucune réponse ne quitte le navigateur.
import { pointsDiagnostic, evaluer } from '../../produit/src/moteur/autocontrole.js';
import { GROUPES, REPONSES } from '../../produit/src/contenus/autocontrole.js';
import { html } from '../../produit/src/ui/html.js';

const PROBANT_FAIT = {
  ac02: 'Formulaire de désignation pré-rempli et marche à suivre ERMES.',
  ac03: 'Classification individualisée sur les 5 axes légaux, en 15 minutes.',
  ac04: 'Rappel de revue annuelle et gestion des versions.',
  ac05: 'Procédures internes complètes (13 sections) générées depuis votre classification.',
  ac07: 'Une fiche de vigilance guidée par opération, avec registre.',
  ac08: 'Vérification des deux parties, avec pièce, date et vérificateur tracés.',
  ac09: 'Bénéficiaires effectifs obligatoires pour toute société, avec rappel du RBE.',
  ac10: 'Question PPE systématique pour chaque partie et chaque bénéficiaire.',
  ac11: 'Consultation du registre des gels datée et tracée ; blocage en cas de correspondance.',
  ac12: 'Seuils internes et justificatifs exigés automatiquement.',
  ac16: 'Formation de chaque collaborateur, attestation numérotée et registre.',
  ac17: 'Modules construits à partir de votre classification et de chaque fonction, volet sanctions inclus.',
};

const points = pointsDiagnostic();
const reponses = {};
const racine = document.getElementById('diagnostic');

function rendre(resultat = false) {
  const res = evaluer(reponses, points);
  const nb = Object.keys(reponses).length;
  if (resultat && res.complet) {
    const niv = { bon: 'bon', moyen: 'moyen', faible: 'faible' }[res.appreciation.niveau];
    racine.innerHTML = String(html`
<section class="resultat-diag ${niv}" aria-labelledby="titre-resultat" tabindex="-1" id="bloc-resultat">
  <p class="surtitre">Votre résultat</p>
  <h2 id="titre-resultat"><span class="score-diag">${res.score}</span><span class="sur">/100</span></h2>
  <p class="appreciation">${res.appreciation.texte}</p>
  ${res.critiquesManquants.length ? html`<p><strong>${res.critiquesManquants.length} point(s) régulièrement retenu(s) dans les décisions de sanction</strong> ne sont pas couverts.</p>` : ''}
  ${res.priorites.length ? html`<h3>Vos priorités</h3>
  <ol class="priorites">${res.priorites.slice(0, 6).map((p) => html`<li>
    <strong>${p.texte}</strong>${p.critique ? html` <span class="pastille-critique">souvent sanctionné</span>` : ''}
    <span class="action">À faire : ${p.action}</span>
    ${PROBANT_FAIT[p.id] ? html`<span class="probant">Avec Probant : ${PROBANT_FAIT[p.id]}</span>` : ''}
  </li>`)}</ol>` : html`<p>Bravo : votre dispositif couvre les points essentiels. Probant peut vous faire gagner du temps sur la traçabilité au quotidien.</p>`}
  <div class="actions-diag">
    <a class="bouton bouton-primaire" href="app/">Essayer Probant gratuitement</a>
    <a class="bouton bouton-secondaire" href="index.html#tarifs">Voir le tarif (290 € HT/an)</a>
    <button type="button" class="bouton bouton-lien" id="imprimer-diag">Imprimer mon diagnostic</button>
    <button type="button" class="bouton bouton-lien" id="recommencer">Recommencer</button>
  </div>
  <p class="note">Diagnostic indicatif, établi à partir de vos seules réponses. Il ne constitue pas un audit ni un conseil juridique. Vos réponses n’ont été transmises à personne.</p>
</section>`);
    document.getElementById('bloc-resultat').focus();
    document.getElementById('imprimer-diag').addEventListener('click', () => window.print());
    document.getElementById('recommencer').addEventListener('click', () => { for (const k of Object.keys(reponses)) delete reponses[k]; rendre(); window.scrollTo(0, racine.offsetTop - 20); });
    return;
  }
  racine.innerHTML = String(html`
<form class="formulaire-diag" id="form-diag" novalidate>
  <div class="progression-diag" role="progressbar" aria-valuemin="0" aria-valuemax="${points.length}" aria-valuenow="${nb}" aria-label="Questions répondues"><span style="width:${Math.round((nb / points.length) * 100)}%"></span></div>
  <p class="compteur">${nb} / ${points.length} questions</p>
  ${GROUPES.filter((g) => points.some((p) => p.groupe === g.id)).map((g) => html`<fieldset class="groupe-diag"><legend>${g.titre}</legend>
    ${points.filter((p) => p.groupe === g.id).map((p) => html`<div class="question-diag" role="radiogroup" aria-labelledby="q-${p.id}">
      <p id="q-${p.id}">${p.texte}</p>
      <div class="reponses">${REPONSES.map((r) => html`<label><input type="radio" name="${p.id}" value="${r.v}" ${reponses[p.id] === r.v ? 'checked' : ''}><span>${r.libelle}</span></label>`)}</div>
    </div>`)}
  </fieldset>`)}
  <button type="submit" class="bouton bouton-primaire" ${nb < points.length ? 'disabled' : ''}>${nb < points.length ? `Répondez aux ${points.length - nb} question(s) restante(s)` : 'Voir mon résultat'}</button>
</form>`);
  const form = document.getElementById('form-diag');
  form.addEventListener('change', (ev) => {
    if (ev.target.name) {
      reponses[ev.target.name] = ev.target.value;
      const y = window.scrollY;
      rendre();
      window.scrollTo(0, y);
      const el = document.querySelector(`input[name="${ev.target.name}"][value="${ev.target.value}"]`);
      if (el) el.focus({ preventScroll: true });
    }
  });
  form.addEventListener('submit', (ev) => { ev.preventDefault(); rendre(true); });
}

rendre();
document.documentElement.dataset.pret = 'oui';
