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

## Phase 2 — Produit ⏳ (à faire)

## Phase 3 — Pitch et page de vente ⏳ (à faire)

## Phase 4 — Prospection et rapport ⏳ (à faire)
