// Documents du dispositif : classification des risques, procédures internes, désignation Tracfin.
import { html, euros } from '../ui/html.js';
import { badgeNiveau } from './gabarit.js';
import { REF, LIENS } from '../contenus/textes.js';
import { AXES, FACTEURS } from '../contenus/questions-profil.js';
import { LISTES_PAYS } from '../contenus/pays.js';
import { formatDate, ajouterMois } from '../moteur/dates.js';

const aCompleter = (v, defaut = '[à compléter]') => (v && String(v).trim() ? v : defaut);

export function docClassification(c) {
  const { cls, etat } = c;
  const v = etat.classification || {};
  const meta = [
    ['Agence', `${aCompleter(c.nomAgence)}${c.agence.siren ? ' — SIREN ' + c.agence.siren : ''}`],
    ['Activité assujettie', 'Intermédiation en transactions immobilières (art. L. 561-2, 8° CMF)'],
    ['Version', `v${v.version || 1}`],
    ['Validée le', v.dateValidation ? formatDate(v.dateValidation) : 'Non validée'],
    ['Validée par', aCompleter(v.validePar || c.dirigeant)],
    ['Prochaine revue', v.dateValidation ? formatDate(ajouterMois(v.dateValidation, 12)) : 'Dans les 12 mois suivant la validation'],
  ];
  const corps = html`
<h2>1. Objet et méthode</h2>
<p>Ce document constitue la classification des risques de blanchiment de capitaux et de financement du terrorisme de l’agence, établie en application de l’${REF.L561_4_1}. Il identifie et évalue les risques selon les cinq axes prévus par le texte : la nature des produits ou services offerts, les conditions des transactions proposées, les canaux de distribution utilisés, les caractéristiques des clients et le pays ou territoire d’origine ou de destination des fonds.</p>
<p>Chaque facteur est évalué sur trois niveaux (faible, modéré, élevé) à partir des données d’activité déclarées par l’agence. Un axe prend le niveau de son facteur le plus élevé, une règle prudente qui se justifie aisément lors d’un contrôle. Le profil global est élevé si deux axes au moins sont élevés ou si la somme des niveaux des axes atteint 11 sur 15, et modéré si un axe est élevé ou si cette somme atteint 7.</p>
<div class="encadre">L’Analyse nationale des risques publiée en 2023 classe le secteur immobilier à <strong>risque élevé</strong>. Le profil ci-dessous mesure l’exposition propre de l’agence au sein de ce secteur : il ne réduit aucune obligation légale et sert à proportionner les mesures de vigilance, les procédures et la formation des collaborateurs (${REF.D561_38_1_1}).</div>

<h2>2. Synthèse</h2>
<table class="t">
  <tr><th style="width:44%">Axe (${REF.L561_4_1.split(' (')[0]})</th><th style="width:16%">Niveau</th><th>Exposition</th></tr>
  ${cls.axes.map((a) => html`<tr><td>${a.lettre}. ${a.titre}</td><td>${a.niveau ? badgeNiveau(a.niveau, a.libelleNiveau) : '—'}</td><td><div class="barre"><span style="width:${a.niveau ? Math.round((a.niveau / 3) * 100) : 0}%"></span></div></td></tr>`)}
  <tr><th>Profil global de l’agence</th><th>${badgeNiveau(cls.global.niveau, cls.global.libelle)}</th><th>Indice d’exposition : ${cls.indice} / 100</th></tr>
</table>
${!cls.complet ? html`<div class="encadre alerte">Questionnaire incomplet : ${cls.repondus} facteurs renseignés sur ${cls.total}. Les facteurs non renseignés sont provisoirement considérés comme faibles. Complétez-les avant de valider.</div>` : ''}

<h2>3. Évaluation détaillée par axe</h2>
${AXES.map((a) => html`
<h3>${a.lettre}. ${a.titre}</h3>
<table class="t">
  <tr><th style="width:31%">Facteur de risque</th><th style="width:27%">Constat pour l’agence</th><th style="width:11%">Niveau</th><th>Mesure associée</th></tr>
  ${cls.facteurs.filter((f) => f.axe === a.id).map((f) => html`<tr>
    <td>${f.question}</td>
    <td>${f.constat}${f.ajuste ? html`<br><span class="petit">Niveau ajusté par l’agence (calculé : ${['', 'faible', 'modéré', 'élevé'][f.niveauCalcule] || '—'}). Motif : ${f.justification}</span>` : ''}</td>
    <td>${f.niveau ? badgeNiveau(f.niveau, f.libelleNiveau) : '—'}</td>
    <td>${f.mesure || 'Vigilance standard.'}</td>
  </tr>`)}
</table>`)}

<h2>4. Situations imposant une vigilance renforcée</h2>
<p>Dans les situations suivantes, la fiche de vigilance de l’opération passe automatiquement en vigilance renforcée. Cela impose des justificatifs complémentaires, un examen écrit et une validation par le dirigeant.</p>
<ul>${cls.situations.map((s) => html`<li>${s.texte} <span class="petit">(${s.ref})</span></li>`)}</ul>

<h2>5. Seuils internes</h2>
<table class="t">
  <tr><th>Seuil</th><th style="width:28%">Valeur retenue</th></tr>
  <tr><td>Apport personnel à partir duquel l’origine des fonds est justifiée par pièces</td><td>${euros(cls.seuils.origineFondsMontant)} ou ${cls.seuils.origineFondsPart} % du prix</td></tr>
  <tr><td>Acquisition sans prêt bancaire déclenchant la vigilance renforcée</td><td>${euros(cls.seuils.comptantRenforce)}</td></tr>
  <tr><td>Prix à partir duquel un bien est considéré comme « de prestige »</td><td>${euros(cls.seuils.prixPrestige)}</td></tr>
</table>
<p class="petit">Listes de pays utilisées : ${LISTES_PAYS.gafiNoire.titre} et ${LISTES_PAYS.gafiGrise.titre.replace('GAFI — ', '')} (état au ${formatDate(LISTES_PAYS.gafiGrise.date)}) ; ${LISTES_PAYS.ue.titre} (état au ${formatDate(LISTES_PAYS.ue.date)}).</p>

<h2>6. Mise à jour</h2>
<p>La classification est revue au moins une fois par an, ainsi qu’à chaque évolution significative : nouvelle activité, nouveau marché, recrutement d’agents commerciaux, alerte ou déclaration de soupçon, évolution réglementaire (notamment l’entrée en application du ${REF.AMLR}). Chaque révision donne lieu à une nouvelle version validée par le dirigeant. Elle entraîne aussi la mise à jour des procédures et du plan de formation.</p>`;
  return { titre: 'Classification des risques LCB-FT', sousTitre: `Établie selon l’${REF.L561_4_1}`, meta, corps, signatures: [`Le dirigeant : ${aCompleter(c.dirigeant, '')}`], fichier: 'classification-des-risques' };
}

