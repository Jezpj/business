// Documents opérationnels : fiche de vigilance, registre des fiches, rapport d'auto-contrôle.
import { html, euros } from '../ui/html.js';
import { REF } from '../contenus/textes.js';
import { nomPays } from '../contenus/pays.js';
import { SIGNAUX } from '../contenus/signaux.js';
import { POINTS, GROUPES, REPONSES } from '../contenus/autocontrole.js';
import { formatDate } from '../moteur/dates.js';
import { evaluerFiche, nomPartie, ROLES, TYPES_OPERATION, PIECES, MODES_VERIF, ORIGINES_FONDS } from '../moteur/vigilance.js';
import { evaluer } from '../moteur/autocontrole.js';

const aCompleter = (v, defaut = '[à compléter]') => (v && String(v).trim() ? v : defaut);
const lib = (liste, v) => liste.find((x) => x.v === v)?.libelle || '—';
const PPE = { non: 'Non', oui: 'Oui', proche: 'Membre de la famille ou proche associé', '': 'Non déterminé' };
const GEL = { aucune: 'Aucune correspondance', homonymieLevee: 'Homonymie levée', correspondance: 'Correspondance confirmée', '': 'Non consulté' };

function blocPartie(p) {
  const v = p.verification || {};
  const identite = p.nature === 'PM'
    ? html`<tr><td class="l">Dénomination / forme</td><td>${aCompleter(p.denomination)} ${p.forme ? '(' + p.forme + ')' : ''}</td></tr>
       <tr><td class="l">Immatriculation</td><td>${aCompleter(p.numeroRegistre)} — ${nomPays(p.paysImmatriculation)}</td></tr>
       <tr><td class="l">Représentant</td><td>${aCompleter(p.representant)}</td></tr>`
    : html`<tr><td class="l">Nom, prénom</td><td>${aCompleter([p.nom, p.prenom].filter(Boolean).join(', '))}</td></tr>
       <tr><td class="l">Naissance</td><td>${formatDate(p.dateNaissance) || '—'} à ${aCompleter(p.lieuNaissance, '—')}</td></tr>
       <tr><td class="l">Nationalité / résidence</td><td>${nomPays(p.nationalite)} / ${nomPays(p.residence)}</td></tr>
       <tr><td class="l">Profession</td><td>${aCompleter(p.profession, '—')}</td></tr>`;
  return html`
<h3>${ROLES[p.role] || p.role}${p.estClient ? ' (client de l’agence)' : ' (cocontractant)'} — ${nomPartie(p)}</h3>
<table class="meta">
  ${identite}
  <tr><td class="l">Vérification de l’identité</td><td>${lib(PIECES, v.piece)}${v.numero ? ' n° ' + v.numero : ''}${v.expiration ? ', valable jusqu’au ' + formatDate(v.expiration) : ''}<br>${lib(MODES_VERIF, v.mode)} — le ${formatDate(v.date) || '—'} par ${aCompleter(v.par, '—')}</td></tr>
  <tr><td class="l">Personne politiquement exposée</td><td>${PPE[p.ppe || '']}${p.ppeDetail ? ' — ' + p.ppeDetail : ''}</td></tr>
  <tr><td class="l">Registre national des gels</td><td>${GEL[p.gel?.resultat || '']}${p.gel?.date ? ' — consulté le ' + formatDate(p.gel.date) : ''}</td></tr>
  ${p.nature === 'PM' ? html`<tr><td class="l">Structure complexe ou étrangère</td><td>${p.structureComplexe ? 'Oui' : 'Non'}</td></tr>` : ''}
</table>
${p.nature === 'PM' ? html`<table class="t"><tr><th>Bénéficiaire effectif</th><th>Naissance</th><th>Nationalité / résidence</th><th>Détention ou contrôle</th><th>PPE</th><th>Gel</th></tr>
  ${(p.beneficiaires || []).map((b) => html`<tr><td>${aCompleter([b.prenom, b.nom].filter(Boolean).join(' '))}</td><td>${formatDate(b.dateNaissance) || '—'}</td><td>${nomPays(b.nationalite)} / ${nomPays(b.residence)}</td><td>${aCompleter(b.detention, '—')}</td><td>${PPE[b.ppe || '']}</td><td>${GEL[b.gel?.resultat || '']}${b.gel?.date ? ' (' + formatDate(b.gel.date) + ')' : ''}</td></tr>`)}
  ${!(p.beneficiaires || []).length ? html`<tr><td colspan="6">Aucun bénéficiaire effectif renseigné.</td></tr>` : ''}</table>` : ''}`;
}

