# JOURNAL — état d'avancement

Ce fichier permet de reprendre le travail exactement là où il s'est arrêté.

---

## Phase 1 — Recherche et choix ✅ (19/11/2026)

**Décision** : **Probant**, le dossier de conformité anti-blanchiment (LCB-FT) des agences immobilières indépendantes, construit pour le décret n° 2026-310 (formation adaptée et preuves). Licence annuelle de 290 € HT par agence.

**Livrables**
- `docs/01-recherche-et-choix.md` : 14 pistes, short-list notée, décision, risques, sources.
- `docs/02-strategie.md` : cible, proposition de valeur, modèle, acquisition, opérations, feuille de route.
- `docs/03-offre-et-prix.md` : offre, positionnement, repères concurrents sourcés, justification du prix.

**Contexte technique à connaître pour reprendre**
- Réseau : un environnement cloud « business » a été créé (avec l'accord de l'utilisateur) avec une liste d'hôtes autorisés. `curl` passe par le proxy. Le lecteur WebFetch, lui, ne résout pas les noms de domaine dans cette session.
- Sites inaccessibles même autorisés (protection anti-robots) : economie.gouv.fr (403), legifrance.gouv.fr et fatf-gafi.org (défi Cloudflare), eur-lex (défi WAF). Ces informations ont été obtenues via la recherche web et sont signalées [E] dans les sources.
- API officielle utilisable : `https://recherche-entreprises.api.gouv.fr/search` (sans clé, environ 7 requêtes par seconde au maximum, totaux plafonnés à 10 000). Elle renvoie dirigeants, adresse, effectif, et un champ `opposition_diffusion_commerciale` à respecter pour la prospection.
- Scripts utilitaires (non versionnés) dans le scratchpad de session : `fetch.sh`, `totext.py`, `browse.js`.

**Points ouverts reportés aux phases suivantes**
- Lire directement les pages de tarifs concurrentes (konforme.eu, vigimmo.com, conform-immo.fr, kyc.immo, documan.fr) : hôtes à autoriser en phase 4 avec les sites des prospects.

---

## Phase 2 — Produit ✅ (19/11/2026)

**Livrable** : `produit/dist/probant.html`. C'est une application autonome en un seul fichier de 229 Ko, qui fonctionne hors ligne et dont les données restent dans le navigateur.

**Fonctions**
- Classification des risques : 22 facteurs sur les 5 axes, ajustements motivés, versions.
- Procédures internes : 13 sections et 2 annexes.
- Désignation Tracfin et marche à suivre ERMES.
- Formation adaptée par fonction et par risque : 21 modules, 32 questions, attestation numérotée, registre avec fin de conservation à départ + 5 ans.
- Fiches de vigilance : niveau standard, renforcé ou bloqué, manquants, clôture contrôlée, conservation à clôture + 5 ans.
- Auto-contrôle sur 20 points, avec pré-remplissage.
- 10 documents PDF et Word.
- Licence ECDSA vérifiée hors ligne, mode démo avec filigrane.
- Sauvegarde et restauration, journal de traçabilité, agence d'exemple fictive.

**Tests** : 32 tests unitaires et 7 tests E2E dans Chromium, tous réussis. Ils couvrent le parcours complet jusqu'à 100 %, la licence (valide, falsifiée, expirée), les 14 documents en PDF, la sauvegarde et la restauration, le blocage sur gel des avoirs, l'injection de code, l'affichage mobile et les libellés de tous les champs.

**Automatisation des ventes** :
- `produit/outils/licence.mjs` : clés, émission et vérification. Testé de bout en bout dans une copie jetable, sans qu'aucune clé ne reste dans le dépôt.
- `produit/outils/worker-licence/` : chaîne Stripe → licence → e-mail Brevo, testée avec des échanges simulés.

**Exemples** : `produit/exemples/` contient 10 PDF et 5 captures, produits à partir d'une agence fictive.

**Pour reprendre** :
- Ouvrir `produit/dist/probant.html`.
- Lancer `cd produit && npm install && npm test && npm run test:e2e`.
- Mise en service des licences : `npm run licence:init` puis `npm run build`, à faire par le fondateur.

## Phase 2 — Produit (historique)

## Phase 3 — Pitch et page de vente ⏳ (à faire)

## Phase 4 — Prospection et rapport ⏳ (à faire)
