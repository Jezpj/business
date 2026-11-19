# Prospection — méthode, conformité et mode d'emploi

> **Rien n'a été envoyé.** Les messages sont des brouillons (`brouillons.md`). L'envoi est une action du fondateur, après la mise en ligne du site et la relecture juridique.

## Fichiers

| Fichier | Contenu |
|---|---|
| `prospects.csv` | 10 agences réelles. Pour chacune : identité légale, carte professionnelle, représentant, effectif INSEE, canal de contact, **source de chaque information**, angle de personnalisation et statut |
| `brouillons.md` | 10 messages personnalisés, 1 relance unique, signature et pied communs |
| `oppositions.csv` | Registre des oppositions, à tenir à jour (vide au départ) |
| `outils/candidats_api.py` | Script reproductible pour lister des agences candidates via l'API officielle |

## Méthode de sélection (19/11/2026)

**Cible** : agences immobilières **indépendantes et employeuses**, actives en transaction, sur les **marchés les plus exposés** au risque de blanchiment. Ce sont les marchés de prestige, de résidences secondaires et frontaliers, visés par les contrôles de la DGCCRF en 2025. C'est là que la douleur est la plus forte et le message le plus pertinent.

| Étape | Source | Résultat |
|---|---|---|
| 1. Agences de 16 villes ciblées (Saint-Tropez, Cannes, Biarritz, Anglet, Saint-Jean-de-Luz, Annecy, Megève, Chamonix, Évian, Thonon, Porto-Vecchio…) | Annuaire des agences FNAIM (pages publiques par ville), consulté manuellement agence par agence | 209 fiches d'agences |
| 2. Exclusion des réseaux et franchises (Orpi, Century 21, Square Habitat, Barnes, Citya, ERA, L'Adresse…) et des fiches sans SIRET ou sans site | Fiches FNAIM | 110 agences |
| 3. Croisement SIREN avec le **répertoire officiel** : entreprise active, employeuse (effectif INSEE 2024), au plus 3 établissements, **sans opposition à l'utilisation commerciale de ses données** (champ `opposition_diffusion_commerciale`) | API Recherche d'entreprises (DINUM, données INSEE et RNE) | 53 agences |
| 4. Lecture du site de l'agence : adresse **générique publiée** (contact@, agence@…), indépendance réelle, faits vérifiables pour personnaliser | Site de chaque agence | 14 sites lus |
| 5. Retenues | | **10 agences** (8 par e-mail publié, 2 par formulaire de contact) |

**Exclusions motivées à l'étape 4** :
- **CBRE Axite** (Annecy) : affiliée au réseau CBRE et présente sur 8 sites. Hors du cœur de cible des indépendants.
- **AJP Mateille** (Biarritz) : réseau AJP.
- **Bersot** (Évian) : groupe de 14 agences.
- **Agence Immo Parent** (Anglet) : site hors service.
- **Antonin Allard** (Megève) et **Lépine & Fils** (Cannes) : sites non consultables depuis l'environnement de travail. À reprendre à la main.
- Les adresses de prestataires (`la-boite-immo.com`, `leseditionscorses.com`, `tascloudservices.fr`) et celle du médiateur de la consommation (`anmconso.com`) ont été écartées. Les adresses **nominatives** des salariés, bien que publiées, ont été volontairement ignorées au profit des adresses génériques.

## Conformité : règles appliquées

1. **B2B en régime d'opposition (opt-out)** : sans consentement préalable, la prospection par e-mail vers un professionnel est possible si l'objet est **en rapport avec son activité** (ici, une obligation légale de l'agent immobilier), s'il en est informé et s'il peut s'y opposer simplement et gratuitement. Sources : article L. 34-5 du Code des postes et des communications électroniques (CPCE) et doctrine de la CNIL sur la prospection B2B. Fiche CNIL : https://www.cnil.fr/la-prospection-commerciale-par-sms-mms.
2. **Adresses génériques de l'entreprise, publiées par elle-même**, jamais devinées (pas de reconstitution « prenom.nom@ », pratique encadrée par la CNIL en 2026). Pas d'achat de fichier.
3. **Information sur l'origine des données** dès le premier message (article 14 du RGPD) et **opposition à chaque message** (« répondez STOP »). L'opposition est traitée sous 48 h et inscrite dans `oppositions.csv`. Une entreprise inscrite n'est plus jamais contactée.
4. **Respect des oppositions publiques** : seules les entreprises **sans** opposition à l'utilisation commerciale de leurs données dans le répertoire officiel ont été retenues.
5. **Pas de pixel de suivi** ni de suivi individuel des ouvertures. La recommandation de la CNIL sur les pixels dans les courriels (avril 2026) exige le consentement pour ce suivi.
6. **Loyauté** : expéditeur identifié, objet honnête, aucune imitation d'un organisme officiel, mention explicite de l'absence d'affiliation à une administration, aucune pression ni fausse urgence. C'est l'inverse des arnaques au « DUERP » ou aux « annuaires ».
7. **Minimisation et durée** : on ne conserve que les données professionnelles nécessaires, 3 ans après le dernier contact au plus, et on les supprime immédiatement en cas d'opposition. Ce traitement est décrit dans la politique de confidentialité du site (`site/public/legal/confidentialite.html`).

## Procédure d'envoi (à faire par le fondateur)

1. **Prérequis** : site en ligne (le diagnostic doit fonctionner), adresse e-mail sur le domaine de Probant avec SPF, DKIM et DMARC configurés, pages légales relues et publiées.
2. **Envoi manuel** depuis la messagerie professionnelle, **en texte simple**, sans pièce jointe ni lien raccourci. Au plus 20 à 30 envois par jour.
3. **Avant chaque envoi** : relire le message, compléter les champs entre crochets, vérifier `oppositions.csv`.
4. **Suivi** : mettre à jour la colonne `statut` de `prospects.csv` (envoyé le, réponse, démo, client, opposition).
5. **Une seule relance**, à J+7 ouvrés, uniquement sans réponse ni opposition.
6. **Formulaires de contact** (P09, P10) : soumettre le message tel quel, une seule fois.

## Passer à l'échelle

```bash
python3 prospection/outils/candidats_api.py --ville 74120 --ville 83990 > candidats.csv
```

Le script interroge l'API officielle (données publiques, Licence Ouverte) et **exclut d'office** les entreprises opposées à la prospection. La suite reste manuelle et qualitative : écarter les réseaux, lire le site, trouver une adresse générique publiée, personnaliser à partir d'un fait vérifiable. Compter environ 5 minutes par agence. Objectif de la stratégie : 60 agences par semaine.

> Ne pas extraire en masse l'annuaire FNAIM (droit du producteur de base de données, conditions d'utilisation du site). Il sert uniquement à vérifier une agence ponctuellement.
