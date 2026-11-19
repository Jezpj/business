# RAPPORT — Probant

*Rédigé le 19 novembre 2026. Tout est dans ce dépôt, branche `claude/zealous-turing-s6v2fp`. **Rien n'a été publié, rien n'a été envoyé, aucun compte n'a été créé et aucun paiement n'a eu lieu.***

## 1. En bref

**Probant** produit en 30 minutes le dossier anti-blanchiment (LCB-FT) complet d'une agence immobilière indépendante :

- classification des risques ;
- procédures internes ;
- désignation Tracfin ;
- **formation adaptée à chaque collaborateur, avec attestations et registre des preuves**, comme l'exige le décret n° 2026-310 depuis le 26 avril 2026 ;
- fiches de vigilance par vente ;
- auto-contrôle annuel.

L'outil est vendu **290 € HT par an et par agence, collaborateurs illimités**. Il fonctionne entièrement dans le navigateur : aucune donnée client n'est hébergée. La vente, la délivrance de la licence et le renouvellement peuvent être automatisés de bout en bout. Le fonctionnement courant demande **3 à 5 heures par semaine**, surtout pour la prospection.

## 2. Livrables

| Demandé | Où | État |
|---|---|---|
| 1. Idée choisie et justifiée, alternatives écartées | `docs/01-recherche-et-choix.md` | ✅ 14 pistes, notation pondérée, sources |
| 2. Stratégie complète | `docs/02-strategie.md` | ✅ Cible, modèle, acquisition, opérations, feuille de route |
| 3. Offre, positionnement, prix sourcé | `docs/03-offre-et-prix.md` | ✅ 290 € HT/an ; **4 grilles tarifaires concurrentes lues directement** |
| 4. Produit terminé, testé, utilisable | `produit/dist/probant.html` (+ `produit/README.md`) | ✅ **40 tests automatisés réussis** (32 unitaires, 8 de bout en bout) |
| 5. Support de présentation | `pitch/Probant-pitch.pdf` et `.pptx` | ✅ 15 diapositives, notes de l'orateur |
| 6. Page de vente prête à mettre en ligne | `site/public/` + **`site/DEPLOIEMENT.md`** | ✅ **Non publiée**, procédure pas à pas |
| 7. Prospection | `prospection/` | ✅ **10 agences réelles** sourcées, 10 brouillons **non envoyés** |
| 8. Rapport | ce fichier + `JOURNAL.md` | ✅ |

**Pour voir le produit maintenant** : ouvre `produit/dist/probant.html` dans un navigateur, puis clique sur « Charger une agence d'exemple (fictive) ». Des exemples de documents produits sont dans `produit/exemples/`.

## 3. Les décisions, et pourquoi

