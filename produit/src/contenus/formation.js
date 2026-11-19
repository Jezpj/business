// Contenu du module de formation LCB-FT (art. L. 561-34 et D. 561-38-1-1 CMF).
// Le module d'un collaborateur = sections « socle » + sections déclenchées par la classification
// des risques de l'agence + sections propres à sa fonction. Le volet « sanctions » est toujours inclus.
import { SIGNAUX } from './signaux.js';
import { LISTES_PAYS } from './pays.js';

export const FONCTIONS = [
  { id: 'dirigeant', libelle: 'Dirigeant ou titulaire de la carte professionnelle' },
  { id: 'responsable', libelle: 'Responsable LCB-FT ou déclarant Tracfin' },
  { id: 'negociateur', libelle: 'Négociateur salarié' },
  { id: 'agentCommercial', libelle: 'Agent commercial (mandataire indépendant)' },
  { id: 'assistant', libelle: 'Assistant(e), accueil ou gestion administrative' },
  { id: 'support', libelle: 'Fonction support (comptabilité, direction administrative)' },
];

const euros = (n) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' €';
const dateFr = (iso) => iso.split('-').reverse().join('/');

export const SECTIONS = [
  {
    id: 'enjeux', titre: 'Pourquoi l’immobilier est exposé au blanchiment', duree: 4, socle: true,
    paragraphes: () => [
      'Blanchir, c’est donner une apparence licite à des fonds d’origine criminelle : trafics, escroqueries, corruption, fraude fiscale… Le financement du terrorisme consiste à fournir des fonds, même d’origine licite, à une entreprise terroriste.',
      'L’immobilier est un véhicule privilégié : des montants élevés, des biens durables qui conservent leur valeur, la possibilité d’interposer des sociétés, et une revente qui « recycle » les fonds. L’Analyse nationale des risques publiée en 2023 classe le secteur immobilier à risque élevé.',
      'Les agents immobiliers sont donc des « professionnels assujettis » (art. L. 561-2 du Code monétaire et financier). Vous n’êtes pas enquêteur, mais vous devez connaître vos clients, comprendre les opérations, détecter les anomalies et les signaler à Tracfin, le service de renseignement financier du ministère de l’Économie.',
    ],
    points: () => [
      'Sont concernées les transactions (vente, achat) et les locations dont le loyer mensuel atteint 10 000 €.',
      'La DGCCRF contrôle les agences ; la Commission nationale des sanctions prononce les sanctions.',
      'Tout le dispositif de l’agence découle de sa classification des risques.',
    ],
    pratique: (c) => {
      const eleves = c.cls.axes.filter((a) => a.niveau === 3).map((a) => a.titre.toLowerCase());
      return [
        `Profil d’exposition de votre agence : ${c.cls.global.libelle.toLowerCase()} (indice ${c.cls.indice}/100).`,
        eleves.length ? `Axes les plus exposés : ${eleves.join(' ; ')}.` : 'Aucun axe n’est classé à risque élevé : la vigilance standard s’applique, avec des mesures renforcées au cas par cas.',
      ];
    },
  },
  {
    id: 'obligations', titre: 'Vos obligations de vigilance, étape par étape', duree: 7, socle: true,
    paragraphes: () => [
      'Avant de signer un mandat ou d’assister un client dans une transaction, l’agence identifie son client et vérifie son identité sur un document probant : pièce d’identité officielle en cours de validité, avec photographie, pour une personne physique ; extrait d’immatriculation de moins de trois mois pour une personne morale, avec l’identité de son représentant (art. L. 561-5 et R. 561-5 CMF).',
      'Par prudence, et parce que le règlement européen AMLR le rendra explicite au 10 juillet 2027, la procédure de l’agence prévoit l’identification des deux parties à la vente : votre mandant et son cocontractant.',
      'Vous recueillez aussi l’objet et la nature de l’opération (résidence principale, investissement locatif, revente…) et vous les consignez (art. L. 561-5-1).',
      'La vigilance est constante : si un élément change (substitution d’acquéreur, nouveau financement, nouvel intervenant), la fiche est mise à jour et le risque réévalué (art. L. 561-6).',
      'Le niveau de vigilance dépend du risque. Il est renforcé notamment pour les personnes politiquement exposées, en cas de lien avec un pays à haut risque et pour les opérations complexes ou inhabituelles (art. L. 561-10 et L. 561-10-2).',
      'Si vous ne parvenez pas à identifier une partie ou à vérifier son identité, vous ne poursuivez pas l’opération et vous vous interrogez sur une déclaration de soupçon (art. L. 561-8).',
    ],
    points: () => [
      'Identifier n’est pas vérifier : la vérification se fait sur pièce probante.',
      'Une fiche de vigilance par opération, complétée avant l’avant-contrat.',
      'Sans identité vérifiée, pas d’opération.',
    ],
    pratique: (c) => {
      const p = ['Dans l’agence, la fiche de vigilance est ouverte dès la signature du mandat et complétée avant le compromis ou la promesse de vente.'];
      if (c.n('distance') >= 2) p.push('Vous concluez parfois à distance : appliquez la mesure complémentaire prévue par la procédure (identification électronique certifiée ou seconde pièce justificative).');
      return p;
    },
  },
  {
    id: 'beppe', titre: 'Bénéficiaire effectif, personnes politiquement exposées et gel des avoirs', duree: 6, socle: true,
    paragraphes: () => [
      'Bénéficiaire effectif : lorsqu’une partie est une société (SCI, SAS…), il faut remonter jusqu’aux personnes physiques qui détiennent, directement ou indirectement, plus de 25 % du capital ou des droits de vote, ou qui exercent un contrôle par un autre moyen (art. R. 561-1 CMF). Consultez le registre des bénéficiaires effectifs et documentez tout écart avec les déclarations du client.',
      'Personne politiquement exposée (PPE) : personne qui exerce, ou a cessé depuis moins d’un an, une fonction publique importante (chef d’État, ministre, parlementaire, membre d’une haute juridiction, dirigeant de banque centrale, ambassadeur, officier général, dirigeant d’entreprise publique ou d’organisation internationale…), ainsi que les membres de sa famille et ses proches associés (art. R. 561-18). La relation n’est pas interdite, mais elle exige des mesures complémentaires : origine du patrimoine et des fonds, décision d’entrer en relation prise par le dirigeant, suivi renforcé.',
      'Gel des avoirs : certaines personnes et entités font l’objet de mesures de gel nationales, européennes ou onusiennes. Avant l’opération, vérifiez chaque partie et chaque bénéficiaire effectif sur le registre national des gels de la DG Trésor, et notez la date et le résultat. En cas de correspondance confirmée : aucune mise à disposition de fonds ou de biens, aucune opération, et information sans délai de la DG Trésor (art. L. 562-1 et suivants).',
    ],
    points: () => [
      'Bénéficiaire effectif : plus de 25 % du capital ou des droits de vote, ou un contrôle de fait.',
      'PPE : question systématique, validation par le dirigeant.',
      'Gel : vérification datée pour chaque partie et chaque bénéficiaire effectif.',
    ],
    pratique: (c) => {
      const p = [];
      if (c.n('personnesMorales') >= 2) p.push('Vous traitez régulièrement avec des personnes morales : chaque fiche de vigilance exige au moins un bénéficiaire effectif par société.');
      if (c.n('ppe') >= 2) p.push('Votre classification retient un risque PPE : la question est posée pour chaque partie et chaque bénéficiaire effectif.');
      p.push('Registre national des gels : https://gels-avoirs.dgtresor.gouv.fr');
      return p;
    },
  },
  {
    id: 'fonds', titre: 'Origine des fonds et cohérence de l’opération', duree: 5, socle: true,
    paragraphes: (c) => [
      'Le notaire n’est pas votre bouclier : chaque professionnel assujetti a ses propres obligations. Le 17 février 2026, la Commission nationale des sanctions a sanctionné une agence et son dirigeant pour une seule vente de 290 000 € : l’origine des fonds n’était pas documentée et le dossier ne permettait pas d’analyser le risque.',
      `Documentez systématiquement le plan de financement : prêt (offre ou accord de principe), apport personnel et sa provenance. À partir de ${euros(c.seuils.origineFondsMontant)} d’apport, ou de ${c.seuils.origineFondsPart} % du prix financé sans prêt (seuils fixés par l’agence), obtenez des justificatifs : relevés de compte, acte de vente d’un bien antérieur, acte de donation ou de succession, contrat de prêt familial, cession de parts…`,
      `Appréciez la cohérence : l’opération correspond-elle à l’âge, aux revenus, à la profession et au patrimoine déclarés ? Le prix est-il cohérent avec le marché ? Une acquisition sans prêt bancaire de ${euros(c.seuils.comptantRenforce)} ou plus, ou des fonds venant de l’étranger, justifient une vigilance renforcée.`,
    ],
    points: () => [
      'Un plan de financement documenté dans chaque fiche.',
      'Des justificatifs au-delà du seuil interne.',
      'La cohérence entre profil, opération et prix.',
    ],
    pratique: (c) => [`Seuils internes de l’agence : justificatifs d’origine des fonds dès ${euros(c.seuils.origineFondsMontant)} d’apport ou ${c.seuils.origineFondsPart} % du prix ; vigilance renforcée dès ${euros(c.seuils.comptantRenforce)} sans prêt.`],
  },
  {
    id: 'signaux', titre: 'Les signaux d’alerte en transaction immobilière', duree: 5, socle: true,
    paragraphes: () => [
      'Un signal d’alerte n’est pas une preuve : c’est un élément inhabituel qui doit vous conduire à poser des questions, à approfondir et, si le doute persiste, à alerter le déclarant.',
      'Un signal isolé, expliqué de façon crédible et justifiée, peut être levé : notez l’explication et les pièces. Plusieurs signaux, ou un signal fort non expliqué, doivent être transmis au déclarant.',
    ],
    points: () => SIGNAUX.map((s) => s.libelle + (s.fort ? ' (signal fort)' : '')),
    pratique: (c) => {
      const p = [];
      if (c.n('comptant') >= 2) p.push('Surveillez particulièrement les acquisitions sans prêt et l’origine des apports.');
      if (c.n('personnesMorales') >= 2 || c.n('structuresComplexes') === 3) p.push('Surveillez les sociétés récentes ou peu capitalisées qui achètent comptant.');
      if (c.n('nonResidents') >= 2 || c.n('fondsEtrangers') >= 2) p.push('Surveillez les fonds venant de l’étranger, a fortiori d’un pays inscrit sur une liste.');
      if (c.n('reventesRapides') === 3) p.push('Surveillez les reventes rapides avec forte plus-value.');
      return p.length ? p : ['Gardez en tête la liste complète des signaux : c’est souvent leur accumulation qui alerte.'];
    },
  },
  {
    id: 'declaration', titre: 'Alerte interne et déclaration de soupçon', duree: 5, socle: true,
    paragraphes: (c) => [
      'La déclaration de soupçon est due dès que vous savez, soupçonnez ou avez de bonnes raisons de soupçonner que des sommes ou une opération proviennent d’une infraction passible de plus d’un an d’emprisonnement, ou participent au financement du terrorisme (art. L. 561-15 CMF). Il n’est pas nécessaire d’avoir une preuve, ni de qualifier l’infraction.',
      `Dans l’agence, tout collaborateur qui a un doute alerte sans délai ${c.declarant ? c.declarant + ' (déclarant Tracfin)' : 'le déclarant Tracfin désigné'}, de façon confidentielle, en décrivant les faits. Le déclarant analyse, décide et, le cas échéant, transmet la déclaration à Tracfin sur la plateforme ERMES.`,
      'La déclaration intervient en principe avant la réalisation de l’opération : Tracfin peut s’y opposer (art. L. 561-24). Une déclaration faite de bonne foi n’engage pas la responsabilité de son auteur (art. L. 561-22).',
      'La confidentialité est absolue : il est interdit de révéler au client ou à un tiers l’existence ou le contenu d’une déclaration (art. L. 561-18). La divulgation est punie de 22 500 € d’amende (art. L. 574-1).',
    ],
    points: () => [
      'Le doute suffit.',
      'L’alerte se fait en interne, auprès du déclarant, jamais auprès du client.',
      'La déclaration passe par ERMES, si possible avant l’opération.',
    ],
    pratique: (c) => [c.declarant ? `Déclarant Tracfin de l’agence : ${c.declarant}.` : 'Le déclarant Tracfin n’est pas encore désigné : le dirigeant doit le désigner et l’enregistrer sur ERMES.'],
  },
  {
    id: 'conservation', titre: 'Conservation et traçabilité', duree: 3, socle: true,
    paragraphes: () => [
      'Les documents d’identification et les pièces relatives aux opérations sont conservés 5 ans à compter de la fin de la relation ou de l’exécution de l’opération (art. L. 561-12 CMF). Ils doivent pouvoir être produits rapidement lors d’un contrôle.',
      'Depuis le décret du 24 avril 2026, les justificatifs de formation (programme, dates, personnes formées, attestations, supports) sont conservés pendant toute la durée des fonctions du collaborateur, puis 5 ans après son départ (art. D. 561-38-1-1).',
      'Une conformité « déclarative » ne suffit plus : l’inspecteur vérifie dans les dossiers que les diligences ont réellement été faites. Ce qui n’est pas écrit n’existe pas.',
    ],
    points: () => [
      'Pièces : 5 ans après la fin de la relation ou de l’opération.',
      'Formation : pendant les fonctions, puis 5 ans après le départ.',
      'Ce qui n’est pas tracé n’existe pas.',
    ],
    pratique: () => ['Probant calcule la date de fin de conservation de chaque fiche et de chaque attestation.'],
  },
  {
    id: 'sanctions', titre: 'Les sanctions encourues', duree: 5, socle: true, obligatoire: true,
    paragraphes: () => [
      'Sanctions administratives. La DGCCRF contrôle les agences et peut saisir la Commission nationale des sanctions (CNS). La CNS peut prononcer un avertissement, un blâme, une interdiction temporaire d’exercer l’activité ou des fonctions de direction (jusqu’à 5 ans, éventuellement avec sursis), le retrait de la carte professionnelle, et une sanction pécuniaire pouvant atteindre 5 millions d’euros (art. L. 561-40 CMF). Les décisions sont publiées, souvent de façon nominative.',
      'Ces sanctions peuvent viser personnellement le dirigeant ainsi que les salariés et préposés impliqués dans les manquements.',
      'Exemples récents : interdiction de 3 mois avec sursis et 4 000 € d’amende pour une société de transaction et son dirigeant (mars 2024 : absence de cartographie des risques, de formation et de contrôle interne) ; interdiction de 2 ans avec sursis, 15 000 € pour la société et 5 000 € pour le dirigeant (juin 2024 : manquements à la quasi-totalité des obligations) ; interdiction avec sursis et 10 000 € d’amende pour le dirigeant (février 2026 : origine des fonds non documentée sur une vente de 290 000 €).',
      'Sanctions pénales. Le blanchiment, y compris le fait d’apporter son concours à une opération de blanchiment, est puni de 5 ans d’emprisonnement et de 375 000 € d’amende, portés à 10 ans et 750 000 € lorsqu’il est commis de façon habituelle ou en utilisant les facilités d’une activité professionnelle (art. 324-1 et 324-2 du Code pénal). La divulgation d’une déclaration de soupçon est punie de 22 500 € d’amende.',
      'Au-delà de la sanction elle-même, la publication de la décision et l’interdiction d’exercer, même avec sursis, ont un coût d’image et un coût commercial considérables pour une agence.',
    ],
    points: () => [
      'CNS : de l’avertissement à l’interdiction d’exercer, et jusqu’à 5 M€.',
      'Des sanctions personnelles sont possibles pour le dirigeant et les collaborateurs.',
      'Blanchiment : 5 ans et 375 000 € ; s’il est aggravé, 10 ans et 750 000 €.',
    ],
    pratique: () => ['Ce module est obligatoire pour chaque collaborateur (art. D. 561-38-1-1 CMF).'],
  },
  // ── Sections déclenchées par la classification des risques
  {
    id: 'etrangers', titre: 'Clientèle étrangère, non-résidents et pays à risque', duree: 4,
    si: (c) => c.n('nonResidents') >= 2 || c.n('paysRisque') === 3 || c.n('offshore') >= 2 || c.n('fondsEtrangers') >= 2 || ['frontalier', 'prestige'].includes(c.r('zone')),
    paragraphes: () => [
      'Une clientèle étrangère n’est pas suspecte en soi. Elle complique en revanche la vérification (documents étrangers, bénéficiaires effectifs hors de France) et peut impliquer des pays à risque.',
      `Pour chaque partie et chaque bénéficiaire effectif, renseignez la nationalité, le pays de résidence et le pays de provenance des fonds. Probant les compare aux listes du GAFI (état au ${dateFr(LISTES_PAYS.gafiGrise.date)}) et de l’Union européenne (état au ${dateFr(LISTES_PAYS.ue.date)}).`,
      'Pays de la liste noire du GAFI (Iran, Corée du Nord, Myanmar) : examen au cas par cas avec le dirigeant, et contre-mesures pour l’Iran et la Corée du Nord. Pays de la liste grise ou de la liste UE : mesures de vigilance renforcées (justificatifs de l’origine des fonds, validation par le dirigeant, suivi renforcé).',
      'Ces listes changent plusieurs fois par an. Vérifiez la date des listes affichée dans l’outil.',
    ],
    points: () => ['Nationalité, résidence et provenance des fonds : pour chaque partie et chaque bénéficiaire.', 'Pays inscrit sur une liste : vigilance renforcée.', 'Liste noire : décision du dirigeant, au cas par cas.'],
  },
  {
    id: 'societes', titre: 'SCI, sociétés et structures complexes', duree: 4,
    si: (c) => c.n('personnesMorales') >= 2 || c.n('structuresComplexes') === 3 || c.n('neufInvest') >= 2,
    paragraphes: () => [
      'Les sociétés permettent d’acquérir sans apparaître. C’est leur intérêt légitime (gestion patrimoniale, transmission) et c’est aussi leur risque (sociétés écrans, prête-noms).',
      'Pour chaque société : un extrait d’immatriculation de moins de 3 mois, les statuts à jour, l’identité du représentant, les bénéficiaires effectifs (plus de 25 % ou un contrôle) et la consultation du registre des bénéficiaires effectifs. Pour une structure étrangère, un trust ou plusieurs niveaux de détention, reconstituez la chaîne jusqu’aux personnes physiques et faites justifier l’intérêt du montage.',
      'Signaux : société récente et peu capitalisée qui achète comptant, siège dans un territoire à fiscalité très faible, associés de façade, refus d’indiquer les bénéficiaires effectifs.',
    ],
    points: () => ['Pas de fiche « société » sans bénéficiaire effectif identifié.', 'Structure étrangère ou multi-niveaux : examen renforcé.', 'Refus de transparence : signal fort.'],
  },
  {
    id: 'prestige', titre: 'Biens de prestige et montants élevés', duree: 3,
    si: (c) => c.n('prestige') >= 2 || c.n('prixMoyen') === 3 || c.n('biensAtypiques') >= 2,
    paragraphes: (c) => [
      'Plus le montant est élevé, plus le bien est attractif pour placer des fonds illicites, et plus un écart de prix permet de transférer de la valeur entre les parties.',
      `Pour un bien de prestige (${euros(c.seuils.prixPrestige)} ou plus) : vigilance renforcée systématique, origine du patrimoine de l’acquéreur, cohérence du prix (motivez tout écart par écrit) et validation par le dirigeant.`,
      'En 2025, des opérations de contrôle inopinées de la DGCCRF ont visé des agences de prestige (Saint-Tropez, ouest parisien).',
    ],
    points: () => ['Bien de prestige : vigilance renforcée systématique.', 'Tout écart de prix est motivé par écrit.'],
  },
  {
    id: 'comptant', titre: 'Acquisitions sans crédit et financements atypiques', duree: 3,
    si: (c) => c.n('comptant') >= 2 || c.n('tiersPayeurs') >= 2 || c.n('fondsEtrangers') >= 2,
    paragraphes: (c) => [
      'Sans prêt, aucune banque n’a analysé les fonds de l’acquéreur : votre vigilance est la seule barrière avant le notaire.',
      `À partir de ${euros(c.seuils.comptantRenforce)} sans prêt, la vigilance est renforcée : relevés montrant l’origine des fonds, justificatif de l’événement qui les a générés (vente, donation, succession, cession d’entreprise), cohérence avec le profil.`,
      'Apports de tiers : identifiez le tiers, son lien avec l’acquéreur et la nature juridique de l’apport. Des fonds fractionnés ou venant de comptes multiples doivent être expliqués.',
    ],
    points: () => ['Pas de prêt : justificatifs d’origine obligatoires au-delà du seuil.', 'Tiers apporteur : identifié, lien et nature de l’apport documentés.'],
  },
  {
    id: 'distance', titre: 'Relation à distance', duree: 3,
    si: (c) => c.n('distance') >= 2 || c.n('plateformes') >= 2,
    paragraphes: () => [
      'Un client jamais rencontré est plus difficile à identifier avec certitude : usurpation d’identité, faux documents.',
      'Hors présence physique, la vérification doit reposer sur un moyen d’identification électronique fiable, ou être complétée par les mesures prévues par les textes (par exemple une seconde pièce justificative, ou un premier paiement depuis un compte ouvert au nom du client : art. R. 561-5-1 et suivants CMF).',
      'Une photo de pièce d’identité envoyée par e-mail ne suffit pas, à elle seule.',
    ],
    points: () => ['À distance : identification électronique fiable ou mesure complémentaire.', 'Une photo envoyée par e-mail ne suffit pas.'],
  },
  {
    id: 'intermediaires', titre: 'Agents commerciaux et apporteurs d’affaires', duree: 3,
    si: (c) => c.n('agentsCommerciaux') >= 2 || c.n('apporteurs') >= 2,
    paragraphes: () => [
      'Les agents commerciaux qui travaillent pour l’agence participent aux obligations : ils appliquent les procédures, ils sont formés et ils figurent dans le registre de formation.',
      'Les apporteurs d’affaires et les intermédiaires ne vous dispensent pas de vos propres diligences. Identifiez votre client réel, ne vous contentez pas des informations transmises par l’intermédiaire et méfiez-vous des rémunérations atypiques.',
    ],
    points: () => ['Agents commerciaux : mêmes procédures, même formation.', 'Intermédiaire : il ne remplace jamais vos diligences.'],
  },
  {
    id: 'location', titre: 'Locations de 10 000 € par mois et plus', duree: 3,
    si: (c) => c.n('locationHaut') === 3,
    paragraphes: () => [
      'Ces locations entrent dans le champ de la LCB-FT (art. L. 561-2 CMF). Identifiez et vérifiez le bailleur et le preneur, ainsi que leurs bénéficiaires effectifs.',
      'Signaux : loyers payés d’avance sur de longues périodes, paiement par un tiers ou depuis l’étranger, preneur qui est une société écran.',
    ],
    points: () => ['Bailleur et preneur identifiés et vérifiés.', 'Paiements anticipés, par un tiers ou depuis l’étranger : à justifier.'],
  },
  {
    id: 'fondsCommerce', titre: 'Cessions de fonds de commerce', duree: 3,
    si: (c) => c.n('fondsCommerce') >= 2,
    paragraphes: () => [
      'Les commerces à forte intensité d’espèces peuvent servir à blanchir, notamment par un chiffre d’affaires gonflé.',
      'Comparez le prix au chiffre d’affaires et à la rentabilité, documentez l’origine des fonds de l’acquéreur, et identifiez les bénéficiaires effectifs des sociétés cédante et cessionnaire.',
    ],
    points: () => ['Prix comparé au chiffre d’affaires.', 'Origine des fonds de l’acquéreur documentée.'],
  },
  {
    id: 'investisseurs', titre: 'Programmes neufs, investisseurs et ventes en bloc', duree: 2,
    si: (c) => c.n('neufInvest') >= 2 || c.n('investisseurs') >= 2,
    paragraphes: () => [
      'Pour les ventes en bloc et les acquisitions multiples par un même investisseur, identifiez le bénéficiaire effectif de chaque structure, comprenez l’objet de l’opération et la provenance des fonds, en particulier lorsqu’ils viennent de l’étranger.',
    ],
    points: () => ['Chaque structure acquéreuse a son bénéficiaire effectif.', 'L’objet de l’investissement est consigné.'],
  },
  // ── Sections propres à une fonction
  {
    id: 'roleDirigeant', titre: 'Vos responsabilités de dirigeant', duree: 4, fonctions: ['dirigeant'],
    paragraphes: () => [
      'Le dispositif LCB-FT relève de la responsabilité de l’agence et de son dirigeant, même lorsque des tâches sont déléguées. Vous validez la classification des risques et les procédures, vous désignez le déclarant et le correspondant Tracfin, vous organisez la formation et vous contrôlez l’application des procédures.',
      'Vous décidez dans les situations à risque : entrée en relation avec une PPE, opérations en vigilance renforcée, refus d’opération.',
      'Au moins une fois par an : auto-contrôle, revue d’un échantillon de fiches de vigilance, mise à jour de la classification et du plan de formation.',
      'La CNS peut vous sanctionner personnellement, y compris par une interdiction d’exercer des fonctions de direction.',
    ],
    points: () => ['Vous validez, désignez, formez et contrôlez.', 'Vous décidez des cas en vigilance renforcée.', 'Auto-contrôle au moins annuel.'],
  },
  {
    id: 'roleDeclarant', titre: 'Le déclarant et le correspondant Tracfin', duree: 4, fonctions: ['responsable'],
    paragraphes: () => [
      'Le déclarant est habilité à établir, signer et transmettre les déclarations à Tracfin (art. R. 561-23 CMF). Le correspondant répond aux demandes de Tracfin (art. R. 561-24). La même personne peut tenir les deux rôles, qui doivent être enregistrés sur la plateforme ERMES.',
      'À réception d’une alerte interne : accusez réception, analysez les pièces, documentez votre analyse (même si vous concluez à l’absence de soupçon) et décidez rapidement, idéalement avant l’avant-contrat.',
      'La déclaration se fait sur ERMES. Elle est précise et factuelle : identité des personnes, description de l’opération, éléments atypiques, montants, dates, pièces. Conservez la déclaration et l’accusé de réception à part, de façon strictement confidentielle.',
      'Répondez dans les délais aux demandes de communication de pièces de Tracfin.',
    ],
    points: () => ['Chaque alerte est analysée et l’analyse est écrite.', 'Déclarations sur ERMES, factuelles et documentées.', 'Archivage séparé et confidentiel.'],
  },
  {
    id: 'roleTerrain', titre: 'Au contact du client', duree: 3, fonctions: ['negociateur', 'agentCommercial'],
    paragraphes: () => [
      'Vous êtes les premiers à voir le client. Vous recueillez les pièces, vous posez les questions sur l’objet de l’opération et le financement, vous repérez les signaux d’alerte pendant les visites et les négociations.',
      'Expliquez simplement la démarche : « La loi nous impose de vérifier l’identité et l’origine des fonds de toutes les parties. » Un client honnête le comprend ; un refus est en soi un signal.',
      'En cas de doute : ne le dites pas au client, alertez immédiatement le déclarant et notez les faits.',
    ],
    points: () => ['Pièces et financement : dès le premier rendez-vous.', 'Un doute se dit au déclarant, jamais au client.'],
  },
  {
    id: 'roleSupport', titre: 'Contrôle des pièces et archivage', duree: 3, fonctions: ['assistant', 'support'],
    paragraphes: () => [
      'Vous vérifiez la qualité des pièces : validité, cohérence des noms, des dates et des signatures, absence de retouches, extrait d’immatriculation de moins de 3 mois.',
      'Vous assurez le classement et l’archivage : une fiche par opération, des pièces faciles à retrouver, une conservation de 5 ans et un accès réservé aux personnes habilitées.',
      'Une anomalie documentaire (document illisible, incohérence, suspicion de faux) se signale au déclarant, sans en parler au client.',
    ],
    points: () => ['Pièces vérifiées, pas seulement collectées.', 'Une anomalie se signale au déclarant.'],
  },
];

