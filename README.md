# create-pet-plugin

一条命令生成桌宠（吐梨邦）插件骨架。

> ## ⚠️ SDK 契约尚未冻结
>
> 生成的骨架依赖 [@pet/plugin-types](https://github.com/ShunyuYao/pet-plugin-types)，
> 而该包目前全部标 `@experimental`——宿主的 SDK surface 终审还没完成，签名随时可能变。
> 现在适合用来试玩和给 SDK 提反馈，**不适合发布给他人长期使用**。

## 用法

```bash
npx github:ShunyuYao/create-pet-plugin my-plugin
npx github:ShunyuYao/create-pet-plugin my-panel --kind panel
npx github:ShunyuYao/create-pet-plugin my-card  --kind dashboard-card
```

`--kind` 可选 `tool`（默认）/ `panel` / `dashboard-card`。目录名会自动填进
manifest 的 `id` 与 `name`。

## 三种样板

| kind | 生成内容 | 说明 |
|---|---|---|
| `tool` | `manifest.json` + `index.js` | 注册一个工具供宿主 Agent 调用 |
| `panel` | `manifest.json` + `panel.html` | 独立面板窗口 |
| `dashboard-card` | `manifest.json` + `card.html` | 往看板挂一个卡片区块 |

三份 manifest 模板都已用宿主的 `core/plugin-runtime/manifest.js` 实测校验通过。

## 本地调试

1. 打开桌宠 **设置 → 插件**，开启 **开发者模式**（默认关闭）。
2. 用旁加载入口选择你生成的目录。
3. 改完代码重新加载插件即可看到效果。

> ⚠️ **旁加载不经任何审核。** 这类插件将获得对你电脑的完全访问权限
> （读写文件、联网、执行程序），仅安装你完全信任的来源。
> 这条路径供开发者调试自己的插件；分发给他人请走
> [插件市场 registry](https://github.com/ShunyuYao/pet-plugin-registry)。

## 上下文差异（重要）

`pet.*` 各命名空间在 tool / panel / dashboard-card 三种上下文下的可用性**并不一致**
（例如 `pet.tools` 只在 tool 上下文有）。这是宿主三份桥的历史差异，正在统一中。
具体能力矩阵以宿主的 SDK 终审文档为准。

## 相关

- 类型定义：[@pet/plugin-types](https://github.com/ShunyuYao/pet-plugin-types)
- 插件市场与开发者政策：[pet-plugin-registry](https://github.com/ShunyuYao/pet-plugin-registry)