export function docProcedures(c) {
  const { cls, etat } = c;
  const p = etat.procedures || {};
  const n = (id) => cls.facteurs.find((f) => f.id === id)?.niveau || 1;
  const sit = new Set(cls.situations.map((s) => s.id));
  const meta = [
    ['Agence', `${aCompleter(c.nomAgence)}${c.agence.siren ? ' — SIREN ' + c.agence.siren : ''}`],
    ['Responsable du dispositif', aCompleter(c.responsable)],
    ['Déclarant / correspondant Tracfin', `${aCompleter(c.declarant)} / ${aCompleter(c.correspondant)}`],
    ['Classification de référence', etat.classification?.dateValidation ? `v${etat.classification.version || 1} validée le ${formatDate(etat.classification.dateValidation)}` : 'À valider'],
    ['Procédures validées le', p.dateValidation ? formatDate(p.dateValidation) : 'Non validées'],
  ];
  const corps = html`
<h2>1. Objet, champ d’application et références</h2>
<p>Les présentes procédures décrivent l’organisation mise en place par l’agence pour respecter ses obligations de lutte contre le blanchiment de capitaux et le financement du terrorisme (LCB-FT), en application de l’${REF.L561_32}. Elles s’appliquent à toutes les personnes qui participent, même ponctuellement, aux opérations de l’agence : dirigeant, salariés, agents commerciaux, assistants et fonctions support.</p>
<p>Activités concernées : intermédiation dans les opérations d’achat et de vente de biens immobiliers${n('fondsCommerce') >= 2 ? ', cessions de fonds de commerce' : ''}${n('locationHaut') === 3 ? ', locations dont le loyer mensuel est égal ou supérieur à 10 000 €' : ''} (${REF.L561_2}). Elles s’appuient sur la classification des risques de l’agence (${REF.L561_4_1}), dont elles déclinent les mesures.</p>

<h2>2. Organisation et responsabilités</h2>
<table class="t">
  <tr><th style="width:30%">Rôle</th><th style="width:25%">Titulaire</th><th>Missions</th></tr>
  <tr><td>Responsable du dispositif</td><td>${aCompleter(c.responsable)}</td><td>Valide la classification et les procédures, organise la formation, décide des opérations en vigilance renforcée et de l’entrée en relation avec une PPE, réalise l’auto-contrôle annuel.</td></tr>
  <tr><td>Déclarant Tracfin (${REF.R561_23.split(' (')[0]})</td><td>${aCompleter(c.declarant)}</td><td>Reçoit les alertes internes, les analyse, décide et transmet les déclarations de soupçon sur ERMES, conserve les analyses de façon confidentielle.</td></tr>
  <tr><td>Correspondant Tracfin (${REF.R561_24.split(' (')[0]})</td><td>${aCompleter(c.correspondant)}</td><td>Répond aux demandes d’information et de pièces de Tracfin dans les délais.</td></tr>
  <tr><td>Collaborateurs et agents commerciaux</td><td>Toute l’équipe</td><td>Appliquent les présentes procédures, complètent les fiches de vigilance, alertent le déclarant en cas de doute, suivent la formation.</td></tr>
</table>

<h2>3. Classification des risques</h2>
<p>Le profil d’exposition de l’agence est <strong>${cls.global.libelle.toLowerCase()}</strong> (indice ${cls.indice}/100). La classification est revue au moins une fois par an et à chaque changement significatif d’activité, de clientèle ou de réglementation. Toute révision entraîne la mise à jour des présentes procédures et du plan de formation.</p>

<h2>4. Entrée en relation : identification et vérification</h2>
<p><strong>Quand ?</strong> Une fiche de vigilance est ouverte pour chaque opération dès la signature du mandat. Elle est complétée avant la signature de l’avant-contrat (compromis ou promesse) et, au plus tard, avant l’acte authentique.</p>
<p><strong>Qui ?</strong> L’agence identifie et vérifie l’identité de son client (mandant) et, par prudence, celle de son cocontractant, ainsi que, le cas échéant, leurs représentants et leurs bénéficiaires effectifs (${REF.L561_5}). Le ${REF.AMLR}, rendra explicite la vérification des deux parties.</p>
<p><strong>Comment ?</strong> Sur présentation de l’original d’un document officiel en cours de validité comportant une photographie (personne physique). Pour une personne morale : extrait d’immatriculation de moins de trois mois, statuts, identité et pouvoir du représentant (${REF.R561_5}). La pièce vérifiée, sa date de validité, la date de vérification et le nom du vérificateur sont consignés.</p>
${n('distance') >= 2 || sit.has('distance') ? html`<p><strong>À distance.</strong> Lorsque la personne n’est pas physiquement présente, la vérification se fait par un moyen d’identification électronique certifié ou est complétée par une mesure prévue par les textes (seconde pièce justificative, premier paiement depuis un compte au nom du client…). Une simple copie de pièce ne suffit pas et place l’opération en vigilance renforcée.</p>` : ''}
<p><strong>Bénéficiaires effectifs.</strong> Pour toute personne morale, l’agence identifie la ou les personnes physiques qui détiennent, directement ou indirectement, plus de 25 % du capital ou des droits de vote, ou qui exercent un contrôle (${REF.R561_1}). Elle consulte le registre des bénéficiaires effectifs et documente tout écart avec les informations du client.</p>
<p><strong>PPE.</strong> Pour chaque partie et chaque bénéficiaire effectif, l’agence détermine s’il s’agit d’une personne politiquement exposée, d’un membre de sa famille ou d’un proche associé (${REF.R561_18}) : déclaration de la personne, recherches et, le cas échéant, bases spécialisées.</p>

<h2>5. Connaissance de l’opération et origine des fonds</h2>
<p>L’agence recueille l’objet et la nature de l’opération (${REF.L561_5_1}) et le plan de financement. L’origine des fonds est justifiée par des pièces dès que l’apport personnel atteint ${euros(cls.seuils.origineFondsMontant)} ou ${cls.seuils.origineFondsPart} % du prix : relevés de compte, acte de vente antérieur, acte de donation ou de succession, contrat de prêt, acte de cession… L’agence apprécie la cohérence entre l’opération, le prix et le profil des parties.</p>

<h2>6. Niveaux de vigilance</h2>
<p><strong>Vigilance standard</strong> : mesures des sections 4 et 5. <strong>Vigilance renforcée</strong> dans les situations définies par la classification :</p>
<ul>${cls.situations.map((s) => html`<li>${s.texte}</li>`)}</ul>
<p>En vigilance renforcée : justificatifs complémentaires sur l’origine du patrimoine et des fonds, examen renforcé écrit (${REF.L561_10_2}), décision de poursuivre prise par le dirigeant (nom et date dans la fiche), suivi renforcé jusqu’à l’acte (${REF.L561_10}).</p>

<h2>7. Vigilance constante</h2>
<p>Jusqu’à la conclusion de l’opération, la fiche est mise à jour à chaque changement : substitution d’acquéreur, nouveau financement, nouvel intervenant, modification du prix (${REF.L561_6}). Chaque changement donne lieu à une réévaluation du niveau de vigilance.</p>

<h2>8. Gel des avoirs</h2>
<p>Avant l’opération, chaque partie et chaque bénéficiaire effectif sont recherchés sur le registre national des gels (${LIENS.gels.url}). La date et le résultat sont consignés. En cas d’homonymie, les éléments d’identification (date de naissance, nationalité) permettent de lever le doute, ce qui est également consigné. En cas de correspondance confirmée, aucune opération n’est réalisée, aucun fonds ni bien n’est mis à disposition et la DG Trésor est informée sans délai (${REF.L562_1}).</p>

<h2>9. Signaux d’alerte, alerte interne et déclaration de soupçon</h2>
<p>Les signaux d’alerte figurent dans chaque fiche de vigilance. Un signal fort non expliqué, ou deux signaux, entraînent la transmission du dossier au déclarant.</p>
<p><strong>Alerte interne.</strong> Tout collaborateur qui a un doute alerte le déclarant dans un délai maximal de ${p.delaiAlerte || '24 heures'}, oralement puis par écrit (modèle en annexe B), sans jamais en informer le client. Le déclarant accuse réception, analyse les éléments et rend sa décision dans un délai de ${p.delaiAnalyse || '5 jours ouvrés'}, et en tout état de cause avant la signature de l’avant-contrat lorsque c’est possible. L’analyse est écrite et conservée séparément, y compris lorsqu’elle conclut à l’absence de soupçon.</p>
<p><strong>Déclaration.</strong> Lorsque l’agence sait, soupçonne ou a de bonnes raisons de soupçonner que des sommes ou une opération proviennent d’une infraction passible d’une peine de plus d’un an d’emprisonnement ou participent au financement du terrorisme, le déclarant effectue une déclaration de soupçon à Tracfin sur ERMES (${REF.L561_15}), en principe avant l’exécution de l’opération (${REF.L561_24}).</p>
<p><strong>Confidentialité.</strong> L’existence et le contenu d’une déclaration ne sont jamais révélés au client ni à un tiers (${REF.L561_18}). La divulgation est pénalement sanctionnée (${REF.L574_1}).</p>

<h2>10. Abstention et refus</h2>
<p>Si l’identité d’une partie ne peut être vérifiée, ou si les informations sur l’opération ne peuvent être obtenues, l’agence n’exécute pas l’opération et le dossier est transmis au déclarant (${REF.L561_8}).</p>

<h2>11. Conservation des documents</h2>
<p>Les fiches de vigilance, les copies des pièces et les justificatifs sont conservés pendant 5 ans à compter de la clôture de l’opération ou de la fin de la relation (${REF.L561_12}). Ils sont classés par opération${p.archivage ? ' (' + p.archivage + ')' : ''}, l’accès en est réservé aux personnes habilitées et ils peuvent être produits sans délai en cas de contrôle. Les justificatifs de formation sont conservés pendant la durée des fonctions de chaque collaborateur, puis 5 ans après son départ (${REF.D561_38_1_1}).</p>

<h2>12. Formation des collaborateurs</h2>
<p>Chaque personne qui participe aux obligations LCB-FT est formée dès son arrivée, avant de participer aux diligences, puis tous les ${c.periodicite('negociateur')} mois au plus. La formation est adaptée à la classification des risques de l’agence et à la fonction de chacun, et comprend un volet sur les sanctions encourues (${REF.L561_34} ; ${REF.D561_38_1_1}). Chaque formation donne lieu à une évaluation, une attestation nominative et une inscription au registre des formations.</p>

<h2>13. Contrôle interne et mise à jour</h2>
<p>Au moins une fois par an, le responsable du dispositif réalise un auto-contrôle : revue d’un échantillon de fiches de vigilance (au moins 10 % des opérations de l’année et toutes les opérations en vigilance renforcée), vérification de la formation de chaque collaborateur et mise à jour de la classification. Les constats et le plan d’action sont consignés. Les procédures sont revues après chaque auto-contrôle et à chaque évolution réglementaire.</p>

<h2 class="saut">Annexe A — Pièces justificatives</h2>
<table class="t">
  <tr><th style="width:30%">Situation</th><th>Pièces</th></tr>
  <tr><td>Personne physique</td><td>Original d’une pièce d’identité officielle en cours de validité avec photographie (carte d’identité, passeport, titre de séjour) ; justificatif de domicile si nécessaire.</td></tr>
  <tr><td>Personne morale</td><td>Extrait d’immatriculation de moins de 3 mois, statuts à jour, pièce d’identité et pouvoir du représentant, déclaration et consultation du registre des bénéficiaires effectifs.</td></tr>
  <tr><td>Bénéficiaire effectif</td><td>Identité complète, nationalité, résidence, nature et pourcentage de détention ou de contrôle.</td></tr>
  <tr><td>Financement</td><td>Offre ou accord de prêt ; pour l’apport, relevés de compte et pièce justifiant l’origine (vente, donation, succession, prêt, cession).</td></tr>
  <tr><td>Vigilance renforcée</td><td>Justificatifs sur l’origine du patrimoine, examen écrit, validation du dirigeant.</td></tr>
</table>

<h2>Annexe B — Fiche d’alerte interne (modèle)</h2>
<table class="t">
  <tr><td style="width:35%">Date et heure de l’alerte</td><td>&nbsp;</td></tr>
  <tr><td>Collaborateur à l’origine de l’alerte</td><td>&nbsp;</td></tr>
  <tr><td>Référence de la fiche de vigilance</td><td>&nbsp;</td></tr>
  <tr><td>Personnes concernées</td><td>&nbsp;</td></tr>
  <tr><td>Faits et éléments atypiques constatés</td><td style="height:60pt">&nbsp;</td></tr>
  <tr><td>Pièces jointes</td><td>&nbsp;</td></tr>
  <tr><td>Reçue par le déclarant le</td><td>&nbsp;</td></tr>
</table>
<p class="petit">Document strictement confidentiel : ne jamais le communiquer au client ni le joindre au dossier de vente.</p>`;
  return { titre: 'Procédures internes LCB-FT', sousTitre: `Organisation et procédures établies selon l’${REF.L561_32}`, meta, corps, signatures: [`Le dirigeant : ${aCompleter(c.dirigeant, '')}`], fichier: 'procedures-internes-lcb-ft' };
}

