// Contexte commun à tous les documents, calculé à partir de l'état.
import { calculerClassification } from '../moteur/risques.js';
import { contexte as contexteFormation, periodiciteMois } from '../moteur/formation.js';

export function contexteDocument(etat, { licence, aujourdhui }) {
  const a = etat.agence || {};
  const cls = calculerClassification(etat.profil, etat.ajustements, etat.seuils);
  const fctx = contexteFormation({ agence: a, classification: cls, reponses: etat.profil, seuils: etat.seuils, tracfin: etat.tracfin });
  const nomPersonne = (p) => (p ? [p.prenom, p.nom].filter(Boolean).join(' ') : '');
  return {
    etat,
    agence: a,
    nomAgence: a.raisonSociale || '',
    dirigeant: [a.dirigeantPrenom, a.dirigeantNom].filter(Boolean).join(' '),
    qualiteDirigeant: a.dirigeantQualite || 'Représentant légal',
    adresse: [a.adresse, [a.codePostal, a.ville].filter(Boolean).join(' ')].filter(Boolean).join(', '),
    cls,
    fctx,
    seuils: cls.seuils,
    licence,
    aujourdhui,
    declarant: nomPersonne(etat.tracfin?.declarant),
    correspondant: etat.tracfin?.memePersonne ? nomPersonne(etat.tracfin?.declarant) : nomPersonne(etat.tracfin?.correspondant),
    responsable: nomPersonne(etat.tracfin?.responsable) || [a.dirigeantPrenom, a.dirigeantNom].filter(Boolean).join(' '),
    periodicite: (fonction) => periodiciteMois(cls.global.niveau, fonction),
  };
}