export function docFicheVigilance(c, fiche) {
  const ev = evaluerFiche(fiche, { situations: c.cls.situations, seuils: c.seuils });
  const f = fiche.financement || {};
  const signaux = SIGNAUX.filter((s) => fiche.signaux?.[s.id]);
  const meta = [
    ['Opération', lib(TYPES_OPERATION, fiche.type)],
    ['Bien', aCompleter(fiche.bien?.adresse)],
    [fiche.type === 'location' ? 'Loyer mensuel' : 'Prix', fiche.type === 'location' ? euros(fiche.bien?.loyer) : euros(fiche.bien?.prix)],
    ['Ouverture / clôture', `${formatDate(fiche.dateOuverture) || '—'} / ${fiche.dateCloture ? formatDate(fiche.dateCloture) : 'en cours'}`],
    ['Conservation jusqu’au', ev.conservationJusquau ? formatDate(ev.conservationJusquau) : '5 ans après la clôture'],
    ['Niveau de vigilance', html`<span class="niv niv-${ev.niveau}">${ev.libelle}</span>`],
  ];
  const corps = html`
${ev.horsChamp ? html`<div class="encadre">Location dont le loyer mensuel est inférieur à 10 000 € : opération hors du champ de la LCB-FT (${REF.L561_2}). Fiche tenue à titre facultatif.</div>` : ''}
<h2>1. Objet et nature de l’opération</h2>
<p>${aCompleter(fiche.objet)}</p>
<h2>2. Parties à l’opération</h2>
${(fiche.parties || []).map(blocPartie)}
${fiche.type !== 'location' ? html`
<h2>3. Financement et origine des fonds</h2>
<table class="meta">
  <tr><td class="l">Prêt bancaire</td><td>${{ oui: 'Oui', non: 'Non', partiel: 'Partiel' }[f.pret] || 'Non renseigné'}${f.montantPret ? ' — ' + euros(f.montantPret) : ''}</td></tr>
  <tr><td class="l">Apport personnel</td><td>${f.apport ? euros(f.apport) : '—'}</td></tr>
  <tr><td class="l">Origine des fonds</td><td>${(f.origines || []).map((o) => lib(ORIGINES_FONDS, o)).join(', ') || '—'}</td></tr>
  <tr><td class="l">Pays de provenance</td><td>${nomPays(f.paysFonds) || '—'}</td></tr>
  <tr><td class="l">Justificatifs</td><td>${f.justificatifsRecus ? 'Reçus' : 'Non reçus'}${f.justificatifs ? ' — ' + f.justificatifs : ''}</td></tr>
  <tr><td class="l">Tiers payeur</td><td>${f.tiersPayeur ? 'Oui — ' + aCompleter(f.tiersDetail) : 'Non'}</td></tr>
</table>` : ''}
<h2>${fiche.type !== 'location' ? '4' : '3'}. Signaux d’alerte</h2>
${signaux.length ? html`<ul>${signaux.map((s) => html`<li>${s.libelle}${s.fort ? ' (signal fort)' : ''}</li>`)}</ul>` : html`<p>Aucun signal d’alerte relevé.</p>`}
<h2>${fiche.type !== 'location' ? '5' : '4'}. Évaluation</h2>
<div class="encadre ${ev.niveau !== 'standard' ? 'alerte' : ''}"><strong>${ev.libelle}.</strong> ${ev.recommandation}</div>
${ev.motifs.length ? html`<h3>Motifs</h3><ul>${ev.motifs.map((m) => html`<li>${m}</li>`)}</ul>` : ''}
<h3>Mesures appliquées</h3>
<ul>${ev.mesures.map((m) => html`<li>${m.texte} <span class="petit">(${m.ref})</span></li>`)}</ul>
${ev.manquants.length ? html`<div class="encadre alerte"><strong>Points à compléter (${ev.manquants.length})</strong><ul>${ev.manquants.map((m) => html`<li>${m}</li>`)}</ul></div>` : html`<p><strong>Fiche complète.</strong></p>`}
<h2>${fiche.type !== 'location' ? '6' : '5'}. Examen et décision</h2>
<table class="meta">
  <tr><td class="l">Examen renforcé / analyse</td><td>${aCompleter(fiche.analyse, ev.niveau === 'standard' ? 'Sans objet (vigilance standard)' : '[à compléter]')}</td></tr>
  <tr><td class="l">Validation par le dirigeant</td><td>${fiche.validation?.nom ? `${fiche.validation.nom}, le ${formatDate(fiche.validation.date)}` : (ev.niveau === 'standard' ? 'Non requise' : '[à compléter]')}</td></tr>
  <tr><td class="l">Alerte transmise au déclarant</td><td>${fiche.alerteDeclarant?.transmise ? `Oui${fiche.alerteDeclarant.date ? ', le ' + formatDate(fiche.alerteDeclarant.date) : ''}` : 'Non'}</td></tr>
</table>
<p class="petit">Document interne et confidentiel, à conserver 5 ans après la clôture (${REF.L561_12}). Ne pas le communiquer aux parties.</p>`;
  const signatures = ['Le collaborateur en charge du dossier'];
  if (ev.niveau !== 'standard') signatures.push('Le dirigeant (vigilance renforcée)');
  return { titre: `Fiche de vigilance ${fiche.reference}`, sousTitre: `Opération : ${lib(TYPES_OPERATION, fiche.type)}`, meta, corps, signatures, fichier: `fiche-vigilance-${fiche.reference}` };
}

