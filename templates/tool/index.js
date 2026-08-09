/**
 * 工具型插件最小样板（apiVersion 1）。
 *
 * 入口导出 activate(pet)，宿主在激活时调用一次；可选导出 deactivate() 做清理。
 * 本样板只用 A 档（已冻结）能力：storage / pet / tools / scheduler / events。
 * 三档承诺与完整能力矩阵见 @pet/plugin-types 的 README。
 *
 * @typedef {import('@pet/plugin-types').PetTool} PetTool
 */

// 定时器 id 与 pet 句柄存在模块作用域，供 deactivate 清理
let timerId = null;
/** @type {PetTool | null} */
let sdk = null;

/** @type {import('@pet/plugin-types').ActivateFn<PetTool>} */
exports.activate = async function activate(pet) {
  sdk = pet;

  // 1) 注册一个工具，宿主 Agent 可以调用它（tools.* 仅 tool 上下文可用）
  pet.tools.register({
    name: 'say_hello',
    promptHint: '让宠物说一句问候',
    schema: {
      type: 'object',
      properties: { name: { type: 'string', description: '要问候的人' } },
      required: ['name'],
    },
    async handler({ name }) {
      await pet.pet.bubble(`你好，${name}！`);
      const count = (await pet.storage.get('greetCount', 0)) + 1;
      await pet.storage.set('greetCount', count);
      return { ok: true, count };
    },
  });

  // 2) 定时任务（scheduler.* 仅 tool 上下文可用）。返回的 id 用于 deactivate 里取消。
  timerId = await pet.scheduler.every(30 * 60 * 1000, async () => {
    const count = await pet.storage.get('greetCount', 0);
    if (count > 0) await pet.pet.bubble(`今天已经打过 ${count} 次招呼啦`);
  });

  // 3) 订阅宿主事件（events.* 三种上下文都有）
  pet.events.on('pet:clicked', () => {
    pet.pet.playAnim('happy');
  });
};

/** @type {import('@pet/plugin-types').DeactivateFn} */
exports.deactivate = async function deactivate() {
  // 停用/卸载时取消自己起的定时器，别把回调留在宿主里
  if (sdk && timerId != null) await sdk.scheduler.cancel(timerId);
  timerId = null;
  sdk = null;
};
