import { fileURLToPath } from 'node:url';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { createServer as createHttpServer } from 'node:http';
import { createServer, type ViteDevServer } from 'vite';
import { test, expect } from './test';

let server: ViteDevServer;
let cache: string;
test.beforeAll(async () => {
  cache = await mkdtemp(join(fileURLToPath(new URL('../../.upstream/artifacts/', import.meta.url)), 'tree-select-input-hydration-'));
  server = await createServer({ configFile: fileURLToPath(new URL('./vite.config.ts', import.meta.url)),
    server: { middlewareMode: true, hmr: { server: createHttpServer() }, watch: null }, appType: 'custom', cacheDir: cache });
});
test.afterAll(async () => {
  await server?.close();
  if (cache) await rm(cache, { recursive: true, force: true });
});

test('TreeSelect hydrates a custom editor with the Source controlled value while keeping identity and focus', async ({ page }) => {
  const module = await server.ssrLoadModule(fileURLToPath(new URL('./fixtures/tree-select-input-hydration.server.ts', import.meta.url)));
  const rendered = module.renderTreeSelectInput();
  await page.goto('/tree-select-input-hydration.html');
  await page.evaluate(({ head, body }) => {
    document.head.insertAdjacentHTML('beforeend', head);
    document.getElementById('root')!.innerHTML = body;
    const input = document.querySelector<HTMLInputElement>('[data-tree-select-input-case] input')!;
    input.value = 'Draft before hydration';
    input.focus();
    input.setSelectionRange(2, 8);
  }, { head: rendered.head, body: rendered.body });
  await page.addScriptTag({ type: 'module', url: '/tree-select-input-hydration.client.ts' });
  await page.waitForFunction(() => window.treeSelectInputHydration);
  expect(await page.evaluate(() => {
    const { editor, root } = window.treeSelectInputHydration!;
    return { sameEditor: editor === document.querySelector('[data-tree-select-input-case] input'),
      sameRoot: root === document.querySelector('[data-tree-select-input-case] .ant-select'),
      draft: editor.value, focused: document.activeElement === editor, selection: [editor.selectionStart, editor.selectionEnd] };
  })).toEqual({ sameEditor: true, sameRoot: true, draft: '', focused: true, selection: [0, 0] });
  await expect(page.locator('[data-input-refs]')).toHaveAttribute('data-input-refs', 'true');
  await expect(page.locator('[data-input-events]')).toHaveText('[]');
  const field = page.locator('[data-tree-select-input-case] input');
  await field.fill('Hydrated');
  await expect(page.locator('[data-input-controlled]')).toHaveText('"Hydrated"');
  await page.locator('[data-input-update]').evaluate(node => node.dispatchEvent(new CustomEvent('fixtureupdate', { detail: { ownPhase: 1 } })));
  await expect(field).toHaveAttribute('id', 'own-live-after');
  await expect(field).toHaveValue('Hydrated');
  await expect(field).toBeFocused();
  expect(await page.evaluate(() => window.treeSelectInputHydration!.editor
    === document.querySelector('[data-tree-select-input-case] input'))).toBe(true);
  await page.evaluate(() => window.treeSelectInputHydration!.dispose());
  await expect(page.locator('[data-tree-select-input-case] input')).toHaveCount(0);
  await expect(page.locator('[popover]')).toHaveCount(0);
});
