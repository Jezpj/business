// Documents de formation : plan, attestation nominative, registre, support pédagogique.
import { html } from '../ui/html.js';
import { REF } from '../contenus/textes.js';
import { formatDate, formatDateLongue } from '../moteur/dates.js';
import { planFormation, sectionsPour, statutFormation, finConservation, libelleFonction, SEUIL_REUSSITE } from '../moteur/formation.js';
import { SECTIONS } from '../contenus/formation.js';

const aCompleter = (v, defaut = '[à compléter]') => (v && String(v).trim() ? v : defaut);
const nomMembre = (m) => [m.prenom, m.nom].filter(Boolean).join(' ') || '(collaborateur sans nom)';
const TYPES = { socle: 'Socle', risque: 'Risque de l’agence', fonction: 'Fonction' };

export function docPlanFormation(c) {
  const plan = planFormation(c.fctx);
  const equipe = c.etat.equipe || [];
  const declenchees = SECTIONS.filter((s) => !s.socle && !s.fonctions && s.si && s.si(c.fctx));
  const meta = [
    ['Agence', aCompleter(c.nomAgence)],
    ['Profil de risque de référence', `${c.cls.global.libelle} (indice ${c.cls.indice}/100)${c.etat.classification?.dateValidation ? ' — classification validée le ' + formatDate(c.etat.classification.dateValidation) : ''}`],
    ['Établi le', formatDate(c.aujourdhui)],
    ['Responsable du plan', aCompleter(c.responsable)],
  ];
  const corps = html`
<h2>1. Principes</h2>
<ul>
  <li><strong>À l’embauche</strong> : toute personne appelée à participer aux obligations LCB-FT est formée dès son arrivée, avant toute participation aux diligences (${REF.D561_38_1_1}).</li>
  <li><strong>Puis régulièrement</strong> : selon la périodicité indiquée ci-dessous, ainsi qu’à chaque changement de fonction, à chaque révision de la classification des risques et à chaque évolution réglementaire majeure (notamment l’application du ${REF.AMLR}).</li>
  <li><strong>Un contenu adapté</strong> aux risques identifiés par la classification de l’agence (${REF.L561_4_1}), aux fonctions et à la position hiérarchique de chacun.</li>
  <li><strong>Un volet sur les sanctions</strong> encourues, inclus dans chaque parcours.</li>
  <li><strong>Une évaluation</strong> par questionnaire (réussite à partir de ${SEUIL_REUSSITE} % de bonnes réponses), une attestation nominative et une inscription au registre des formations.</li>
  <li><strong>La conservation</strong> des programmes, attestations et supports pendant toute la durée des fonctions, puis 5 ans après le départ.</li>
</ul>

<h2>2. Parcours par fonction</h2>
<table class="t">
  <tr><th style="width:22%">Fonction</th><th>Modules</th><th style="width:11%">Durée</th><th style="width:13%">Périodicité</th></tr>
  ${plan.map((p) => html`<tr><td>${p.libelle}</td><td>${p.sections.map((s) => s.titre).join(' · ')}</td><td>${p.duree} min</td><td>${p.periodicite} mois</td></tr>`)}
</table>

<h2>3. Modules déclenchés par la classification des risques</h2>
${declenchees.length ? html`<ul>${declenchees.map((s) => html`<li>${s.titre}</li>`)}</ul>` : html`<p>Aucun module spécifique n’est déclenché : le socle et les modules par fonction couvrent le profil de l’agence.</p>`}

<h2>4. Collaborateurs concernés</h2>
${equipe.length ? html`<table class="t">
  <tr><th>Collaborateur</th><th>Fonction</th><th>Arrivée</th><th>Dernière formation</th><th>Prochaine échéance</th><th>Statut</th></tr>
  ${equipe.map((m) => { const st = statutFormation(m, { periodicite: c.periodicite(m.fonction), aujourdhui: c.aujourdhui }); return html`<tr><td>${nomMembre(m)}</td><td>${libelleFonction(m.fonction)}</td><td>${formatDate(m.dateArrivee) || '—'}</td><td>${st.derniere ? formatDate(st.derniere.date) : '—'}</td><td>${st.prochaine ? formatDate(st.prochaine) : '—'}</td><td>${st.libelle}</td></tr>`; })}
</table>` : html`<p>Aucun collaborateur n’est encore enregistré.</p>`}`;
  return { titre: 'Plan de formation LCB-FT', sousTitre: `Établi selon l’${REF.D561_38_1_1} (décret n° 2026-310 du 24 avril 2026)`, meta, corps, signatures: [`Le dirigeant : ${aCompleter(c.dirigeant, '')}`], fichier: 'plan-de-formation-lcb-ft' };
}

