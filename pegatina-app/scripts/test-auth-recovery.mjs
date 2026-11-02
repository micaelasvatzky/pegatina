// Pruebas aisladas: no conectan MongoDB ni envían emails o pagos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { createHmac } from 'node:crypto';
const moduleRequire = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function load(file, mocks = {}, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, {
    exports, require: (name) => name in mocks ? mocks[name] : moduleRequire(name),
    console: { error() {} }, Date, URL, AbortSignal, process: { env: {} }, ...globals,
  }, { filename: file });
  return exports;
}

const tokens = load('src/lib/password-reset.ts');
const next = { NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200 }) } };
const request = (body) => ({ json: async () => body });

test('tokens aleatorios, hash sin token original y formato estricto', () => {
  const a = tokens.createResetToken(), b = tokens.createResetToken();
  assert.notEqual(a.token, b.token);
  assert.equal(tokens.validResetToken(a.token), true);
  assert.equal(tokens.hashResetToken(a.token), a.hash);
  assert.notEqual(a.token, a.hash);
  for (const bad of [undefined, '', 'x'.repeat(64), {}, 'a'.repeat(63)]) {
    assert.equal(tokens.validResetToken(bad), false);
  }
});

test('reset: vencimiento, consumo único y dos intentos simultáneos', async () => {
  const issued = tokens.createResetToken();
  let user = { hash: issued.hash, expires: new Date(Date.now() + 60000), password: 'anterior' };
  let cookieCleared = 0;
  const matches = (f) => user.hash === f['password_reset.token_hash'] && user.expires > f['password_reset.expires_at'].$gt;
  const collection = {
    async findOne(f) { return matches(f) ? { _id: 'test' } : null; },
    async updateOne(f, update) {
      if (!matches(f)) return { modifiedCount: 0 };
      user.password = update.$set.password_hash;
      user.hash = null;
      return { modifiedCount: 1 };
    },
  };
  const route = load('src/app/api/auth/reset-password/route.ts', {
    'next/server': next, '@/lib/password-reset': tokens,
    '@/lib/mongodb': { getDb: async () => ({ collection: () => collection }) },
    '@/lib/auth': { hashPassword: async (p) => 'hashed:' + p, clearSessionCookie: async () => cookieCleared++ },
  });
  assert.equal((await route.POST(request({ token: issued.token, password: '123' }))).status, 400);
  user.expires = new Date(Date.now() - 1);
  assert.equal((await route.POST(request({ token: issued.token, password: 'nueva123' }))).status, 400);
  user.expires = new Date(Date.now() + 60000);
  const results = await Promise.all([1, 2].map(() => route.POST(request({ token: issued.token, password: 'nueva123' }))));
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 400]);
  assert.equal(user.password, 'hashed:nueva123');
  assert.equal(cookieCleared, 1);
  assert.equal((await route.POST(request({ token: issued.token, password: 'otra123' }))).status, 400);
});

test('recuperación: email inexistente y cooldown responden igual; fallo de envío invalida token', async () => {
  let existing = false, fail = false, sent = 0, removed = 0, issued;
  const collection = {
    async findOneAndUpdate(filter, update) {
      assert.ok(filter.$or[1]['password_reset.requested_at'].$lte instanceof Date);
      issued = update.$set.password_reset;
      return existing ? { _id: 'test', email: 'test@example.com' } : null;
    },
    async updateOne(filter) { assert.equal(filter['password_reset.token_hash'], issued.token_hash); removed++; },
  };
  const route = load('src/app/api/auth/forgot-password/route.ts', {
    'next/server': next, '@/lib/password-reset': tokens,
    '@/lib/mongodb': { getDb: async () => ({ collection: () => collection }) },
    '@/lib/email': {
      passwordEmailConfig: () => ({}),
      sendPasswordResetEmail: async (_email, token) => {
        sent++;
        assert.equal(tokens.hashResetToken(token), issued.token_hash);
        if (fail) throw new Error('proveedor no disponible');
      },
    },
  });
  const unknown = await route.POST(request({ email: 'test@example.com' }));
  assert.equal(sent, 0);
  existing = true;
  const known = await route.POST(request({ email: 'test@example.com' }));
  assert.equal(JSON.stringify(known), JSON.stringify(unknown));
  assert.equal(sent, 1);
  fail = true;
  assert.equal((await route.POST(request({ email: 'test@example.com' }))).status, 200);
  assert.equal(removed, 1);
});

