# 实验性输入提供方 / Experimental input provider

未发布示例，需候选宿主实际支持 `pet.input`；没有最低已发布宿主版本，也没有 npm 发布。此目录可用于隔离开发 profile 的“从文件夹安装”，不要复制到日常用户数据。

This is an unreleased example for an input-capable candidate host. No published host version or npm package is claimed. Use an isolated development profile for folder installation.

tool 登记标准布局和默认调校；panel 只管理自己的配置，关闭面板不会注销 tool。首次授予 `input:provide` 并登记的提供方被选中；第二个不能抢占。配置采用 revision/CAS；失败保留可见草稿，不假报成功。默认值不会覆盖已有用户偏好。选中提供方停用/崩溃时游戏降级，不自动切换到另一提供方。

The tool registers declarative defaults. Its panel edits only that provider's settings. Closing the panel does not unregister the tool. The first authorized registration selects a provider; another provider cannot take over. CAS failure preserves the draft, and registration never overwrites preferences. Provider failure disables controller input without silently switching providers.

激活与停用共享串行队列，旧注销完成前不会登记新实例；一次失败不堵住后续重试。这个最小面板没有冲突合并或刷新按钮：遇到 revision 冲突时先记下草稿，再关闭重开面板读取最新版本后重新修改；不会自动覆盖草稿或强行写入旧 revision。完整设置产品应另行设计可见的冲突处理。

Activation and deactivation share one queue so an old shutdown finishes before a replacement registers; a failed operation does not block later attempts. This minimal panel has no conflict merge/reload control. After a revision conflict, note the draft, close and reopen the panel to load the current revision, then apply the edit again. It does not silently replace drafts or force stale writes. A full settings product needs an explicit conflict-resolution flow.

此示例只演示 SDK 接入，不是定稿设置界面或硬件兼容证明。auto 在无法可靠判断设备型号时显示通用标记；可手动选 Xbox/PlayStation。标准 Gamepad mapping 之外的设备目前不受支持。

The sample is not a final settings design or hardware validation. Automatic presentation falls back to generic labels; manual Xbox/PlayStation labels are available. Nonstandard Gamepad mappings are unsupported in this candidate.