export function docAttestation(c, membre, formation) {
  const meta = [
    ['N° d’attestation', formation.numero],
    ['Collaborateur', nomMembre(membre)],
    ['Fonction', libelleFonction(membre.fonction)],
    ['Date de la formation', formatDate(formation.date)],
    ['Durée', `${formation.duree} minutes`],
    ['Résultat de l’évaluation', `${formation.score} % (${formation.bonnes}/${formation.total}) — ${formation.reussi ? 'réussie' : 'non réussie'}`],
    ['Version des contenus', formation.versionContenus],
  ];
  const fin = finConservation(membre);
  const corps = html`
<p>Je soussigné(e), ${aCompleter(c.dirigeant)}, ${c.qualiteDirigeant.toLowerCase()} de ${aCompleter(c.nomAgence)}, atteste que <strong>${nomMembre(membre)}</strong>, ${libelleFonction(membre.fonction).toLowerCase()}, a suivi le ${formatDateLongue(formation.date)} la formation à la lutte contre le blanchiment de capitaux et le financement du terrorisme prévue par l’${REF.L561_34} et l’${REF.D561_38_1_1}, issu du décret n° 2026-310 du 24 avril 2026.</p>
<p>Cette formation est adaptée aux risques identifiés par la classification des risques de l’agence et à la fonction de l’intéressé(e). Elle comprend un volet sur les sanctions encourues.</p>
<h2>Programme suivi</h2>
<table class="t">
  <tr><th>Module</th><th style="width:22%">Nature</th><th style="width:12%">Durée</th></tr>
  ${formation.sections.map((s) => { const def = SECTIONS.find((x) => x.id === s.id); const type = def?.fonctions ? 'fonction' : def?.socle ? 'socle' : 'risque'; return html`<tr><td>${s.titre}</td><td>${TYPES[type]}</td><td>${s.duree} min</td></tr>`; })}
  <tr><td>Questionnaire d’évaluation</td><td>Évaluation</td><td>8 min</td></tr>
</table>
<h2>Conservation</h2>
<p>Attestation à conserver pendant toute la durée des fonctions de l’intéressé(e), puis 5 ans après son départ (${REF.D561_38_1_1}). ${fin ? html`Fin de conservation : <strong>${formatDate(fin)}</strong>.` : 'Fin de conservation : 5 ans après la date de départ, à reporter au registre.'}</p>`;
  return { titre: 'Attestation de formation LCB-FT', sousTitre: `Attestation n° ${formation.numero}`, meta, corps, signatures: [`Le dirigeant : ${aCompleter(c.dirigeant, '')}`, `Le collaborateur : ${nomMembre(membre)}`], fichier: `attestation-${formation.numero}` };
}

export function docRegistreFormations(c) {
  const equipe = c.etat.equipe || [];
  const lignes = [];
  for (const m of equipe) {
    const fs = (m.formations || []).slice().sort((a, b) => (a.date < b.date ? -1 : 1));
    if (!fs.length) lignes.push({ m, f: null });
    for (const f of fs) lignes.push({ m, f });
  }
  const meta = [['Agence', aCompleter(c.nomAgence)], ['Arrêté au', formatDate(c.aujourdhui)], ['Collaborateurs enregistrés', String(equipe.length)]];
  const corps = html`
<p>Le registre recense les formations LCB-FT suivies par chaque personne participant aux obligations de l’agence. Les justificatifs (attestations, programmes, supports) sont conservés pendant la durée des fonctions, puis 5 ans après le départ (${REF.D561_38_1_1}).</p>
<table class="t">
  <tr><th>Collaborateur</th><th>Fonction</th><th>Arrivée / départ</th><th>N° attestation</th><th>Date</th><th>Durée</th><th>Résultat</th><th>Fin de conservation</th></tr>
  ${lignes.map(({ m, f }) => html`<tr>
    <td>${nomMembre(m)}</td><td>${libelleFonction(m.fonction)}</td>
    <td>${formatDate(m.dateArrivee) || '—'}${m.dateDepart ? ' → ' + formatDate(m.dateDepart) : ''}</td>
    <td>${f ? (f.numero || 'Non réussie') : 'Non formé'}</td><td>${f ? formatDate(f.date) : '—'}</td><td>${f ? f.duree + ' min' : '—'}</td>
    <td>${f ? `${f.score} % ${f.reussi ? '✓' : '✗'}` : '—'}</td>
    <td>${finConservation(m) ? formatDate(finConservation(m)) : 'Durée des fonctions + 5 ans'}</td></tr>`)}
</table>
${!lignes.length ? html`<p>Aucun collaborateur enregistré.</p>` : ''}`;
  return { titre: 'Registre des formations LCB-FT', sousTitre: 'Traçabilité exigée par l’article D. 561-38-1-1 du CMF', meta, corps, signatures: [`Le dirigeant : ${aCompleter(c.dirigeant, '')}`], fichier: 'registre-des-formations' };
}

export function docSupportFormation(c, fonction) {
  const sections = sectionsPour(fonction, c.fctx);
  const meta = [['Agence', aCompleter(c.nomAgence)], ['Parcours', libelleFonction(fonction)], ['Durée indicative', `${sections.reduce((t, s) => t + s.duree, 0)} minutes de contenu`]];
  const corps = html`
<p>Support pédagogique du parcours LCB-FT « ${libelleFonction(fonction)} », adapté à la classification des risques de l’agence (profil ${c.cls.global.libelle.toLowerCase()}). À conserver avec les attestations, au titre des justificatifs de formation.</p>
${sections.map((s, i) => html`
<h2>${i + 1}. ${s.titre} <span class="petit">— ${TYPES[s.type]}, ${s.duree} min</span></h2>
${s.paragraphes.map((p) => html`<p>${p}</p>`)}
<div class="encadre"><strong>À retenir</strong><ul>${s.points.map((p) => html`<li>${p}</li>`)}</ul></div>
${s.pratique.length ? html`<p><strong>Dans votre agence :</strong> ${s.pratique.join(' ')}</p>` : ''}`)}`;
  return { titre: 'Support de formation LCB-FT', sousTitre: libelleFonction(fonction), meta, corps, signatures: [], fichier: `support-formation-${fonction}` };
}
