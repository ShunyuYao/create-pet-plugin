# create-pet-plugin

一条命令生成桌宠（吐梨邦）插件骨架。

> ## SDK 契约已冻结在 `apiVersion: 1`
>
> 三种基础模板都声明 `"apiVersion": 1`，样板代码只调用 **A 档（已冻结）** 能力：
> 同一 `apiVersion` 内只加不改不删。标 `@experimental` 的 B 档能力可以用，但签名/语义
> 可能在任一 apiVersion 变更且不走废弃流程；判为 C 档的能力不作为对外契约，样板不碰。
> 分档定义见 [@pet/plugin-types](https://github.com/ShunyuYao/pet-plugin-types) 的 README。

本分支的实时形象与访客说明属于尚未发布的 M1b / M2 候选，不声明最低宿主支持版本；源码版本号 `1.0.0-rc.3` 不代表 npm 产物已包含这些说明。基础模板继续只调用冻结能力，未增加权限；类型依赖仍来自 Git，实际内容取决于锁文件解析的提交。

The realtime M1b and visitor M2 documentation describes unreleased development candidates, with no claimed minimum host version. The source version `1.0.0-rc.3` is not evidence of a corresponding updated npm artifact. Templates retain their existing permissions and frozen API calls; the Git type dependency follows the commit resolved in the consumer lockfile.

## 用法

```bash
npx github:ShunyuYao/create-pet-plugin my-plugin
npx github:ShunyuYao/create-pet-plugin my-panel --kind panel
npx github:ShunyuYao/create-pet-plugin my-card  --kind dashboard-card
```

`--kind` 可选 `tool`（默认）/ `panel` / `dashboard-card`；此开发分支另支持实验性的 `theme`（见文末，尚未发布）。目录名会自动填进
manifest 的 `id` 与 `name`。

## 样板

| kind | 生成内容 | 样板做了什么 |
|---|---|---|
| `tool` | `manifest.json` + `index.js` | 注册 `say_hello` 工具供宿主 Agent 调用，起一个定时提醒，订阅 `pet:clicked`，`deactivate` 里取消定时器 |
| `panel` | `manifest.json` + `panel.html` | 独立面板窗口：计数器读写 `storage`、让宠物冒泡、`ui.closePanel` 自关 |
| `dashboard-card` | `manifest.json` + `card.html` | 看板卡片：读写 `storage` 并按内容 `dashboard.requestHeight` / `notifyReady` |
| `theme`（未发布） | `manifest.json` + `theme.json` | 纯数据聊天外观，无可执行入口；由用户在设置中选择 |

基础与主题 manifest 模板都已用对应宿主的 `demo/core/plugin-runtime/manifest.js` 实测校验通过
（含 `apiVersion` 字段校验）。

## manifest 字段

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | ✅ | `[a-zA-Z0-9][a-zA-Z0-9._-]*`，不含 `..` |
| `name` | ✅ | 展示名 |
| `version` | ✅ | 必须是 `x.y.z` |
| `apiVersion` | 建议 | 按哪一代 SDK 语义写的。当前 `1`；缺省按宿主最低兼容版本处理，声明了就必须是 ≥1 的整数 |
| `kind` | ✅ | 普通插件为 `tool` / `panel` / `asset` / `skill` / `settings` / `service` / `dashboard-card` 的非空子集；实验主题只能为 `["theme"]`，实时渲染插件只能为 `["appearance-renderer"]` |
| `permissions` | — | 权限名数组，见 `@pet/plugin-types` 的 `PluginPermission`。联网必须逐域名写 `net:api.example.com`，没有宽泛的 `net` |
| `minHostVersion` | — | 要求的最低宿主版本 |
| `entry` | 视 kind | `kind` 含 `tool` 要 `entry.tool`；含 `panel` 要 `entry.panel.src`；含 `dashboard-card` 要 `entry.dashboardBlock.src`；含 `service` 要 `provides.service` |

## 上下文能力矩阵

普通插件使用 tool/panel/dashboard-card 三种上下文；专用 render 沙箱只提供 `pet.render`，不继承通用 SDK。上下文差异是权限与生命周期边界。下表与候选宿主的 `demo/core/plugin-runtime/sdk-surface.js` 对应；`apiVersion: 1` 不表示旧宿主支持后来增加的实验能力。

标记：**A** = 已冻结；**B** = `@experimental`；空 = 该上下文不可用。

<!-- sdk-surface:start -->
| Namespace | Method | tool | panel | block | render | work |
|---|---|---|---|---|---|---|
| `input` | `registerProvider` | B | — | — | — | — |
| `input` | `getConfig` | B | B | — | — | — |
| `input` | `updateConfig` | B | B | — | — | — |
| `input` | `unregisterProvider` | B | — | — | — | — |
| `input` | `connect` | — | — | — | — | B |
| `input` | `read` | — | — | — | — | B |
| `input` | `setContext` | — | — | — | — | B |
| `input` | `onStatus` | — | — | — | — | B |
| `input` | `openSettings` | — | — | — | — | B |
| `input` | `disconnect` | — | — | — | — | B |
| `render` | `onControl` | — | — | — | B | — |
| `render` | `submitFrame` | — | — | — | B | — |
| `render` | `fail` | — | — | — | B | — |
| `sessions` | `getContext` | — | — | — | — | B |
| `sessions` | `join` | — | — | — | — | B |
| `sessions` | `send` | — | — | — | — | B |
| `sessions` | `poll` | — | — | — | — | B |
| `sessions` | `transfer` | — | — | — | — | B |
| `sessions` | `readTransfer` | — | — | — | — | B |
| `sessions` | `leave` | — | — | — | — | B |
| `character` | `getCurrent` | B | B | B | — | B |
| `character` | `getRealtime` | B | B | B | — | B |
| `character` | `watch` | B | B | B | — | B |
| `character` | `next` | B | B | B | — | B |
| `character` | `unwatch` | B | B | B | — | B |
| `capabilities` | `query` | B | B | B | — | B |
| `capabilities` | `request` | — | — | — | — | B |
| `services` | `invoke` | B | B | B | — | B |
| `appearance` | `getState` | B | B | — | — | — |
| `appearance` | `apply` | B | B | — | — | — |
| `appearance` | `reset` | B | B | — | — | — |
| `appearance` | `refresh` | B | — | — | — | — |
| `account` | `getState` | B | — | — | — | — |
| `account` | `authorize` | B | — | — | — | — |
| `storage` | `get` | A | A | A | — | B |
| `storage` | `set` | A | A | A | — | B |
| `storage` | `delete` | A | A | A | — | B |
| `storage` | `all` | A | A | A | — | B |
| `secrets` | `get` | A | — | — | — | — |
| `secrets` | `set` | A | — | — | — | — |
| `secrets` | `delete` | A | — | — | — | — |
| `pet` | `bubble` | A | A | A | — | — |
| `pet` | `playAnim` | A | A | A | — | — |
| `pet` | `getAnimations` | B | B | B | — | — |
| `pet` | `speak` | A | A | A | — | — |
| `badge` | `set` | B | — | — | — | — |
| `badge` | `clear` | B | — | — | — | — |
| `ui` | `dialog` | A | A | A | — | — |
| `ui` | `taskCheck` | B | B | B | — | — |
| `ui` | `copyText` | A | A | A | — | — |
| `ui` | `openPanel` | A | — | — | — | — |
| `ui` | `closePanel` | A | A | — | — | — |
| `ui` | `setPanelPinned` | B | B | — | — | — |
| `events` | `on` | A | A | A | — | — |
| `events` | `emit` | A | A | A | — | — |
| `scheduler` | `every` | A | — | — | — | — |
| `scheduler` | `daily` | A | — | — | — | — |
| `scheduler` | `cancel` | A | — | — | — | — |
| `net` | `fetch` | A | — | — | — | — |
| `services` | `get` | A | A | A | — | — |
| `settings` | `get` | A | A | A | — | — |
| `ai` | `chat` | B | B | B | — | — |
| `files` | `pick` | B | B | — | — | — |
| `files` | `stat` | B | B | — | — | — |
| `files` | `open` | B | B | — | — | — |
| `files` | `list` | B | B | — | — | — |
| `files` | `revoke` | B | B | — | — | — |
| `files` | `pin` | B | B | — | — | — |
| `files` | `unpin` | B | B | — | — | — |
| `clipboard` | `startHistory` | B | — | — | — | — |
| `clipboard` | `stopHistory` | B | — | — | — | — |
| `clipboard` | `query` | B | B | — | — | — |
| `clipboard` | `read` | B | B | — | — | — |
| `clipboard` | `copy` | B | B | — | — | — |
| `clipboard` | `markReferenced` | B | B | — | — | — |
| `clipboard` | `remove` | B | B | — | — | — |
| `clipboard` | `clearHistory` | B | B | — | — | — |
| `errands` | `composeFile` | B | B | — | — | — |
| `friends` | `me` | A | A | A | — | — |
| `friends` | `list` | A | A | A | — | — |
| `friends` | `isFriend` | A | A | A | — | — |
| `friends` | `avatar` | A | A | A | — | — |
| `activity` | `getLatest` | B | B | B | — | — |
| `activity` | `connectionInfo` | B | B | B | — | — |
| `dashboard` | `requestHeight` | A | — | A | — | — |
| `dashboard` | `notifyReady` | A | — | A | — | — |
| `tools` | `register` | A | — | — | — | — |
| `calendar` | `registerProvider` | B | — | — | — | — |
| `(root)` | `context` | — | — | A | — | — |
<!-- sdk-surface:end -->

对应精确类型为 `PetTool` / `PetPanel` / `PetBlock` / `PetRender` / `PetWork`，编辑器里越界访问会直接报错。work 不继承普通插件权限；work.storage 为 B 档，普通插件 storage 仍为 A 档。普通 SDK 调用返回 Promise；render 的 `submitFrame`/`fail` 和 work.input.setContext 返回 void，input.read 返回本地同步快照，订阅返回取消函数，以对应类型签名为准。
内置和外部工具插件都经 utilityProcess/RPC 调用宿主。

`panel` 与 `dashboard-card` 由宿主强制加 CSP：`script-src 'self' 'unsafe-inline'`，
不含任何远端源——内联 `<script>` 可用，但**不能从 CDN 拉脚本**，依赖请随插件目录打包。

## 新增实验能力与最低宿主版本

本矩阵随实际候选宿主和 `@pet/plugin-types` 做交付对账，不以一个历史版本概括所有增量能力。基础模板只使用 A 档能力，不默认开启剪贴板历史、占用徽标或申请 `appearance:render`。

- `badge.set/clear` 仅 tool，需 `pet` 权限；`onClick: 'openPanel'` 还需 `ui` 和 panel 入口。
  徽标以宿主 0.19.1 为基线，旧版应先探测可用性，或声明实际最低宿主版本。
- `ui.setPanelPinned` 仅 tool/panel；`clipboard` 需同名权限，轮询启停仅 tool。
- `errands.composeFile` 需 `errands` 权限；剪贴板图片来源另需 `clipboard`，收件人由用户选择。
- `files.revoke` 是撤销授权，不删除磁盘文件；已没有 `files.remove` 方法。
- `character.getRealtime` 只读返回当前形象的实时外观数据（无实时描述时为 `null`），复用 `character:read`，不授予 `appearance:render`；尚未发布，须先探测。基础模板不调用它。
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

外观 API 的说明已纳入本仓库主分支，新增类型见 `pet-plugin-types` 的主分支，对应宿主实现已完成；**macOS arm64 本地打包构建 0.23.0 已通过兼容性实测**，覆盖市场安装、真实权限授权、八动作查询与已选定的 12 帧走路、重启保持、恢复及卸载。宿主 0.22 不支持本轮扩展；旧宿主须先探测 `pet.appearance?.getState`，不能仅凭 `apiVersion: 1` 判断支持。这是本地测试构建的验证结果，非公开宿主发布；官方宿主仍仅通过受邀测试渠道分发，本轮没有 npm 发布。The main branch includes appearance API documentation for the completed host implementation; the definitions are supplied by the main branch of `pet-plugin-types`. A local packaged macOS arm64 host 0.23.0 build passed compatibility testing: market installation, explicit permission consent, eight available actions and the selected 12-frame walk, persistence across restarts, restore and uninstall. Host 0.22 does not support this extension; feature-detect older hosts rather than relying on apiVersion 1. This validates a local test build, not a public host release. The official host remains invitation-only, and no npm release is made by this delivery.

```js
// asset+panel manifest: kind: ['asset', 'panel'], permissions: ['ui', 'appearance']
const state = await pet.appearance.getState();
// In an explicit “Use” button handler:
const applied = await pet.appearance.apply();
// In an explicit “Restore” button handler, enabled only when canRestore:
const restored = await pet.appearance.reset();
```


## 动作查询与可选素材 / Animation metadata (experimental, implemented on main)

新增 `pet.pet.getAnimations(): Promise<PetAnimation[]>`，tool / panel / block 均可用，需要声明并获得 `pet` 权限。无参数，查询当前实际外观；每项只有 `state`、`frameCount`、`fps`、`loop`、`standard`，对应首个素材变体，不包含路径。未加载的外观返回空数组。本仓库主分支已包含此扩展，macOS arm64 本地打包构建 0.23.0 已通过兼容性实测。宿主 0.22 不支持此扩展；旧宿主须先探测 `pet.pet.getAnimations`，不能据 apiVersion 1 或类型包版本号推断支持。官方宿主仍仅通过受邀测试渠道分发，验证不代表公开宿主发布；本轮未发布 npm 包。

The query returns the current appearance's available clips, including locally registered custom keys. It takes no arguments, requires an active plugin with the `pet` permission, and is available in tool, panel and block contexts. It exposes first-variant metadata only, with no filesystem paths. Errors include `permission_denied`, `plugin_inactive`, `unsupported_context` and `invalid_request`. The extension is included in the main branch and has passed compatibility tests with a local packaged macOS arm64 host 0.23.0 build. Host 0.22 does not support it; feature-detect the method on older hosts. The official host is still distributed through invitation-only channels. This is neither a public host release nor a new npm release.

继续通过已有 `pet.pet.playAnim(state)` 播放，不为各动作新增方法。其布尔返回值仅确认已向宠物窗口分发，不能代表播放完成。单次素材自然结束回待机，循环素材持续到下一动作或真实交互。既有唤醒优先级保持：wake 不打断走路/送文件等行为。缺失标准动作默认回 idle；send 优先回 walk，edgehide 优先回 sleep；未注册的未知键不播放。动画调用只控制本机伙伴；不是远程操控访客的接口。

`playAnim` keeps its existing boolean dispatch acknowledgement, not a completion promise. Non-looping clips return to idle; looping clips continue until superseded by another animation or interaction. Existing wake priority remains. Missing standard states resolve to idle, except send prefers walk and edgehide prefers sleep; unknown unregistered names do nothing. Playback addresses the local companion, not a remote visitor.

14 个标准键：`idle walk sleep wake speak send drag unread edgehide peek unpeek greet dropempty dropfull`。跨机包要求 idle/walk，其余选配；扩展描述 v2 显式声明 loop，只传严格验证的静态 PNG 与描述，不能携带代码。旧 v1 双动作包继续兼容。接收端不支持扩展描述时，出发前明确失败；不会悄悄删掉动作。局域网无需登录或好友验证，串门期间外观不变。

Cross-machine appearance v2 permits the fourteen listed states with explicit loop flags; idle and walk are required. Legacy v1 two-state packages remain supported. Unsupported receivers fail preparation before departure. Only validated static PNG frames and animation metadata are transferred, never plugin code. Other visitor action slots can be decoded without a new automatic behavior: actual visitor triggers follow its existing arrival, speaking, dragging, delivery and edge lifecycle.

查询沿用现有 SDK 桥参数归一化：JavaScript 多传的参数会被零参数方法忽略，TypeScript 签名在编译时拒绝它们；原始主进程协议载荷若带参数则拒绝 invalid_request。The existing JavaScript bridge normalizes this method to zero arguments (extra caller arguments are ignored); TypeScript rejects extra arguments at compile time. A malformed raw host protocol request with arguments is rejected with invalid_request.

## 聊天主题包 v1 / Chat themes (experimental, unreleased)

本节描述开发分支的格式，最低已发布宿主版本尚未确定，不能据类型或文档更新宣称既有宿主支持。主题包由用户在设置中选择，安装不会自动应用，不读取聊天内容，不运行主题脚本，不增加 tool/panel/block 方法。

This data-only format is experimental and unreleased. No released host compatibility is claimed. Installing registers a choice; the user selects it in host settings. Themes cannot read chat content or execute code, and add no SDK methods. Raw ui.injectStyle remains closed.

manifest 使用 kind: ['theme']、permissions: ['ui:theme']，entry 仅有 theme 字段，值为包内相对路径（推荐 theme.json）。不接受其他入口、services、provides 或 activation。

Only the theme kind and ui:theme permission are accepted; entry contains only a relative theme path. Service, activation and executable entry declarations are rejected.

主题 JSON 精确包含 schemaVersion: 1、target: 'chat'、colors、radius、bubbleRadius、texture 六个字段，最多 16 KiB。colors 必须提供 canvas、panel、ink、muted、surface、card、line、accent、accentInk、tint、success、error、errorSurface、file、fileInk，每值为 #RRGGBB。两个圆角为 0–28 整数，texture 为 plain / paper / grid。未知字段、脚本、任意 CSS、URL、越界路径均拒绝。

JSON has exactly six fields and fifteen #RRGGBB color slots, integer radii 0–28, and a plain/paper/grid texture preset. The host enforces the 16 KiB limit, exact values and path containment. TypeScript checks do not replace runtime validation.

切换保留草稿和会话，重启恢复有效选择；卸载、停用或失效恢复默认并解释原因，重新安装不自动选中。保存失败保留现有选择，包更新失败保留之前可用版本。

Switching preserves drafts and conversation state. Valid choices survive restart. Removal, disabling or invalidation restores the default with a reason; reinstalling does not automatically select the package. Failed selection writes keep the current choice; failed updates retain the previous working version.

在包含此改动的源码检出中运行 `node index.js my-theme --kind theme`。生成 manifest.json、theme.json、package.json 与说明，不生成可执行入口。普通模板的权限不变。此用法尚未发布到正式 CLI。

From a checkout containing this change, run `node index.js my-theme --kind theme`. It generates data and documentation only. Existing templates keep their permissions. This is an unreleased source feature.


## 实时形象 / Realtime appearance（M1b / M2 候选，未发布）

本期只更新契约说明与交付检查，不增加 renderer 生成模板；tool/panel/dashboard-card 基础模板不会申请 `appearance:render`。公共渲染代码和个人 asset 数据必须分包。

- 渲染包仅 `kind:["appearance-renderer"]`、`permissions:["appearance:render"]`，入口为 `entry.renderer:{src:"renderer.html",apiVersion:1,dataVersions:[1]}`；不可混合 tool/panel/service 入口或通用权限。dataVersions 接受 1–64 项不重复的正安全整数，版本由 renderer 定义，示例 [1] 不是宿主限制。
- 个人形象继续保留普通动作，在 character.json 增加 `realtime:{renderer:"sample-renderer",dataVersion:1,data:"realtime/data.json",assets:{head:"realtime/head.png"}}`。data/assets 相对于 character.json，不能指向外部 URL 或宿主路径。
- data 最多 64 KiB；资源最多 32 项，单项 16 MiB、总计 64 MiB；仅 png/jpg/jpeg/webp/json/glb/bin，单张图片每边最多 8192 像素、总像素最多 16 × 1024²，全部作为数据读取。照片留在个人资源包，渲染包只提供公共代码与模型。
- `PetRender` 只有 `pet.render.onControl`、`submitFrame`、`fail`，不继承普通 SDK。onControl 返回取消订阅函数；submitFrame/fail 返回 void。控制消息含 init/begin/move/end/cancel/ack；帧仅 `{seq,width,height,pixels,x,y,phase:'active'|'idle'}`，会话由宿主绑定，不能传目标 ID。
- 首个有效 idle 帧在宿主离屏准备画布绘制后 ACK，表示准备完成，不覆盖当前普通姿态；活动阶段 ACK 在可见画布提交后发出。RGBA 帧最多 1024²，始终一帧在途。结束抓取不等于结束渲染；切换、同 key 刷新、失活或错误均回收旧会话。
- `appearance.getState().own.realtime` 是可选 `{renderer,dataVersion,state}`，state 为 ready/missing-renderer/unsupported/unavailable。缺字段或无兼容 renderer 时保留普通动作。不能凭 apiVersion 1 宣称旧宿主支持。

`submitFrame` 同步抛出 `render_not_initialized` / `invalid_frame` / `stale_frame` / `frame_in_flight`。拒绝不消耗 seq，init 重置计数；匹配 ack 先释放在途帧位再调用 onControl，监听器内可发送下一帧。像素只复制有效视图，避免传输无关的大 backing buffer。These are synchronous errors, not Promise rejections.

The dedicated render sandbox only exposes the three render methods; tool, panel and block do not gain frame control. The installed renderer receives immutable data and session-scoped asset URLs, never a personal plugin directory or host credentials. Preparation acknowledges drawing to the host preparation canvas without replacing the ordinary pose; active rendering is acknowledged after visible-canvas submission. The render-bridge apiVersion and renderer dataVersion are separate. The complete message and type contract lives in [pet-plugin-types](https://github.com/ShunyuYao/pet-plugin-types).

M1b 只创建 host；尚未发布的 M2 候选支持 `init.instance.kind:'visitor'`，沿用三个 render 方法，不新增方法、权限或模板。M2 通过现有认证来访通道传递出发时固定的数据和资源，普通动作 v1–v3 描述保持不变。接收端仅运行本机已安装、已授权且数据版本兼容的 provider，不接收、安装或执行远端插件代码，也不跨机传送连续 RGBA 帧。每位访客独立会话，召回/离开优先终止抓取或自由落体并清理。

缺少、未授权或不兼容 provider 时，串门继续普通动作并提示暂不支持布偶拖拽；损坏资源或准备失败须明确失败。可用实时访客在普通帧解码且首个有效 idle 帧在宿主离屏准备画布绘制后 ACK 后才允许出发。以上是候选兼容契约，不是跨机或 E2E 验收结论。本候选尚未发布 npm 或宿主版本，不填写未经构建验证的 minHostVersion，不登记市场条目，也不提供测试宿主下载入口。

M1b creates host instances only; the unreleased M2 candidate also binds visitors through the same three render methods. An authenticated visit channel carries immutable departure data and resources, without changing ordinary v1–v3 descriptors. Only a locally installed, authorized and data-compatible provider executes on the receiver. Peer plugin code and continuous RGBA frames are not transferred. Recall/departure cancels local grabbing or falling and cleans up the visitor session.

A missing, unauthorized or incompatible provider uses ordinary actions with a notice; corrupt resources or failed preparation must fail explicitly. Supported realtime visits wait for ordinary-frame decoding and acknowledgement after drawing the first valid idle frame to the host preparation canvas before departure. This documents candidate requirements, not a public release declaration; see the dated validation status below. No new template, package publication, marketplace entry, minimum released host version or public host download is introduced.

交付时使用实际候选宿主与类型包路径运行 `test:delivery`；它经类型包检查器核对四列能力矩阵和 renderer 隔离契约，同时验证四种现有模板。没有相应依赖时不能将跳过记为通过。

### 私有候选验证 / Private candidate validation

2026-09-22 验证状态：私有 macOS arm64 候选的真实签名 ASAR 完成 168 项隐藏端到端检查；两个独立 Mac 经虚拟局域网完成 153 项检查，覆盖双向来访、轻放/抛出、召回、重启和缺 provider 回退。不是物理 Wi-Fi 广播、Windows、原生焦点/穿透或公开发布的证明。未新增能力或最低已发布宿主版本；个人素材不随这些公开仓库分发。

Validation status (2026-09-22): a private macOS arm64 signed-ASAR candidate passed 168 hidden E2E checks; two separate Macs passed 153 checks over a virtual LAN, including both visit directions, placement/throwing, recall, restart and missing-provider fallback. This does not establish physical Wi-Fi broadcast, Windows, native focus/passthrough or a public release. No API or minimum released host version is added, and personal assets are not distributed by these public repositories.


## 独立布偶提供者 / Independent ragdoll provider

`pet-ragdoll-renderer` 使用现有实验 `PetRender` 三方法和声明式资源接口；它定义的 `dataVersion: 2` 将衣服贴图、轮廓及头像都放在角色包，公共 provider 不含形象素材。这是 provider 私有数据版本的变化，不是宿主桥 API 升级。兼容基线为受邀 macOS arm64 候选 `0.26.0-ragdoll.1`，旧 `0.26.0` 不支持。宿主仍仅受邀分发，不因插件公开而公开宿主。

The independent provider uses the existing experimental three-method render bridge. Provider-owned appearance data v2 moves clothing textures, contours and portraits into the owning appearance package; it does not add a host SDK method or a scaffold permission. Compatibility is limited to the invited realtime-capable macOS arm64 candidate `0.26.0-ragdoll.1`; older `0.26.0` is unsupported. Publishing a provider does not publish host installers or an npm SDK version.


## 通用手柄输入 / Action input（experimental，未发布）

2026-09-29 候选新增 `input` 10 个 B 档方法。`input.d.ts` 声明输入数据和方法，`work.d.ts` 补齐 HTML 作品独立根；普通 plugin 根没有 work 的输入捕获或联机会话权限。`apiVersion: 1`、源码包版本和手柄协议 1 均不证明旧宿主支持；本轮没有 npm 发布、最低已发布宿主版本或硬件兼容承诺。

The September 29 candidate adds ten experimental input methods and a separate HTML-work type root. This is unreleased source, not a published npm package or a minimum supported host release. Input protocol 1, package version and host apiVersion are independent; none proves hardware compatibility.

| Context | Input methods | Permission |
| --- | --- | --- |
| tool | registerProvider, getConfig, updateConfig, unregisterProvider | input:provide |
| panel | getConfig, updateConfig | input:provide; panel entry also needs ui |
| work | connect, read, setContext, onStatus, openSettings, disconnect | service:gamepad-input |
| block / render | None | No input authority |

提供方必须包含 tool 入口，身份由宿主绑定；panel 只改自己提供方的配置，关面板不会停输入。第一次已授权登记选择提供方，后来的插件不能抢占。默认值不覆盖旧偏好；updateConfig 用 expectedRevision 原子比较写入，写失败不广播，逐游戏 target 只接受宿主登记的 gameKey。全局绑定限通用 ui.*，自定义动作在逐游戏层配置；实际合并后的映射也校验类型和冲突。

A provider must have a tool entry. Identity and selection belong to the host, and panels configure only their own provider. Registration preserves preferences. Configuration changes use atomic revision/CAS updates; failure keeps the old active configuration. Game targets are host-issued identities; global bindings use only common ui.* actions, while custom actions are configured per game. Closing a panel does not stop its provider.

高频采样与 read 留在游戏的隔离 preload 中，不逐帧调用提供方/主进程。游戏声明动作并保留键鼠路径；失焦、断连、撤权或提供方失败会中和，resetRevision 变化时须取消旧持续动作并推进 press/release 消费基线。强制中和不伪造物理 releaseCount，避免蓄力误发招。重新启用先等待回中；gameplay 中的新配置到菜单/暂停才整体生效，onStatus 报 pendingRevision。提示取 presentation 的有限文本/glyph，不能假定按钮数组下标或具体品牌。

Sampling and synchronous read remain inside the work preload. Games retain keyboard/mouse paths and consume monotonic edges once. Focus loss, disconnection, revocation and provider failure cancel held actions without synthesizing a physical release. On resetRevision changes, cancel gameplay and advance consumption baselines. Restoration requires neutral controls; configuration changes wait for a menu/pause boundary and report pendingRevision. Use presentation labels/glyphs for prompts.

HTML 沿用 v1/v2 的 service:gamepad-input 权限，并探测 pet.input 后回退键鼠。该服务名是宿主保留名；不得通过 services.provide/get/invoke 冒用，通用 provide 仍为 C 档未公开。work 没有通用 events/get 服务代理。work.sessions 类型反映已有 2–4 人实际契约，不能由此推断旧宿主支持 3–4 人声明。

HTML keeps the existing named-service permission and feature-detects pet.input. gamepad-input is reserved and cannot be impersonated or accessed through generic service discovery/invocation. Generic services.provide remains closed. Work receives no generic plugin events or service proxies; its session types reflect the current 2–4 player contract, not compatibility with older hosts.

首轮真机目标是 macOS + PS5 DualSense；Xbox、PS4/PS5 是计划支持范围，USB/蓝牙、原生焦点和具体型号仍需单独记录证据。纯 Node/类型/示例编译不证明设备兼容。当前数据格式只接受浏览器 standard mapping；auto 无可靠型号信息时显示通用标签，手动 Xbox/PlayStation 标签也不改变物理映射。没有震动、陀螺仪、自适应扳机或同机多人契约。

The first hardware target is macOS with PS5 DualSense. Planned Xbox/PS4/PS5 coverage still requires model, OS and USB/Bluetooth evidence. Unit/type/example compilation is not hardware validation. This candidate accepts standard Gamepad mappings only; label preferences do not change physical mappings. Haptics, gyro, adaptive triggers and local multiplayer are outside this contract.

独立样例：[输入提供方](examples/input-provider/README.md)、[HTML 游戏](examples/input-work/README.md)。基础 CLI 模板不自动申请手柄权限；这两个候选示例按需使用，不新增默认 kind。`test:delivery` 在原有生成/宿主对账后运行 `test:input-examples`，使用显式提供的宿主与类型目录编译实际 JS 和单文件 HTML 脚本，无缺依赖 SKIP。

The separate provider and HTML-work examples are opt-in; ordinary CLI templates keep their original permissions and kinds. Delivery compiles the shipped example sources against the explicitly supplied types and validates declarations against the actual host. Missing host/types paths fail instead of skipping.
