'use strict';
// Business-logic tests run the actual shipped sample sources with controlled
// async SDK replies. The small DOM fixture is not browser/hardware acceptance.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..', 'examples');
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const flush = () => new Promise(resolve => setImmediate(resolve));

test('provider serializes pending activation, deactivation and replacement activation', async () => {
  const sdkRegistration = deferred(), sdkUnregister = deferred();
  let registrations = 0, unregisters = 0, active = false;
  const sdk = { input: {
    async registerProvider() { registrations++; if (registrations === 1) await sdkRegistration.promise; active = true; return { selected: true }; },
    async unregisterProvider() { unregisters++; await sdkUnregister.promise; active = false; },
  } };
  const sandbox = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'input-provider', 'index.js'), 'utf8'), sandbox);
  const first = sandbox.exports.activate(sdk);
  const stopping = sandbox.exports.deactivate();
  const replacement = sandbox.exports.activate(sdk);
  await flush();
  assert.equal(registrations, 1, 'Replacement must wait for the first activation and its shutdown.');
  sdkRegistration.resolve(); await flush();
  assert.equal(unregisters, 1);
  assert.equal(registrations, 1, 'A delayed old unregister must finish before replacement registers.');
  sdkUnregister.resolve(); await Promise.all([first, stopping, replacement]);
  assert.equal(registrations, 2); assert.equal(active, true);
  await sandbox.exports.activate(sdk);
  assert.equal(registrations, 2, 'Duplicate activation is idempotent.');
});

test('provider lifecycle queue recovers from a rejected registration', async () => {
  let attempts = 0;
  const sdk = { input: { async registerProvider() { if (++attempts === 1) throw new Error('not authorized'); }, async unregisterProvider() {} } };
  const sandbox = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'input-provider', 'index.js'), 'utf8'), sandbox);
  await assert.rejects(sandbox.exports.activate(sdk), /not authorized/);
  await sandbox.exports.activate(sdk);
  assert.equal(attempts, 2);
});

function workFixture(sdk) {
  class Element {
    constructor() { this.listeners = new Map(); this.value = ''; this.textContent = ''; }
    addEventListener(type, callback) { this.listeners.set(type, callback); }
    dispatch(type) { return this.listeners.get(type)?.({ target: this }); }
  }
  class Select extends Element {}
  const elements = Object.fromEntries(['connect', 'settings', 'status', 'count'].map(id => [id, new Element()]));
  elements.context = new Select(); elements.context.value = 'gameplay';
  const document = { getElementById: id => elements[id], addEventListener() {} };
  const html = fs.readFileSync(path.join(root, 'input-work', 'game.html'), 'utf8');
  const script = /<script>([\s\S]*?)<\/script>/.exec(html)[1];
  vm.runInNewContext(script, { window: { pet: sdk, addEventListener() {} }, document, HTMLSelectElement: Select, HTMLInputElement: Element, HTMLButtonElement: Element, requestAnimationFrame() {} });
  return elements;
}

test('work retains the chosen menu context when connecting later', async () => {
  const contexts = [];
  const sdk = { capabilities: { async request() {} }, input: {
    async connect() { return { sessionId: 'new-session' }; },
    setContext(session, context) { contexts.push([session, context]); },
    onStatus() { return () => {}; },
  } };
  const elements = workFixture(sdk);
  elements.context.value = 'menu'; elements.context.dispatch('change');
  await elements.connect.dispatch('click');
  assert.deepEqual(contexts, [['new-session', 'menu']]);
});

test('rapid work connection clicks share one pending authorization and connection', async () => {
  const grant = deferred(); let requests = 0, connects = 0;
  const sdk = { capabilities: { async request() { requests++; await grant.promise; } }, input: {
    async connect() { connects++; return { sessionId: 'new-session' }; },
    setContext() {}, onStatus() { return () => {}; },
  } };
  const elements = workFixture(sdk);
  const first = elements.connect.dispatch('click'), second = elements.connect.dispatch('click');
  assert.equal(requests, 1);
  grant.resolve(); await Promise.all([first, second]);
  assert.equal(connects, 1);
});
