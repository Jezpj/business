// Questionnaire de classification des risques, structuré selon les 5 axes de l'art. L. 561-4-1 CMF :
// produits ou services, conditions de transaction, canaux de distribution, clients, pays ou territoires.
// niveau : 1 = faible, 2 = modéré, 3 = élevé.

export const AXES = [
  { id: 'produits', lettre: 'A', titre: 'Nature des produits et services offerts' },
  { id: 'transactions', lettre: 'B', titre: 'Conditions des transactions proposées' },
  { id: 'canaux', lettre: 'C', titre: 'Canaux de distribution utilisés' },
  { id: 'clients', lettre: 'D', titre: 'Caractéristiques des clients' },
  { id: 'pays', lettre: 'E', titre: 'Pays et territoires d’origine ou de destination des fonds' },
];

export const FACTEURS = [
  // ── A. Produits et services
  {
    id: 'prixMoyen', axe: 'produits',
    question: 'Prix de vente moyen des biens que vous vendez',
    options: [
      { v: 'bas', libelle: 'Moins de 250 000 €', niveau: 1 },
      { v: 'moyen', libelle: 'De 250 000 € à 750 000 €', niveau: 2 },
      { v: 'haut', libelle: 'Plus de 750 000 €', niveau: 3 },
    ],
    mesure: 'Les montants élevés favorisent l’intégration de fonds importants : la justification de l’origine des fonds est systématique au-delà du seuil interne.',
  },
  {
    id: 'prestige', axe: 'produits',
    question: 'Part de biens de prestige (prix ≥ 1 000 000 €) dans vos ventes',
    options: [
      { v: 'aucune', libelle: 'Aucune', niveau: 1 },
      { v: 'faible', libelle: 'Moins de 10 %', niveau: 2 },
      { v: 'forte', libelle: '10 % ou plus', niveau: 3 },
    ],
    mesure: 'Vigilance renforcée pour toute transaction d’un bien de prestige : bénéficiaire effectif, origine du patrimoine et des fonds, cohérence du prix.',
  },
  {
    id: 'fondsCommerce', axe: 'produits',
    question: 'Intervenez-vous dans des cessions de fonds de commerce ou de parts de sociétés ?',
    options: [
      { v: 'jamais', libelle: 'Jamais', niveau: 1 },
      { v: 'occasionnel', libelle: 'Occasionnellement', niveau: 2 },
      { v: 'regulier', libelle: 'Régulièrement', niveau: 3 },
    ],
    mesure: 'Cessions de commerces à forte intensité d’espèces : cohérence prix / chiffre d’affaires et origine des fonds de l’acquéreur à documenter.',
  },
  {
    id: 'locationHaut', axe: 'produits',
    question: 'Intervenez-vous dans des locations dont le loyer mensuel atteint ou dépasse 10 000 € ?',
    options: [
      { v: 'non', libelle: 'Non', niveau: 1 },
      { v: 'oui', libelle: 'Oui', niveau: 3 },
    ],
    mesure: 'Ces locations entrent dans le champ de la LCB-FT : identification du bailleur et du preneur, origine des fonds en cas de loyers payés d’avance ou par un tiers.',
  },
  {
    id: 'neufInvest', axe: 'produits',
    question: 'Commercialisez-vous des programmes neufs, des ventes en bloc ou des produits d’investissement ?',
    options: [
      { v: 'non', libelle: 'Non', niveau: 1 },
      { v: 'oui', libelle: 'Oui', niveau: 2 },
    ],
    mesure: 'Investisseurs multi-acquéreurs et ventes en bloc : identifier le bénéficiaire effectif de chaque structure acquéreuse.',
  },
  {
    id: 'biensAtypiques', axe: 'produits',
    question: 'Vendez-vous des biens atypiques et difficiles à évaluer (domaines, châteaux, îles, biens très rares) ?',
    options: [
      { v: 'non', libelle: 'Non', niveau: 1 },
      { v: 'oui', libelle: 'Oui', niveau: 2 },
    ],
    mesure: 'Prix difficile à comparer au marché : faire motiver par écrit tout écart de prix significatif.',
  },
  // ── B. Conditions des transactions
  {
    id: 'comptant', axe: 'transactions',
    question: 'Part des acquisitions réalisées sans prêt bancaire',
    options: [
      { v: 'faible', libelle: 'Moins de 10 %', niveau: 1 },
      { v: 'moyenne', libelle: 'De 10 % à 30 %', niveau: 2 },
      { v: 'forte', libelle: 'Plus de 30 %', niveau: 3 },
    ],
    mesure: 'Sans prêt bancaire, aucun établissement financier n’a vérifié les fonds : justificatifs d’origine obligatoires au-delà du seuil interne.',
  },
  {
    id: 'fondsEtrangers', axe: 'transactions',
    question: 'Des acquisitions sont-elles financées par des fonds venant de comptes à l’étranger ?',
    options: [
      { v: 'jamais', libelle: 'Jamais', niveau: 1 },
      { v: 'parfois', libelle: 'Parfois', niveau: 2 },
      { v: 'souvent', libelle: 'Souvent', niveau: 3 },
    ],
    mesure: 'Identifier le pays de provenance des fonds et le croiser avec les listes GAFI et UE ; obtenir les justificatifs bancaires.',
  },
  {
    id: 'tiersPayeurs', axe: 'transactions',
    question: 'Rencontrez-vous des apports importants de tiers (famille, associés, prêteurs privés) ?',
    options: [
      { v: 'rare', libelle: 'Rarement', niveau: 1 },
      { v: 'frequent', libelle: 'Fréquemment', niveau: 2 },
    ],
    mesure: 'Identifier le tiers apporteur, son lien avec l’acquéreur et la nature de l’apport (donation, prêt), pièces à l’appui.',
  },
  {
    id: 'reventesRapides', axe: 'transactions',
    question: 'Traitez-vous des achats-reventes rapides (moins de 2 ans) ou des opérations de marchands de biens ?',
    options: [
      { v: 'rare', libelle: 'Rarement ou jamais', niveau: 1 },
      { v: 'frequent', libelle: 'Fréquemment', niveau: 3 },
    ],
    mesure: 'Les reventes rapides avec forte plus-value sont un schéma connu : examen renforcé de la justification économique.',
  },
  // ── C. Canaux de distribution
  {
    id: 'distance', axe: 'canaux',
    question: 'Concluez-vous des mandats ou des ventes avec des clients jamais rencontrés physiquement ?',
    options: [
      { v: 'jamais', libelle: 'Jamais', niveau: 1 },
      { v: 'parfois', libelle: 'Parfois', niveau: 2 },
      { v: 'souvent', libelle: 'Souvent', niveau: 3 },
    ],
    mesure: 'Hors présence physique : vérification par un moyen d’identification électronique fiable ou par des mesures complémentaires prévues par les textes.',
  },
  {
    id: 'apporteurs', axe: 'canaux',
    question: 'Recourez-vous à des apporteurs d’affaires ou intermédiaires tiers (chasseurs, conciergeries, family offices) ?',
    options: [
      { v: 'non', libelle: 'Non', niveau: 1 },
      { v: 'occasionnel', libelle: 'Occasionnellement', niveau: 2 },
      { v: 'frequent', libelle: 'Fréquemment', niveau: 3 },
    ],
    mesure: 'Identifier l’intermédiaire, son mandant réel et son mode de rémunération ; ne jamais se reposer sur ses seules diligences.',
  },
  {
    id: 'agentsCommerciaux', axe: 'canaux',
    question: 'Combien d’agents commerciaux (mandataires indépendants) travaillent pour l’agence ?',
    options: [
      { v: 'aucun', libelle: 'Aucun', niveau: 1 },
      { v: 'peu', libelle: '1 à 3', niveau: 2 },
      { v: 'nombreux', libelle: 'Plus de 3', niveau: 3 },
    ],
    mesure: 'Les agents commerciaux appliquent les procédures de l’agence, sont formés et transmettent les fiches de vigilance au responsable LCB-FT.',
  },
  {
    id: 'plateformes', axe: 'canaux',
    question: 'Recevez-vous des mandats ou des clients via des plateformes en ligne ou des intermédiaires étrangers ?',
    options: [
      { v: 'non', libelle: 'Non', niveau: 1 },
      { v: 'oui', libelle: 'Oui', niveau: 2 },
    ],
    mesure: 'Vérifier l’identité réelle du client derrière la plateforme ou l’intermédiaire.',
  },
  // ── D. Clients
  {
    id: 'nonResidents', axe: 'clients',
    question: 'Part de clients étrangers ou non-résidents fiscaux en France',
    options: [
      { v: 'faible', libelle: 'Moins de 5 %', niveau: 1 },
      { v: 'moyenne', libelle: 'De 5 % à 25 %', niveau: 2 },
      { v: 'forte', libelle: 'Plus de 25 %', niveau: 3 },
    ],
    mesure: 'Vérifier le pays de résidence et de nationalité de chaque partie et de ses bénéficiaires effectifs au regard des listes GAFI et UE.',
  },
  {
    id: 'personnesMorales', axe: 'clients',
    question: 'Fréquence des acquéreurs ou vendeurs personnes morales (SCI, sociétés)',
    options: [
      { v: 'rare', libelle: 'Rare', niveau: 1 },
      { v: 'regulier', libelle: 'Régulière', niveau: 2 },
      { v: 'frequent', libelle: 'Fréquente (plus d’une opération sur quatre)', niveau: 3 },
    ],
    mesure: 'Pour chaque personne morale : extrait d’immatriculation de moins de 3 mois, statuts, identification du ou des bénéficiaires effectifs et consultation du registre des bénéficiaires effectifs.',
  },
  {
    id: 'structuresComplexes', axe: 'clients',
    question: 'Rencontrez-vous des structures complexes ou étrangères (holdings étrangères, trusts, fiducies, sociétés offshore) ?',
    options: [
      { v: 'jamais', libelle: 'Jamais', niveau: 1 },
      { v: 'parfois', libelle: 'Parfois', niveau: 3 },
    ],
    mesure: 'Examen renforcé systématique : reconstituer la chaîne de détention jusqu’aux personnes physiques et justifier l’intérêt économique du montage.',
  },
  {
    id: 'ppe', axe: 'clients',
    question: 'Avez-vous ou pourriez-vous avoir des clients personnes politiquement exposées (PPE) ou leurs proches ?',
    options: [
      { v: 'non', libelle: 'Non, très peu probable', niveau: 1 },
      { v: 'possible', libelle: 'C’est possible', niveau: 2 },
      { v: 'oui', libelle: 'Oui, cela arrive', niveau: 3 },
    ],
    mesure: 'Question PPE systématique dans chaque fiche de vigilance ; pour toute PPE : origine du patrimoine et des fonds, et décision d’entrer en relation prise par le dirigeant.',
  },
  {
    id: 'investisseurs', axe: 'clients',
    question: 'Part d’investisseurs multipropriétaires ou de clients sans attache avec votre secteur',
    options: [
      { v: 'faible', libelle: 'Faible', niveau: 1 },
      { v: 'forte', libelle: 'Importante', niveau: 2 },
    ],
    mesure: 'Comprendre l’objet de l’acquisition (résidence, location, revente) et le consigner dans la fiche de vigilance.',
  },
  // ── E. Pays et territoires
  {
    id: 'zone', axe: 'pays',
    question: 'Type de marché sur lequel l’agence est implantée',
    options: [
      { v: 'residentiel', libelle: 'Résidentiel local (ville, périurbain, rural)', niveau: 1 },
      { v: 'touristique', libelle: 'Touristique, littoral ou station (résidences secondaires)', niveau: 2 },
      { v: 'frontalier', libelle: 'Frontalier ou à forte clientèle internationale', niveau: 2 },
      { v: 'prestige', libelle: 'Marché de prestige (Côte d’Azur, Paris Ouest, stations haut de gamme…)', niveau: 3 },
    ],
    mesure: 'Les marchés touristiques, frontaliers et de prestige concentrent clientèle étrangère et fonds importants : vigilance accrue sur la provenance des fonds.',
  },
  {
    id: 'paysRisque', axe: 'pays', type: 'pays',
    question: 'Ces 12 derniers mois, des clients ou des fonds étaient-ils liés à l’un de ces pays ?',
    aide: 'Sélectionnez les pays rencontrés. La liste proposée comprend les pays inscrits sur les listes GAFI (noire et grise) et sur la liste UE des pays tiers à haut risque.',
    mesure: 'Toute opération liée à un pays inscrit sur une liste GAFI ou UE fait l’objet de mesures de vigilance renforcées ; les pays sous contre-mesures du GAFI imposent un examen au cas par cas avec le dirigeant.',
  },
  {
    id: 'offshore', axe: 'pays',
    question: 'Des fonds proviennent-ils de centres financiers extraterritoriaux ou de territoires à fiscalité très faible ?',
    options: [
      { v: 'jamais', libelle: 'Jamais', niveau: 1 },
      { v: 'parfois', libelle: 'Parfois', niveau: 2 },
      { v: 'souvent', libelle: 'Souvent', niveau: 3 },
    ],
    mesure: 'Faire justifier la provenance et la cohérence des fonds ; une opacité persistante doit être signalée au déclarant.',
  },
];

export const NIVEAUX = {
  1: { id: 'faible', libelle: 'Faible' },
  2: { id: 'modere', libelle: 'Modéré' },
  3: { id: 'eleve', libelle: 'Élevé' },
};

// Seuils internes par défaut, modifiables par l'agence (utilisés par les fiches de vigilance).
export const SEUILS_DEFAUT = {
  origineFondsMontant: 50000, // apport personnel à partir duquel l'origine des fonds est justifiée par pièces
  origineFondsPart: 30,       // ou part du prix (en %) financée sans prêt
  comptantRenforce: 300000,   // acquisition sans prêt bancaire à partir de laquelle la vigilance est renforcée
  prixPrestige: 1000000,      // prix à partir duquel le bien est considéré « de prestige »
};
