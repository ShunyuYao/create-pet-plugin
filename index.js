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

生成后把该目录通过桌宠「设置 → 插件 → 开发者模式 → 从文件夹安装」装入调试。
⚠️ 旁加载不经过任何审核，这类插件将获得对你这台电脑的完全访问权限
   （读写文件含密码文件、联网外发、执行任意程序），仅安装你完全信任的来源。
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
  const idOk = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(base) && !base.includes('..');
  if (idOk) {
    m.id = base;
    m.name = base;
    fs.writeFileSync(mf, JSON.stringify(m, null, 2) + '\n');
  }

  // 生成插件自己的 package.json：只为在编辑器里拿到 @pet/plugin-types 的补全。
  // 宿主加载插件读的是 manifest.json，不读这份；删掉它插件照样能跑。
  // 该包暂不发 npm，故用 git 依赖。
  fs.writeFileSync(path.join(dest, 'package.json'), JSON.stringify({
    name: idOk ? base : 'my-pet-plugin',
    version: m.version || '0.1.0',
    private: true,
    description: `桌宠 ${args.kind} 插件`,
    devDependencies: { '@pet/plugin-types': 'github:ShunyuYao/pet-plugin-types' },
  }, null, 2) + '\n');

  console.log(`✓ 已生成 ${args.kind} 插件骨架（apiVersion 1）：${dest}`);
  console.log('');
  console.log('下一步：');
  console.log('  1. 想要类型补全就先装依赖：npm install');
  console.log('  2. 打开桌宠「设置 → 插件」，开启「开发者模式」');
  console.log(`  3. 用「从文件夹安装」入口选择该目录：${dest}`);
  console.log('');
  console.log('  ⚠️ 旁加载不经过任何审核。这类插件将获得对你这台电脑的完全访问权限：');
  console.log('     · 读写你电脑上的文件，包括文档、照片和保存过的密码文件');
  console.log('     · 连接互联网，把读到的任何内容发送出去');
  console.log('     · 执行任意程序，安装后可持续在后台运行');
  console.log('     只安装你完全信任的来源。宿主无法拦截、无法撤销已经发生的破坏，');
  console.log('     风险由你自己承担。');
}

main();
