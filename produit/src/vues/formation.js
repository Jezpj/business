import { html } from '../ui/html.js';
import { enTete, bouton, encadre, badge, boutonsDocument } from '../ui/composants.js';
import { calculerClassification } from '../moteur/risques.js';
import { contexte, sectionsPour, questionsPour, corriger, dureeTotale, enregistrementFormation, libelleFonction, SEUIL_REUSSITE } from '../moteur/formation.js';
import { journaliser } from '../etat.js';

const TYPES = { socle: 'Socle', risque: 'Risque de votre agence', fonction: 'Votre fonction' };

function session(app, membre) {
  const s = app.session.formation;
  if (!s || s.membreId !== membre.id) app.session.formation = { membreId: membre.id, etape: 'intro', index: 0, reponses: {}, resultat: null, tentative: 1 };
  return app.session.formation;
}

function preparer(app, membre) {
  const e = app.etat;
  const cls = calculerClassification(e.profil, e.ajustements, e.seuils);
  const c = contexte({ agence: e.agence, classification: cls, reponses: e.profil, seuils: e.seuils, tracfin: e.tracfin });
  const sections = sectionsPour(membre.fonction, c);
  const s = session(app, membre);
  const questions = questionsPour(sections.map((x) => x.id), `${membre.id}-${s.tentative}`);
  return { cls, sections, questions, s };
}

export function rendre(app, [id]) {
  const membre = app.etat.equipe.find((m) => m.id === id);
  if (!membre) return html`${enTete('Formation', '')}${encadre(html`Collaborateur introuvable. <a href="#/equipe">Retour à l’équipe</a>.`, 'attention')}`;
  const { cls, sections, questions, s } = preparer(app, membre);
  app.cibles.quiz = s;
  const nom = [membre.prenom, membre.nom].filter(Boolean).join(' ');
  const total = sections.length;
  const fil = html`<p class="fil"><a href="#/equipe">Équipe</a> › Formation de ${nom}</p>`;

  if (s.etape === 'intro') {
    return html`${fil}${enTete(`Formation LCB-FT — ${nom}`, `${libelleFonction(membre.fonction)} · environ ${dureeTotale(sections)} minutes`)}
    ${!app.etat.classification.dateValidation ? encadre('La classification des risques n’est pas encore validée : le module est construit à partir des réponses actuelles du questionnaire.', 'attention') : ''}
    <section class="carte">
      <h2>Le parcours de ${membre.prenom || nom}</h2>
      <p>Ce parcours est construit à partir de la classification des risques de l’agence (profil ${badge(cls.global.niveau, cls.global.libelle.toLowerCase())}) et de la fonction de ${membre.prenom || 'la personne'}. Il comprend le volet obligatoire sur les sanctions et se termine par un questionnaire de ${questions.length} questions (${SEUIL_REUSSITE} % de bonnes réponses requis).</p>
      <ol class="modules">${sections.map((x) => html`<li><span class="tag tag-${x.type}">${TYPES[x.type]}</span> ${x.titre} <span class="aide">${x.duree} min</span></li>`)}</ol>
      <p class="aide">À suivre par la personne elle-même, sur ce poste ou sur la copie de Probant de l’agence. L’attestation est générée automatiquement en cas de réussite.</p>
      ${bouton('Commencer la formation', 'formationEtape', { variante: 'primaire', donnees: { etape: 'section', index: 0 } })}
    </section>`;
  }

  if (s.etape === 'section') {
    const x = sections[Math.min(s.index, total - 1)];
    const pct = Math.round(((s.index + 1) / (total + 1)) * 100);
    return html`${fil}
    <div class="progression" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Avancement de la formation"><span style="width:${pct}%"></span></div>
    <article class="carte module" aria-labelledby="t-module">
      <p class="aide">Module ${s.index + 1} sur ${total} · <span class="tag tag-${x.type}">${TYPES[x.type]}</span> · ${x.duree} min</p>
      <h1 id="t-module">${x.titre}</h1>
      ${x.paragraphes.map((p) => html`<p>${p}</p>`)}
      <div class="encadre encadre-info"><strong>À retenir</strong><ul>${x.points.map((p) => html`<li>${p}</li>`)}</ul></div>
      ${x.pratique.length ? html`<div class="encadre encadre-agence"><strong>Dans votre agence</strong><ul>${x.pratique.map((p) => html`<li>${p}</li>`)}</ul></div>` : ''}
      <div class="navigation-module">
        ${bouton('← Précédent', 'formationEtape', { donnees: s.index === 0 ? { etape: 'intro', index: 0 } : { etape: 'section', index: s.index - 1 } })}
        ${s.index < total - 1 ? bouton('Module suivant →', 'formationEtape', { variante: 'primaire', donnees: { etape: 'section', index: s.index + 1 } }) : bouton('Passer au questionnaire →', 'formationEtape', { variante: 'primaire', donnees: { etape: 'quiz', index: s.index } })}
      </div>
    </article>`;
  }

  if (s.etape === 'quiz') {
    const repondues = questions.filter((q) => s.reponses[q.id] !== undefined).length;
    return html`${fil}${enTete('Questionnaire d’évaluation', `${questions.length} questions · ${SEUIL_REUSSITE} % de bonnes réponses requis`)}
    <form class="carte quiz" onsubmit="return false">
      ${questions.map((q, i) => html`<fieldset class="question" data-qid="${q.id}">
        <legend><span class="num">${i + 1}.</span> ${q.q}</legend>
        ${q.o.map((o, j) => { const idr = `q-${q.id}-${j}`; return html`<label class="option" for="${idr}"><input type="radio" id="${idr}" name="q-${q.id}" value="${j}" data-champ="reponses.${q.id}" data-cible="quiz" data-nombre ${s.reponses[q.id] === j ? 'checked' : ''}><span>${o}</span></label>`; })}
      </fieldset>`)}
      <div class="navigation-module">
        ${bouton('← Revoir les modules', 'formationEtape', { donnees: { etape: 'section', index: 0 } })}
        ${bouton(repondues < questions.length ? `Répondez à toutes les questions (${repondues}/${questions.length})` : 'Valider mes réponses', 'formationCorriger', { variante: 'primaire', desactive: repondues < questions.length })}
      </div>
    </form>`;
  }

  // Résultat
  const r = s.resultat;
  return html`${fil}${enTete('Résultat', nom)}
  <section class="carte resultat ${r.reussi ? 'reussi' : 'echoue'}">
    <p class="score">${r.pourcentage} %</p>
    <p>${r.bonnes} bonne(s) réponse(s) sur ${r.total}. ${r.reussi ? 'Formation réussie : elle est enregistrée au registre des formations.' : `Score insuffisant : ${SEUIL_REUSSITE} % sont requis. Relisez les modules puis repassez le questionnaire.`}</p>
    ${r.reussi && s.formationId ? html`<p>${boutonsDocument('attestation', { id: membre.id, formation: s.formationId })}</p>` : ''}
    <div class="navigation-module">
      ${r.reussi ? html`<a class="btn btn-primaire" href="#/equipe">Retour à l’équipe</a>` : html`${bouton('Revoir les modules', 'formationEtape', { donnees: { etape: 'section', index: 0 } })}${bouton('Repasser le questionnaire', 'formationRecommencer', { variante: 'primaire' })}`}
    </div>
  </section>
  <section class="carte"><h2>Corrigé</h2>
    <ol class="corrige">${questions.map((q) => { const d = r.details.find((x) => x.id === q.id); return html`<li class="${d.correcte ? 'juste' : 'faux'}"><strong>${q.q}</strong><br>${d.correcte ? '✓' : '✗'} Bonne réponse : ${q.o[q.c]}<br><span class="aide">${q.e}</span></li>`; })}</ol>
  </section>`;
}

