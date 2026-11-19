// Point d'entrée de l'application Probant.
/* global __CLE_PUBLIQUE__, __VERSION__ */
import { charger, sauvegarder, etatInitial, normaliser, lire, ecrire } from './etat.js';
import { aujourdHui, ajouterMois } from './moteur/dates.js';
import { verifierLicence } from './licence.js';
import { html } from './ui/html.js';
import { documentComplet } from './documents/gabarit.js';
import { contexteDocument } from './documents/contexte.js';
import { docClassification, docProcedures, docTracfin } from './documents/dispositif.js';
import { docPlanFormation, docAttestation, docRegistreFormations, docSupportFormation } from './documents/formation.js';
import { docFicheVigilance, docRegistreVigilance, docAutocontrole } from './documents/operations.js';
import { imprimer, telechargerWord, nomDeFichier } from './export.js';
import { bilan } from './vues/bilan.js';
import * as tableau from './vues/tableau.js';
import * as agence from './vues/agence.js';
import * as classification from './vues/classification.js';
import * as procedures from './vues/procedures.js';
import * as tracfin from './vues/tracfin.js';
import * as equipe from './vues/equipe.js';
import * as formation from './vues/formation.js';
import * as vigilance from './vues/vigilance.js';
import * as autocontrole from './vues/autocontrole.js';
import * as documents from './vues/documents.js';
import * as parametres from './vues/parametres.js';

const VUES = {
  tableau: { titre: 'Tableau de bord', m: tableau },
  agence: { titre: 'Identité de l’agence', m: agence },
  classification: { titre: 'Classification des risques', m: classification },
  procedures: { titre: 'Procédures internes', m: procedures },
  tracfin: { titre: 'Déclarant Tracfin', m: tracfin },
  equipe: { titre: 'Équipe et formation', m: equipe },
  formation: { titre: 'Formation', m: formation, parent: 'equipe' },
  vigilance: { titre: 'Fiches de vigilance', m: vigilance },
  autocontrole: { titre: 'Auto-contrôle', m: autocontrole },
  documents: { titre: 'Documents', m: documents },
  parametres: { titre: 'Paramètres', m: parametres },
};
const NAV = [
  ['tableau'],
  ['—', 'Dispositif'], ['agence'], ['classification'], ['procedures'], ['tracfin'],
  ['—', 'Au quotidien'], ['equipe'], ['vigilance'],
  ['—', 'Contrôle'], ['autocontrole'], ['documents'], ['parametres'],
];

const racine = document.getElementById('app');
let minuteurSauvegarde = null;
let renduPlanifie = false;

const app = {
  version: typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'dev',
  etat: charger(),
  session: {},
  cibles: {},
  licence: { valide: false, raison: '', donnees: null },
  stockageOk: true,
  aujourdhui: () => (typeof window.__PROBANT_DATE__ === 'string' ? window.__PROBANT_DATE__ : aujourdHui()),

  sauver() {
    clearTimeout(minuteurSauvegarde);
    minuteurSauvegarde = setTimeout(() => { app.stockageOk = sauvegarder(app.etat); }, 200);
  },
  sauverMaintenant() { clearTimeout(minuteurSauvegarde); app.stockageOk = sauvegarder(app.etat); },

  async verifierLicence(cle) {
    const cleProd = typeof __CLE_PUBLIQUE__ !== 'undefined' ? __CLE_PUBLIQUE__ : null;
    const r = cle ? await verifierLicence(cle, cleProd, app.aujourdhui()) : { valide: false, raison: '' };
    app.licence = r.valide ? r : { valide: false, raison: r.raison, donnees: null };
    return r;
  },

  naviguer(route) { if (location.hash === `#/${route}`) app.rendre({ hautDePage: true }); else location.hash = `#/${route}`; },

  remplacerEtat(nouvel) { app.etat = normaliser(nouvel); app.session = {}; app.sauverMaintenant(); app.rendre(); },
  reinitialiser() { const cle = app.etat.licence.cle; app.etat = etatInitial(); app.etat.licence.cle = cle; app.session = {}; app.sauverMaintenant(); app.rendre(); },

  annoncer(message, type = 'info') {
    document.getElementById('annonce').textContent = message;
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.setAttribute('role', type === 'erreur' ? 'alert' : 'status');
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('visible'), 10);
    setTimeout(() => { t.classList.remove('visible'); setTimeout(() => t.remove(), 300); }, type === 'erreur' ? 6000 : 4000);
  },

  rendre(options = {}) { rendre(options); },
};

