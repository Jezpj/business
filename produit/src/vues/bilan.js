// Bilan du dossier : étapes, avancement « prêt pour le contrôle » et tâches prioritaires.
import { calculerClassification } from '../moteur/risques.js';
import { evaluerFiche } from '../moteur/vigilance.js';
import { statutFormation, periodiciteMois } from '../moteur/formation.js';
import { ajouterMois, formatDate } from '../moteur/dates.js';

export const empreinteClassification = (e) => JSON.stringify({ p: e.profil, a: e.ajustements, s: e.seuils });

export function bilan(app) {
  const e = app.etat;
  const auj = app.aujourdhui();
  const cls = calculerClassification(e.profil, e.ajustements, e.seuils);
  const a = e.agence;
  const agenceOk = Boolean(a.raisonSociale && a.siren && a.adresse && a.ville && a.dirigeantNom);

  const clsValidee = Boolean(e.classification.dateValidation) && cls.complet;
  const clsModifiee = clsValidee && e.classification.empreinte !== empreinteClassification(e);
  const clsEchue = clsValidee && ajouterMois(e.classification.dateValidation, 12) <= auj;
  const clsOk = clsValidee && !clsModifiee && !clsEchue;

  const procValidees = Boolean(e.procedures.dateValidation);
  const procAJour = procValidees && e.procedures.versionClassification === e.classification.version;
  const procOk = procAJour && clsValidee;

  const t = e.tracfin;
  const designes = Boolean(t.declarant?.nom && (t.memePersonne || t.correspondant?.nom));
  const tracfinOk = designes && Boolean(t.ermesEnregistre);

  const statuts = e.equipe.map((m) => ({ m, st: statutFormation(m, { periodicite: periodiciteMois(cls.global.niveau, m.fonction), aujourdhui: auj }) }));
  const actifs = statuts.filter((s) => s.st.etat !== 'parti');
  const formes = actifs.filter((s) => s.st.etat === 'aJour');
  const equipeOk = actifs.length > 0 && formes.length === actifs.length;

  const fiches = e.vigilances.map((f) => ({ f, ev: evaluerFiche(f, { situations: cls.situations, seuils: cls.seuils }) }));
  const enCours = fiches.filter((x) => x.f.statut !== 'cloturee');
  const incompletes = enCours.filter((x) => !x.ev.complet);
  const vigilanceOk = incompletes.length === 0;

  const acs = e.autocontroles.slice().sort((x, y) => (x.date < y.date ? 1 : -1));
  const dernierAc = acs[0] || null;
  const acOk = Boolean(dernierAc && ajouterMois(dernierAc.date, 12) > auj);

  const etapes = [
    { id: 'agence', titre: 'Identité de l’agence', ok: agenceOk, detail: agenceOk ? a.raisonSociale : 'Raison sociale, SIREN, adresse et dirigeant à renseigner' },
    { id: 'classification', titre: 'Classification des risques', ok: clsOk, attention: clsModifiee || clsEchue,
      detail: clsOk ? `Validée le ${formatDate(e.classification.dateValidation)} — profil ${cls.global.libelle.toLowerCase()}` : clsModifiee ? 'Modifiée depuis la validation : à revalider' : clsEchue ? 'Revue annuelle à faire' : `${cls.repondus}/${cls.total} facteurs renseignés, à valider` },
    { id: 'procedures', titre: 'Procédures internes', ok: procOk, attention: procValidees && !procAJour,
      detail: procOk ? `Validées le ${formatDate(e.procedures.dateValidation)}` : procValidees ? 'Classification révisée : procédures à revalider' : 'À générer et valider' },
    { id: 'tracfin', titre: 'Déclarant et correspondant Tracfin', ok: tracfinOk, attention: designes && !t.ermesEnregistre,
      detail: tracfinOk ? 'Désignés et enregistrés sur ERMES' : designes ? 'Désignés : enregistrement ERMES à faire' : 'À désigner' },
    { id: 'equipe', titre: 'Formation de l’équipe', ok: equipeOk, attention: actifs.length > 0 && !equipeOk,
      detail: actifs.length ? `${formes.length}/${actifs.length} collaborateur(s) à jour` : 'Ajoutez les collaborateurs de l’agence' },
    { id: 'vigilance', titre: 'Fiches de vigilance', ok: vigilanceOk, attention: incompletes.length > 0,
      detail: e.vigilances.length ? `${enCours.length} en cours, dont ${incompletes.length} incomplète(s)` : 'Aucune fiche : ouvrez-en une par opération' },
    { id: 'autocontrole', titre: 'Auto-contrôle annuel', ok: acOk, detail: dernierAc ? `Dernier le ${formatDate(dernierAc.date)} — ${dernierAc.score}/100` : 'Jamais réalisé' },
  ];
  const pret = Math.round((etapes.filter((x) => x.ok).length / etapes.length) * 100);

  const aFaire = [];
  if (!agenceOk) aFaire.push({ texte: 'Compléter l’identité de l’agence', route: 'agence' });
  if (!clsOk) aFaire.push({ texte: clsModifiee ? 'Revalider la classification des risques modifiée' : 'Établir et valider la classification des risques', route: 'classification', critique: true });
  if (!procOk) aFaire.push({ texte: 'Valider les procédures internes', route: 'procedures', critique: true });
  if (!designes) aFaire.push({ texte: 'Désigner le déclarant et le correspondant Tracfin', route: 'tracfin', critique: true });
  else if (!t.ermesEnregistre) aFaire.push({ texte: 'Enregistrer les désignations sur ERMES', route: 'tracfin' });
  for (const s of actifs.filter((x) => x.st.etat !== 'aJour')) aFaire.push({ texte: `${s.st.etat === 'echu' ? 'Renouveler' : 'Réaliser'} la formation de ${[s.m.prenom, s.m.nom].filter(Boolean).join(' ')}`, route: `formation/${s.m.id}`, critique: s.st.etat === 'aFormer' });
  for (const x of incompletes.slice(0, 5)) aFaire.push({ texte: `Compléter la fiche ${x.f.reference} (${x.ev.manquants.length} point(s))`, route: `vigilance/${x.f.id}`, critique: x.ev.niveau !== 'standard' });
  if (!acOk) aFaire.push({ texte: 'Réaliser l’auto-contrôle annuel', route: 'autocontrole' });

  return { cls, etapes, pret, aFaire, statuts, actifs, formes, fiches, enCours, incompletes, dernierAc, clsModifiee };
}
