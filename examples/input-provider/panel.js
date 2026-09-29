// @ts-check
/** @type {import('@pet/plugin-types').PetPanel | undefined} */
const inputPanelSdk = Reflect.get(window, 'pet');
const panelStatus = document.getElementById('status');
const layoutSelect = /** @type {HTMLSelectElement} */ (document.getElementById('layout'));
const saveButton = /** @type {HTMLButtonElement} */ (document.getElementById('save'));
let revision = 0;
/** @param {unknown} message */
function showStatus(message) { if (panelStatus) panelStatus.textContent = String(message); }
async function refreshConfig() {
  if (!inputPanelSdk?.input) { saveButton.disabled = true; showStatus('Input SDK unavailable in this host.'); return; }
  const current = await inputPanelSdk.input.getConfig();
  revision = current.revision;
  layoutSelect.value = current.global.layout || 'auto';
  showStatus(current.selected ? 'Selected provider' : 'Registered but not selected');
}
saveButton.addEventListener('click', async () => {
  if (!inputPanelSdk?.input) return;
  saveButton.disabled = true;
  try {
    const layout = /** @type {import('@pet/plugin-types').InputLayout} */ (layoutSelect.value);
    const result = await inputPanelSdk.input.updateConfig({ expectedRevision: revision, target: 'global', patch: { layout } });
    revision = result.revision;
    showStatus('Saved. Active gameplay applies the change at the next menu/pause boundary.');
  } catch (error) {
    // Preserve the visible draft on failure; do not overwrite someone else's revision.
    showStatus('Not saved: ' + String(error));
  } finally { saveButton.disabled = false; }
});
void refreshConfig().catch(showStatus);
