# 01 — Recherche et choix de l'idée

*Rédigé le 19 novembre 2026. Statut : décision prise.*

## En une phrase

**Probant** : un outil web qui produit en environ 30 minutes le dossier anti-blanchiment (LCB-FT) complet d'une agence immobilière indépendante, et la preuve de la formation de chaque collaborateur qu'exige le décret n° 2026-310 depuis le 26 avril 2026. Il est vendu en licence annuelle forfaitaire, sans aucune donnée client stockée chez nous.

---

## 1. Cadre de décision

### Contraintes (issues de la demande)
- Vente B2B, marché français d'abord, 100 % numérique.
- Fonctionnement quasi autonome une fois lancé ; compatible avec un fondateur au temps limité.
- Problème réel, documenté par des sources publiques, assez grave pour déclencher un achat.
- V1 constructible aujourd'hui, budget quasi nul.
- Aucune dépendance à une notoriété, une audience ou une marque personnelle.

> Note : le fichier `CLAUDE.md` ne contient aucun profil ni contrainte personnelle (seulement : travail en français, décisions dans `docs/`, pas de secrets). Les contraintes ci-dessus sont donc celles de la demande. Si le fondateur a un profil métier particulier, il faudra le vérifier (voir `RAPPORT.md`).

### Critères et pondération

| Critère | Poids | Ce qu'on mesure |
|---|---|---|
| Douleur et urgence | 20 % | Obligation légale sanctionnée, échéance récente ou proche |
| Preuves terrain publiques | 15 % | Contrôles, sanctions publiées, chiffres officiels |
| Capacité et volonté de payer | 15 % | Budget de la cible, ticket acceptable sans comité d'achat |
| Différenciation possible | 15 % | Place laissée par la concurrence |
| Faisabilité d'une V1 aujourd'hui | 15 % | Constructible sans backend, sans agrément, sans budget |
| Automatisation | 10 % | Vente et livraison sans intervention humaine |
| Acquisition sans audience | 10 % | Cibles identifiables publiquement, prospection B2B légale et crédible |

---

## 2. Liste longue : 14 pistes examinées