test('email sin configurar: 503 antes de consultar datos', async () => {
  const route = load('src/app/api/auth/forgot-password/route.ts', {
    'next/server': next, '@/lib/password-reset': tokens,
    '@/lib/mongodb': { getDb: () => { throw new Error('No debe consultar'); } },
    '@/lib/email': { passwordEmailConfig: () => null },
  });
  assert.equal((await route.POST(request({ email: 'test@example.com' }))).status, 503);
});

test('checkout envía modo manual y cobra a Pegatina sin marketplace_fee', async () => {
  let body;
  const mp = load('src/lib/mercadopago.ts', {
    mercadopago: {
      MercadoPagoConfig: class {},
      Order: class { async create(options) { body = options.body; return { id: 'order-test', checkout_url: 'https://example.com/checkout' }; } },
    },
  }, { process: { env: { MP_ACCESS_TOKEN: 'test-no-es-una-clave', APP_URL: 'https://example.com' } } });
  await mp.crearOrderCheckout({ items: [{ title: 'Sticker', quantity: 1, unit_price: 1000 }], total: 1000, externalReference: 'test', centralizado: true });
  assert.equal(body.processing_mode, 'manual');
  assert.equal(body.total_amount, '1000.00');
  assert.equal('marketplace_fee' in body, false);
  assert.equal(body.config.online.success_url, 'https://example.com/pedidos/test?comprado=1');
});

test('webhook: firma del ID original y en minúsculas; rechaza otra clave y firma ausente', () => {
  const secret = 'clave-solo-para-pruebas';
  const mp = load('src/lib/mercadopago.ts', {}, { process: { env: { MP_NOTIFICATION_SECRET: secret } } });
  const id = 'ORDTST01M6E9P231Q13YPAJWDKCYPE3J';
  const signature = (dataId, key = secret) => 'ts=1742505638683,v1=' + createHmac('sha256', key)
    .update(`id:${dataId};request-id:test-request;ts:1742505638683;`).digest('hex');
  for (const signedId of [id, id.toLowerCase()]) {
    assert.equal(mp.validarFirmaWebhook({ dataId: id, xRequestId: 'test-request', xSignature: signature(signedId) }), true);
  }
  assert.equal(mp.validarFirmaWebhook({ dataId: id, xRequestId: 'test-request', xSignature: signature(id, 'otra-clave') }), false);
  assert.equal(mp.validarFirmaWebhook({ dataId: id, xRequestId: 'test-request', xSignature: '' }), false);
});

test('webhook: una order acreditada actualiza el pedido solo después de verificar firma y consultar MP', async () => {
  const secret = 'clave-solo-para-pruebas';
  const id = 'ORDTST01M6E9P231Q13YPAJWDKCYPE3J', pedidoId = '6ae89a60407b320adf05bd32';
  const mp = load('src/lib/mercadopago.ts', {}, { process: { env: { MP_NOTIFICATION_SECRET: secret } } });
  let updates = 0, queries = 0;
  const route = load('src/app/api/mercadopago/webhook/route.ts', {
    'next/server': next,
    '@/lib/errors': { mensajeDeError: (e) => e.message },
    '@/lib/mongodb': { getDb: async () => ({ collection: () => ({ updateOne: async (filter, change) => {
      assert.equal(filter._id.toString(), pedidoId);
      assert.equal(change.$set['pago.estado'], 'aprobado');
      assert.equal(change.$set['pago.order_id'], id);
      updates++;
      return { modifiedCount: 1 };
    } }) }) },
    '@/lib/mercadopago': { ...mp, obtenerOrder: async () => {
      queries++;
      return { id, status: 'processed', external_reference: pedidoId, transactions: { payments: [{ id: 'PAY-test', status: 'processed' }] } };
    } },
  }, { console: { log() {}, warn() {}, error() {} } });
  const signature = 'ts=1742505638683,v1=' + createHmac('sha256', secret)
    .update(`id:${id};request-id:test-request;ts:1742505638683;`).digest('hex');
  const notification = (sig, bodyId = id) => ({
    url: `https://example.com/api/mercadopago/webhook?type=order&data.id=${id}`,
    headers: new Headers({ 'x-signature': sig, 'x-request-id': 'test-request' }),
    json: async () => ({ type: 'order', data: { id: bodyId } }),
  });
  assert.equal((await route.POST(notification('incorrecta'))).status, 401);
  assert.equal(queries, 0);
  assert.equal(updates, 0);
  assert.equal((await route.POST(notification(signature, 'ORD-diferente'))).status, 400);
  assert.equal(queries, 0);
  assert.equal((await route.POST(notification(signature))).status, 200);
  assert.equal(queries, 1);
  assert.equal(updates, 1);
});