export const actions = {
  formationEtape(app, el) {
    const s = app.session.formation;
    s.etape = el.dataset.etape;
    s.index = Number(el.dataset.index || 0);
    app.rendre({ hautDePage: true });
  },
  formationCorriger(app) {
    const s = app.session.formation;
    const membre = app.etat.equipe.find((m) => m.id === s.membreId);
    const { sections, questions } = preparer(app, membre);
    const resultat = corriger(questions, s.reponses);
    s.resultat = resultat;
    s.etape = 'resultat';
    const e = app.etat;
    const rang = resultat.reussi ? (e.compteurs.attestations = (e.compteurs.attestations || 0) + 1) : 0;
    const f = enregistrementFormation({ date: app.aujourdhui(), sections, resultat, rang });
    if (!resultat.reussi) f.numero = '';
    membre.formations = membre.formations || [];
    membre.formations.push(f);
    s.formationId = f.id;
    journaliser(e, `Formation ${resultat.reussi ? 'réussie' : 'non réussie'} : ${[membre.prenom, membre.nom].join(' ')} (${resultat.pourcentage} %)${resultat.reussi ? ' — attestation ' + f.numero : ''}`);
    app.sauver(); app.rendre({ hautDePage: true });
    app.annoncer(resultat.reussi ? `Formation réussie (${resultat.pourcentage} %). Attestation ${f.numero} disponible.` : `Score de ${resultat.pourcentage} % : ${SEUIL_REUSSITE} % sont requis.`);
  },
  formationRecommencer(app) {
    const s = app.session.formation;
    s.tentative += 1; s.reponses = {}; s.resultat = null; s.etape = 'quiz';
    app.rendre({ hautDePage: true });
  },
};
