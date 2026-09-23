#!/usr/bin/env node
/**
 * 生成测试：四种 kind 各生成一份，检查目录结构与 manifest 字段。
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

const KINDS = ['tool', 'panel', 'dashboard-card', 'theme'];
const ENTRY_FILE = { tool: 'index.js', panel: 'panel.html', 'dashboard-card': 'card.html', theme: 'theme.json' };
const CLI = path.join(__dirname, '..', 'index.js');

const hostIdx = process.argv.indexOf('--host');
const hostDemo = hostIdx > -1 ? process.argv[hostIdx + 1] : process.env.PET_PLUGIN_HOST_DIR;
const typesIdx = process.argv.indexOf('--types');
const typesDir = typesIdx > -1 ? process.argv[typesIdx + 1] : process.env.PET_PLUGIN_TYPES_DIR;
if (process.argv.includes('--require-host') && (!hostDemo || !typesDir)) {
  console.error('交付检查必须提供 PET_PLUGIN_HOST_DIR 和 PET_PLUGIN_TYPES_DIR，不允许跳过宿主/类型对账。');
  process.exit(1);
}
let loadManifest = null;
let readTheme = null;
if (hostDemo) {
  loadManifest = require(path.join(path.resolve(hostDemo), 'core/plugin-runtime/manifest.js')).loadManifest;
  readTheme = require(path.join(path.resolve(hostDemo), 'core/ui-theme-contract.js')).readTheme;
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
    check(m.updateReminders === false, `${kind}: 默认不参与主动更新提醒`);
    check(m.apiVersion === 1, `${kind}: apiVersion === 1`);
    check(m.id === `sample-${kind}`, `${kind}: id 已按目录名填为 sample-${kind}`);
    if (kind === 'theme') {
      check(JSON.stringify(m.kind) === '["theme"]', 'theme: 只声明 theme 种类');
      check(JSON.stringify(m.permissions) === '["ui:theme"]', 'theme: 只声明 ui:theme 权限');
      check(JSON.stringify(m.entry) === '{"theme":"theme.json"}', 'theme: 只有 JSON 入口');
      check(!('services' in m) && !('provides' in m) && !('activation' in m), 'theme: 不声明服务或激活代码');
      check(!('minHostVersion' in m), 'theme: 不虚构最低支持版本');
      check(fs.readdirSync(dir).every(file => !/\.(?:js|html|css)$/.test(file)), 'theme: 不携带可执行入口或任意样式');
      check(fs.readFileSync(path.join(dir, 'README.md'), 'utf8').includes('未发布'), 'theme: 样板明确未发布边界');
      const theme = JSON.parse(fs.readFileSync(path.join(dir, 'theme.json'), 'utf8'));
      check(Object.keys(theme).length === 6 && Object.keys(theme.colors).length === 15, 'theme: 六字段与十五个颜色');
      check(fs.statSync(path.join(dir, 'theme.json')).size <= 16 * 1024, 'theme: JSON 小于等于 16 KiB');
    } else {
      const original = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'templates', kind, 'manifest.json'), 'utf8'));
      check(JSON.stringify(m.permissions) === JSON.stringify(original.permissions), `${kind}: 普通模板权限保持不变`);
      check(!m.permissions.includes('ui:theme'), `${kind}: 不自动申请主题权限`);
      check(!m.permissions.includes('appearance:render'), `${kind}: 不自动申请实时渲染权限`);
    }

    if (loadManifest) {
      try {
        const loaded = loadManifest(dir);
        check(loaded.kind.includes(kind), `${kind}: 通过宿主 manifest.js 校验`);
        if (kind === 'theme') {
          const actual = readTheme(dir, loaded.entry.theme);
          check(actual.target === 'chat' && actual.texture === 'paper', 'theme: 生成 JSON 通过真实宿主读盘校验');
        }
      } catch (e) {
        check(false, `${kind}: 宿主 manifest.js 校验失败 — ${e.message}`);
      }
    }
  }

  // tool 样板是 JS，必须能通过语法检查
  execFileSync(process.execPath, ['--check', path.join(tmp, 'sample-tool', 'index.js')], { stdio: 'pipe' });
  check(true, 'tool: index.js 语法检查通过');
  if (typesDir) {
    const typeRoot = path.resolve(typesDir);
    const modules = path.join(tmp, 'node_modules', '@pet');
    fs.mkdirSync(modules, { recursive: true });
    fs.symlinkSync(typeRoot, path.join(modules, 'plugin-types'), 'dir');
    const tsc = require.resolve('typescript/bin/tsc', { paths: [typeRoot] });
    execFileSync(process.execPath, [tsc, '--checkJs', '--allowJs', '--noEmit', '--strict', '--target', 'ES2022',
      '--module', 'Node16', '--moduleResolution', 'Node16', path.join(tmp, 'sample-tool', 'index.js')], { stdio: 'inherit' });
    check(true, '真实生成的 tool 通过公开类型严格编译');
    const themeDir = path.join(tmp, 'sample-theme');
    const theme = JSON.parse(fs.readFileSync(path.join(themeDir, 'theme.json'), 'utf8'));
    const themeManifest = JSON.parse(fs.readFileSync(path.join(themeDir, 'manifest.json'), 'utf8'));
    const contracts = path.join(tmp, 'generated-theme.ts');
    fs.writeFileSync(contracts, `import type { ThemeDefinition, ThemePluginManifest } from '@pet/plugin-types';\n`
      + `const manifest = ${JSON.stringify(themeManifest)} satisfies ThemePluginManifest;\n`
      + `const theme = ${JSON.stringify(theme)} satisfies ThemeDefinition;\n`);
    execFileSync(process.execPath, [tsc, '--noEmit', '--strict', '--target', 'ES2022', '--module', 'Node16',
      '--moduleResolution', 'Node16', contracts], { stdio: 'inherit' });
    check(true, '真实生成的主题 manifest / JSON 通过公开类型严格编译');
    if (hostDemo) {
      execFileSync(process.execPath, [path.join(typeRoot, 'test', 'check-host.js'), '--host', path.resolve(hostDemo),
        '--readme', path.join(__dirname, '..', 'README.md')], { stdio: 'inherit' });
      check(true, '宿主、公开类型和脚手架能力文档三方一致');
    }
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (!loadManifest) console.log('\n提示：未传 --host，跳过宿主 manifest.js 硬校验');
console.log(failed ? `\n✗ ${failed} 项失败` : '\n✓ 全部通过');
process.exit(failed ? 1 : 0);
