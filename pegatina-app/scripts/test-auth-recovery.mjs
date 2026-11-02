// Pruebas aisladas: no conectan MongoDB ni envían emails o pagos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
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
