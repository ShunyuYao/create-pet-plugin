# create-pet-plugin

一条命令生成桌宠（吐梨邦）插件骨架。

> ## SDK 契约已冻结在 `apiVersion: 1`
>
> 生成的三份 manifest 都声明 `"apiVersion": 1`，样板代码只调用 **A 档（已冻结）** 能力：
> 同一 `apiVersion` 内只加不改不删。标 `@experimental` 的 B 档能力可以用，但签名/语义
> 可能在任一 apiVersion 变更且不走废弃流程；判为 C 档的能力不作为对外契约，样板不碰。
> 分档定义见 [@pet/plugin-types](https://github.com/ShunyuYao/pet-plugin-types) 的 README。

本轮更新已纳入主分支，未发布新的 npm 包；源码版本号 `1.0.0-rc.3` 不代表 npm 产物已包含本轮说明。基础模板继续只调用冻结能力，未增加权限；类型依赖仍来自 Git，实际内容取决于锁文件解析的提交。

This update is on the main branch, with no new npm release. The source version `1.0.0-rc.3` is not evidence of a corresponding updated npm artifact. Templates retain their existing permissions and frozen API calls; the Git type dependency follows the commit resolved in the consumer lockfile.

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
| `appearance` | `getState` | B | B | — |
| `appearance` | `apply` | B | B | — |
| `appearance` | `reset` | B | B | — |
| `account` | `getState` | B | — | — |
| `account` | `authorize` | B | — | — |
| `storage` | `get` | A | A | A |
| `storage` | `set` | A | A | A |
| `storage` | `delete` | A | A | A |
| `storage` | `all` | A | A | A |
| `secrets` | `get` | A | — | — |
| `secrets` | `set` | A | — | — |
| `secrets` | `delete` | A | — | — |
| `pet` | `bubble` | A | A | A |
| `pet` | `playAnim` | A | A | A |
| `pet` | `getAnimations` | B | B | B |
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


## Account delegation / 插件账号授权（实验，未发布）

`pet.account.getState({serviceId})` 与 `pet.account.authorize({serviceId,challengeId,codeChallenge})` 仅 tool 可用，需 `account:authorize:<serviceId>` 权限，且该服务已在宿主与账号服务登记。新方法未包含在已发布宿主中；请探测能力并明确提示暂不可用，不能仅凭 apiVersion 1 推断支持，也不要虚填 minHostVersion。基础模板不自动申请这项权限。

`getState` 返回本机 `signedIn / uid / revision`，UID 不是认证凭据。`authorize` 返回 60 秒内有效的一次性 `code / expiresIn / revision`；每次生成新的随机 PKCE verifier，并传 S256 挑战。仅目标服务后端可兑换授权码，插件不得读取或获取宿主 access / refresh token。

Games must keep their own session in the tool process and send only display data to panels. Recheck account revision while active and before protected operations. Discard stale responses on account changes or deactivation; preserve editing drafts under their original owner. Normal account-token refresh does not change revision. The service checks the parent account session on each protected operation; grants expire within 10 minutes. Server-confirmed logout invalidates the authorization. An offline logout or failed revocation stops local requests immediately, but an existing server grant may survive until its original expiry, at most 10 minutes.

Errors are returned as `Error.message`: `not_logged_in`, `permission_denied`, `service_unavailable`, `account_changed`, `network`, `invalid_request`, `busy`, `plugin_inactive`, `rate_limited`. Missing service registration fails closed; there is no fallback login or arbitrary authorization URL.

开发交付须同时检查宿主、类型包、脚手架及 registry 的 SDK / 权限政策；类型包与脚手架都运行带实际宿主路径的 `test:delivery`，缺依赖跳过不算通过。Only update registry plugin entries when an actual compatible plugin package is released.

## 插件外观 / Plugin appearance（experimental，主分支已实现）

`pet.appearance.getState()`、`apply()`、`reset()` 仅 tool/panel 可用，要求已激活的 asset 插件声明并获准 `appearance` 权限；面板另需 `ui` 权限和 panel 入口。基础模板不自动申请这些权限。

返回 `companion: {key,name}`、`current: {key,name,isDefault,ownedByCaller}`、`own: {key,name}`、`canRestore`。查询不修改状态；面板打开期间刷新状态并丢弃迟到响应。`apply()` 只使用本插件注册的素材，保留当前伙伴身份、名字、人设与记忆，重启保留选择。`reset()` 只在本插件外观仍生效时恢复原伙伴外观；用户已换为 B 插件时 A 的 reset 不改变 B，也不恢复之前的其他插件外观。

All three methods take no arguments and return `Promise<AppearanceState>`. They expose no host configuration, memory, credentials or disk paths. Successful apply/reset acknowledges a persisted selection; the renderer paints asynchronously. A failed write rejects with `persistence_failed` and restores the in-memory selection. Installation and local preview must not silently apply a skin. Closing a panel preserves the selection; removing or disabling the active asset restores the companion's original appearance.

Errors in `Error.message`: `permission_denied`, `unsupported_context`, `appearance_unavailable`, `plugin_inactive`, `invalid_request`, `method_not_found`, `persistence_failed`. Only the owning active asset can change its appearance; dashboard blocks have no appearance API. Handle errors visibly and offer retry.

外观 API 的说明已纳入本仓库主分支，新增类型见 `pet-plugin-types` 的主分支，对应宿主实现已完成；目标兼容构建为 **0.23.0 受邀测试版**，安装包实测仍待完成。`apiVersion: 1` 不能代表旧宿主已支持；先探测 `pet.appearance?.getState`，缺失时提示需支持该功能的测试版本。实测完成前，不能把 0.23.0 宣称为已验证的最低支持版本。宿主仅通过受邀测试渠道分发，本轮没有 npm 发布。The main branch includes appearance API documentation for the completed host implementation; the definitions are supplied by the main branch of `pet-plugin-types`. Host 0.23.0 is the target invitation-only test build; packaged-build validation is still pending. Feature-detect older hosts. This is not a public host release or an npm release, and a validated minimum host version has not yet been established.

```js
// asset+panel manifest: kind: ['asset', 'panel'], permissions: ['ui', 'appearance']
const state = await pet.appearance.getState();
// In an explicit “Use” button handler:
const applied = await pet.appearance.apply();
// In an explicit “Restore” button handler, enabled only when canRestore:
const restored = await pet.appearance.reset();
```


## 动作查询与可选素材 / Animation metadata (experimental, implemented on main)

新增 `pet.pet.getAnimations(): Promise<PetAnimation[]>`，tool / panel / block 均可用，需要声明并获得 `pet` 权限。无参数，查询当前实际外观；每项只有 `state`、`frameCount`、`fps`、`loop`、`standard`，对应首个素材变体，不包含路径。未加载的外观返回空数组。本仓库主分支已包含此扩展；目标宿主为 0.23.0 受邀测试构建，安装包实测待完成。旧宿主须先探测 `pet.pet.getAnimations`，不能据 apiVersion 1 或类型包版本号推断支持；本轮未发布 npm 包。

The query returns the current appearance's available clips, including locally registered custom keys. It takes no arguments, requires an active plugin with the `pet` permission, and is available in tool, panel and block contexts. It exposes first-variant metadata only, with no filesystem paths. Errors include `permission_denied`, `plugin_inactive`, `unsupported_context` and `invalid_request`. The extension is included in the main branch. Feature-detect the method on older hosts: validation of the target invitation-only host 0.23.0 package is pending, and no validated minimum host version or new npm release is being claimed.

继续通过已有 `pet.pet.playAnim(state)` 播放，不为各动作新增方法。其布尔返回值仅确认已向宠物窗口分发，不能代表播放完成。单次素材自然结束回待机，循环素材持续到下一动作或真实交互。既有唤醒优先级保持：wake 不打断走路/送文件等行为。缺失标准动作默认回 idle；send 优先回 walk，edgehide 优先回 sleep；未注册的未知键不播放。动画调用只控制本机伙伴；不是远程操控访客的接口。

`playAnim` keeps its existing boolean dispatch acknowledgement, not a completion promise. Non-looping clips return to idle; looping clips continue until superseded by another animation or interaction. Existing wake priority remains. Missing standard states resolve to idle, except send prefers walk and edgehide prefers sleep; unknown unregistered names do nothing. Playback addresses the local companion, not a remote visitor.

14 个标准键：`idle walk sleep wake speak send drag unread edgehide peek unpeek greet dropempty dropfull`。跨机包要求 idle/walk，其余选配；扩展描述 v2 显式声明 loop，只传严格验证的静态 PNG 与描述，不能携带代码。旧 v1 双动作包继续兼容。接收端不支持扩展描述时，出发前明确失败；不会悄悄删掉动作。局域网无需登录或好友验证，串门期间外观不变。

Cross-machine appearance v2 permits the fourteen listed states with explicit loop flags; idle and walk are required. Legacy v1 two-state packages remain supported. Unsupported receivers fail preparation before departure. Only validated static PNG frames and animation metadata are transferred, never plugin code. Other visitor action slots can be decoded without a new automatic behavior: actual visitor triggers follow its existing arrival, speaking, dragging, delivery and edge lifecycle.

查询沿用现有 SDK 桥参数归一化：JavaScript 多传的参数会被零参数方法忽略，TypeScript 签名在编译时拒绝它们；原始主进程协议载荷若带参数则拒绝 invalid_request。The existing JavaScript bridge normalizes this method to zero arguments (extra caller arguments are ignored); TypeScript rejects extra arguments at compile time. A malformed raw host protocol request with arguments is rejected with invalid_request.
