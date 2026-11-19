# Mettre en ligne la page de vente de Probant

> Je n'ai **rien publié**. Tout est prêt dans `site/public/`. Les étapes ci-dessous touchent à des comptes, un nom de domaine et des paiements : elles sont à réaliser par toi.

Ce que contient `site/public/` (1,1 Mo, 100 % statique, sans cookie ni traceur) :

| Chemin | Contenu |
|---|---|
| `index.html` | Page de vente |
| `diagnostic.html` | Diagnostic gratuit (12 questions, calculé dans le navigateur) |
| `app/` | L'application Probant (mode démo tant qu'aucune licence n'est saisie) |
| `exemples/` | 4 PDF d'exemple (agence fictive) |
| `legal/` | Mentions légales, CGV, confidentialité — **projets à faire relire** |
| `_headers` | En-têtes de sécurité (CSP, HSTS…) lus par Cloudflare Pages et Netlify |
| `404.html`, `robots.txt`, `sitemap.xml` | Fichiers techniques |

---

## Étape 0 — Prérequis (une seule fois)

1. **Statut juridique** : micro-entreprise ou SASU. Il faut un SIREN pour les mentions légales, les CGV et Stripe.
2. **Nom de domaine** : vérifier la disponibilité de `probant.immo`, `probant-immo.fr` ou `getprobant.fr` chez un registrar (OVHcloud, Gandi, Cloudflare Registrar). Compter environ 10 à 40 € par an. Vérifier aussi la marque « Probant » sur la base de l'INPI (classes 9, 42 et 45).
3. **Adresse e-mail professionnelle** sur ce domaine (par exemple `contact@…`), indispensable pour la prospection.
4. **Clé de licence** (sur ton ordinateur, Node 18 ou plus) :

   ```bash
   cd produit
   ```

   ```bash
   npm install
   ```

   ```bash
   npm run licence:init
   ```

   Sauvegarde immédiatement `produit/cle-privee.json` dans un coffre-fort de mots de passe. Ne la committe jamais : elle est déjà exclue par `.gitignore`.

## Étape 1 — Paiement Stripe

1. Crée un compte sur stripe.com : entreprise, IBAN, pièce d'identité. Commence en **mode test**.
2. Dans **Produits**, crée trois produits en **paiement unique**. Il n'y a pas d'abonnement, ce qui correspond à l'engagement « sans reconduction tacite » des CGV.
   - « Probant — Licence Agence (offre fondateurs, 12 mois) » : 190 € HT
   - « Probant — Licence Agence (12 mois) » : 290 € HT
   - « Probant — Licence Multi-agences (12 mois) » : 590 € HT

   Configure la TVA (20 %) dans Stripe Tax, ou indique que tu es en franchise en base. Active l'émission automatique de factures après paiement.
3. Pour chaque produit, crée un **Payment Link** :
   - champs personnalisés : `raisonsociale` (texte, obligatoire) et `siren` (texte) ;
   - collecte de l'adresse de facturation et du numéro de TVA ;
   - métadonnée `plan` = `agence` (ou `multi`) ;
   - « Après le paiement » : laisse la page de confirmation Stripe, ou, si tu as déployé le Worker (étape 5), redirige vers `https://<worker>/licence?session_id={CHECKOUT_SESSION_ID}`.

## Étape 2 — Remplacer les champs `REMPLACER_…`

| Champ | Où | Valeur |
|---|---|---|
| `REMPLACER_DOMAINE` | `index.html`, `diagnostic.html`, `robots.txt`, `sitemap.xml` | Ton domaine, sans `https://` (ex. `probant-immo.fr`) |
| `REMPLACER_LIEN_STRIPE_FONDATEURS` | `index.html` | Payment Link à 190 € |
| `REMPLACER_LIEN_STRIPE_MULTI` | `index.html` | Payment Link à 590 € |
| `REMPLACER_EMAIL_CONTACT` | `index.html` | `contact@ton-domaine` |
| `REMPLACER_RAISON_SOCIALE` | `index.html` | Ta raison sociale |