| # | Piste | Verdict | Raison principale |
|---|---|---|---|
| 1 | Facturation électronique (réforme 2026-2027) | Écartée | La transmission doit passer par une plateforme agréée (immatriculation par l'État). Le marché est saturé d'offres gratuites ou incluses. |
| 2 | Générateur de DUERP (document unique) pour TPE | Écartée | Secteur miné par les **arnaques** : faux courriers DUERP signalés par la CAPEB (oct. 2025), la FFB et la préfecture de l'Ain. Une prospection à froid y serait suspecte. Aide déjà fournie par les services de santé au travail et outils OiRA gratuits. |
| 3 | Kit d'affichages obligatoires | Écartée | Faible valeur perçue, catégorie elle aussi associée au démarchage abusif. |
| 4 | Accessibilité numérique (EAA, depuis juin 2025) | Écartée | La mise en conformité exige un travail de développement sur le site du client, qu'un outil ne remplace pas. Les micro-entreprises sont exemptées. Les testeurs automatiques sont gratuits. |
| 5 | « Fonction de rétractation » e-commerce (ordonnance n° 2026-2, 19 juin 2026) | Écartée | Bonne urgence, mais il faut une intégration par CMS (Shopify, WooCommerce…), et des apps et plugins existent déjà. |
| 6 | Transparence salariale (directive 2023/970) | Écartée (pour l'instant) | Projet de loi présenté le 10 sept. 2026, pas encore adopté : date d'application inconnue. |
| 7 | Générateurs de mentions légales / CGV | Écartée | Saturé (Legalstart, Captain Contrat, nombreux gratuits). |
| 8 | Registre RGPD pour TPE | Écartée | Modèle gratuit de la CNIL, faible volonté de payer. |
| 9 | Veille appels d'offres publics | Écartée | Alertes BOAMP gratuites, marché saturé. |
| 10 | Relances d'impayés automatisées | Écartée | Saturé (Libeo, Upflow, Agicap…). |
| 11 | Dispositif lanceurs d'alerte (≥ 50 salariés) | Écartée | Exige un backend sécurisé, marché déjà équipé. |
| 12 | Suivi des attestations de vigilance URSSAF | Écartée | Urgence plus faible, acteurs installés (e-Attestations, Provigis). |
| 13 | LCB-FT des sociétés de domiciliation | **Réserve** | Forte douleur (sanctions CNS en 2025-2026), mais petit marché. Même moteur réutilisable : **extension n° 1**. |
| 14 | **LCB-FT des agences immobilières** | **Retenue** | Voir ci-dessous. |

---

## 3. Short-list et notation

| Critère (poids) | LCB-FT immo | LCB-FT domiciliation | Transparence salariale | DUERP | Facturation électr. | EAA | Rétractation |
|---|---|---|---|---|---|---|---|
| Douleur et urgence (20) | 5 | 5 | 2 | 4 | 5 | 3 | 3 |
| Preuves publiques (15) | 5 | 4 | 3 | 4 | 5 | 3 | 3 |
| Capacité à payer (15) | 4 | 4 | 4 | 2 | 3 | 3 | 2 |
| Différenciation (15) | 3 | 4 | 3 | 1 | 1 | 2 | 1 |
| Faisabilité V1 (15) | 4 | 3 | 3 | 4 | 1 | 2 | 3 |
| Automatisation (10) | 5 | 4 | 4 | 5 | 3 | 3 | 4 |
| Acquisition sans audience (10) | 4 | 2 | 3 | 1 | 2 | 4 | 4 |
| **Score pondéré / 5** | **4,30** | 3,85 | 3,05 | 3,05 | 3,00 | 2,80 | 2,75 |

*Les notes sont des jugements argumentés à partir des sources du §6, pas des mesures.*

---

## 4. Décision : pourquoi l'anti-blanchiment des agences immobilières

### 4.1 Le problème est réel, grave et documenté
- **Le secteur est classé « à risque élevé »** par l'Analyse nationale des risques du COLB (2023), « du fait de son poids dans l'économie, de son attractivité et de son dynamisme » [E3].
- **Sur le terrain, la DGCCRF a constaté** lors de ses contrôles qu'« aucun professionnel contrôlé ne respectait la totalité des exigences » et qu'il n'existait « quasiment aucun protocole interne écrit » dans les agences, avec une formation jugée insuffisante [E1].
- **Les sanctions tombent et sont publiques** (Commission nationale des sanctions, CNS) [L4][L2] :
  - 22 mars 2024 : interdiction d'exercer 3 mois avec sursis, 4 000 € d'amende (société et dirigeant), publication. Motifs : absence de cartographie des risques, de vigilance, de formation et de contrôle interne.
  - 28 juin 2024 : interdiction de 2 ans avec sursis, 15 000 € (société) et 5 000 € (dirigeant), publication.
  - 17 février 2026 : interdiction avec sursis pour la société et le dirigeant, plus 10 000 € d'amende pour le dirigeant, pour **une seule vente à 290 000 €** sans justification de l'origine des fonds.
  - Plafond légal : avertissement, blâme, interdiction jusqu'à 5 ans, retrait de la carte, amende jusqu'à 5 M€ (art. L. 561-40 CMF) [E7].
- **Les contrôles s'intensifient** : 1 739 professionnels de l'immobilier contrôlés, 65,1 % en anomalie, toutes réglementations confondues [L2]. Opérations LCB-FT inopinées sur des agences de luxe (Saint-Tropez le 15 mai 2025, ouest parisien) [E1][L4].

### 4.2 Pourquoi maintenant : trois déclencheurs datés
1. **Décret n° 2026-310 du 24 avril 2026**, d'application immédiate (article D. 561-38-1-1 du CMF) [L1][L3]. Chaque personne qui participe aux obligations LCB-FT doit être formée **dès l'embauche, puis régulièrement**. Le contenu et la fréquence doivent être **adaptés aux risques de la classification des risques de la structure** (art. L. 561-4-1), à la fonction et à la position hiérarchique. La formation doit inclure **un volet sur les sanctions**. Les justificatifs doivent être conservés **pendant les fonctions, puis 5 ans après le départ**. Conséquence : « une formation générique, identique pour tous, pourra être jugée insuffisante » [L1].
2. **Brochures Tracfin–DGCCRF de février 2026** sur l'immobilier, qui listent six obligations concrètes, la classification des risques en premier [E8].
3. **Règlement européen AMLR (UE) 2024/1624**, applicable le **10 juillet 2027** : nouvelles exigences, dont la vérification explicite des deux parties à la transaction [E5].

### 4.3 La cible est nombreuse, identifiable et solvable
- **7 113 agences actives de 3 à 49 salariés** (code NAF 68.31Z) et **plus de 10 000 de 1 à 2 salariés**, d'après l'API officielle de l'annuaire des entreprises (INSEE/SIRENE), interrogée le 19/11/2026 [A1]. Le plafond technique de l'API empêche un décompte exact au-delà de 10 000.
- Une partie de ces agences appartient à des réseaux de franchise, souvent outillés en central. **Estimation : environ 10 000 agences indépendantes employeuses**, cœur de cible (à affiner).
- Le dirigeant, titulaire de la carte T, décide seul de dépenses de quelques centaines d'euros.

### 4.4 Le marché est validé… et justement encombré : notre angle
Depuis le décret, l'offre a explosé. C'est une **preuve de demande**, mais il faut un angle net :

| Offre existante | Modèle | Limite pour une petite agence |
|---|---|---|
| Konforme, Legapass VigImmo, Conform-Immo, kyc.immo, Documan, Modelo (Septeo), AP Solutions IO | SaaS de KYC ou de criblage, abonnement mensuel (29 à 149 € HT/mois, prix vérifiés [L6]) ou paiement au dossier | Centré sur le dossier client. Abonnement récurrent. Pièces d'identité stockées dans le cloud de l'éditeur. |
| Lefebvre Dalloz, Galian, maformationimmo, organismes ALUR | E-learning **générique** facturé par personne (49 à 168 € HT) | Pas adapté à la classification des risques de l'agence, ce que le décret exige désormais. |
| Avocats et consultants | Prestation sur mesure | Cher et ponctuel. Le dispositif ne se met pas à jour. |

**Le trou dans le marché** : personne ne relie, en un seul outil forfaitaire pensé pour l'indépendant,
**classification des risques individualisée → procédures écrites → formation adaptée par fonction (avec volet sanctions) → attestations et registre des preuves → fiches de vigilance par opération → auto-contrôle annuel**.
C'est exactement la chaîne que le décret 2026-310 rend obligatoire et que les décisions de la CNS sanctionnent maillon par maillon.

**Positionnement de Probant** : *« Le dossier LCB-FT de votre agence, prêt pour le contrôle. »*
- Individualisé à partir du profil réel de l'agence (un modèle recopié est réputé non individualisé).
- Forfait annuel par agence, collaborateurs illimités, moins cher qu'un abonnement SaaS.
- **Aucune donnée client chez nous** : l'outil tourne dans le navigateur. Il n'y a donc rien à fuiter, et le RGPD s'en trouve simplifié.
- Pas de criblage automatisé : l'outil guide la vérification manuelle sur le registre officiel des gels et la trace. C'est un choix assumé pour la V1, et un module complémentaire possible ensuite.

### 4.5 Ce que nous ne faisons volontairement pas
- Les grands réseaux et les franchises (cycles de vente longs, déjà équipés).
- Le stockage de pièces d'identité (risque et coût).
- L'attestation de formation continue ALUR (réservée aux organismes habilités) : Probant **complète** une formation ALUR et ne la remplace pas. C'est dit clairement aux clients.

---

## 5. Risques et parades

| Risque | Parade |
|---|---|
| Concurrence SaaS déjà installée | Angle différent (forfait, décret 2026-310, aucune donnée stockée). Ticket bas pour un essai facile. Démo complète gratuite. |
| Exactitude juridique des contenus générés | Références d'articles explicites, date de mise à jour, avertissement. **Relecture par un avocat avant lancement** (voir RAPPORT). |
| Évolutions réglementaires (listes GAFI 3 fois par an, AMLR 2027) | Mises à jour incluses dans la licence annuelle, ce qui justifie le modèle récurrent. |
| Méfiance envers un nouvel acteur sans marque | Sources citées partout, essai sans carte bancaire, garantie 30 jours, ton sobre, aucune imitation d'un organisme officiel. |
| Réutilisation du dossier sans licence | Licence nominative : le nom de l'agence figure sur tous les documents, et les documents de démonstration portent un filigrane. |

**Critères d'arrêt ou de pivot** (à 90 jours du lancement) : moins de 3 ventes pour 300 prospects contactés, ou moins de 5 % de réponses positives. Dans ce cas, on décline le même moteur pour la domiciliation ou le courtage, ou on passe par des partenaires (formateurs ALUR, experts-comptables).

---

## 6. Sources

Légende : **[L]** page lue intégralement le 19/11/2026 · **[E]** extrait de moteur de recherche, page non lue intégralement (l'environnement bloque ou filtre certains sites officiels) · **[A]** API officielle interrogée.

| Réf. | Source | Type |
|---|---|---|
| L1 | MySweetImmo, « Les agents immobiliers doivent désormais prouver qu'ils sont formés », 30/04/2026 — https://www.mysweetimmo.com/2026/04/30/blanchiment-dargent-lcb-ft-les-agents-immobiliers-doivent-desormais-prouver-quils-sont-formes/ | L |
| L2 | MySweetImmo, « LCB-FT : BSK Immobilier choisit AP Solutions IO », 05/05/2026 (sanction CNS du 17/02/2026, chiffres DGCCRF) — https://www.mysweetimmo.com/2026/05/05/lcb-ft-bsk-immobilier-choisit-ap-solutions-io/ | L |
| L3 | Kohen Avocats, « Agent immobilier et Tracfin en 2026 », 12/06/2026 (art. D. 561-38-1-1 CMF) — https://kohenavocats.fr/2026/06/12/agent-immobilier-tracfin-2026-controle-dgccrf-mandat-honoraires-annonces/ | L |
| L4 | Novlaw Avocats, « Conformité LCB-FT des agences immobilières » (décisions CNS 2024) — https://novlaw.fr/conformite-lcb-ft-agences-immobilieres/ | L |
| L5 | GetApp, fiche Konforme (fonctionnalités) — https://www.getapp.com/all-software/a/konforme/ | L |
| E1 | DGCCRF, enquêtes LCB-FT (résultats 2022, contrôles 2025) — https://www.economie.gouv.fr/dgccrf/laction-de-la-dgccrf/les-enquetes/blanchiment-de-capitaux-et-financement-du-terrorisme-les | E (site bloqué en lecture directe) |
| L6 | Tarifs concurrents lus directement le 19/11/2026 : https://konforme.eu/tarifs · https://vigimmo.com/ · https://conform-immo.fr/ · https://kyc.immo/ (Documan https://www.documan.fr/immobilier : extrait de moteur) | L (détail dans `03-offre-et-prix.md`) |
| E3 | Direction générale du Trésor, ANR 2023 — https://www.tresor.economie.gouv.fr/Articles/2023/02/14/le-colb-a-approuve-l-analyse-nationale-des-risques-anr-de-blanchiment-de-capitaux-et-de-financement-du-terrorisme-en-france | E |
| E4 | Village de la Justice, décret 2026-310 et champ (tous les assujettis de l'art. L. 561-2) — https://www.village-justice.com/articles/lcb-obligation-formation-des-professionnels-assujettis-epreuve-decret-2026-310,57289.html | E |
| E5 | AMLR (UE) 2024/1624, application au 10/07/2027 — https://www.springlex.eu/fr/packages/aml/amlr-regulation/article-90/ · https://www.dudkowiak.com/blog/real-estate-agents-under-the-amlr-from-10-july-2027-verification-of-both-buyer-and-seller/ | E |
| E6 | GAFI, juridictions sous surveillance renforcée, 30/10/2026 — https://www.fatf-gafi.org/en/publications/High-risk-and-other-monitored-jurisdictions/increased-monitoring-october-2026.html | E (site protégé) |
| E7 | Art. L. 561-40 CMF (sanctions CNS) — https://www.juritravail.com/codes/code-monetaire-financier/article/L561-40.html | E |
| E8 | Brochures Tracfin–DGCCRF immobilier et domiciliation, février 2026 (mention par une source secondaire) | E |
| E9 | Arnaques DUERP : CAPEB https://www.capeb.fr/actualites/alerte-fraude-faux-courriers-concernant-le-duerp · FFB https://www.ffbatiment.fr/actualites-batiment/actualite-ba/document-unique-evaluation-risques-professionnels-restez-vigilant | E |
| E10 | Transparence salariale, projet de loi au Sénat (sept. 2026) — https://www.info.gouv.fr/actualite/transparence-des-salaires-regles-et-evolutions-prevues · https://tpeactu.fr/2026/08/28/transparence-salariale-projet-loi-adoption-2027/ | E |
| E11 | Fonction de rétractation, ordonnance n° 2026-2 — https://hlc.com/fr/publications/transposition-under-french-law-of-the-eu-mandatory-withdrawal-button-for-online-sales · https://www.quechoisir.org/actualite-achats-en-ligne-les-sites-doivent-desormais-proposer-un-bouton-de-retractation-n177246/ | E |
| A1 | API Recherche d'entreprises (DINUM, données INSEE/RNE), NAF 68.31Z, actives, par tranche d'effectif — https://recherche-entreprises.api.gouv.fr/search?activite_principale=68.31Z&etat_administratif=A&tranche_effectif_salarie=02 | A |