1. **Le problème avant la solution.** J'ai retenu un problème réglementaire daté, sanctionné et documenté. L'immobilier est classé à risque élevé, et la DGCCRF constate que presque aucune agence n'est en règle. Des sanctions publiques tombent, dont une en février 2026 pour **une seule vente**. Le décret du 24 avril 2026 crée en outre une obligation nouvelle et précise.
2. **Écarter le DUERP, pourtant évident.** Ce marché est miné par les arnaques (alertes de la CAPEB, de la FFB et d'une préfecture) : une prospection à froid y serait perçue comme suspecte. Facturation électronique, accessibilité, bouton de rétractation et transparence salariale sont écartés pour des raisons documentées dans `docs/01`.
3. **Constater que le marché LCB-FT immobilier est encombré.** Konforme, VigImmo, Conform-Immo, kyc.immo et Documan sont tous des **SaaS de KYC et de criblage par abonnement**. Plutôt que de les copier, Probant prend l'angle que le décret rend obligatoire et qu'ils ne couvrent pas : **classification individualisée → formation adaptée par fonction → preuves**. Vérification directe faite le 19/11 : la page tarifs de Konforme ne mentionne aucune formation, et les collaborateurs illimités y coûtent 99 €/mois.
4. **Données locales.** Rien n'est hébergé : coût nul, aucune fuite possible, RGPD simplifié, et un argument commercial fort. La contrepartie est assumée : sauvegardes à faire par l'utilisateur, rappelées chaque mois, et synchronisation entre plusieurs postes reportée à 2027.
5. **Licence signée vérifiée hors ligne (ECDSA).** Pas de serveur à maintenir. Un Worker Cloudflare, fourni et testé, automatise la chaîne Stripe → licence → e-mail.
6. **Prix de 290 € HT par an.** C'est sous le seuil de décision immédiate d'un gérant, environ la moitié de l'offre SaaS la moins chère, et cela couvre une équipe entière. Le récurrent se justifie par les listes GAFI mises à jour trois fois par an et par l'AMLR en 2027. Pas de reconduction tacite la première année : c'est un argument de confiance.
7. **Diagnostic gratuit fondé sur le même moteur que le produit.** C'est un aimant à prospects crédible et cohérent, sans collecte de données.
8. **Acquisition sobre et ciblée.** Les marchés retenus sont les plus exposés (prestige, frontalier, résidences secondaires). Les prospects sont croisés avec le **répertoire officiel**, en excluant les entreprises opposées à la prospection. Les messages reposent sur des faits vérifiables, sans imitation d'un organisme officiel ni fausse urgence.
9. **Marque « Probant »** : un mot français qui renvoie à la preuve, pour une conformité « prouvable ». Aucun conflit trouvé dans ce secteur. Le dépôt à l'INPI reste à vérifier (§5).

## 4. Ce qui est vérifié, estimé ou non vérifié

**Vérifié** (page lue intégralement, données officielles ou test automatisé) :
- Le contenu du **décret n° 2026-310** (art. D. 561-38-1-1 CMF) : formation à l'embauche puis régulière, adaptée à la classification et aux fonctions, volet sanctions, conservation des justificatifs 5 ans après le départ. Lu chez MySweetImmo (30/04/2026) et Kohen Avocats (12/06/2026). *Ce sont des sources secondaires : le Journal officiel n'a pas pu être lu (§5).*
- Les **sanctions de la CNS** : 22/03/2024 et 28/06/2024 (Novlaw) ; 17/02/2026 (MySweetImmo).
- Les **contrôles DGCCRF inopinés du 15/05/2025** dans 13 agences de luxe de Saint-Tropez (Novlaw).
- **1 739 professionnels contrôlés, 65,1 % en anomalie**, toutes réglementations confondues (chiffre DGCCRF cité par MySweetImmo).
- La **taille du marché** : 7 113 agences de 3 à 49 salariés, et plus de 10 000 de 1 à 2 salariés (API officielle, NAF 68.31Z).
- Les **prix concurrents** : Konforme (49 et 99 €/mois), VigImmo (49,99, 66,67 et 99,99 € HT/mois), Conform-Immo (0, 29 et 49 € HT/mois), kyc.immo (0, 49 et 149 € HT/mois ou 30 € par opération). Pages lues le 19/11/2026.
- Les **10 prospects** : identité, carte professionnelle, effectif et **absence d'opposition** (répertoire officiel), fiche FNAIM, site de l'agence et adresse publiée.
- Le **produit** : 40 tests automatisés réussis. Ils couvrent le parcours complet jusqu'à 100 %, la licence (valide, falsifiée, expirée), les 14 documents en PDF, la sauvegarde et la restauration, le blocage en cas de gel des avoirs, l'injection de code, l'affichage mobile, les libellés de champs et le rappel de renouvellement. Le site a aussi été testé dans Chromium sous la politique de sécurité de production, sur ordinateur et sur mobile.

**Estimé** (hypothèses de travail, à confirmer) :
- Environ 10 000 agences indépendantes employeuses en cœur de cible.
- Les taux de conversion et les scénarios de revenus (7 600 €, 29 800 € et 82 000 € la première année).
- Le coût d'une relecture juridique (500 à 1 500 €).
- Le temps nécessaire après lancement (3 à 5 h par semaine).
- Les durées de formation par module.

**Non vérifié à la source** (obtenu par extraits de moteur de recherche, car les sites concernés bloquaient la lecture automatisée : Légifrance, economie.gouv.fr, GAFI, EUR-Lex) :
- La citation de la DGCCRF « aucun professionnel contrôlé ne respectait la totalité des exigences ».
- Le classement « risque élevé » de l'Analyse nationale des risques 2023.
- Le plafond de 5 M€ de l'art. L. 561-40 et l'amende de 22 500 € de l'art. L. 574-1.
- Les articles R. 561-23 et R. 561-24 et la procédure ERMES.
- **Les listes de pays** : liste grise du GAFI au 30/10/2026 (18 juridictions) et liste UE au 29/01/2026 (26 pays).
- La date d'application de l'AMLR (10/07/2027).
- Les prix de Documan, Lefebvre Dalloz, Galian, maformationimmo et Orsys.

## 5. À valider ou faire toi-même avant toute mise en ligne ou tout envoi

### Juridique (bloquant)
1. **Faire relire par un avocat** :
   - les trois **projets de textes** : `site/public/legal/mentions-legales.html`, `cgv.html` et `confidentialite.html` ;
   - **les contenus réglementaires du produit** (procédures, modules de formation, quiz, classification, fiches de vigilance), en vérifiant chaque article cité sur Légifrance ;
   - la qualification d'« outil d'aide, pas de conseil juridique » (loi du 31/12/1971, art. 54) ;
   - le tableau comparatif de la page de vente (publicité comparative).
2. **Revérifier les listes de pays** (GAFI et UE) sur les sites officiels, puis à chaque plénière : prochaine en février 2027. Fichier unique : `produit/src/contenus/pays.js`.
3. **Choisir le statut** (micro-entreprise ou SASU), le **régime de TVA** et une **assurance RC professionnelle** adaptée à un éditeur de logiciel de conformité.
4. **Marque et domaine** : recherche d'antériorité « Probant » à l'INPI (classes 9, 42 et 45), puis achat du domaine.
5. **Facturation électronique** : la réception est déjà obligatoire, et l'émission vers les clients professionnels français devra passer par une plateforme agréée dès le 1/9/2027. À prévoir dans le choix de l'outil de facturation.

### Comptes et paiements (toi seul)
6. Messagerie professionnelle sur le domaine, avec SPF, DKIM et DMARC.
7. Sur ton poste : lancer `npm run licence:init`, **sauvegarder `cle-privee.json` dans un coffre-fort de mots de passe**, puis lancer `npm run build`.
8. Comptes Stripe (Payment Links), Brevo et Cloudflare (Pages et Worker) : voir `site/DEPLOIEMENT.md` et `produit/README.md`. Commencer en mode test.
9. Remplacer les champs `REMPLACER_…` : `node site/verifier.mjs` doit passer sans erreur avant publication.

### Prospection
10. Juste avant chaque envoi, revérifier l'adresse, le site et l'absence d'opposition, puis envoyer **à la main**, sans pixel de suivi, en suivant `prospection/README.md`. Tenir `oppositions.csv` à jour.

### Divers
11. **Ton profil** : `CLAUDE.md` ne contenait ni profil, ni contraintes, ni règles de sécurité personnelles (seulement trois conventions). J'ai travaillé avec les contraintes de ta demande. Si ton profil change la donne (expertise, temps, budget, statut), dis-le-moi.
12. **Environnement cloud** : avec ton accord, j'ai créé l'environnement « business ». Il autorise une liste précise de sites (API officielle, FNAIM, sites des agences prospectées, pages tarifs concurrentes). Tu peux le supprimer ou réduire cette liste dans les paramètres.

## 6. Limites connues du produit (V1)

- Les données sont **stockées dans le navigateur d'un poste**. Pas de synchronisation entre plusieurs postes : un poste référent est recommandé, la synchronisation est prévue en 2027.
- Pas de **criblage automatique** des PPE ni des sanctions : la vérification manuelle sur le registre national des gels est guidée et tracée.
- L'export Word est un `.doc` au format HTML : il s'ouvre et se modifie dans Word et LibreOffice, mais ce n'est pas un `.docx` natif.
- Les numéros de page à l'impression reposent sur Chrome et Edge. Sous Firefox, le pied de page s'imprime sans numérotation.
- La formation est une formation interne LCB-FT : **elle ne compte pas dans les 42 heures de la loi ALUR**, ce qui est dit clairement sur la page de vente.
- Le **module AMLR** est à livrer avant le 10/07/2027.
- Le diagnostic gratuit ne collecte pas de contacts (choix de confidentialité). L'ajout d'un formulaire demanderait un outil tiers et une mise à jour de la politique de confidentialité.

## 7. Prochaines étapes recommandées

| Quand | Quoi |
|---|---|
| Sous 7 jours | Relecture juridique (§5.1), statut, domaine, `licence:init`, Stripe en mode test, déploiement sur Cloudflare Pages, test d'achat de bout en bout |
| Sous 30 jours | Envoi des 10 premiers messages, puis 20 à 30 par jour, 50 agences « fondatrices » à 190 €, 3 témoignages, mesure de l'entonnoir (`docs/02` §5) |
| Février 2027 | Mise à jour post-plénière GAFI, critères d'arrêt ou de pivot à 90 jours (`docs/01` §5) |
| Juin 2027 | Module AMLR |

## 8. Reprendre le travail

```bash
cd produit
```

```bash
npm install
```

```bash
npm test
```

```bash
npm run test:e2e
```

Pour reconstruire après une modification :

```bash
npm run build
```

Puis, depuis la racine du dépôt :

```bash
node site/construire.mjs
```

```bash
node site/verifier.mjs --brouillon
```

Pour régénérer le pitch :

```bash
python3 pitch/generer_pitch.py
```

L'historique détaillé, phase par phase, est dans `JOURNAL.md`.
