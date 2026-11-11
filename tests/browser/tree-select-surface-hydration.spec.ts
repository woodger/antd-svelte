import { fileURLToPath } from 'node:url';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { createServer as createHttpServer } from 'node:http';
import { createServer, type ViteDevServer } from 'vite';
import { test, expect } from './test';
import { readTreeSelectVirtual } from './tree-select-virtual-metrics';

let server: ViteDevServer;
let cache: string;
test.beforeAll(async () => {
  cache = await mkdtemp(join(fileURLToPath(new URL('../../.upstream/artifacts/', import.meta.url)),
    'tree-select-surface-hydration-'));
  server = await createServer({
    configFile: fileURLToPath(new URL('./vite.config.ts', import.meta.url)),
    server: { middlewareMode: true, hmr: { server: createHttpServer() }, watch: null },
    appType: 'custom', cacheDir: cache
  });
});
test.afterAll(async () => {
  await server?.close();
  if (cache) await rm(cache, { recursive: true, force: true });
});

test('TreeSelect hydrates the initial custom popup in place before moving it to its container', async ({ page }) => {
  const module = await server.ssrLoadModule(fileURLToPath(new URL(
    './fixtures/tree-select-surface-hydration.server.ts', import.meta.url
  )));
  const { head, body } = module.renderTreeSelectPopup();
  await page.goto('/tree-select-surface-hydration.html');
  await page.evaluate(({ head, body }) => {
    document.head.insertAdjacentHTML('beforeend', head);
    document.getElementById('root')!.innerHTML = body;
  }, { head, body });
  const outside = page.getByRole('button', { name: 'Outside selection' });
  const editor = page.getByRole('combobox', { name: 'Surface selection', exact: true });
  const draft = page.getByRole('textbox', { name: 'Popup draft' });
  await expect(draft).toHaveCount(0);
  await outside.focus();
  await page.addScriptTag({ type: 'module', url: '/tree-select-surface-hydration.client.ts' });
  await page.waitForFunction(() => window.treeSelectPopupHydration);
  await expect(outside).toBeFocused();
  await expect(draft).toHaveValue('Draft');
  expect(await page.evaluate(() => {
    const { popup, editor, draft } = window.treeSelectPopupHydration!;
    return {
      samePopup: popup === document.querySelector('[data-surface-target] [popover]:popover-open'),
      sameEditor: editor === document.querySelector('input[role="combobox"]'),
      sameDraft: draft === document.querySelector('[data-surface-draft]'),
      fieldId: editor.id,
      draftId: draft.getAttribute('id'),
      tree: Boolean(document.getElementById(editor.getAttribute('aria-controls')!))
    };
  })).toEqual({ samePopup: true, sameEditor: true, sameDraft: true,
    fieldId: expect.stringMatching(/^ant-field-tree-select-popup-/), draftId: null, tree: true });
  await expect(page.locator('[data-surface-events]')).toHaveText('[]');
  await expect(page.locator('[data-surface-lifecycle]')).toHaveText('["mount"]');
  await draft.fill('Hydrated draft');
  await outside.click();
  await editor.click();
  await expect(draft).toHaveValue('Hydrated draft');
  await page.locator('[data-surface-target]').getByText('Beta', { exact: true }).click();
  await expect(editor).toHaveValue('Beta');
  await expect(editor).toBeFocused();
  await page.evaluate(() => window.treeSelectPopupHydration!.dispose());
  await expect(page.locator('[popover]:popover-open')).toHaveCount(0);
});

test('TreeSelect hydrates a hidden virtual window before scrolling to the selected row', async ({ page }) => {
  const module = await server.ssrLoadModule(fileURLToPath(new URL(
    './fixtures/tree-select-virtual-hydration.server.ts', import.meta.url
  )));
  const { head, body } = module.renderVirtualTreeSelect();
  await page.goto('/tree-select-surface-hydration.html');
  await page.evaluate(({ head, body }) => {
    document.head.insertAdjacentHTML('beforeend', head);
    document.getElementById('root')!.innerHTML = body;
  }, { head, body });
  await expect(page.locator('[popover][hidden] [role="treeitem"]')).toHaveCount(5);
  await page.addScriptTag({ type: 'module', url: '/tree-select-virtual-hydration.client.ts' });
  await page.waitForFunction(() => window.virtualTreeSelectHydration);
  await expect.poll(() => page.evaluate(readTreeSelectVirtual, 'native')).toMatchObject({
    open: true, viewport: { count: 5, height: 84, top: 1627, active: 'Node 60' }
  });
  expect(await page.evaluate(() => window.virtualTreeSelectHydration!.popup
    === document.querySelector('[popover]:popover-open'))).toBe(true);
  await page.evaluate(() => window.virtualTreeSelectHydration!.dispose());
  await expect(page.locator('[popover]:popover-open')).toHaveCount(0);
});

