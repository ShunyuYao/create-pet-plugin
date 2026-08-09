#!/usr/bin/env node
/**
 * 生成测试：三种 kind 各生成一份，检查目录结构与 manifest 字段。
 *
 * 加 --host <桌宠仓库 demo 目录> 时，会额外用宿主真正的
 * core/plugin-runtime/manifest.js 校验生成的 manifest —— 那是唯一硬验证，
 * 模板长得对不算数，宿主认才算。不带 --host 只做本地字段检查。
 *
 *   node test/generate-test.js
 *   node test/generate-test.js --host /path/to/桌宠测试版/demo
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const KINDS = ['tool', 'panel', 'dashboard-card'];
const ENTRY_FILE = { tool: 'index.js', panel: 'panel.html', 'dashboard-card': 'card.html' };
const CLI = path.join(__dirname, '..', 'index.js');

const hostIdx = process.argv.indexOf('--host');
const hostDemo = hostIdx > -1 ? process.argv[hostIdx + 1] : null;
let loadManifest = null;
if (hostDemo) {
  loadManifest = require(path.join(path.resolve(hostDemo), 'core/plugin-runtime/manifest.js')).loadManifest;
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cpp-test-'));
let failed = 0;
const check = (ok, msg) => { console.log(`${ok ? '✓' : '✗'} ${msg}`); if (!ok) failed++; };

try {
  for (const kind of KINDS) {
    const dir = path.join(tmp, `sample-${kind}`);
    execFileSync(process.execPath, [CLI, dir, '--kind', kind], { stdio: 'pipe' });

    check(fs.existsSync(path.join(dir, 'manifest.json')), `${kind}: manifest.json 已生成`);
    check(fs.existsSync(path.join(dir, ENTRY_FILE[kind])), `${kind}: 入口 ${ENTRY_FILE[kind]} 已生成`);
    check(fs.existsSync(path.join(dir, 'package.json')), `${kind}: package.json 已生成`);

    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
    check(pkg.devDependencies['@pet/plugin-types'] === 'github:ShunyuYao/pet-plugin-types',
      `${kind}: package.json 依赖 @pet/plugin-types`);

    const m = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
    for (const f of ['id', 'name', 'version', 'apiVersion', 'kind', 'permissions', 'entry']) {
      check(m[f] !== undefined, `${kind}: manifest 含 ${f}`);
    }
    check(m.apiVersion === 1, `${kind}: apiVersion === 1`);
    check(m.id === `sample-${kind}`, `${kind}: id 已按目录名填为 sample-${kind}`);

    if (loadManifest) {
      try {
        const loaded = loadManifest(dir);
        check(loaded.kind.includes(kind), `${kind}: 通过宿主 manifest.js 校验`);
      } catch (e) {
        check(false, `${kind}: 宿主 manifest.js 校验失败 — ${e.message}`);
      }
    }
  }

  // tool 样板是 JS，必须能通过语法检查
  execFileSync(process.execPath, ['--check', path.join(tmp, 'sample-tool', 'index.js')], { stdio: 'pipe' });
  check(true, 'tool: index.js 语法检查通过');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (!loadManifest) console.log('\n提示：未传 --host，跳过宿主 manifest.js 硬校验');
console.log(failed ? `\n✗ ${failed} 项失败` : '\n✓ 全部通过');
process.exit(failed ? 1 : 0);
