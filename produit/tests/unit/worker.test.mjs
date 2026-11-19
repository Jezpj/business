import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto, createHmac } from 'node:crypto';
import worker, { verifierSignatureStripe, donneesLicence } from '../../outils/worker-licence/worker.js';
import { verifierLicence } from '../../src/licence.js';

const SECRET = 'whsec_test_123';
const signer = (corps, t) => `t=${t},v1=${createHmac('sha256', SECRET).update(`${t}.${corps}`).digest('hex')}`;

async function paireCles() {
  const p = await webcrypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  return { pub: await webcrypto.subtle.exportKey('jwk', p.publicKey), priv: await webcrypto.subtle.exportKey('jwk', p.privateKey) };
}

const session = {
  id: 'cs_test_a1B2c3D4e5F6g7H8', payment_status: 'paid', metadata: { plan: 'agence' },
  customer_details: { email: 'gerant@agence-test.invalid', name: 'Alice Durand' },
  custom_fields: [{ key: 'raisonsociale', text: { value: 'Agence Test <b>Immo</b>' } }, { key: 'siren', text: { value: '123 456 789' } }],
};

test('worker : signature Stripe valide, falsifiée ou périmée', async () => {
  const corps = '{"id":"evt_1"}';
  const t = 1_800_000_000;
  assert.equal(await verifierSignatureStripe(corps, signer(corps, t), SECRET, t + 10), true);
  assert.equal(await verifierSignatureStripe(corps + ' ', signer(corps, t), SECRET, t + 10), false);
  assert.equal(await verifierSignatureStripe(corps, signer(corps, t), SECRET, t + 1000), false);
  assert.equal(await verifierSignatureStripe(corps, null, SECRET, t), false);
});

test('worker : données de licence issues de la session', () => {
  const d = donneesLicence(session, '2026-11-19');
  assert.equal(d.agence, 'Agence Test <b>Immo</b>');
  assert.equal(d.siren, '123456789');
  assert.equal(d.exp, '2027-11-19');
  assert.equal(d.id, 'LIC-2026-E5F6G7H8');
});

test('worker : webhook payé → licence valide envoyée par e-mail, nom échappé', async () => {
  const { pub, priv } = await paireCles();
  const env = { STRIPE_WEBHOOK_SECRET: SECRET, LICENCE_CLE_PRIVEE: JSON.stringify(priv), BREVO_API_KEY: 'k', EXPEDITEUR_EMAIL: 'licences@exemple.invalid', URL_APPLICATION: 'https://exemple.invalid/app/' };
  const corps = JSON.stringify({ type: 'checkout.session.completed', data: { object: session } });
  const envois = [];
  const fetchOrigine = globalThis.fetch;
  globalThis.fetch = async (url, init) => { envois.push({ url, init }); return new Response('{}', { status: 201 }); };
  try {
    const rep = await worker.fetch(new Request('https://w.invalid/stripe', { method: 'POST', body: corps, headers: { 'stripe-signature': signer(corps, Math.floor(Date.now() / 1000)) } }), env);
    assert.equal(rep.status, 200);
    assert.equal(envois.length, 1);
    assert.equal(envois[0].url, 'https://api.brevo.com/v3/smtp/email');
    const message = JSON.parse(envois[0].init.body);
    assert.equal(message.to[0].email, 'gerant@agence-test.invalid');
    assert.ok(!message.htmlContent.includes('<b>Immo</b>'), 'nom échappé dans l’e-mail');
    const cle = message.htmlContent.match(/PRB1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/)[0];
    const v = await verifierLicence(cle, pub, '2026-11-19');
    assert.equal(v.valide, true);
    const mauvaise = await worker.fetch(new Request('https://w.invalid/stripe', { method: 'POST', body: corps, headers: { 'stripe-signature': 't=1,v1=00' } }), env);
    assert.equal(mauvaise.status, 400);
  } finally { globalThis.fetch = fetchOrigine; }
});

test('worker : page de confirmation affiche la licence si la session est payée', async () => {
  const { pub, priv } = await paireCles();
  const env = { STRIPE_SECRET_KEY: 'sk_test', LICENCE_CLE_PRIVEE: JSON.stringify(priv), URL_APPLICATION: 'https://exemple.invalid/app/' };
  const fetchOrigine = globalThis.fetch;
  globalThis.fetch = async (url) => (String(url).includes(session.id) ? new Response(JSON.stringify(session), { status: 200 }) : new Response('', { status: 404 }));
  try {
    const rep = await worker.fetch(new Request(`https://w.invalid/licence?session_id=${session.id}`), env);
    assert.equal(rep.status, 200);
    const page = await rep.text();
    const cle = page.match(/PRB1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/)[0];
    assert.equal((await verifierLicence(cle, pub, '2026-11-19')).valide, true);
    assert.equal((await worker.fetch(new Request('https://w.invalid/licence?session_id=../../x'), env)).status, 400);
    assert.equal((await worker.fetch(new Request('https://w.invalid/licence?session_id=cs_inconnu'), env)).status, 404);
  } finally { globalThis.fetch = fetchOrigine; }
});

test('outil licence : signature puis vérification, licence expirée refusée', async () => {
  const { pub, priv } = await paireCles();
  const { signerLicence } = await import('../../src/licence.js');
  const cle = await signerLicence({ v: 1, id: 'LIC-2026-0001', agence: 'A', plan: 'multi', emis: '2026-11-19', exp: '2027-11-19' }, priv);
  assert.equal((await verifierLicence(cle, pub, '2026-11-19')).valide, true);
  assert.equal((await verifierLicence(cle, pub, '2027-11-20')).valide, false);
  const autre = await paireCles();
  assert.equal((await verifierLicence(cle, autre.pub, '2026-11-19')).valide, false);
  assert.equal((await verifierLicence('n’importe quoi', pub, '2026-11-19')).valide, false);
  assert.equal((await verifierLicence(cle, null, '2026-11-19')).valide, false);
});
