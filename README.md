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

| 命名空间 | 方法 | tool | panel | dashboard-card |
|---|---|:--:|:--:|:--:|
| `storage` | `get` `set` `delete` `all` | A | A | A |
| `secrets` | `get` `set` `delete` | A | — | — |
| `pet` | `bubble` `playAnim` `speak` | A | A | A |
| `ui` | `dialog` `copyText` | A | A | A |
| `ui` | `openPanel` | A | — | — |
| `ui` | `closePanel` | A | A | — |
| `ui` | `taskCheck` | B | B | B |
| `events` | `on` `emit` | A | A | A |
| `scheduler` | `every` `daily` `cancel` | A | — | — |
| `net` | `fetch` | A | — | — |
| `services` | `get` | A | A | A |
| `settings` | `get` | A | A | A |
| `friends` | `me` `list` `isFriend` `avatar` | A | A | A |
| `dashboard` | `requestHeight` `notifyReady` | A | — | A |
| `tools` | `register` | A | — | — |
| `ai` | `chat` | B | B | B |
| `files` | `pick` `stat` `open` `list` `remove` `pin` `unpin` | B | B | — |
| `activity` | `getLatest` `connectionInfo` | B | B | B |
| `calendar` | `registerProvider` | B | — | — |
| （顶层常量） | `pet.context` | — | — | A（值为 `'dashboard-block'`） |

三种上下文的精确类型分别是 `PetTool` / `PetPanel` / `PetBlock`，编辑器里越界访问会直接
报错。**返回值一律按 `Promise` 处理**：宿主内部有同步与 RPC 两条实现路径，`await` 在两
种形态下都正确。

`panel` 与 `dashboard-card` 由宿主强制加 CSP：`script-src 'self' 'unsafe-inline'`，
不含任何远端源——内联 `<script>` 可用，但**不能从 CDN 拉脚本**，依赖请随插件目录打包。

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

## 相关

- 类型定义：[@pet/plugin-types](https://github.com/ShunyuYao/pet-plugin-types)
- 插件市场与开发者政策：[pet-plugin-registry](https://github.com/ShunyuYao/pet-plugin-registry)
