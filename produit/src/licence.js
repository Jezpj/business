// Licences nominatives Probant : charge utile JSON signée en ECDSA P-256 / SHA-256.
// Format : « PRB1.<charge utile base64url>.<signature base64url> ». Vérification 100 % hors ligne.
// Fonctionne dans le navigateur et dans Node (globalThis.crypto.subtle).

const PREFIXE = 'PRB1';
const ALGO = { name: 'ECDSA', namedCurve: 'P-256' };
const SIGN = { name: 'ECDSA', hash: 'SHA-256' };
export const PLANS = {
  agence: { libelle: 'Licence Agence', etablissements: 1 },
  multi: { libelle: 'Licence Multi-agences', etablissements: 5 },
};

function subtle() {
  const s = globalThis.crypto && globalThis.crypto.subtle;
  if (!s) throw new Error('Cryptographie indisponible dans ce navigateur.');
  return s;
}

export function versBase64Url(octets) {
  let bin = '';
  const u8 = octets instanceof Uint8Array ? octets : new Uint8Array(octets);
  for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function depuisBase64Url(texte) {
  const b64 = texte.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((texte.length + 3) % 4);
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
}

const versOctets = (s) => new TextEncoder().encode(s);
const depuisOctets = (u8) => new TextDecoder().decode(u8);

export async function signerLicence(donnees, jwkPrivee) {
  const cle = await subtle().importKey('jwk', jwkPrivee, ALGO, false, ['sign']);
  const charge = versBase64Url(versOctets(JSON.stringify(donnees)));
  const signature = await subtle().sign(SIGN, cle, versOctets(`${PREFIXE}.${charge}`));
  return `${PREFIXE}.${charge}.${versBase64Url(new Uint8Array(signature))}`;
}

/**
 * Vérifie une licence. Ne lève jamais d'exception : renvoie { valide, raison, donnees }.
 * @param {string} cle          licence saisie par le client
 * @param {object|null} jwk     clé publique intégrée au build
 * @param {string} aujourdhui   date ISO du jour
 */
export async function verifierLicence(cle, jwk, aujourdhui) {
  try {
    if (!jwk) return { valide: false, raison: 'Les licences ne sont pas configurées sur cette copie de Probant.' };
    const texte = String(cle || '').trim().replace(/\s+/g, '');
    const morceaux = texte.split('.');
    if (morceaux.length !== 3 || morceaux[0] !== PREFIXE) return { valide: false, raison: 'Format de licence non reconnu.' };
    const [, charge, sig] = morceaux;
    const publique = await subtle().importKey('jwk', jwk, ALGO, false, ['verify']);
    const ok = await subtle().verify(SIGN, publique, depuisBase64Url(sig), versOctets(`${PREFIXE}.${charge}`));
    if (!ok) return { valide: false, raison: 'Signature invalide : cette licence n’a pas été émise par Probant.' };
    const donnees = JSON.parse(depuisOctets(depuisBase64Url(charge)));
    if (donnees.v !== 1 || !PLANS[donnees.plan] || !donnees.agence || !donnees.exp) return { valide: false, raison: 'Licence incomplète.' };
    if (donnees.exp < aujourdhui) return { valide: false, raison: `Licence expirée le ${donnees.exp.split('-').reverse().join('/')}.`, donnees, expiree: true };
    return { valide: true, raison: '', donnees };
  } catch {
    return { valide: false, raison: 'Licence illisible.' };
  }
}
