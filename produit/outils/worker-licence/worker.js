// Cloudflare Worker : émission automatique des licences après paiement Stripe.
//
//   POST /stripe                    webhook Stripe « checkout.session.completed » → licence envoyée par e-mail (Brevo)
//   GET  /licence?session_id=cs_…   page de confirmation après paiement → licence affichée immédiatement
//
// Secrets (wrangler secret put …) : LICENCE_CLE_PRIVEE (JWK JSON), STRIPE_WEBHOOK_SECRET, STRIPE_SECRET_KEY, BREVO_API_KEY
// Variables (wrangler.toml)       : EXPEDITEUR_EMAIL, EXPEDITEUR_NOM, URL_APPLICATION
// Aucune donnée client n'est stockée par le Worker.
import { signerLicence, PLANS } from '../../src/licence.js';
import { ajouterMois, aujourdHui } from '../../src/moteur/dates.js';

const enc = new TextEncoder();

async function hmacHex(secret, message) {
  const cle = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', cle, enc.encode(message)));
  return [...sig].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function egaliteConstante(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/** Vérifie l'en-tête Stripe-Signature (schéma v1, HMAC-SHA256 de « t.corps »). */
export async function verifierSignatureStripe(corps, entete, secret, maintenantSec = Math.floor(Date.now() / 1000), tolerance = 300) {
  if (!entete || !secret) return false;
  const morceaux = {};
  const v1 = [];
  for (const p of entete.split(',')) {
    const [k, v] = p.split('=');
    if (k === 't') morceaux.t = v;
    if (k === 'v1') v1.push(v);
  }
  const t = Number(morceaux.t);
  if (!Number.isFinite(t) || Math.abs(maintenantSec - t) > tolerance || !v1.length) return false;
  const attendu = await hmacHex(secret, `${morceaux.t}.${corps}`);
  return v1.some((s) => egaliteConstante(s, attendu));
}

const champ = (session, cle) => session.custom_fields?.find((f) => f.key === cle)?.text?.value?.trim() || '';

export function donneesLicence(session, aujourdhui) {
  const plan = session.metadata?.plan === 'multi' ? 'multi' : 'agence';
  const siren = champ(session, 'siren').replace(/\D/g, '').slice(0, 9);
  return {
    v: 1,
    id: `LIC-${aujourdhui.slice(0, 4)}-${String(session.id).slice(-8).toUpperCase()}`,
    agence: (champ(session, 'raisonsociale') || session.customer_details?.name || 'Agence').slice(0, 120),
    ...(siren ? { siren } : {}),
    plan,
    etablissements: PLANS[plan].etablissements,
    emis: aujourdhui,
    exp: ajouterMois(aujourdhui, 12),
  };
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function corpsEmail(donnees, cle, env) {
  return `<p>Bonjour,</p>
<p>Merci pour votre confiance. Voici la licence Probant de <strong>${esc(donnees.agence)}</strong> (${esc(PLANS[donnees.plan].libelle)}, valable jusqu’au ${donnees.exp.split('-').reverse().join('/')}) :</p>
<pre style="white-space:pre-wrap;word-break:break-all;background:#f4f6fa;padding:12px;border-radius:8px">${esc(cle)}</pre>
<p>Pour l’activer : ouvrez Probant (${esc(env.URL_APPLICATION || '')}), menu <strong>Paramètres</strong>, collez la clé, puis « Activer la licence ».</p>
<p>Vos documents deviennent nominatifs et sans filigrane. La facture vous est envoyée séparément par notre prestataire de paiement.</p>
<p>Une question ? Répondez simplement à cet e-mail.</p><p>— L’équipe Probant</p>`;
}

async function envoyerEmail(env, destinataire, donnees, cle) {
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { email: env.EXPEDITEUR_EMAIL, name: env.EXPEDITEUR_NOM || 'Probant' },
      to: [{ email: destinataire }],
      subject: `Votre licence Probant — ${donnees.agence}`,
      htmlContent: corpsEmail(donnees, cle, env),
    }),
  });
  if (!r.ok) throw new Error(`Envoi de l’e-mail impossible (${r.status})`);
}

async function lireSession(env, id) {
  const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`, { headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } });
  if (!r.ok) return null;
  return r.json();
}

function pageLicence(donnees, cle, env) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Votre licence Probant</title>
<style>body{font-family:system-ui,Segoe UI,Roboto,sans-serif;max-width:680px;margin:40px auto;padding:0 16px;color:#14213d;background:#f4f6fa}main{background:#fff;border-radius:12px;padding:28px;box-shadow:0 4px 16px rgba(20,33,61,.08)}textarea{width:100%;font-family:ui-monospace,monospace;font-size:13px;padding:10px;border-radius:8px;border:1px solid #b9c1d0}button,a.btn{display:inline-block;margin-top:10px;background:#14213d;color:#fff;border:0;border-radius:8px;padding:10px 16px;font:inherit;font-weight:600;cursor:pointer;text-decoration:none}</style></head>
<body><main><h1>Merci ! Voici votre licence</h1>
<p><strong>${esc(donnees.agence)}</strong> — ${esc(PLANS[donnees.plan].libelle)} — valable jusqu’au ${donnees.exp.split('-').reverse().join('/')}.</p>
<textarea id="cle" rows="5" readonly>${esc(cle)}</textarea>
<button type="button" onclick="navigator.clipboard.writeText(document.getElementById('cle').value);this.textContent='Copiée ✓'">Copier la clé</button>
<p>Ouvrez Probant, menu <strong>Paramètres</strong>, collez la clé puis « Activer la licence ». Elle vous est aussi envoyée par e-mail.</p>
${env.URL_APPLICATION ? `<a class="btn" href="${esc(env.URL_APPLICATION)}">Ouvrir Probant</a>` : ''}</main></body></html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (request.method === 'POST' && url.pathname === '/stripe') {
        const corps = await request.text();
        if (!(await verifierSignatureStripe(corps, request.headers.get('stripe-signature'), env.STRIPE_WEBHOOK_SECRET))) return new Response('Signature invalide', { status: 400 });
        const evenement = JSON.parse(corps);
        if (evenement.type !== 'checkout.session.completed') return new Response('Ignoré', { status: 200 });
        const session = evenement.data.object;
        if (session.payment_status !== 'paid') return new Response('Paiement non finalisé', { status: 200 });
        const donnees = donneesLicence(session, aujourdHui());
        const cle = await signerLicence(donnees, JSON.parse(env.LICENCE_CLE_PRIVEE));
        const email = session.customer_details?.email;
        if (email) await envoyerEmail(env, email, donnees, cle);
        return new Response('OK', { status: 200 });
      }
      if (request.method === 'GET' && url.pathname === '/licence') {
        const id = url.searchParams.get('session_id') || '';
        if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return new Response('Session invalide', { status: 400 });
        const session = await lireSession(env, id);
        if (!session || session.payment_status !== 'paid') return new Response('Paiement introuvable ou non finalisé. Si vous venez de payer, actualisez la page dans quelques secondes.', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
        const donnees = donneesLicence(session, aujourdHui());
        const cle = await signerLicence(donnees, JSON.parse(env.LICENCE_CLE_PRIVEE));
        return new Response(pageLicence(donnees, cle, env), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' } });
      }
      return new Response('Introuvable', { status: 404 });
    } catch (err) {
      return new Response('Erreur interne', { status: 500 });
    }
  },
};