export function docRegistreVigilance(c) {
  const fiches = (c.etat.vigilances || []).slice().sort((a, b) => (a.dateOuverture < b.dateOuverture ? 1 : -1));
  const meta = [['Agence', aCompleter(c.nomAgence)], ['Arrêté au', formatDate(c.aujourdhui)], ['Fiches enregistrées', String(fiches.length)]];
  const corps = html`
<table class="t">
  <tr><th>Référence</th><th>Ouverture</th><th>Opération</th><th>Parties</th><th>Niveau</th><th>Statut</th><th>Conservation jusqu’au</th></tr>
  ${fiches.map((f) => { const ev = evaluerFiche(f, { situations: c.cls.situations, seuils: c.seuils }); return html`<tr>
    <td>${f.reference}</td><td>${formatDate(f.dateOuverture)}</td><td>${lib(TYPES_OPERATION, f.type)}<br><span class="petit">${f.bien?.adresse || ''}</span></td>
    <td>${(f.parties || []).map((p) => nomPartie(p)).join(' / ')}</td>
    <td><span class="niv niv-${ev.niveau}">${ev.libelle}</span></td>
    <td>${f.statut === 'cloturee' ? 'Clôturée le ' + formatDate(f.dateCloture) : ev.complet ? 'Complète, en cours' : `Incomplète (${ev.manquants.length})`}</td>
    <td>${ev.conservationJusquau ? formatDate(ev.conservationJusquau) : '—'}</td></tr>`; })}
  ${!fiches.length ? html`<tr><td colspan="7">Aucune fiche enregistrée.</td></tr>` : ''}
</table>`;
  return { titre: 'Registre des fiches de vigilance', sousTitre: `Conservation 5 ans après la clôture (${REF.L561_12})`, meta, corps, signatures: [], fichier: 'registre-des-fiches-de-vigilance' };
}

export function docAutocontrole(c, ac) {
  const res = evaluer(ac.reponses || {});
  const meta = [['Agence', aCompleter(c.nomAgence)], ['Date de l’auto-contrôle', formatDate(ac.date)], ['Réalisé par', aCompleter(ac.par || c.responsable)], ['Score global', `${res.score} / 100`]];
  const corps = html`
<div class="encadre ${res.appreciation.niveau !== 'bon' ? 'alerte' : ''}"><strong>Appréciation :</strong> ${res.appreciation.texte}</div>
<h2>1. Résultats par domaine</h2>
<table class="t"><tr><th>Domaine</th><th style="width:16%">Score</th><th style="width:40%"></th></tr>
  ${res.parGroupe.map((g) => html`<tr><td>${g.titre}</td><td>${g.score} %</td><td><div class="barre"><span style="width:${g.score}%"></span></div></td></tr>`)}
</table>
<h2>2. Points de contrôle</h2>
${GROUPES.map((g) => html`<h3>${g.titre}</h3><table class="t"><tr><th>Point de contrôle</th><th style="width:16%">Réponse</th></tr>
  ${POINTS.filter((p) => p.groupe === g.id).map((p) => html`<tr><td>${p.texte}${p.critique ? html` <span class="petit">(point régulièrement sanctionné)</span>` : ''}</td><td>${REPONSES.find((r) => r.v === ac.reponses?.[p.id])?.libelle || 'Non évalué'}</td></tr>`)}</table>`)}
<h2>3. Plan d’action</h2>
${res.priorites.length ? html`<table class="t"><tr><th style="width:6%">#</th><th>Action</th><th style="width:20%">Échéance proposée</th></tr>
  ${res.priorites.map((p, i) => html`<tr><td>${i + 1}</td><td>${p.action}${p.critique ? ' (prioritaire)' : ''}</td><td>${p.critique ? 'Sous 1 mois' : 'Sous 3 mois'}</td></tr>`)}</table>` : html`<p>Aucune action requise.</p>`}`;
  return { titre: 'Rapport d’auto-contrôle LCB-FT', sousTitre: `Contrôle interne annuel (${REF.L561_32})`, meta, corps, signatures: [`Le responsable du dispositif : ${aCompleter(c.responsable, '')}`], fichier: `auto-controle-${ac.date}` };
}
