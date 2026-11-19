# Probant — l'application

Application web autonome qui produit le dossier LCB-FT d'une agence immobilière :

- classification des risques ;
- procédures internes ;
- désignation Tracfin ;
- plan, module, attestations et registre de formation (décret n° 2026-310) ;
- fiches de vigilance par opération ;
- auto-contrôle annuel.

**Livrable** : `dist/probant.html`, un **fichier unique** de 230 Ko (HTML, CSS et JavaScript intégrés). Il fonctionne hébergé (https) comme ouvert en local (`file://`), sans aucun appel réseau. Les données restent dans le navigateur de l'utilisateur (`localStorage`), avec sauvegarde et restauration en JSON.

## Essayer tout de suite

Ouvrez `dist/probant.html` dans Chrome, Edge, Firefox ou Safari, puis cliquez sur **« Charger une agence d'exemple (fictive) »**.
Sans licence, tout fonctionne. Les documents portent alors un filigrane « Démonstration ».

Des exemples de documents produits (PDF) et des captures d'écran sont dans `exemples/`.

## Commandes

| Commande | Effet |
|---|---|
| `npm install` | Installe esbuild (seule dépendance, de développement) |
| `npm run build` | Construit `dist/probant.html` avec la clé publique `cle-publique.json` |
| `npm test` | 32 tests unitaires (moteurs, documents, licences, Worker) |
| `npm run test:e2e` | 7 tests de bout en bout dans Chromium (parcours complet, licence, PDF, sauvegarde, sécurité, mobile et accessibilité) |
| `npm run exemples` | Régénère `exemples/*.pdf` et `exemples/captures/*.png` |
| `npm run licence:init` | Crée la paire de clés de licence (une seule fois) |
| `npm run licence:emettre -- --agence "Nom" --siren 123456789 --plan agence` | Émet une licence d'un an |

## Mise en service des licences (une seule fois, sur le poste du fondateur)

```bash
cd produit
npm install
npm run licence:init
npm run build
```

`init` crée **`cle-publique.json`**, à versionner : elle est intégrée au build. Il crée aussi **`cle-privee.json`**, qui est **secrète** : elle est ignorée par git et doit être sauvegardée dans un coffre-fort de mots de passe. Perdre la clé privée oblige à refaire `init` et à rééditer toutes les licences.

Ensuite, pour chaque vente, deux possibilités :

- **Manuel (1 minute)** : lancez `npm run licence:emettre -- --agence "Raison sociale" --siren 123456789`, puis collez la clé affichée dans un e-mail au client.
- **Automatique** : déployez le Worker décrit ci-dessous.

## Automatiser l'émission des licences (zéro intervention)

`outils/worker-licence/` contient un Cloudflare Worker, testé par `tests/unit/worker.test.mjs`. Après un paiement Stripe, il :

1. vérifie la signature du webhook Stripe ;
2. génère la licence nominative (raison sociale et SIREN saisis au paiement) ;
3. l'envoie par e-mail via Brevo ;
4. l'affiche aussi sur la page de confirmation de paiement.

Il ne stocke aucune donnée.

1. **Stripe** : créez un produit « Probant — Licence Agence », prix 290 € HT, paiement annuel. Créez un *Payment Link* avec deux champs personnalisés : `raisonsociale` (texte) et `siren` (texte). Ajoutez la métadonnée `plan = agence` (ou `multi`). Dans « Après le paiement », choisissez la redirection vers `https://<worker>/licence?session_id={CHECKOUT_SESSION_ID}`.
2. **Brevo** : créez un compte, vérifiez le domaine d'envoi et récupérez une clé API.
3. **Cloudflare** : depuis `outils/worker-licence/`, lancez :

   ```bash
   npx wrangler login
   ```

   Saisissez les secrets un par un :

   ```bash
   npx wrangler secret put LICENCE_CLE_PRIVEE
   ```

   ```bash
   npx wrangler secret put STRIPE_WEBHOOK_SECRET
   ```

   ```bash
   npx wrangler secret put STRIPE_SECRET_KEY
   ```

   ```bash
   npx wrangler secret put BREVO_API_KEY
   ```

   Puis déployez :

   ```bash
   npx wrangler deploy
   ```

   Mettez à jour `EXPEDITEUR_EMAIL` et `URL_APPLICATION` dans `wrangler.toml` avant le déploiement.
4. **Webhook Stripe** : pointez-le vers `https://<worker>/stripe`, événement `checkout.session.completed`.

Toutes ces étapes touchent à des comptes et à des paiements : elles sont à réaliser par le fondateur (voir `RAPPORT.md`).

## Architecture

```
src/
  main.js               coque, routeur (#/…), liaison des champs, aperçu, licences
  etat.js               état, persistance locale, sauvegarde et restauration, journal de traçabilité
  licence.js            licences ECDSA P-256 vérifiées hors ligne (WebCrypto)
  contenus/             DONNÉES RÉGLEMENTAIRES (une seule source de vérité)
    pays.js             listes GAFI (30/10/2026) et UE (29/01/2026) — à mettre à jour
    textes.js           références légales, liens officiels, version des contenus
    questions-profil.js 22 facteurs de risque sur les 5 axes de l'art. L. 561-4-1 CMF, seuils par défaut
    formation.js        21 modules (socle, risques, fonctions) et 32 questions
    signaux.js          14 signaux d'alerte
    autocontrole.js     20 points de contrôle
  moteur/               FONCTIONS PURES, testées unitairement
    risques.js          classification (niveau par axe = facteur le plus élevé ; profil global)
    vigilance.js        niveau de vigilance d'une opération, mesures, manquants, blocages
    formation.js        parcours adapté, quiz, correction, statut, conservation (départ + 5 ans)
    autocontrole.js     score, priorités, pré-remplissage
  documents/            10 documents A4 imprimables et exportables sous Word
  vues/                 11 écrans
```

## Maintenance réglementaire (environ 2 h par trimestre)

1. **Après chaque plénière du GAFI** (février, juin, octobre) et chaque acte délégué de la Commission européenne, mettez à jour `src/contenus/pays.js` (listes et dates).
2. **À chaque évolution des textes**, mettez à jour les contenus concernés, puis incrémentez `VERSION_CONTENUS` dans `src/contenus/textes.js`. La version apparaît sur chaque document et chaque attestation.
3. Lancez `npm test`, `npm run test:e2e`, `npm run build`, puis redéployez `dist/probant.html`.

**Prochaines échéances connues** : plénière du GAFI de février 2027 ; application de l'AMLR le 10 juillet 2027, qui demande un module dédié (voir `docs/02-strategie.md`).

## Sécurité et confidentialité

- Aucune donnée n'est transmise : pas de serveur, pas de traceur, pas de police ni de script externe.
- Toute saisie est échappée à l'affichage et dans les documents, y compris dans les chaînes CSS du pied de page. Un test injecte du code et vérifie qu'il n'est jamais exécuté.
- Les licences sont signées hors ligne. Une licence falsifiée ou expirée est refusée (tests unitaires et E2E).