Une fois les 50 places fondateurs vendues, remplace dans `index.html` le lien et le libellé du bouton fondateurs par le Payment Link à 290 €.

Complète ensuite les **pages légales** (`legal/*.html`, champs surlignés) et **fais-les relire par un professionnel du droit**. Retire enfin le bandeau « PROJET » et les classes `a-completer`.

## Étape 3 — Reconstruire avec ton domaine, puis vérifier

Depuis la racine du dépôt, construis l'application avec ta clé publique et ton lien d'achat :

```bash
cd produit && PROBANT_URL_ACHAT="https://TON-DOMAINE/#tarifs" npm run build && cd ..
```

Assemble ensuite le site :

```bash
node site/construire.mjs
```

Puis vérifie-le :

```bash
node site/verifier.mjs
```

`verifier.mjs` doit afficher uniquement des ✔ et se terminer sans erreur. Il refuse la mise en ligne s'il reste un champ `REMPLACER_…`, une page légale à l'état de projet ou un lien interne cassé.

## Étape 4 — Publier (au choix)

### Option A — Cloudflare Pages (recommandée : gratuite, rapide, même plateforme que le Worker)
1. Crée un compte sur dash.cloudflare.com.
2. Va dans **Workers & Pages** → **Create** → **Pages** → **Upload assets**.
3. Nomme le projet `probant`, glisse-dépose le dossier **`site/public`**, puis clique sur **Deploy**.
4. Le site est accessible sur `https://probant.pages.dev`. Vérifie-le de bout en bout (étape 6).
5. Dans **Custom domains**, ajoute ton domaine et suis les instructions DNS. Le HTTPS est automatique.
6. Pour une mise à jour, refais `node site/construire.mjs` puis **Create new deployment** en déposant `site/public`.

En ligne de commande, l'équivalent est :

```bash
npx wrangler pages deploy site/public --project-name probant
```

### Option B — Netlify Drop
1. Ouvre app.netlify.com/drop et glisse-dépose le dossier **`site/public`**. Une URL est attribuée immédiatement.
2. Crée un compte pour conserver le site, puis ajoute le domaine dans **Domain management**. Le fichier `_headers` est pris en compte.

> GitHub Pages fonctionne aussi, mais n'applique pas les en-têtes de sécurité de `_headers` : à éviter pour un produit de conformité.

## Étape 5 — Automatiser l'envoi des licences (recommandé)

Suis la section « Automatiser l'émission des licences » de `produit/README.md`. Il s'agit de déployer un Cloudflare Worker et de créer des comptes Stripe et Brevo. Sans cela, émets chaque licence à la main en une minute :

```bash
npm run licence:emettre -- --agence "Raison sociale" --siren 123456789
```

Envoie ensuite la clé au client par e-mail.

## Étape 6 — Tester en conditions réelles avant d'annoncer quoi que ce soit

1. Ouvre le site sur ordinateur et sur téléphone, fais le diagnostic jusqu'au résultat, puis ouvre `/app/` et charge l'agence d'exemple.
2. En **mode test Stripe**, achète une licence avec la carte `4242 4242 4242 4242`. Vérifie la réception de la clé (à l'écran ou par e-mail), puis son activation dans **Paramètres** : le filigrane doit disparaître.
3. Passe Stripe en **mode live** et remplace les liens de test par les liens live (étape 2).
4. Fais un achat réel de 190 €, puis rembourse-le, pour valider la chaîne complète : paiement, facture, licence.

## Mesure d'audience (facultatif)

Le site n'utilise ni cookie ni traceur, donc il n'a pas besoin de bandeau de consentement. Si tu veux des statistiques, active **Cloudflare Web Analytics** (sans cookie) depuis le tableau de bord Pages, puis mets à jour la politique de confidentialité.
