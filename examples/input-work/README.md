# HTML 游戏输入示例 / HTML work action input

`game.html` 是完整单文件作品，声明 v1 与 `service:gamepad-input`。在候选宿主的 HTML 作品窗口打开，点“Enable controller”走真实授权，再连接。手柄需先按确认选择设备、松开回中；计数器随后响应跳跃动作。Space 键一直可用。

Open the standalone HTML in a candidate host's work player. Enable controller input through the real work grant, confirm the device, release controls to neutral, then use the jump action. Space remains available. The v1 declaration deliberately uses the existing named-service permission; older hosts may parse it, but still need method detection and keyboard fallback.

示例按 resetRevision 取消旧动作并推进计数基线；不会把失焦/断连当成松手发招。每帧 `read` 是本地快照；菜单重复、焦点、实际游戏暂停与联网玩法仍由接入方按业务适配。本例没有验证 USB/蓝牙或具体手柄系统兼容，也不是六款游戏的完整适配。

The sample consumes monotonic edges once and resets its baseline after cancellation. `read` is local; real menus and game/network pause rules still require game-specific adaptation. This example does not establish USB/Bluetooth compatibility or complete adaptation of existing games. No released minimum host version or npm publication is claimed.
