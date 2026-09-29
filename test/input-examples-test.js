'use strict';
// Compiles the actual shipped example sources and validates their declarations
// against the supplied host. This is not a Gamepad/Electron hardware test.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const host = process.env.PET_PLUGIN_HOST_DIR, types = process.env.PET_PLUGIN_TYPES_DIR;
assert(host && types, 'PET_PLUGIN_HOST_DIR and PET_PLUGIN_TYPES_DIR are required; delivery never SKIPs.');
const root = path.resolve(__dirname, '..');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pet-input-examples-'));
try {
  const provider = path.join(dir, 'input-provider');
  fs.cpSync(path.join(root, 'examples', 'input-provider'), provider, { recursive: true });
  fs.mkdirSync(path.join(dir, 'node_modules', '@pet'), { recursive: true });
  fs.symlinkSync(path.resolve(types), path.join(dir, 'node_modules', '@pet', 'plugin-types'), 'dir');
  const { loadManifest, requestedGrants } = require(path.resolve(host, 'core/plugin-runtime/manifest.js'));
  const manifest = loadManifest(provider);
  assert.deepEqual(manifest.kind, ['tool', 'panel']);
  assert(requestedGrants(manifest).includes('input:provide'));
  assert.equal(Object.hasOwn(manifest, 'minHostVersion'), false);
  const html = fs.readFileSync(path.join(root, 'examples', 'input-work', 'game.html'), 'utf8');
  const { parseDeclaration } = require(path.resolve(host, 'core/html-card/sdk-policy.js'));
  assert.deepEqual(parseDeclaration(html).permissions, ['service:gamepad-input']);
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  assert.equal(scripts.length, 1, 'Compile the actual standalone work script.');
  const workJs = path.join(dir, 'game.js');
  fs.writeFileSync(workJs, scripts[0]);
  const tsc = require.resolve('typescript/bin/tsc', { paths: [path.resolve(types)] });
  execFileSync(process.execPath, [tsc, '--allowJs', '--checkJs', '--noEmit', '--strict', '--target', 'ES2022', '--module', 'Node16', '--moduleResolution', 'Node16', path.join(provider, 'index.js'), path.join(provider, 'panel.js'), workJs], { stdio: 'inherit' });
  for (const kind of ['tool', 'panel', 'dashboard-card']) {
    const template = JSON.parse(fs.readFileSync(path.join(root, 'templates', kind, 'manifest.json'), 'utf8'));
    assert(!template.permissions.includes('input:provide'));
    assert(!template.permissions.includes('service:gamepad-input'));
  }
  console.log('PASS input examples: real host declarations, shipped JS strict compilation, ordinary templates keep their original permissions');
} finally { fs.rmSync(dir, { recursive: true, force: true }); }
