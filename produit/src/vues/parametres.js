import { html } from '../ui/html.js';
import { enTete, bouton, encadre } from '../ui/composants.js';
import { LISTES_PAYS } from '../contenus/pays.js';
import { VERSION_CONTENUS, AVERTISSEMENT, LIENS } from '../contenus/textes.js';
import { formatDate } from '../moteur/dates.js';
import { PLANS } from '../licence.js';
import { exporter, importer, journaliser } from '../etat.js';
import { telechargerTexte } from '../export.js';

/* global __URL_ACHAT__ */
// Hébergée avec le site (…/app/), l'app pointe vers la page tarifs du site ; sinon vers l'URL fixée au build.
export function urlAchat() {
  const defaut = typeof __URL_ACHAT__ !== 'undefined' ? __URL_ACHAT__ : '#';
  try { return location.protocol.startsWith('http') ? new URL('../#tarifs', location.href).href : defaut; } catch { return defaut; }
}

export function rendre(app) {
  const e = app.etat;
  const l = app.licence;
  const d = l.donnees;
  const ecart = l.valide && e.agence.raisonSociale && d.agence.trim().toLowerCase() !== e.agence.raisonSociale.trim().toLowerCase();
  return html`
${enTete('Paramètres', 'Licence, sauvegarde de vos données et informations réglementaires.')}
<section class="carte" aria-labelledby="t-licence">
  <h2 id="t-licence">Licence</h2>
  ${l.valide ? encadre(html`<strong>${PLANS[d.plan].libelle}</strong> n° ${d.id} — ${d.agence}${d.siren ? ' (SIREN ' + d.siren + ')' : ''} — valable jusqu’au <strong>${formatDate(d.exp)}</strong>.`, 'succes')
    : encadre(html`<strong>Mode démonstration.</strong> Toutes les fonctions sont utilisables. Les documents portent un filigrane et ne sont pas nominatifs. ${l.raison && e.licence.cle ? html`<br>Licence saisie refusée : ${l.raison}` : ''}`, 'attention')}
  ${ecart ? encadre(html`Le nom de l’agence (« ${e.agence.raisonSociale} ») diffère de celui de la licence (« ${d.agence} »). Les documents mentionnent la licence : contactez le support si l’agence a changé de nom.`, 'attention') : ''}
  <div class="champ champ-large">
    <label for="saisie-licence">Clé de licence</label>
    <textarea id="saisie-licence" rows="3" spellcheck="false" placeholder="PRB1.…" aria-describedby="aide-licence">${app.session.saisieLicence ?? e.licence.cle ?? ''}</textarea>
    <p class="aide" id="aide-licence">La clé est reçue par e-mail après l’achat. Elle est vérifiée sur ce poste, sans connexion.</p>
  </div>
  <p>${bouton('Activer la licence', 'activerLicence', { variante: 'primaire' })} ${l.valide ? bouton('Retirer la licence de ce poste', 'retirerLicence', { variante: 'lien' }) : html`<a class="btn btn-secondaire" href="${urlAchat()}" target="_blank" rel="noopener noreferrer">Acheter une licence — 290 € HT/an</a>`}</p>
</section>
<section class="carte" aria-labelledby="t-sauvegarde">
  <h2 id="t-sauvegarde">Vos données</h2>
  <p>Toutes les données sont enregistrées <strong>uniquement dans ce navigateur</strong>, sur cet ordinateur. Probant ne les envoie nulle part. Si vous videz l’historique du navigateur ou changez d’ordinateur, elles sont perdues : téléchargez une sauvegarde régulièrement et conservez-la avec vos archives.</p>
  <p>${e.derniereSauvegarde ? html`Dernière sauvegarde téléchargée le <strong>${formatDate(e.derniereSauvegarde)}</strong>.` : html`<strong>Aucune sauvegarde téléchargée pour l’instant.</strong>`}</p>
  <p class="groupe-btn">${bouton('Télécharger une sauvegarde', 'exporterDonnees', { variante: 'primaire', icone: '⤓' })}
    <label class="btn btn-secondaire" for="fichier-import">⤒ Restaurer une sauvegarde</label>
    <input type="file" id="fichier-import" accept="application/json,.json" class="visuellement-cache" data-action-change="importerDonnees"></p>
  <details><summary>Effacer toutes les données de ce navigateur</summary>
    <p class="aide">Action irréversible. Téléchargez d’abord une sauvegarde.</p>${bouton('Tout effacer', 'toutEffacer', { variante: 'danger' })}</details>
</section>
<section class="carte" aria-labelledby="t-listes">
  <h2 id="t-listes">Listes de pays utilisées</h2>
  <ul class="liste-compacte">
    <li>${LISTES_PAYS.gafiNoire.titre} — état au ${formatDate(LISTES_PAYS.gafiNoire.date)}</li>
    <li>${LISTES_PAYS.gafiGrise.titre} — état au ${formatDate(LISTES_PAYS.gafiGrise.date)} (${LISTES_PAYS.gafiGrise.pays.length} juridictions)</li>
    <li>${LISTES_PAYS.ue.titre} — état au ${formatDate(LISTES_PAYS.ue.date)} (${LISTES_PAYS.ue.pays.length} pays)</li>
  </ul>
  <p class="aide">Ces listes sont mises à jour après chaque plénière du GAFI (février, juin, octobre) et chaque acte de la Commission européenne. Vérifiez la version officielle : <a href="${LIENS.gafi.url}" target="_blank" rel="noopener noreferrer">GAFI</a>.</p>
</section>
<section class="carte" aria-labelledby="t-journal">
  <h2 id="t-journal">Journal de traçabilité</h2>
  ${e.journal.length ? html`<ol class="journal">${e.journal.slice(0, 40).map((j) => html`<li><time>${formatDate(j.date)} ${j.heure}</time> ${j.action}</li>`)}</ol>` : html`<p class="aide">Aucune action enregistrée.</p>`}
</section>
<section class="carte" aria-labelledby="t-apropos">
  <h2 id="t-apropos">À propos</h2>
  <p>Probant v${app.version} — contenus réglementaires v${VERSION_CONTENUS}.</p>
  <p class="aide">${AVERTISSEMENT}</p>
</section>`;
}

