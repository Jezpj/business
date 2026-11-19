// Listes de pays à risque utilisées par la classification et les fiches de vigilance.
// ⚠ Données datées : à mettre à jour après chaque plénière du GAFI (février, juin, octobre)
// et après chaque acte délégué de la Commission européenne. Une seule source de vérité : ce fichier.

export const LISTES_PAYS = {
  dateMaj: '2026-11-19',
  gafiNoire: {
    titre: 'GAFI — juridictions à haut risque faisant l’objet d’un appel à l’action (« liste noire »)',
    date: '2026-10-30',
    source: 'https://www.fatf-gafi.org/en/publications/High-risk-and-other-monitored-jurisdictions.html',
    pays: { IR: 'contre-mesures', KP: 'contre-mesures', MM: 'vigilance renforcée' },
  },
  gafiGrise: {
    titre: 'GAFI — juridictions sous surveillance renforcée (« liste grise »)',
    date: '2026-10-30',
    source: 'https://www.fatf-gafi.org/en/publications/High-risk-and-other-monitored-jurisdictions/increased-monitoring-october-2026.html',
    pays: ['AO', 'BO', 'BA', 'CM', 'HT', 'IQ', 'KE', 'KW', 'LA', 'LB', 'NP', 'PG', 'SS', 'SY', 'VE', 'VN', 'VG', 'YE'],
  },
  ue: {
    titre: 'UE — pays tiers à haut risque (règlement délégué 2016/1675 modifié, notamment par 2025/1184, 2026/46 et 2026/83)',
    date: '2026-01-29',
    source: 'https://finance.ec.europa.eu/financial-crime/anti-money-laundering-and-countering-financing-terrorism-international-level_en',
    pays: ['AF', 'DZ', 'AO', 'BO', 'CM', 'CI', 'KP', 'HT', 'IR', 'KE', 'LA', 'LB', 'MC', 'MM', 'NA', 'NP', 'CD', 'RU', 'SS', 'SY', 'TT', 'VU', 'VE', 'VN', 'YE', 'VG'],
  },
};

// Codes ISO 3166-1 alpha-2 (les noms sont fournis en français par Intl.DisplayNames).
const CODES = ('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW').split(' ');

let noms = null;
function nomsPays() {
  if (noms) return noms;
  let dn = null;
  try { dn = new Intl.DisplayNames(['fr'], { type: 'region' }); } catch { dn = null; }
  noms = CODES.map((code) => ({ code, nom: (dn && dn.of(code)) || code }))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  return noms;
}

export function listePays() { return nomsPays(); }

export function nomPays(code) {
  if (!code) return '';
  const p = nomsPays().find((x) => x.code === code);
  return p ? p.nom : code;
}

/** Renvoie les listes sur lesquelles figure un pays, et le niveau de risque qui en découle. */
export function risquePays(code) {
  if (!code || code === 'FR') return { listes: [], niveau: null };
  const listes = [];
  if (LISTES_PAYS.gafiNoire.pays[code]) listes.push('gafiNoire');
  if (LISTES_PAYS.gafiGrise.pays.includes(code)) listes.push('gafiGrise');
  if (LISTES_PAYS.ue.pays.includes(code)) listes.push('ue');
  const niveau = listes.includes('gafiNoire') ? 'tres-eleve' : listes.length ? 'eleve' : null;
  return { listes, niveau };
}

export const LIBELLE_LISTE = {
  gafiNoire: 'liste noire GAFI',
  gafiGrise: 'liste grise GAFI',
  ue: 'liste UE des pays tiers à haut risque',
};

export function libelleRisquePays(code) {
  const { listes } = risquePays(code);
  return listes.map((l) => LIBELLE_LISTE[l]).join(', ');
}
