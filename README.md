# create-pet-plugin

一条命令生成桌宠（吐梨邦）插件骨架。

> ## SDK 契约已冻结在 `apiVersion: 1`
>
> 生成的三份 manifest 都声明 `"apiVersion": 1`，样板代码只调用 **A 档（已冻结）** 能力：
> 同一 `apiVersion` 内只加不改不删。标 `@experimental` 的 B 档能力可以用，但签名/语义
> 可能在任一 apiVersion 变更且不走废弃流程；判为 C 档的能力不作为对外契约，样板不碰。
> 分档定义见 [@pet/plugin-types](https://github.com/ShunyuYao/pet-plugin-types) 的 README。

## 用法

```bash
npx github:ShunyuYao/create-pet-plugin my-plugin
npx github:ShunyuYao/create-pet-plugin my-panel --kind panel
npx github:ShunyuYao/create-pet-plugin my-card  --kind dashboard-card
```

`--kind` 可选 `tool`（默认）/ `panel` / `dashboard-card`。目录名会自动填进
manifest 的 `id` 与 `name`。

## 三种样板

| kind | 生成内容 | 样板做了什么 |
|---|---|---|
| `tool` | `manifest.json` + `index.js` | 注册 `say_hello` 工具供宿主 Agent 调用，起一个定时提醒，订阅 `pet:clicked`，`deactivate` 里取消定时器 |
| `panel` | `manifest.json` + `panel.html` | 独立面板窗口：计数器读写 `storage`、让宠物冒泡、`ui.closePanel` 自关 |
| `dashboard-card` | `manifest.json` + `card.html` | 看板卡片：读写 `storage` 并按内容 `dashboard.requestHeight` / `notifyReady` |

三份 manifest 模板都已用宿主的 `demo/core/plugin-runtime/manifest.js` 实测校验通过
（含 `apiVersion` 字段校验）。

## manifest 字段

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | ✅ | `[a-zA-Z0-9][a-zA-Z0-9._-]*`，不含 `..` |
| `name` | ✅ | 展示名 |
| `version` | ✅ | 必须是 `x.y.z` |
| `apiVersion` | 建议 | 按哪一代 SDK 语义写的。当前 `1`；缺省按宿主最低兼容版本处理，声明了就必须是 ≥1 的整数 |
| `kind` | ✅ | `tool` / `panel` / `asset` / `skill` / `settings` / `service` / `dashboard-card` 的非空子集 |
| `permissions` | — | 权限名数组，见 `@pet/plugin-types` 的 `PluginPermission`。联网必须逐域名写 `net:api.example.com`，没有宽泛的 `net` |
| `minHostVersion` | — | 要求的最低宿主版本 |
| `entry` | 视 kind | `kind` 含 `tool` 要 `entry.tool`；含 `panel` 要 `entry.panel.src`；含 `dashboard-card` 要 `entry.dashboardBlock.src`；含 `service` 要 `provides.service` |

## 上下文能力矩阵

`pet.*` 各命名空间在三种上下文下**有意不一致**——这是安全与生命周期决定的边界，不是待修
的历史差异：渲染层不给密钥与裸 `fetch`（有 CSP 约束、XSS 即泄漏），窗口/区块关掉就失活
所以不能持有 handler。下表为 `apiVersion: 1` 的确定结论，与宿主
`demo/core/plugin-runtime/sdk-surface.js` 一一对应。

标记：**A** = 已冻结；**B** = `@experimental`；空 = 该上下文不可用。

<!-- sdk-surface:start -->
| 命名空间 | 方法 | tool | panel | dashboard-card |
|---|---|:--:|:--:|:--:|
| `storage` | `get` | A | A | A |
| `storage` | `set` | A | A | A |
| `storage` | `delete` | A | A | A |
| `storage` | `all` | A | A | A |
| `secrets` | `get` | A | — | — |
| `secrets` | `set` | A | — | — |
| `secrets` | `delete` | A | — | — |
| `pet` | `bubble` | A | A | A |
| `pet` | `playAnim` | A | A | A |
| `pet` | `speak` | A | A | A |
| `badge` | `set` | B | — | — |
| `badge` | `clear` | B | — | — |
| `ui` | `dialog` | A | A | A |
| `ui` | `taskCheck` | B | B | B |
| `ui` | `copyText` | A | A | A |
| `ui` | `openPanel` | A | — | — |
| `ui` | `closePanel` | A | A | — |
| `ui` | `setPanelPinned` | B | B | — |
| `events` | `on` | A | A | A |
| `events` | `emit` | A | A | A |
| `scheduler` | `every` | A | — | — |
| `scheduler` | `daily` | A | — | — |
| `scheduler` | `cancel` | A | — | — |
| `net` | `fetch` | A | — | — |
| `services` | `get` | A | A | A |
| `settings` | `get` | A | A | A |
| `ai` | `chat` | B | B | B |
| `files` | `pick` | B | B | — |
| `files` | `stat` | B | B | — |
| `files` | `open` | B | B | — |
| `files` | `list` | B | B | — |
| `files` | `revoke` | B | B | — |
| `files` | `pin` | B | B | — |
| `files` | `unpin` | B | B | — |
| `clipboard` | `startHistory` | B | — | — |
| `clipboard` | `stopHistory` | B | — | — |
| `clipboard` | `query` | B | B | — |
| `clipboard` | `read` | B | B | — |
| `clipboard` | `copy` | B | B | — |
| `clipboard` | `markReferenced` | B | B | — |
| `clipboard` | `remove` | B | B | — |
| `clipboard` | `clearHistory` | B | B | — |
| `errands` | `composeFile` | B | B | — |
| `friends` | `me` | A | A | A |
| `friends` | `list` | A | A | A |
| `friends` | `isFriend` | A | A | A |
| `friends` | `avatar` | A | A | A |
| `activity` | `getLatest` | B | B | B |
| `activity` | `connectionInfo` | B | B | B |
| `dashboard` | `requestHeight` | A | — | A |
| `dashboard` | `notifyReady` | A | — | A |
| `tools` | `register` | A | — | — |
| `calendar` | `registerProvider` | B | — | — |
| `(root)` | `context` | — | — | A |
<!-- sdk-surface:end -->

三种上下文的精确类型分别是 `PetTool` / `PetPanel` / `PetBlock`，编辑器里越界访问会直接
报错。普通 SDK 调用返回 Promise；桥内注册方法返回 void，以对应类型签名为准。
内置和外部工具插件都经 utilityProcess/RPC 调用宿主。

`panel` 与 `dashboard-card` 由宿主强制加 CSP：`script-src 'self' 'unsafe-inline'`，
不含任何远端源——内联 `<script>` 可用，但**不能从 CDN 拉脚本**，依赖请随插件目录打包。

## 新增实验能力与最低宿主版本

本矩阵与宿主 0.19.1 源码及更新后的 `@pet/plugin-types` 对齐；模板只使用基础 A 档能力，
不会默认开启剪贴板历史或占用徽标。

- `badge.set/clear` 仅 tool，需 `pet` 权限；`onClick: 'openPanel'` 还需 `ui` 和 panel 入口。
  徽标以宿主 0.19.1 为基线，旧版应先探测可用性，或声明实际最低宿主版本。
- `ui.setPanelPinned` 仅 tool/panel；`clipboard` 需同名权限，轮询启停仅 tool。
- `errands.composeFile` 需 `errands` 权限；剪贴板图片来源另需 `clipboard`，收件人由用户选择。
- `files.revoke` 是撤销授权，不删除磁盘文件；已没有 `files.remove` 方法。
- `friends` 以账号 UID 为主键，存量/游客情形用 `uid || petId`。
- manifest 可声明 `activation: 'opt-in'` 和 `entry.panel.transparent`；前者是插件启用策略，
  不是更新开关。本轮未新增任何自动更新接口或参与字段。

## 本地调试

1. 打开桌宠 **设置 → 插件**，开启 **开发者模式**（默认关闭）。开启时会弹一次风险确认。
2. 开发者模式打开后才会出现 **「从文件夹安装」** 入口（关着时该入口整块不渲染）。
   点它选择你生成的目录，安装前还会再弹一次同强度的确认。
3. 改完代码在插件列表里重新加载插件即可看到效果。

> ### ⚠️ 旁加载不经过任何审核
>
> 经旁加载入口安装的插件**将获得对你这台电脑的完全访问权限**：
>
> - 读写你电脑上的文件，包括文档、照片和保存过的密码文件
> - 连接互联网，把读到的任何内容发送出去
> - 执行任意程序，安装后可持续在后台运行
>
> 只安装你完全信任的来源。**宿主无法拦截、无法撤销已经发生的破坏，风险由你自己承担。**
>
> 这条路径供开发者调试自己的插件；分发给他人请走
> [插件市场 registry](https://github.com/ShunyuYao/pet-plugin-registry)。

## 类型补全

生成的骨架 `package.json`（若你自己加）或本仓库依赖里都引用了
[@pet/plugin-types](https://github.com/ShunyuYao/pet-plugin-types)。该包**暂不发布到
npm**，用 git 依赖引用：

```json
{
  "devDependencies": {
    "@pet/plugin-types": "github:ShunyuYao/pet-plugin-types"
  }
}
```

样板已通过 JSDoc `import('@pet/plugin-types')` 挂上类型，纯 JS 也能在 VS Code 里拿到
补全与越界检查，不必改写成 TypeScript。

## 验证与交付

```sh
npm test
PET_PLUGIN_HOST_DIR=/path/to/desktop-pet/demo \
PET_PLUGIN_TYPES_DIR=/path/to/pet-plugin-types npm run test:delivery
```

交付前先在类型包执行 `npm ci`，并使用与当前宿主匹配的类型包提交。
`npm test` 检查基础生成；`test:delivery` 必须提供两个仓库路径，缺失直接失败，不允许 SKIP。
它检查实际生成的三种 manifest、用公开类型严格编译生成的 tool，并核对本 README 的完整能力矩阵。
这比“能生成文件”覆盖更强：缺类型、模板不通过类型检查、文档漏方法或上下文写错都会失败。
交付时先锁定宿主与类型包提交；离线测试不会自行联网拉取依赖。

## 相关

- 类型定义：[@pet/plugin-types](https://github.com/ShunyuYao/pet-plugin-types)
- 插件市场与开发者政策：[pet-plugin-registry](https://github.com/ShunyuYao/pet-plugin-registry)

## 插件选择参与新版提醒（实验，宿主开发中）

在 manifest 中显式声明 `"updateReminders": true`，允许宿主登录后检查并提示新版。
缺省或 false 都关闭，现有插件不会因宿主升级被自动开启。三种模板均默认 false。
权威来自本机已安装 manifest；市场条目或远端新版的声明不能替旧版开启。

true 只允许自动检查和提醒，**每次下载、安装仍需用户在宿主弹窗点击更新**。
取消、关闭、超时不下载；关闭参与不影响已有手动市场更新入口。
登录范围为恢复已有登录及手动登录成功，等待引导结束；游客不主动提醒。
同插件同目标版本 24 小时最多提醒一次，冷却在重启后保留。
首期没有运行时设置接口，也不向插件开放自行安装或绕过确认的方法。

这是可选的向前兼容字段，`apiVersion` 仍为 1；旧宿主忽略提醒声明。
宿主实现尚未发版，请以包含此功能的实际宿主构建为准，不能仅根据本包版本判断可用。