// Banque de questions. « sections » : sections auxquelles la question se rattache.
export const QUESTIONS = [
  { id: 'q01', sections: ['enjeux'], q: 'Selon l’Analyse nationale des risques publiée en 2023, le secteur immobilier présente un risque de blanchiment :', o: ['Faible', 'Modéré', 'Élevé'], c: 2, e: 'L’ANR classe l’immobilier à risque élevé, en raison de son poids dans l’économie, de son attractivité et de son dynamisme.' },
  { id: 'q02', sections: ['obligations'], q: 'Avant d’assister un client dans une transaction, vous devez :', o: ['Identifier le client et vérifier son identité sur pièce probante, ainsi que celle du bénéficiaire effectif le cas échéant', 'Noter son nom ; le notaire vérifiera', 'Attendre la signature de l’acte authentique'], c: 0, e: 'Identification et vérification interviennent avant l’entrée en relation ou l’assistance à la transaction (art. L. 561-5 CMF).' },
  { id: 'q03', sections: ['obligations'], q: 'Vous ne parvenez pas à vérifier l’identité d’une partie. Que faites-vous ?', o: ['Je poursuis : le notaire s’en chargera', 'Je ne poursuis pas l’opération et j’examine avec le déclarant s’il faut faire une déclaration de soupçon', 'Je demande une attestation sur l’honneur et je poursuis'], c: 1, e: 'Sans identité vérifiée, l’opération ne doit pas être réalisée (art. L. 561-8 CMF).' },
  { id: 'q04', sections: ['obligations'], q: 'En cours de mandat, l’acquéreur est remplacé par une autre personne. Vous :', o: ['Mettez à jour la fiche de vigilance et réévaluez le risque', 'Ne faites rien : la fiche initiale suffit', 'Annulez le mandat'], c: 0, e: 'La vigilance est constante (art. L. 561-6) ; une substitution d’acquéreur est aussi un signal d’alerte à examiner.' },
  { id: 'q05', sections: ['beppe', 'societes'], q: 'Le bénéficiaire effectif d’une SCI acquéreuse est notamment :', o: ['Le notaire chargé de la vente', 'La personne physique qui détient, directement ou indirectement, plus de 25 % du capital ou des droits de vote, ou qui exerce un contrôle', 'Le gérant de l’agence'], c: 1, e: 'Art. R. 561-1 CMF : plus de 25 % du capital ou des droits de vote, ou un pouvoir de contrôle.' },
  { id: 'q06', sections: ['beppe'], q: 'Une personne politiquement exposée (PPE), c’est :', o: ['Toute personne qui a déjà voté', 'Une personne qui exerce, ou a cessé depuis moins d’un an, une fonction publique importante, ainsi que sa famille et ses proches associés', 'Uniquement un élu local'], c: 1, e: 'Art. R. 561-18 CMF.' },
  { id: 'q07', sections: ['beppe'], q: 'L’acquéreur est une PPE. Quelle est la bonne réponse ?', o: ['L’opération est interdite', 'Aucune mesure particulière n’est requise', 'Mesures complémentaires : origine du patrimoine et des fonds, et décision d’entrer en relation prise par le dirigeant'], c: 2, e: 'Une PPE n’est pas interdite de transaction, mais impose une vigilance complémentaire (art. L. 561-10 CMF).' },
  { id: 'q08', sections: ['beppe'], q: 'Le registre national des gels des avoirs fait apparaître une correspondance confirmée avec l’acquéreur. Vous :', o: ['Ne réalisez aucune opération et informez sans délai la DG Trésor', 'Demandez au client de s’expliquer et poursuivez', 'Prévenez le client pour qu’il régularise'], c: 0, e: 'Aucune mise à disposition de fonds ou de biens au profit d’une personne gelée (art. L. 562-1 et suivants CMF).' },
  { id: 'q09', sections: ['fonds', 'comptant', 'etrangers'], q: 'Un acquéreur sans emprunt présente un apport de 600 000 € venant d’un compte à l’étranger. Vous :', o: ['Ne demandez rien : ce n’est pas votre rôle', 'Demandez et conservez des justificatifs de l’origine des fonds et appréciez leur cohérence', 'Refusez systématiquement l’opération'], c: 1, e: 'L’origine des fonds se documente ; un refus systématique n’est pas requis, mais un défaut de justification doit alerter.' },
  { id: 'q10', sections: ['fonds'], q: 'Quel a été le motif principal de la sanction de la CNS du 17 février 2026 contre une agence et son dirigeant ?', o: ['Une faute d’orthographe dans l’annonce', 'L’absence d’éléments sur l’origine des fonds, qui rendait l’opération impossible à analyser', 'Un mandat exclusif mal rédigé'], c: 1, e: 'Une seule vente à 290 000 € sans justification de l’origine des fonds a suffi.' },
  { id: 'q11', sections: ['signaux', 'prestige'], q: 'Lequel de ces éléments est un signal d’alerte ?', o: ['Un couple qui obtient un prêt immobilier classique', 'Un acquéreur qui accepte un prix nettement supérieur au marché, sans visite ni négociation', 'Un vendeur qui présente son titre de propriété'], c: 1, e: 'Prix anormal accepté sans négociation et absence de visite : deux signaux classiques.' },
  { id: 'q12', sections: ['signaux', 'societes'], q: 'Une société créée il y a deux mois, au capital de 1 000 €, achète comptant un bien à 1,2 M€. Le bon réflexe :', o: ['Aucun : les sociétés achètent souvent', 'Demander uniquement l’extrait Kbis', 'Examen renforcé (bénéficiaire effectif, origine des fonds, justification économique) et transmission au déclarant si le doute persiste'], c: 2, e: 'Société récente, peu capitalisée, achat comptant : un signal fort qui impose un examen renforcé (art. L. 561-10-2).' },
  { id: 'q13', sections: ['signaux'], q: 'Un client propose de régler une partie du prix en espèces :', o: ['C’est un signal d’alerte fort : les paiements en espèces sont strictement plafonnés', 'C’est acceptable en dessous de 50 000 €', 'C’est sans importance, le notaire gère les fonds'], c: 0, e: 'Les paiements en espèces sont plafonnés (art. L. 112-6 CMF) ; la proposition elle-même doit alerter.' },
  { id: 'q14', sections: ['declaration'], q: 'La déclaration de soupçon à Tracfin est due lorsque :', o: ['Vous détenez la preuve d’un délit', 'Vous savez, soupçonnez ou avez de bonnes raisons de soupçonner que les fonds proviennent d’une infraction ou financent le terrorisme', 'Le montant dépasse 1 million d’euros'], c: 1, e: 'Art. L. 561-15 CMF : le soupçon suffit, aucun seuil ne s’applique.' },
  { id: 'q15', sections: ['declaration', 'roleTerrain', 'roleSupport'], q: 'Un collaborateur a un doute sur un dossier. Il doit :', o: ['En parler au client pour lever le doute', 'Alerter sans délai le déclarant, de façon confidentielle, en notant les faits', 'Attendre la fin de la vente'], c: 1, e: 'L’alerte est interne et immédiate ; le client ne doit jamais être informé.' },
  { id: 'q16', sections: ['declaration'], q: 'Pouvez-vous informer le client qu’une déclaration de soupçon a été faite ?', o: ['Oui, par transparence', 'Oui, s’il le demande', 'Non : c’est interdit et puni de 22 500 € d’amende'], c: 2, e: 'Confidentialité de la déclaration (art. L. 561-18) ; sanction pénale (art. L. 574-1 CMF).' },
  { id: 'q17', sections: ['declaration', 'roleDeclarant'], q: 'Quand faut-il, en principe, effectuer la déclaration de soupçon ?', o: ['Avant de réaliser l’opération, Tracfin pouvant s’y opposer', 'Un an après la vente', 'Jamais avant la signature de l’acte'], c: 0, e: 'Tracfin dispose d’un droit d’opposition (art. L. 561-24 CMF).' },
  { id: 'q18', sections: ['roleDeclarant'], q: 'Par quel canal le déclarant transmet-il une déclaration de soupçon ?', o: ['Par e-mail à la DGCCRF', 'Sur la plateforme ERMES de Tracfin', 'Par courrier au notaire'], c: 1, e: 'Les déclarations se font sur ERMES, où le déclarant et le correspondant sont enregistrés.' },
  { id: 'q19', sections: ['conservation'], q: 'Combien de temps faut-il conserver les pièces d’identification et les fiches de vigilance ?', o: ['1 an', '5 ans à compter de la fin de la relation ou de l’exécution de l’opération', '30 ans'], c: 1, e: 'Art. L. 561-12 CMF.' },
  { id: 'q20', sections: ['conservation'], q: 'Depuis le décret du 24 avril 2026, les justificatifs de formation LCB-FT doivent être conservés :', o: ['Pendant 6 mois', 'Pendant toute la durée des fonctions, puis 5 ans après le départ du collaborateur', 'Ils n’ont pas à être conservés'], c: 1, e: 'Art. D. 561-38-1-1 CMF.' },
  { id: 'q21', sections: ['sanctions'], q: 'Quelles sanctions la Commission nationale des sanctions peut-elle prononcer ?', o: ['Un simple rappel à la loi', 'Avertissement, blâme, interdiction temporaire d’exercer (jusqu’à 5 ans), retrait de la carte, amende jusqu’à 5 M€', 'Des amendes inférieures à 1 000 € uniquement'], c: 1, e: 'Art. L. 561-40 CMF.' },
  { id: 'q22', sections: ['sanctions', 'roleDirigeant'], q: 'La CNS peut-elle sanctionner personnellement le dirigeant et les collaborateurs ?', o: ['Non, seule la société peut être sanctionnée', 'Oui, le dirigeant ainsi que les salariés ou préposés impliqués', 'Non, seul le titulaire de la carte peut l’être'], c: 1, e: 'Les sanctions peuvent viser les personnes physiques impliquées.' },
  { id: 'q23', sections: ['sanctions'], q: 'Le délit de blanchiment est puni de :', o: ['6 mois d’emprisonnement et 1 500 € d’amende', '5 ans d’emprisonnement et 375 000 € d’amende (10 ans et 750 000 € s’il est aggravé)', 'Une amende administrative uniquement'], c: 1, e: 'Art. 324-1 et 324-2 du Code pénal.' },
  { id: 'q24', sections: ['enjeux', 'roleDirigeant'], q: 'La classification des risques de l’agence doit être :', o: ['Propre à l’agence, écrite, motivée et mise à jour', 'Un modèle recopié d’une autre agence', 'Facultative pour les petites agences'], c: 0, e: 'Art. L. 561-4-1 CMF : un modèle recopié n’est pas individualisé.' },
  { id: 'q25', sections: ['roleDirigeant'], q: 'Qui est responsable de la mise en place du dispositif LCB-FT de l’agence ?', o: ['La banque de l’acquéreur', 'Le notaire', 'L’agence et son dirigeant, même lorsque des tâches sont déléguées'], c: 2, e: 'La personne assujettie reste responsable de son dispositif.' },
  { id: 'q26', sections: ['distance'], q: 'Un acquéreur jamais rencontré envoie une photo de son passeport par e-mail. Est-ce suffisant ?', o: ['Oui', 'Non : il faut un moyen d’identification électronique fiable ou une mesure de vérification complémentaire', 'Aucune vérification n’est requise à distance'], c: 1, e: 'Hors présence physique, la vérification obéit à des modalités renforcées (art. R. 561-5-1 et suivants CMF).' },
  { id: 'q27', sections: ['intermediaires'], q: 'Un agent commercial qui travaille pour l’agence :', o: ['N’est pas concerné, puisqu’il est indépendant', 'Applique les procédures LCB-FT de l’agence et doit être formé', 'Ne doit jamais collecter de pièces'], c: 1, e: 'Toute personne qui participe aux obligations doit être formée (art. D. 561-38-1-1).' },
  { id: 'q28', sections: ['location'], q: 'En location, l’agence est soumise à la LCB-FT :', o: ['Pour toute location', 'Lorsque le loyer mensuel atteint ou dépasse 10 000 €', 'Jamais'], c: 1, e: 'Art. L. 561-2 CMF.' },
  { id: 'q29', sections: ['societes', 'beppe'], q: 'Le bénéficiaire effectif déclaré par le client diffère de celui du registre des bénéficiaires effectifs. Vous :', o: ['Ignorez l’écart', 'Documentez l’écart, approfondissez et appliquez la procédure prévue', 'Corrigez vous-même le registre'], c: 1, e: 'Un écart non expliqué est un signal à documenter et à traiter selon la procédure.' },
  { id: 'q30', sections: ['roleSupport', 'conservation'], q: 'Une pièce d’identité semble retouchée. Que faites-vous ?', o: ['Je la classe quand même', 'Je le signale au déclarant, sans en parler au client', 'Je la renvoie au client en lui demandant de la corriger'], c: 1, e: 'Une suspicion de faux est un signal fort ; l’alerte reste interne.' },
  { id: 'q31', sections: ['fondsCommerce'], q: 'Lors de la cession d’un commerce à forte intensité d’espèces, le prix paraît très supérieur à la rentabilité. Vous :', o: ['Comparez le prix au chiffre d’affaires, documentez l’origine des fonds et alertez le déclarant si l’écart n’est pas expliqué', 'Considérez que le prix relève de la liberté des parties', 'Demandez à être payé en espèces'], c: 0, e: 'Un prix incohérent peut servir à justifier des flux d’origine illicite.' },
  { id: 'q32', sections: ['etrangers'], q: 'Les fonds d’un acquéreur proviennent d’un pays inscrit sur la liste grise du GAFI. Vous appliquez :', o: ['Une vigilance standard', 'Des mesures de vigilance renforcées : justificatifs, validation du dirigeant, suivi renforcé', 'Un refus automatique'], c: 1, e: 'Les pays sous surveillance justifient des mesures renforcées, sans interdiction automatique.' },
];