test('TreeSelect hydrates declarative nodes and the existing popup without replacing the field', async ({ page }) => {
  const module = await server.ssrLoadModule(fileURLToPath(new URL(
    './fixtures/tree-select-nodes-hydration.server.ts', import.meta.url
  )));
  const { head, body } = module.renderDeclaredTreeSelect();
  await page.goto('/tree-select-surface-hydration.html');
  await page.evaluate(({ head, body }) => {
    document.head.insertAdjacentHTML('beforeend', head);
    document.getElementById('root')!.innerHTML = body;
  }, { head, body });
  await expect(page.locator('[popover][hidden] [role="treeitem"]')).toHaveCount(5);
  await page.addScriptTag({ type: 'module', url: '/tree-select-nodes-hydration.client.ts' });
  await page.waitForFunction(() => window.declaredTreeSelectHydration);
  const input = page.getByRole('combobox', { name: 'Declared selection', exact: true });
  await expect(page.locator('[popover]:popover-open .ant-tree-title'))
    .toHaveText(['Node Parent', 'Node Zero', 'Node Beta', 'Node Disabled', 'Node Tail']);
  expect(await page.evaluate(() => ({
    input: window.declaredTreeSelectHydration!.input === document.querySelector('[aria-label="Declared selection"]'),
    popup: window.declaredTreeSelectHydration!.popup === document.querySelector('[popover]:popover-open')
  }))).toEqual({ input: true, popup: true });
  await page.locator('[popover]:popover-open [data-node-marker="beta"] [data-ant-tree-content]').click();
  await expect(input).toHaveValue('Node Beta');
  await expect(input).toBeFocused();
  await page.evaluate(() => window.declaredTreeSelectHydration!.dispose());
  await expect(page.locator('[popover]:popover-open')).toHaveCount(0);
});

test('TreeSelect hydrates autofocus without taking focus from another control and opens on the next focus', async ({ page }) => {
  const module = await server.ssrLoadModule(fileURLToPath(new URL(
    './fixtures/tree-select-trigger-hydration.server.ts', import.meta.url
  )));
  const { head, body } = module.renderTreeSelectTrigger();
  await page.goto('/tree-select-surface-hydration.html');
  await page.evaluate(({ head, body }) => {
    document.head.insertAdjacentHTML('beforeend', head);
    document.getElementById('root')!.innerHTML = body;
  }, { head, body });
  const outside = page.getByRole('button', { name: 'Outside trigger', exact: true });
  await outside.focus();
  await page.addScriptTag({ type: 'module', url: '/tree-select-trigger-hydration.client.ts' });
  await page.waitForFunction(() => window.treeSelectTriggerHydration);
  await expect(outside).toBeFocused();
  await expect(page.locator('[data-trigger-events]')).toHaveText('[]');
  const editor = page.getByRole('combobox', { name: 'Trigger selection', exact: true });
  expect(await page.evaluate(() => ({
    input: window.treeSelectTriggerHydration!.input === document.querySelector('[aria-label="Trigger selection"]'),
    root: window.treeSelectTriggerHydration!.root === document.querySelector('.ant-select')
  }))).toEqual({ input: true, root: true });
  await page.getByRole('button', { name: 'Focus trigger ref', exact: true }).dispatchEvent('click');
  await expect(editor).toBeFocused();
  await expect(editor).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-trigger-events]')).toHaveText('[["open",true],["focus","DIV"]]');
  await page.evaluate(() => window.treeSelectTriggerHydration!.dispose());
  await expect(page.locator('[popover]')).toHaveCount(0);
});

test('TreeSelect hydrates custom Form feedback in place and keeps its field during status updates', async ({ page }) => {
  const module = await server.ssrLoadModule(fileURLToPath(new URL(
    './fixtures/form-feedback-hydration.server.ts', import.meta.url
  )));
  const { head, body } = module.renderFormFeedback();
  await page.goto('/tree-select-surface-hydration.html');
  await page.evaluate(({ head, body }) => {
    document.head.insertAdjacentHTML('beforeend', head);
    document.getElementById('root')!.innerHTML = body;
  }, { head, body });
  const outside = page.getByRole('button', { name: 'Outside feedback', exact: true });
  await outside.focus();
  await page.addScriptTag({ type: 'module', url: '/form-feedback-hydration.client.ts' });
  await page.waitForFunction(() => window.formFeedbackHydration);
  await expect(outside).toBeFocused();
  expect(await page.evaluate(() => ({
    input: window.formFeedbackHydration!.input === document.querySelector('[aria-label="Feedback selection"]'),
    icon: window.formFeedbackHydration!.icon === document.querySelector('[data-custom-feedback]')
  }))).toEqual({ input: true, icon: true });
  const input = page.getByRole('combobox', { name: 'Feedback selection', exact: true });
  await input.focus();
  await page.getByRole('combobox', { name: 'Feedback action', exact: true }).selectOption('1');
  await page.getByRole('button', { name: 'Apply feedback action', exact: true }).dispatchEvent('click');
  await expect(page.locator('[data-custom-feedback]')).toHaveText('local 0 error');
  await expect(input).toBeFocused();
  expect(await page.evaluate(() => window.formFeedbackHydration!.input
    === document.querySelector('[aria-label="Feedback selection"]'))).toBe(true);
  await page.evaluate(() => window.formFeedbackHydration!.dispose());
  await expect(page.locator('[class*="-item-feedback-icon"]')).toHaveCount(0);
});
