/**
 * 工具型插件最小样板。
 * 入口导出 activate(pet)，宿主在激活时调用一次。
 */
exports.activate = async function activate(pet) {
  // 注册一个工具，宿主 Agent 可以调用它
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
};
