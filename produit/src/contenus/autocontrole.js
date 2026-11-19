// Points d'auto-contrôle annuel (art. L. 561-32 CMF). « diag » : utilisé aussi par le diagnostic gratuit.
// « critique » : manquement régulièrement retenu dans les décisions de la Commission nationale des sanctions.
export const GROUPES = [
  { id: 'organisation', titre: 'Organisation' },
  { id: 'classification', titre: 'Classification des risques' },
  { id: 'procedures', titre: 'Procédures internes' },
  { id: 'vigilance', titre: 'Vigilance sur les opérations' },
  { id: 'declaration', titre: 'Alerte et déclaration de soupçon' },
  { id: 'formation', titre: 'Formation' },
  { id: 'conservation', titre: 'Conservation et contrôle interne' },
];

export const POINTS = [
  { id: 'ac01', groupe: 'organisation', poids: 2, texte: 'Une personne est responsable du dispositif LCB-FT au sein de l’agence.', action: 'Désigner le responsable LCB-FT (souvent le dirigeant) et le mentionner dans les procédures.', module: 'tracfin' },
  { id: 'ac02', groupe: 'organisation', poids: 3, critique: true, diag: true, texte: 'Le déclarant et le correspondant Tracfin sont désignés et enregistrés sur ERMES.', action: 'Désigner le déclarant et le correspondant, puis les enregistrer sur la plateforme ERMES de Tracfin.', module: 'tracfin' },
  { id: 'ac03', groupe: 'classification', poids: 3, critique: true, diag: true, texte: 'La classification des risques est écrite, propre à l’agence et motivée.', action: 'Établir une classification des risques individualisée selon les 5 axes de l’art. L. 561-4-1 CMF.', module: 'classification' },
  { id: 'ac04', groupe: 'classification', poids: 2, diag: true, texte: 'La classification a été revue au cours des 12 derniers mois.', action: 'Revoir la classification au moins une fois par an et après tout changement d’activité.', module: 'classification' },
  { id: 'ac05', groupe: 'procedures', poids: 3, critique: true, diag: true, texte: 'Des procédures internes écrites décrivent l’identification, la vigilance, la déclaration et la conservation.', action: 'Rédiger et valider les procédures internes LCB-FT (art. L. 561-32 CMF).', module: 'procedures' },
  { id: 'ac06', groupe: 'procedures', poids: 1, texte: 'Les procédures sont connues des collaborateurs (diffusées, accessibles, présentées en formation).', action: 'Diffuser les procédures et les présenter lors de la formation.', module: 'procedures' },
  { id: 'ac07', groupe: 'vigilance', poids: 3, critique: true, diag: true, texte: 'Une fiche de vigilance existe pour chaque opération en cours.', action: 'Ouvrir une fiche de vigilance dès la signature du mandat, pour chaque opération.', module: 'vigilance' },
  { id: 'ac08', groupe: 'vigilance', poids: 3, diag: true, texte: 'L’identité de chaque partie est vérifiée sur pièce avant l’avant-contrat.', action: 'Vérifier l’identité des deux parties sur pièce probante avant le compromis ou la promesse.', module: 'vigilance' },
  { id: 'ac09', groupe: 'vigilance', poids: 2, diag: true, texte: 'Les bénéficiaires effectifs des personnes morales sont identifiés et le registre est consulté.', action: 'Identifier les bénéficiaires effectifs (plus de 25 % ou contrôle) et consulter le RBE pour chaque société.', module: 'vigilance' },
  { id: 'ac10', groupe: 'vigilance', poids: 2, diag: true, texte: 'Le statut de personne politiquement exposée (PPE) est déterminé pour chaque partie.', action: 'Poser la question PPE à chaque partie et bénéficiaire effectif, et la consigner.', module: 'vigilance' },
  { id: 'ac11', groupe: 'vigilance', poids: 2, diag: true, texte: 'Le registre national des gels est consulté et la consultation est datée.', action: 'Consulter le registre des gels pour chaque partie et bénéficiaire effectif, et noter la date et le résultat.', module: 'vigilance' },
  { id: 'ac12', groupe: 'vigilance', poids: 3, critique: true, diag: true, texte: 'L’origine des fonds est justifiée par des pièces au-delà d’un seuil défini.', action: 'Fixer un seuil interne et exiger des justificatifs d’origine des fonds au-delà de ce seuil.', module: 'vigilance' },
  { id: 'ac13', groupe: 'vigilance', poids: 2, texte: 'Les opérations à risque élevé font l’objet d’un examen renforcé écrit, validé par le dirigeant.', action: 'Rédiger l’examen renforcé et faire valider la poursuite de l’opération par le dirigeant.', module: 'vigilance' },
  { id: 'ac14', groupe: 'declaration', poids: 2, texte: 'Une procédure d’alerte interne vers le déclarant existe et est connue de tous.', action: 'Formaliser le circuit d’alerte interne (qui, comment, sous quel délai) dans les procédures.', module: 'procedures' },
  { id: 'ac15', groupe: 'declaration', poids: 1, texte: 'L’analyse de chaque alerte est documentée, même lorsqu’aucune déclaration n’est faite.', action: 'Conserver une trace écrite de chaque analyse d’alerte, à part et de façon confidentielle.', module: 'procedures' },
  { id: 'ac16', groupe: 'formation', poids: 3, critique: true, diag: true, texte: 'Chaque personne qui participe aux obligations LCB-FT a été formée à son arrivée.', action: 'Former chaque collaborateur dès son arrivée, puis régulièrement (art. D. 561-38-1-1 CMF).', module: 'equipe' },
  { id: 'ac17', groupe: 'formation', poids: 2, diag: true, texte: 'La formation est adaptée aux risques de l’agence et aux fonctions, et comporte un volet sur les sanctions.', action: 'Adapter le contenu de la formation à la classification des risques et à chaque fonction, avec un volet sanctions.', module: 'equipe' },
  { id: 'ac18', groupe: 'formation', poids: 2, texte: 'Les justificatifs de formation sont conservés pendant les fonctions, puis 5 ans après le départ.', action: 'Tenir un registre des formations et conserver les attestations, programmes et supports.', module: 'equipe' },
  { id: 'ac19', groupe: 'conservation', poids: 2, texte: 'Les pièces et les fiches sont conservées 5 ans et peuvent être retrouvées rapidement.', action: 'Organiser l’archivage par opération et calculer la date de fin de conservation.', module: 'vigilance' },
  { id: 'ac20', groupe: 'conservation', poids: 1, texte: 'Un auto-contrôle est réalisé au moins une fois par an et donne lieu à un plan d’action.', action: 'Réaliser l’auto-contrôle annuel et suivre le plan d’action.', module: 'autocontrole' },
];

export const REPONSES = [
  { v: 'oui', libelle: 'Oui', valeur: 1 },
  { v: 'partiel', libelle: 'En partie', valeur: 0.5 },
  { v: 'non', libelle: 'Non', valeur: 0 },
];