function route() {
  const brut = location.hash.replace(/^#\/?/, '');
  const [nom, ...params] = brut.split('/').filter(Boolean);
  return { nom: VUES[nom] ? nom : 'tableau', params: params.map(decodeURIComponent) };
}

function navigation(actif) {
  const b = bilan(app);
  const fait = Object.fromEntries(b.etapes.map((e) => [e.id, e]));
  const parent = VUES[actif]?.parent || actif;
  return html`<nav class="nav" aria-label="Navigation principale">
    <ul>${NAV.map(([id, groupe]) => id === '—' ? html`<li class="nav-groupe" aria-hidden="true">${groupe}</li>` : html`<li>
      <a href="#/${id}" class="${parent === id ? 'actif' : ''}" ${parent === id ? html`aria-current="page"` : ''}>
        <span>${VUES[id].titre}</span>${fait[id] ? html`<span class="nav-etat ${fait[id].ok ? 'ok' : fait[id].attention ? 'attention' : ''}" aria-label="${fait[id].ok ? 'terminé' : 'à faire'}">${fait[id].ok ? '✓' : fait[id].attention ? '!' : ''}</span>` : ''}
      </a></li>`)}</ul>
  </nav>`;
}

function bandeaux() {
  const e = app.etat;
  const out = [];
  if (!app.stockageOk) out.push(html`<div class="bandeau-alerte" role="alert">Le stockage de ce navigateur est indisponible (navigation privée ?) : vos saisies seront perdues à la fermeture. Téléchargez une sauvegarde depuis les Paramètres.</div>`);
  const aDesDonnees = !e.exemple && (e.agence.raisonSociale || e.vigilances.length || e.equipe.length);
  if (aDesDonnees && (!e.derniereSauvegarde || ajouterMois(e.derniereSauvegarde, 1) <= app.aujourdhui())) {
    out.push(html`<div class="bandeau-info">Vos données ne sont stockées que dans ce navigateur. ${e.derniereSauvegarde ? 'Dernière sauvegarde il y a plus d’un mois.' : 'Aucune sauvegarde téléchargée.'} <button type="button" class="btn btn-lien" data-action="exporterDonnees">Télécharger une sauvegarde</button></div>`);
  }
  return out;
}

function rendre({ hautDePage = false } = {}) {
  renduPlanifie = false;
  const { nom, params } = route();
  const vue = VUES[nom];
  const actif = document.activeElement;
  const focusId = actif && actif.id && racine.contains(actif) ? actif.id : null;
  const selection = focusId && typeof actif.selectionStart === 'number' ? [actif.selectionStart, actif.selectionEnd] : null;
  const y = window.scrollY;
  app.cibles = {};
  let contenu;
  try {
    contenu = vue.m.rendre(app, params);
  } catch (err) {
    console.error(err);
    contenu = html`<div class="encadre encadre-alerte" role="alert">Une erreur est survenue lors de l’affichage de cette page. Vos données ne sont pas perdues. <a href="#/tableau">Retour au tableau de bord</a>.<br><small>${String(err && err.message)}</small></div>`;
  }
  const lic = app.licence.valide;
  racine.innerHTML = String(html`
<div class="coque ${app.session.menuOuvert ? 'menu-ouvert' : ''}">
  <aside class="barre-laterale">
    <div class="marque"><span class="logo" aria-hidden="true">P</span><span class="nom-marque">Probant</span>
      <button type="button" class="btn-menu" data-action="basculerMenu" aria-expanded="${app.session.menuOuvert ? 'true' : 'false'}" aria-controls="nav-principale">Menu</button></div>
    <p class="agence-courante">${app.etat.agence.raisonSociale || 'Agence à renseigner'}<br><span class="licence ${lic ? 'ok' : 'demo'}">${lic ? `Licence jusqu’au ${app.licence.donnees.exp.split('-').reverse().join('/')}` : 'Mode démonstration'}</span></p>
    <div id="nav-principale">${navigation(nom)}</div>
    <p class="confidentialite">🔒 Données stockées uniquement dans ce navigateur.</p>
  </aside>
  <main id="contenu" tabindex="-1">
    ${bandeaux()}
    <div class="vue vue-${nom}">${contenu}</div>
  </main>
</div>`);
  document.title = `${vue.titre} — Probant`;
  if (hautDePage) {
    window.scrollTo(0, 0);
    document.getElementById('contenu').focus({ preventScroll: true });
  } else {
    window.scrollTo(0, y);
    if (focusId) {
      const el = document.getElementById(focusId);
      if (el) {
        el.focus({ preventScroll: true });
        if (selection && typeof el.setSelectionRange === 'function') { try { el.setSelectionRange(...selection); } catch { /* champ sans sélection */ } }
      }
    }
  }
}

function planifierRendu() {
  if (renduPlanifie) return;
  renduPlanifie = true;
  setTimeout(() => rendre(), 0);
}

// ── Liaison des champs ───────────────────────────────────────────────────────
function lier(el, typeEvenement) {
  const base = el.dataset.cible ? app.cibles[el.dataset.cible] : app.etat;
  if (!base) return;
  const chemin = el.dataset.champ;
  let valeur;
  if (el.type === 'checkbox') {
    if (el.hasAttribute('data-liste')) {
      const courant = lire(base, chemin);
      const tableauValeurs = Array.isArray(courant) ? courant.slice() : [];
      const i = tableauValeurs.indexOf(el.value);
      if (el.checked && i < 0) tableauValeurs.push(el.value);
      if (!el.checked && i >= 0) tableauValeurs.splice(i, 1);
      valeur = tableauValeurs;
    } else valeur = el.checked;
  } else if (el.type === 'radio') {
    if (!el.checked) return;
    valeur = el.hasAttribute('data-nombre') ? Number(el.value) : el.value;
  } else {
    valeur = el.value;
  }
  ecrire(base, chemin, valeur);
  app.sauver();
  if (typeEvenement === 'change') planifierRendu();
}

// ── Documents ────────────────────────────────────────────────────────────────
function construireDocument(d) {
  const c = contexteDocument(app.etat, { licence: app.licence, aujourdhui: app.aujourdhui() });
  const e = app.etat;
  switch (d.type) {
    case 'classification': return [docClassification(c), c];
    case 'procedures': return [docProcedures(c), c];
    case 'tracfin': return [docTracfin(c), c];
    case 'plan': return [docPlanFormation(c), c];
    case 'registreFormations': return [docRegistreFormations(c), c];
    case 'support': return [docSupportFormation(c, d.fonction), c];
    case 'attestation': {
      const m = e.equipe.find((x) => x.id === d.id);
      const f = m?.formations?.find((x) => x.id === d.formation);
      return m && f ? [docAttestation(c, m, f), c] : [null, c];
    }
    case 'fiche': { const f = e.vigilances.find((x) => x.id === d.id); return f ? [docFicheVigilance(c, f), c] : [null, c]; }
    case 'registreVigilance': return [docRegistreVigilance(c), c];
    case 'autocontrole': { const a = e.autocontroles.find((x) => x.id === d.id); return a ? [docAutocontrole(c, a), c] : [null, c]; }
    default: return [null, c];
  }
}

function documentDepuis(el) {
  app.sauverMaintenant();
  const [doc, c] = construireDocument(el.dataset);
  if (!doc) { app.annoncer('Document introuvable.', 'erreur'); return null; }
  return { doc, complet: documentComplet(doc, c) };
}

let declencheurModale = null;
function ouvrirApercu(el) {
  const r = documentDepuis(el);
  if (!r) return;
  declencheurModale = el;
  let m = document.getElementById('modale');
  if (!m) { m = document.createElement('div'); m.id = 'modale'; document.body.appendChild(m); }
  const donnees = Object.entries(el.dataset).filter(([k]) => k !== 'action').map(([k, v]) => html` data-${k.replace(/[A-Z]/g, (x) => '-' + x.toLowerCase())}="${v}"`);
  m.innerHTML = String(html`<div class="modale-fond" data-action="fermerApercu"></div>
  <div class="modale" role="dialog" aria-modal="true" aria-labelledby="titre-modale">
    <div class="modale-entete"><h2 id="titre-modale">${r.doc.titre}</h2>
      <div class="groupe-btn"><button type="button" class="btn btn-primaire" data-action="imprimer"${donnees}>Imprimer / PDF</button><button type="button" class="btn btn-secondaire" data-action="word"${donnees}>Word</button><button type="button" class="btn btn-secondaire" data-action="fermerApercu" id="fermer-modale">Fermer</button></div></div>
    <iframe class="modale-cadre" title="Aperçu : ${r.doc.titre}"></iframe>
  </div>`);
  m.querySelector('iframe').srcdoc = r.complet;
  document.body.classList.add('modale-ouverte');
  document.getElementById('fermer-modale').focus();
}

function fermerApercu() {
  const m = document.getElementById('modale');
  if (m) m.innerHTML = '';
  document.body.classList.remove('modale-ouverte');
  if (declencheurModale && document.body.contains(declencheurModale)) declencheurModale.focus();
  declencheurModale = null;
}

const ACTIONS_GLOBALES = {
  apercu: (a, el) => ouvrirApercu(el),
  imprimer: (a, el) => { const r = documentDepuis(el); if (r) imprimer(r.complet); },
  word: (a, el) => { const r = documentDepuis(el); if (r) { telechargerWord(r.complet, nomDeFichier(r.doc.fichier || r.doc.titre)); app.annoncer('Document Word téléchargé.'); } },
  fermerApercu: () => fermerApercu(),
  basculerMenu: () => { app.session.menuOuvert = !app.session.menuOuvert; rendre(); },
};

const ACTIONS = Object.assign({}, ...Object.values(VUES).map((v) => v.m.actions || {}), ACTIONS_GLOBALES);

// ── Événements ───────────────────────────────────────────────────────────────
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const handler = ACTIONS[el.dataset.action];
  if (!handler) return;
  ev.preventDefault();
  Promise.resolve(handler(app, el, ev)).catch((err) => { console.error(err); app.annoncer('Action impossible : ' + err.message, 'erreur'); });
});
document.addEventListener('input', (ev) => { if (ev.target.matches('[data-champ]')) lier(ev.target, 'input'); });
document.addEventListener('change', (ev) => {
  if (ev.target.matches('[data-champ]')) lier(ev.target, 'change');
  const a = ev.target.closest('[data-action-change]');
  if (a && ACTIONS[a.dataset.actionChange]) Promise.resolve(ACTIONS[a.dataset.actionChange](app, a, ev)).catch((err) => app.annoncer(err.message, 'erreur'));
});
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && document.body.classList.contains('modale-ouverte')) fermerApercu(); });
window.addEventListener('hashchange', () => { app.session.menuOuvert = false; fermerApercu(); rendre({ hautDePage: true }); });
window.addEventListener('pagehide', () => app.sauverMaintenant());
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') app.sauverMaintenant(); });

// Accès pour les tests automatisés et le support (aucune donnée n'est exposée hors de ce navigateur).
window.__probant = app;

(async () => {
  if (!app.etat.creeLe) { app.etat.creeLe = app.aujourdhui(); }
  app.stockageOk = sauvegarder(app.etat);
  await app.verifierLicence(app.etat.licence.cle);
  rendre();
  document.documentElement.dataset.pret = 'oui';
})();
