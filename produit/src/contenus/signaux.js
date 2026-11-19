// Signaux d'alerte en transaction immobilière (typologies usuelles Tracfin / DGCCRF).
// « fort » : un seul signal fort non expliqué suffit à transmettre le dossier au déclarant.
export const SIGNAUX = [
  { id: 'refusPieces', libelle: 'Réticence à fournir des pièces, ou pièces douteuses, retouchées ou incohérentes', fort: true },
  { id: 'pretenom', libelle: 'Indices de prête-nom : celui qui paie ou décide n’est pas l’acquéreur déclaré', fort: true },
  { id: 'societeRecente', libelle: 'Société acquéreuse récente, peu capitalisée ou sans activité réelle, qui achète comptant', fort: true },
  { id: 'especes', libelle: 'Proposition de régler une partie du prix ou de la commission en espèces', fort: true },
  { id: 'montageComplexe', libelle: 'Montage juridique ou financier complexe sans justification économique apparente', fort: true },
  { id: 'paysSanctions', libelle: 'Lien avec un pays sous sanctions ou une personne visée par des mesures restrictives', fort: true },
  { id: 'prixAnormal', libelle: 'Prix nettement supérieur ou inférieur au marché, accepté sans négociation', fort: false },
  { id: 'sansVisite', libelle: 'Acquisition sans visite ni intérêt pour les caractéristiques du bien', fort: false },
  { id: 'urgence', libelle: 'Urgence inhabituelle ou demande de discrétion injustifiée', fort: false },
  { id: 'substitution', libelle: 'Substitution d’acquéreur ou changement de bénéficiaire en cours de processus', fort: false },
  { id: 'fondsFractionnes', libelle: 'Fonds fractionnés, venant de plusieurs comptes ou de tiers sans lien apparent', fort: false },
  { id: 'incoherenceProfil', libelle: 'Incohérence entre l’opération et le profil (âge, revenus, activité déclarée)', fort: false },
  { id: 'reventeRapide', libelle: 'Revente rapide d’un bien acquis récemment, avec une plus-value inexpliquée', fort: false },
  { id: 'remunerationAtypique', libelle: 'Demande de commission atypique (versée à un tiers, sur un compte étranger, en espèces)', fort: false },
];
