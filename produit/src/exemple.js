// Agence d'exemple FICTIVE, pour découvrir Probant. Aucune donnée réelle.
import { etatInitial } from './etat.js';
import { nouvelleFiche, nouvellePartie, nouveauBeneficiaire } from './moteur/vigilance.js';

export function etatExemple(aujourdhui) {
  const e = etatInitial();
  e.creeLe = aujourdhui;
  e.exemple = true;
  Object.assign(e.agence, {
    raisonSociale: 'Agence Exemple du Lac (fictive)', formeJuridique: 'SARL', siren: '000000000',
    adresse: '1 quai de l’Exemple', codePostal: '74000', ville: 'Annecy',
    carteNumero: 'CPI 0000 0000 000 000 000', carteCci: 'CCI Haute-Savoie', carteValidite: '2028-03-31',
    dirigeantPrenom: 'Sophie', dirigeantNom: 'Exemple', dirigeantQualite: 'Gérante', email: 'contact@agence-exemple.invalid',
  });
  e.profil = {
    prixMoyen: 'moyen', prestige: 'faible', fondsCommerce: 'jamais', locationHaut: 'non', neufInvest: 'non', biensAtypiques: 'non',
    comptant: 'moyenne', fondsEtrangers: 'parfois', tiersPayeurs: 'frequent', reventesRapides: 'rare',
    distance: 'parfois', apporteurs: 'non', agentsCommerciaux: 'peu', plateformes: 'non',
    nonResidents: 'moyenne', personnesMorales: 'regulier', structuresComplexes: 'jamais', ppe: 'possible', investisseurs: 'faible',
    zone: 'frontalier', paysRisque: [], offshore: 'jamais',
  };
  e.tracfin.responsable = { prenom: 'Sophie', nom: 'Exemple', fonction: 'Gérante' };
  e.tracfin.declarant = { prenom: 'Sophie', nom: 'Exemple', fonction: 'Gérante', email: 'contact@agence-exemple.invalid', telephone: '' };
  e.tracfin.memePersonne = true;
  e.equipe = [
    { id: 'ex1', prenom: 'Sophie', nom: 'Exemple', fonction: 'dirigeant', dateArrivee: '2014-09-01', dateDepart: '', formations: [] },
    { id: 'ex2', prenom: 'Lucas', nom: 'Démo', fonction: 'negociateur', dateArrivee: '2025-02-03', dateDepart: '', formations: [] },
    { id: 'ex3', prenom: 'Nina', nom: 'Fictive', fonction: 'agentCommercial', dateArrivee: aujourdhui, dateDepart: '', formations: [] },
    { id: 'ex4', prenom: 'Paul', nom: 'Essai', fonction: 'assistant', dateArrivee: '2021-05-10', dateDepart: '', formations: [] },
  ];
  const f = nouvelleFiche({ numero: 1, date: aujourdhui });
  f.objet = 'Achat d’une résidence secondaire par un acquéreur résidant en Suisse';
  f.bien = { adresse: '12 chemin du Lac, 74290 Talloires (fictif)', nature: 'maison', prix: '980000', loyer: '' };
  Object.assign(f.parties[0], { nom: 'Vendeur', prenom: 'Claire', dateNaissance: '1958-02-11', lieuNaissance: 'Lyon', ppe: 'non' });
  f.parties[0].verification = { piece: 'cni', numero: 'EXEMPLE01', expiration: '2031-01-01', date: aujourdhui, par: 'Lucas Démo', mode: 'presentiel' };
  f.parties[0].gel = { date: aujourdhui, resultat: 'aucune' };
  const pm = nouvellePartie('acquereur', false);
  Object.assign(pm, { nature: 'PM', denomination: 'SCI Exemple Montagne', forme: 'SCI', numeroRegistre: '000000001', paysImmatriculation: 'FR', representant: 'Hans Exemple (gérant)', ppe: 'non' });
  pm.verification = { piece: 'kbis', numero: '', expiration: '', date: aujourdhui, par: 'Lucas Démo', mode: 'presentiel' };
  pm.gel = { date: aujourdhui, resultat: 'aucune' };
  pm.beneficiaires = [Object.assign(nouveauBeneficiaire(), { nom: 'Exemple', prenom: 'Hans', dateNaissance: '1966-07-21', nationalite: 'CH', residence: 'CH', detention: '100 % des parts', ppe: '', gel: { date: '', resultat: '' } })];
  f.parties[1] = pm;
  f.financement = { pret: 'non', montantPret: '', apport: '980000', origines: ['revenusEtrangers'], paysFonds: 'CH', justificatifs: '', justificatifsRecus: false, tiersPayeur: false, tiersDetail: '' };
  e.vigilances = [f];
  e.compteurs.fiches = 1;
  return e;
}
