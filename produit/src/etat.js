// État de l'application, persistant dans le navigateur (localStorage). Aucune donnée n'est envoyée sur Internet.
import { SEUILS_DEFAUT } from './contenus/questions-profil.js';

export const CLE_STOCKAGE = 'probant:v1';
export const FORMAT = 'probant-sauvegarde';
export const VERSION_SCHEMA = 1;

export function etatInitial() {
  return {
    schema: VERSION_SCHEMA,
    creeLe: null,
    agence: {
      raisonSociale: '', formeJuridique: '', siren: '', adresse: '', codePostal: '', ville: '',
      carteNumero: '', carteCci: '', carteValidite: '', dirigeantPrenom: '', dirigeantNom: '', dirigeantQualite: 'Gérant(e)',
      email: '', telephone: '', reseau: '',
    },
    seuils: { ...SEUILS_DEFAUT },
    profil: {},              // réponses au questionnaire de classification
    ajustements: {},         // ajustements motivés de niveaux
    classification: { dateValidation: '', validePar: '', version: 0 },
    procedures: { dateValidation: '', validePar: '', delaiAlerte: '24 heures', delaiAnalyse: '5 jours ouvrés', archivage: '' },
    tracfin: {
      responsable: { prenom: '', nom: '', fonction: '' },
      declarant: { prenom: '', nom: '', fonction: '', email: '', telephone: '' },
      correspondant: { prenom: '', nom: '', fonction: '', email: '', telephone: '' },
      memePersonne: true, ermesEnregistre: false, dateEnregistrement: '', dateDesignation: '',
    },
    equipe: [],              // { id, prenom, nom, fonction, dateArrivee, dateDepart, formations: [] }
    vigilances: [],          // fiches de vigilance
    autocontroles: [],       // { id, date, reponses, score }
    autocontroleEnCours: {},
    licence: { cle: '' },
    journal: [],             // traçabilité : { date, heure, action }
    compteurs: { fiches: 0, attestations: 0 },
  };
}

function fusionner(base, sauve) {
  if (Array.isArray(base)) return Array.isArray(sauve) ? sauve : base;
  if (base && typeof base === 'object') {
    const out = { ...base };
    if (sauve && typeof sauve === 'object' && !Array.isArray(sauve)) {
      for (const k of Object.keys(sauve)) out[k] = k in base ? fusionner(base[k], sauve[k]) : sauve[k];
    }
    return out;
  }
  return sauve === undefined ? base : sauve;
}

export function normaliser(brut) {
  return fusionner(etatInitial(), brut || {});
}

export function charger(stockage = globalThis.localStorage) {
  try {
    const texte = stockage?.getItem(CLE_STOCKAGE);
    return texte ? normaliser(JSON.parse(texte)) : etatInitial();
  } catch {
    return etatInitial();
  }
}

export function sauvegarder(etat, stockage = globalThis.localStorage) {
  try {
    stockage?.setItem(CLE_STOCKAGE, JSON.stringify(etat));
    return true;
  } catch {
    return false;
  }
}

export function exporter(etat, version, date) {
  return JSON.stringify({ format: FORMAT, version, exporteLe: date, etat }, null, 2);
}

export function importer(texte) {
  let obj;
  try { obj = JSON.parse(texte); } catch { throw new Error('Fichier illisible : ce n’est pas une sauvegarde Probant.'); }
  if (!obj || obj.format !== FORMAT || typeof obj.etat !== 'object') throw new Error('Ce fichier n’est pas une sauvegarde Probant.');
  return normaliser(obj.etat);
}

export function journaliser(etat, action, maintenant = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  const date = `${maintenant.getFullYear()}-${p(maintenant.getMonth() + 1)}-${p(maintenant.getDate())}`;
  const heure = `${p(maintenant.getHours())}:${p(maintenant.getMinutes())}`;
  etat.journal.unshift({ date, heure, action });
  if (etat.journal.length > 500) etat.journal.length = 500;
}

/** Lecture / écriture par chemin pointé : « agence.raisonSociale », « parties.0.nom ». */
export function lire(obj, chemin) {
  return chemin.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function ecrire(obj, chemin, valeur) {
  const cles = chemin.split('.');
  let o = obj;
  for (let i = 0; i < cles.length - 1; i++) {
    const k = cles[i];
    if (o[k] == null || typeof o[k] !== 'object') o[k] = /^\d+$/.test(cles[i + 1]) ? [] : {};
    o = o[k];
  }
  const der = cles[cles.length - 1];
  if (der === '__proto__' || der === 'constructor' || der === 'prototype') return;
  o[der] = valeur;
}
