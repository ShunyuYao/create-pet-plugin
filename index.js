#!/usr/bin/env node
/**
 * create-pet-plugin — 生成桌宠插件骨架
 *
 * 用法：
 *   npx github:ShunyuYao/create-pet-plugin <目录> [--kind tool|panel|dashboard-card]
 */
const fs = require('node:fs');
const path = require('node:path');

const KINDS = ['tool', 'panel', 'dashboard-card'];

function parseArgs(argv) {
  const args = { dir: null, kind: 'tool' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--kind' || a === '-k') args.kind = argv[++i];
    else if (a === '--help' || a === '-h') args.help = true;
    else if (!args.dir) args.dir = a;
  }
  return args;
}

function usage() {
  console.log(`
create-pet-plugin — 生成桌宠（吐梨邦）插件骨架

  用法：npx github:ShunyuYao/create-pet-plugin <目录> [--kind <类型>]

  --kind   ${KINDS.join(' | ')}（默认 tool）
  --help   显示本帮助

生成后把该目录通过桌宠「设置 → 插件 → 开发者模式 → 旁加载」装入调试。
⚠️ 旁加载的插件将获得对你电脑的完全访问权限，仅安装你完全信任的来源。
`);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.dir) { usage(); process.exit(args.help ? 0 : 1); }

  if (!KINDS.includes(args.kind)) {
    console.error(`✗ 未知类型 "${args.kind}"，可选：${KINDS.join(' / ')}`);
    process.exit(1);
  }

  const dest = path.resolve(args.dir);
  if (fs.existsSync(dest) && fs.readdirSync(dest).length) {
    console.error(`✗ 目录非空：${dest}`);
    process.exit(1);
  }

  const tpl = path.join(__dirname, 'templates', args.kind);
  copyDir(tpl, dest);

  // 用目录名做插件 id 与 name，省去手改 manifest
  const mf = path.join(dest, 'manifest.json');
  const m = JSON.parse(fs.readFileSync(mf, 'utf8'));
  const base = path.basename(dest);
  if (/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(base) && !base.includes('..')) {
    m.id = base;
    m.name = base;
    fs.writeFileSync(mf, JSON.stringify(m, null, 2) + '\n');
  }

  console.log(`✓ 已生成 ${args.kind} 插件骨架：${dest}`);
  console.log('');
  console.log('下一步：');
  console.log('  1. 打开桌宠「设置 → 插件」，开启「开发者模式」');
  console.log(`  2. 用旁加载入口选择该目录：${dest}`);
  console.log('');
  console.log('  ⚠️ 旁加载的插件将获得对你电脑的完全访问权限（读写文件、联网、');
  console.log('     执行程序），仅安装你完全信任的来源。');
}

main();