export function docTracfin(c) {
  const t = c.etat.tracfin || {};
  const ligne = (role, p) => html`<tr><td>${role}</td><td>${aCompleter([p?.prenom, p?.nom].filter(Boolean).join(' '))}</td><td>${aCompleter(p?.fonction)}</td><td>${aCompleter(p?.email, '—')}<br>${p?.telephone || ''}</td></tr>`;
  const corresp = t.memePersonne ? t.declarant : t.correspondant;
  const meta = [
    ['Agence', `${aCompleter(c.nomAgence)}${c.agence.siren ? ' — SIREN ' + c.agence.siren : ''}`],
    ['Adresse', aCompleter(c.adresse)],
    ['Représentant légal', `${aCompleter(c.dirigeant)} — ${c.qualiteDirigeant}`],
    ['Date de la désignation', t.dateDesignation ? formatDate(t.dateDesignation) : '[à compléter]'],
    ['Enregistrement sur ERMES', t.ermesEnregistre ? `Effectué${t.dateEnregistrement ? ' le ' + formatDate(t.dateEnregistrement) : ''}` : 'À effectuer'],
  ];
  const corps = html`
<h2>1. Décision de désignation</h2>
<p>Je soussigné(e), ${aCompleter(c.dirigeant)}, ${c.qualiteDirigeant.toLowerCase()} de ${aCompleter(c.nomAgence)}, désigne, en application des articles R. 561-23 et R. 561-24 du Code monétaire et financier :</p>
<table class="t">
  <tr><th style="width:22%">Rôle</th><th style="width:24%">Nom</th><th style="width:22%">Fonction</th><th>Coordonnées</th></tr>
  ${ligne('Déclarant', t.declarant)}
  ${ligne('Correspondant', corresp)}
</table>
${t.memePersonne ? html`<p>Les fonctions de déclarant et de correspondant sont exercées par la même personne.</p>` : ''}

<h2>2. Missions</h2>
<p><strong>Le déclarant</strong> est habilité à établir, signer et transmettre à Tracfin les déclarations de soupçon de l’agence. Il reçoit et analyse les alertes internes, décide des suites à leur donner et conserve, de façon strictement confidentielle, les analyses, les déclarations et les accusés de réception.</p>
<p><strong>Le correspondant</strong> est l’interlocuteur de Tracfin. Il répond à ses demandes d’information et de communication de pièces dans les délais fixés.</p>
<p>Le représentant légal informe Tracfin de tout changement de déclarant ou de correspondant.</p>

<h2>3. Enregistrement sur la plateforme ERMES</h2>
<ol>
  <li>Se rendre sur la plateforme ERMES de Tracfin (${LIENS.ermes.url}) et demander la création de l’accès de l’organisme.</li>
  <li>Renseigner l’identité de l’agence (dénomination, SIREN, adresse, activité) et celle des personnes désignées.</li>
  <li>Joindre le présent formulaire de désignation, signé par le représentant légal, ainsi qu’un extrait d’immatriculation (Kbis).</li>
  <li>Conserver la confirmation d’enregistrement avec le présent document.</li>
</ol>
<p class="petit">La marche à suivre peut évoluer : se référer à la documentation en ligne d’ERMES au moment de l’enregistrement.</p>

<h2>4. Confidentialité</h2>
<p>Les personnes désignées sont tenues à une confidentialité absolue : l’existence et le contenu d’une déclaration de soupçon ne peuvent être révélés au client ni à un tiers (${REF.L561_18}). La divulgation est punie de 22 500 € d’amende (${REF.L574_1}).</p>`;
  const signatures = [`Le représentant légal : ${aCompleter(c.dirigeant, '')}`, `Le déclarant : ${[t.declarant?.prenom, t.declarant?.nom].filter(Boolean).join(' ')}`];
  if (!t.memePersonne) signatures.push(`Le correspondant : ${[t.correspondant?.prenom, t.correspondant?.nom].filter(Boolean).join(' ')}`);
  return { titre: 'Désignation du déclarant et du correspondant Tracfin', sousTitre: 'Articles R. 561-23 et R. 561-24 du Code monétaire et financier', meta, corps, signatures, fichier: 'designation-tracfin' };
}

export const NOMS_FACTEURS = Object.fromEntries(FACTEURS.map((f) => [f.id, f.question]));
