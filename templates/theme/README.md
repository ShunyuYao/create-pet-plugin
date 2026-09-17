# 聊天主题样板 / Chat theme starter

**实验性，未发布。** 本样板仅用于支持 theme v1 的隔离测试宿主，不代表任何现有安装包或 npm 版本已支持。最低支持宿主版本尚未指定；正式分发前用真实构建验证，再填写 `minHostVersion`。

**Experimental and unreleased.** Use this starter only with an isolated test host that implements theme v1. It does not claim support in existing host or npm releases. No minimum host version is assigned; validate a real build before declaring one for distribution.

修改 `manifest.json` 的名称、作者所需元数据和版本，并编辑 `theme.json`。目录名会成为生成的插件 ID 和名称，可自行调整。`package.json` 仅提供可选类型开发依赖，不是运行入口。

- `kind` 必须是 `["theme"]`，`permissions` 必须是 `["ui:theme"]`，`entry` 只能有指向包内 JSON 的 `theme` 字段。
- 不得声明 services、provides、activation，不能混合 tool/panel/dashboard-card。
- JSON 最大 16 KiB，只接受 `schemaVersion`、`target`、`colors`、`radius`、`bubbleRadius`、`texture` 六个字段。
- `schemaVersion: 1`、`target: "chat"`；十五个颜色键均必填，颜色必须是 `#RRGGBB` 六位十六进制字符串。
- 两种圆角均为 0–28 整数；`texture` 只允许 `plain`、`paper`、`grid`。背景由宿主绘制，不读取主题图片。
- 不接受任意 CSS、脚本、URL、字体、图标或布局尺寸。JSON 路径不得越出包目录。

The manifest is theme-only, declares exactly the `ui:theme` permission and one package-local JSON entry, and has no services, provides or activation field. The six-field document supports only the fifteen required hex colors, bounded integer radii and host-rendered texture presets. No executable code or arbitrary styles are part of this format. `ui.injectStyle` remains closed.

安装仅登记候选，由用户主动选择后应用；默认外观始终可恢复。切换保留当前聊天与草稿，重启恢复有效选择。停用、卸载、黑名单或文件损坏后回到默认；重新安装不自动抢回选择。只能改变聊天窗外观，不能读取聊天内容、文件、账号或凭据。

Installation registers a candidate; only explicit user selection applies it. Switching preserves the conversation and draft, and a valid selection persists across restarts. Disabled, removed, blocked or invalid themes fall back to the default. Reinstallation does not automatically reapply an old selection. Theme data grants no chat, file, account or credential access.

验证时检查普通消息、文件、长文本、错误提示和输入中的草稿；实际宿主安装、切换、重启和卸载都应完成。不要把浏览器预览当作宿主兼容证据。
