# 吐梨邦桌宠插件 / TuliBang plugins

插件让桌宠增加飞书连接、剪贴板、独立面板等能力。用户在桌宠内安装和管理插件；开发者可以用本仓库生成插件骨架，再提交到插件市场。

The desktop pet can gain new abilities through plugins. This repository is the starting point for using, building, and publishing them.

## 用户：在哪里找、怎么安装？

宿主目前处于受邀测试阶段，请通过受邀测试渠道获取桌宠；公开插件仓库不提供宿主安装包。

1. 在桌宠打开「设置 → 插件中心 → 插件市场」，或从主面板「更多 → 插件」进入。市场展示[已登记的插件](https://github.com/ShunyuYao/pet-plugin-registry/blob/main/registry/plugins.json)。
2. 选择插件，查看用途、权限和兼容要求，确认后安装。
3. 在「已安装」查看、启停或卸载；有独立面板的插件可在这里打开。具体功能和用法见该插件自己的 README。

插件作者发布源码或 zip 后，还须向[市场登记表](https://github.com/ShunyuYao/pet-plugin-registry)提交并通过审核。登记合并、桌宠成功刷新登记表后，插件才会出现在应用内市场。

**本地导入：** 开发者在「设置 → 插件中心」开启「开发者模式」，选择「手动安装 → 从文件夹安装」，导入含 `manifest.json` 的插件目录。该入口不经过市场审核；当前界面不支持直接导入 `.zip` 或 URL。见[本地调试说明](docs/DEVELOPER_GUIDE.md#本地调试)。

## 开发者：从哪里开始？

用一条命令生成插件骨架：

```bash
npx github:ShunyuYao/create-pet-plugin my-plugin
```

可选 `--kind panel` 或 `--kind dashboard-card`；默认生成 `tool`。接着阅读[完整开发指南](docs/DEVELOPER_GUIDE.md)和 [SDK 类型与 API 契约](https://github.com/ShunyuYao/pet-plugin-types)。准备公开发布时，按[市场政策及提交步骤](https://github.com/ShunyuYao/pet-plugin-registry)维护独立源码仓库、用 CI 产出 release zip，并向登记表提 PR。

## English quick start

The host is currently distributed through invitation-only testing channels; public plugin repositories do not provide the host installer.

- **Install a listed plugin:** In the app, open **Settings → Plugin Center → Plugin Marketplace** or **More → Plugins** from the main panel. Review its purpose, permissions, and compatibility, then confirm installation. Manage it under **Installed** and consult its own README for feature-specific use.
- **Find it after publication:** A source release alone does not list a plugin. After its [registry PR](https://github.com/ShunyuYao/pet-plugin-registry) is reviewed and merged and the app refreshes the registry, users can find it in the in-app marketplace.
- **Import a local plugin for development:** Enable **Developer Mode** in Plugin Center, then choose **Manual Install → Install from Folder** and select a directory containing `manifest.json`. The current UI does not import `.zip` files or URLs directly.
- **Build and submit a plugin:** Run `npx github:ShunyuYao/create-pet-plugin my-plugin`, read the [development guide](docs/DEVELOPER_GUIDE.md) and [SDK reference](https://github.com/ShunyuYao/pet-plugin-types), then follow the [registry submission policy](https://github.com/ShunyuYao/pet-plugin-registry).
