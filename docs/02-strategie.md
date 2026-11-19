# 02 — Stratégie

*19 novembre 2026. Ce document découle de la décision du fichier `01-recherche-et-choix.md`.*

## 1. Mission et promesse

**Mission** : rendre la conformité anti-blanchiment *prouvable* pour les petites agences immobilières, sans consultant, sans abonnement mensuel et sans confier leurs données clients à un tiers.

**Promesse client** : *« En 30 minutes, le dossier LCB-FT de votre agence est prêt pour un contrôle DGCCRF. »*

## 2. Cible

### Cœur de cible (ICP)
- **Qui** : le gérant ou la gérante d'une agence immobilière **indépendante** (hors grande franchise), titulaire de la carte T.
- **Taille** : de 1 à 15 personnes, sans responsable conformité.
- **Activité** : transaction, la principale activité assujettie (la location n'est concernée qu'au-delà de 10 000 € de loyer mensuel).
- **Volume** : 7 113 agences actives de 3 à 49 salariés et plus de 10 000 de 1 à 2 salariés (API SIRENE, NAF 68.31Z). Environ 10 000 indépendantes employeuses (*estimation*).

### Segments prioritaires (là où le risque, et donc la douleur, est maximal)
1. **Marchés haut de gamme et résidences secondaires** : Côte d'Azur et Var, stations alpines, Côte basque, Paris Ouest. La DGCCRF y a mené des opérations LCB-FT inopinées en 2025.
2. **Clientèle internationale ou transfrontalière** : Genevois, Alsace, Nord, Riviera.
3. **Agences qui recrutent** : chaque embauche déclenche l'obligation de formation du décret 2026-310.

### Persona
> **Sophie, 47 ans, gère une agence de 4 personnes à Annecy.** Elle a entendu parler du décret d'avril 2026 par sa chambre FNAIM et sait qu'un « contrôle Tracfin » peut tomber. Elle a un classeur de pièces d'identité, mais pas de classification des risques écrite. Ses négociateurs ont suivi un module ALUR d'une heure il y a deux ans. Elle refuse un nouvel abonnement mensuel : elle paie déjà son logiciel de transaction, les portails et la signature électronique. Elle veut un dossier propre, à son nom, qu'elle puisse montrer à un inspecteur.

## 3. Proposition de valeur

| Tâche à accomplir | Douleur aujourd'hui | Ce que fait Probant |
|---|---|---|
| Avoir une classification des risques **propre à l'agence** (art. L. 561-4-1) | Modèle recopié ou rien | Un questionnaire de 15 minutes produit une classification motivée sur les 5 axes légaux |
| Avoir des procédures internes écrites (art. L. 561-32) | « Quasiment aucun protocole écrit » (DGCCRF) | Procédures générées et adaptées aux activités déclarées |
| Former chaque collaborateur de façon adaptée, avec un volet sanctions (D. 561-38-1-1) | E-learning générique facturé par personne | Plan de formation par fonction, module adapté aux risques de l'agence, quiz, attestation nominative |
| **Prouver** la formation pendant les fonctions + 5 ans | Feuilles volantes | Registre des formations avec dates de conservation calculées |
| Documenter chaque dossier (identité, bénéficiaire effectif, PPE, gel, origine des fonds) | Le motif de la sanction CNS du 17/02/2026 | Fiche de vigilance guidée avec niveau de risque, mesures exigées et traçabilité |
| Désigner déclarant et correspondant Tracfin | Méconnu | Formulaire de désignation pré-rempli et marche à suivre ERMES |
| Vérifier une fois par an que tout tient | Rien | Auto-contrôle annuel avec score et plan d'action |

**Différenciateurs** (voir `01`, §4.4) : un forfait par agence avec collaborateurs illimités ; une construction pensée pour le décret 2026-310 ; aucune donnée client sur nos serveurs ; des sources légales citées dans chaque document.

## 4. Modèle économique

- **Licence annuelle par agence** : 290 € HT/an, collaborateurs illimités (détail et justification dans `03-offre-et-prix.md`).
- **Gratuit, pour convertir sans vendeur** : un diagnostic de 3 minutes, puis la démo complète du produit avec documents filigranés.
- **Récurrence justifiée** : formation « régulière » obligatoire, listes GAFI et UE révisées plusieurs fois par an, AMLR au 10/07/2027.

### Coûts (estimations)

| Poste | Coût |
|---|---|
| Hébergement statique (Cloudflare Pages ou Netlify, offre gratuite) | 0 € |
| Nom de domaine | 10 à 40 €/an selon l'extension |
| Messagerie professionnelle sur le domaine | 0 à 6 €/mois |
| Paiement Stripe (carte UE) | ~1,5 % + 0,25 € par paiement |
| Relecture juridique avant lancement (ponctuelle, **fortement recommandée**) | 500 à 1 500 € (*estimation, devis à demander*) |

**Marge brute** : plus de 95 % hors temps passé. **Point mort** de la relecture juridique : 2 à 5 licences.

### Scénarios première année (*estimations, non des prévisions*)

| Scénario | Agences payantes | Revenu annuel (HT) |
|---|---|---|
| Prudent | 40 | 7 600 € (40 fondateurs à 190 €) |
| Central | 120 | 29 800 € (50 × 190 € + 70 × 290 €) |
| Ambitieux | 300 | 82 000 € (50 × 190 € + 250 × 290 €) |

