import { html } from '../ui/html.js';
import { enTete, champ, encadre } from '../ui/composants.js';

export function rendre(app) {
  const c = (o) => champ({ app, ...o });
  return html`
${enTete('Identité de l’agence', 'Ces informations figurent sur tous les documents du dossier.')}
${encadre(html`Vos données restent <strong>dans ce navigateur</strong>, sur cet ordinateur. Probant ne les envoie nulle part. Pensez à télécharger une sauvegarde régulièrement (menu <a href="#/parametres">Paramètres</a>).`)}
<form class="carte formulaire" onsubmit="return false" aria-labelledby="t-id">
  <h2 id="t-id">Société</h2>
  <div class="grille-champs">
    ${c({ champ: 'agence.raisonSociale', libelle: 'Raison sociale', requis: true, autocomplete: 'organization' })}
    ${c({ champ: 'agence.formeJuridique', libelle: 'Forme juridique', placeholder: 'SARL, SAS, EI…' })}
    ${c({ champ: 'agence.siren', libelle: 'SIREN', requis: true, placeholder: '9 chiffres' })}
    ${c({ champ: 'agence.reseau', libelle: 'Réseau ou enseigne (facultatif)' })}
    ${c({ champ: 'agence.adresse', libelle: 'Adresse', requis: true, autocomplete: 'street-address', classe: 'champ-large' })}
    ${c({ champ: 'agence.codePostal', libelle: 'Code postal', autocomplete: 'postal-code' })}
    ${c({ champ: 'agence.ville', libelle: 'Ville', requis: true, autocomplete: 'address-level2' })}
  </div>
  <h2>Carte professionnelle</h2>
  <div class="grille-champs">
    ${c({ champ: 'agence.carteNumero', libelle: 'Numéro de carte (mention « Transactions sur immeubles et fonds de commerce »)' })}
    ${c({ champ: 'agence.carteCci', libelle: 'CCI de délivrance' })}
    ${c({ champ: 'agence.carteValidite', libelle: 'Valable jusqu’au', type: 'date' })}
  </div>
  <h2>Représentant légal</h2>
  <div class="grille-champs">
    ${c({ champ: 'agence.dirigeantPrenom', libelle: 'Prénom', autocomplete: 'given-name' })}
    ${c({ champ: 'agence.dirigeantNom', libelle: 'Nom', requis: true, autocomplete: 'family-name' })}
    ${c({ champ: 'agence.dirigeantQualite', libelle: 'Qualité', placeholder: 'Gérant(e), Président(e)…' })}
    ${c({ champ: 'agence.email', libelle: 'E-mail professionnel', type: 'email', autocomplete: 'email' })}
    ${c({ champ: 'agence.telephone', libelle: 'Téléphone', type: 'tel', autocomplete: 'tel' })}
  </div>
</form>
<form class="carte formulaire" onsubmit="return false" aria-labelledby="t-seuils">
  <h2 id="t-seuils">Seuils internes de vigilance</h2>
  <p class="aide">Ces seuils déclenchent automatiquement les mesures dans les fiches de vigilance. Ils figurent dans la classification des risques et les procédures. Abaissez-les si votre profil de risque est élevé.</p>
  <div class="grille-champs">
    ${c({ champ: 'seuils.origineFondsMontant', libelle: 'Justifier l’origine des fonds à partir d’un apport de (€)', type: 'number', min: 0, pas: 1000 })}
    ${c({ champ: 'seuils.origineFondsPart', libelle: '… ou à partir de cette part du prix sans prêt (%)', type: 'number', min: 0, max: 100 })}
    ${c({ champ: 'seuils.comptantRenforce', libelle: 'Vigilance renforcée pour un achat sans prêt à partir de (€)', type: 'number', min: 0, pas: 10000 })}
    ${c({ champ: 'seuils.prixPrestige', libelle: 'Bien de prestige à partir de (€)', type: 'number', min: 0, pas: 50000 })}
  </div>
</form>
<p class="suite"><a class="btn btn-primaire" href="#/classification">Étape suivante : classification des risques →</a></p>`;
}

export const actions = {};