export const actions = {
  async activerLicence(app) {
    const cle = document.getElementById('saisie-licence').value.trim();
    app.session.saisieLicence = cle;
    const res = await app.verifierLicence(cle);
    if (res.valide) {
      app.etat.licence.cle = cle;
      app.session.saisieLicence = undefined;
      journaliser(app.etat, `Licence ${res.donnees.id} activée (${res.donnees.agence}, jusqu’au ${formatDate(res.donnees.exp)})`);
      app.sauver();
      app.annoncer('Licence activée : vos documents sont désormais nominatifs, sans filigrane.');
    } else {
      app.annoncer(res.raison, 'erreur');
    }
    app.rendre();
  },
  async retirerLicence(app) {
    if (!confirm('Retirer la licence de ce poste ? Les documents repasseront en mode démonstration.')) return;
    app.etat.licence.cle = '';
    await app.verifierLicence('');
    app.sauver(); app.rendre();
  },
  exporterDonnees(app) {
    const date = app.aujourdhui();
    app.etat.derniereSauvegarde = date;
    journaliser(app.etat, 'Sauvegarde téléchargée');
    app.sauver();
    telechargerTexte(exporter(app.etat, app.version, date), `probant-sauvegarde-${date}.json`);
    app.rendre();
    app.annoncer('Sauvegarde téléchargée. Conservez ce fichier en lieu sûr : il contient des données personnelles.');
  },
  async importerDonnees(app, el) {
    const fichier = el.files && el.files[0];
    if (!fichier) return;
    try {
      const nouvel = importer(await fichier.text());
      if (!confirm('Remplacer les données actuelles par celles de la sauvegarde ?')) return;
      app.remplacerEtat(nouvel);
      journaliser(app.etat, `Sauvegarde restaurée (${fichier.name})`);
      app.sauver();
      await app.verifierLicence(app.etat.licence.cle);
      app.rendre();
      app.annoncer('Sauvegarde restaurée.');
    } catch (err) {
      app.annoncer(err.message, 'erreur');
    } finally {
      el.value = '';
    }
  },
  toutEffacer(app) {
    if (!confirm('Effacer définitivement toutes les données Probant de ce navigateur ?')) return;
    app.reinitialiser();
    app.annoncer('Toutes les données ont été effacées.');
    app.naviguer('tableau');
  },
};