Hypothèse centrale : 3 000 agences contactées sur l'année (environ 60 par semaine), 8 % de réponses intéressées, 50 % d'entre elles qui convertissent. Ces taux sont à confirmer dès les 300 premiers envois (voir les critères d'arrêt dans `01`).

## 5. Acquisition : sans audience, par la pertinence

### Canal 1 — Prospection B2B directe et sobre (de J0 à J+90)
- **Cibles** : agences indépendantes repérées via l'annuaire officiel des entreprises et leurs propres sites. On exclut les entreprises qui se sont opposées à la prospection (champ prévu dans les données SIRENE/RNE).
- **Message** : un fait daté (décret 2026-310, sanction CNS récente, contrôles dans leur zone), un bénéfice concret, un lien vers le diagnostic gratuit et une désinscription en un clic. Le cadre est rappelé dans `prospection/README.md`.
- **Volume** : 20 à 30 messages personnalisés par jour au maximum, depuis un domaine dédié. Une seule relance.
- **Garde-fous de réputation** : jamais de ton menaçant, jamais d'imitation d'un organisme officiel, jamais de faux caractère obligatoire de l'achat. C'est l'inverse exact des pratiques d'arnaque observées sur le DUERP.

### Canal 2 — Contenu et référencement (de J+15 à J+180, effort une fois)
Cinq pages piliers : décret 2026-310 expliqué ; classification des risques d'une agence (méthode) ; procédures internes LCB-FT ; fiche de vigilance et origine des fonds ; préparer un contrôle DGCCRF. Chacune mène au diagnostic gratuit.

### Canal 3 — Partenaires prescripteurs (à partir de J+30)
- **Formateurs ALUR** : Probant apporte la « couche d'adaptation » que leurs modules génériques n'ont pas (commission de 20 %).
- **Experts-comptables spécialisés immobilier**, **garants et assureurs RCP**, **chambres FNAIM ou UNIS départementales** (atelier « contrôle LCB-FT »).

### Canal 4 — Extension verticale (2027)
Même moteur, nouveaux référentiels : **sociétés de domiciliation** (fréquemment sanctionnées par la CNS), courtiers en assurance et IOBSP, CGP, marchands d'art. Le décret 2026-310 s'applique à tous les assujettis de l'article L. 561-2.

### Entonnoir et indicateurs

| Étape | Indicateur | Objectif initial |
|---|---|---|
| Message envoyé | Taux de réponse | ≥ 5 % |
| Diagnostic gratuit | Diagnostics démarrés et terminés | ≥ 60 % de complétion |
| Démo | Démos qui ouvrent un document | ≥ 40 % |
| Achat | Conversion démo → licence | ≥ 10 % |
| Renouvellement | Rétention à 12 mois | ≥ 75 % |

## 6. Opérations à faible intervention

| Tâche | Automatisée ? | Temps humain estimé |
|---|---|---|
| Paiement, facture, encaissement | Oui (Stripe) | 0 |
| Émission de la licence nominative | Oui (fonction Cloudflare fournie dans `produit/outils/`), sinon commande d'une ligne | 0 à 1 min par vente |
| Utilisation du produit | Oui (libre-service) | 0 |
| Support | FAQ dans l'app, réponse par e-mail sous 48 h ouvrées | ~1 h/semaine |
| Veille réglementaire et mise à jour des listes (après les plénières GAFI de février, juin et octobre, et les actes UE) | Semi-automatique : un fichier de données à modifier | ~2 h par trimestre |
| Prospection | Semi-manuelle (brouillons préparés, envoi par le fondateur) | 2 à 3 h/semaine |

**Charge totale cible après lancement : 3 à 5 h par semaine.**

## 7. Conformité de Probant lui-même
- **Statut** : édition de logiciel (outil d'aide à la mise en conformité). Pas de consultation juridique personnalisée (encadrée par l'article 54 de la loi du 31 décembre 1971), ce que la mention d'avertissement présente dans l'app et les CGV rappelle. **À faire valider par un avocat.**
- **RGPD** : aucune donnée des clients de l'agence n'est traitée par Probant (tout reste dans le navigateur). Données traitées : celles des acheteurs, pour la facturation, et des prospects B2B (intérêt légitime, opposition possible). Les projets de textes sont dans `site/legal/`.
- **Image** : aucun nom, logo ou formulation pouvant faire croire à un service de l'État (pas de « Tracfin » ni de « DGCCRF » dans la marque ou les objets de mails).

## 8. Feuille de route

| Horizon | Livrable |
|---|---|
| J0 (aujourd'hui) | V1 du produit, page de vente, pitch, 10 prospects et brouillons — ce dépôt |
| J+7 | Relecture juridique ; domaine et messagerie ; compte Stripe ; déploiement |
| J+30 | 50 agences « fondatrices », retours, 3 témoignages |
| Fév. 2027 | Mise à jour post-plénière GAFI ; export Word enrichi ; licence multi-agences |
| Juin 2027 | **Module AMLR** (application au 10/07/2027) : vigilance sur les deux parties, nouveaux formulaires |
| S2 2027 | Référentiel domiciliation ; programme partenaires |
