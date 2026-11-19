import { html } from '../ui/html.js';
import { enTete, bouton, badge, encadre } from '../ui/composants.js';
import { bilan } from './bilan.js';
import { etatExemple } from '../exemple.js';
import { journaliser } from '../etat.js';

export function rendre(app) {
  const b = bilan(app);
  const vide = !app.etat.agence.raisonSociale && !app.etat.vigilances.length && !app.etat.equipe.length;
  const r = 2 * Math.PI * 52;
  return html`
${enTete('Tableau de bord', app.etat.agence.raisonSociale || 'Votre dossier LCB-FT', html`${bouton('Nouvelle fiche de vigilance', 'nouvelleFiche', { variante: 'primaire', icone: '＋' })}`)}
${vide ? encadre(html`<strong>Bienvenue dans Probant.</strong> Suivez les étapes ci-dessous : en 30 minutes environ, le dossier anti-blanchiment de votre agence est prêt. Vous voulez d’abord explorer ? ${bouton('Charger une agence d’exemple (fictive)', 'chargerExemple', { variante: 'lien' })}`) : ''}
${app.etat.exemple ? encadre(html`Vous explorez une <strong>agence d’exemple fictive</strong>. ${bouton('Effacer l’exemple et commencer mon dossier', 'effacerExemple', { variante: 'lien' })}`, 'attention') : ''}
<div class="grille-tableau">
  <section class="carte carte-pret" aria-labelledby="titre-pret">
    <h2 id="titre-pret">Prêt pour un contrôle</h2>
    <div class="jauge" role="img" aria-label="Dossier complet à ${b.pret} %">
      <svg viewBox="0 0 120 120" width="132" height="132" aria-hidden="true"><circle cx="60" cy="60" r="52" class="jauge-fond"/><circle cx="60" cy="60" r="52" class="jauge-valeur" stroke-dasharray="${(r * b.pret) / 100} ${r}" transform="rotate(-90 60 60)"/></svg>
      <div class="jauge-texte"><strong>${b.pret}<small>%</small></strong><span>du dossier</span></div>
    </div>
    <p class="aide">Les 7 éléments qu’un inspecteur de la DGCCRF demande en premier.</p>
  </section>
  <section class="carte carte-etapes" aria-labelledby="titre-etapes">
    <h2 id="titre-etapes">Votre dossier, étape par étape</h2>
    <ol class="etapes">${b.etapes.map((e, i) => html`<li class="etape ${e.ok ? 'faite' : e.attention ? 'attention' : ''}">
      <span class="pastille" aria-hidden="true">${e.ok ? '✓' : e.attention ? '!' : i + 1}</span>
      <a href="#/${e.id}"><strong>${e.titre}</strong><span>${e.detail}</span></a>
      <span class="visuellement-cache">${e.ok ? 'terminé' : 'à faire'}</span>
    </li>`)}</ol>
  </section>
  <section class="carte" aria-labelledby="titre-afaire">
    <h2 id="titre-afaire">À faire maintenant</h2>
    ${b.aFaire.length ? html`<ul class="a-faire">${b.aFaire.slice(0, 8).map((x) => html`<li class="${x.critique ? 'critique' : ''}"><a href="#/${x.route}">${x.texte}</a>${x.critique ? html`<span class="badge badge-3">Prioritaire</span>` : ''}</li>`)}</ul>` : html`<p class="succes">Tout est à jour. Pensez à ouvrir une fiche de vigilance pour chaque nouvelle opération.</p>`}
  </section>
  <section class="carte" aria-labelledby="titre-profil">
    <h2 id="titre-profil">Profil de risque</h2>
    <p>${badge(b.cls.global.niveau, b.cls.global.libelle)} <span class="aide">indice ${b.cls.indice}/100 — ${b.cls.repondus}/${b.cls.total} facteurs renseignés</span></p>
    <ul class="axes-mini">${b.cls.axes.map((a) => html`<li><span>${a.lettre}. ${a.titre}</span><span class="barre-mini"><span class="niv-${a.niveau || 0}" style="width:${((a.niveau || 0) / 3) * 100}%"></span></span></li>`)}</ul>
    <a class="lien" href="#/classification">Voir la classification</a>
  </section>
  <section class="carte" aria-labelledby="titre-chiffres">
    <h2 id="titre-chiffres">En chiffres</h2>
    <dl class="chiffres">
      <div><dt>Collaborateurs à jour</dt><dd>${b.formes.length}/${b.actifs.length}</dd></div>
      <div><dt>Fiches en cours</dt><dd>${b.enCours.length}</dd></div>
      <div><dt>Fiches incomplètes</dt><dd>${b.incompletes.length}</dd></div>
      <div><dt>Vigilance renforcée</dt><dd>${b.enCours.filter((x) => x.ev.niveau !== 'standard').length}</dd></div>
    </dl>
  </section>
</div>`;
}

export const actions = {
  chargerExemple(app) {
    if (app.etat.agence.raisonSociale && !confirm('Remplacer les données actuelles par l’agence d’exemple ?')) return;
    app.remplacerEtat(etatExemple(app.aujourdhui()));
    journaliser(app.etat, 'Agence d’exemple chargée');
    app.annoncer('Agence d’exemple chargée. Explorez librement : rien n’est envoyé sur Internet.');
  },
  effacerExemple(app) {
    if (!confirm('Effacer l’agence d’exemple et commencer votre propre dossier ?')) return;
    app.reinitialiser();
    app.annoncer('Exemple effacé. Commencez par l’identité de votre agence.');
    app.naviguer('agence');
  },
};
