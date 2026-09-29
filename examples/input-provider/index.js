// @ts-check
/** @type {import('@pet/plugin-types').PetTool | undefined} */
let owner;
let lifecycle = Promise.resolve();

/** @param {() => Promise<void>} operation */
function enqueue(operation) {
  const result = lifecycle.then(operation);
  lifecycle = result.catch(() => {});
  return result;
}

/** @param {import('@pet/plugin-types').PetTool} pet */
exports.activate = function activate(pet) {
  return enqueue(async () => {
    if (owner) return;
    if (typeof pet.input?.registerProvider !== 'function' || typeof pet.input?.unregisterProvider !== 'function') throw new Error('This example requires an unreleased input-capable host.');
    await pet.input.registerProvider({
      protocolVersion: 1, mappingVersion: 1, layouts: ['standard'],
      defaults: { layout: 'auto', deadzone: 0.15, buttonThreshold: 0.5 },
    });
    owner = pet;
  });
};

exports.deactivate = function deactivate() {
  return enqueue(async () => {
    const previous = owner;
    owner = undefined;
    // A later activation must not register until this shutdown has completed.
    await previous?.input.unregisterProvider();
  });
};
