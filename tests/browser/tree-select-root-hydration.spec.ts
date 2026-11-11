import { fileURLToPath } from 'node:url';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { createServer as createHttpServer } from 'node:http';
import { createServer, type ViteDevServer } from 'vite';
import { test, expect } from './test';

let server: ViteDevServer;
let cache: string;
test.beforeAll(async () => {
  cache = await mkdtemp(join(fileURLToPath(new URL('../../.upstream/artifacts/', import.meta.url)),
    'tree-select-root-hydration-'));
  server = await createServer({ configFile: fileURLToPath(new URL('./vite.config.ts', import.meta.url)),
    server: { middlewareMode: true, hmr: { server: createHttpServer() }, watch: null },
    appType: 'custom', cacheDir: cache });
});
test.afterAll(async () => {
  await server?.close();
  if (cache) await rm(cache, { recursive: true, force: true });
});

for (const id of ['own-button', 'own-input', 'composite', 'default-open']) {
  test(`TreeSelect hydrates ${id} root and imperative refs without replacing DOM`, async ({ page }) => {
    const module = await server.ssrLoadModule(fileURLToPath(new URL(
      './fixtures/tree-select-root-hydration.server.ts', import.meta.url
    )));
    const { head, body } = module.renderTreeSelectRoot(id);
    await page.goto('/tree-select-root-hydration.html');
    await page.evaluate(({ head, body }) => {
      document.head.insertAdjacentHTML('beforeend', head);
      document.getElementById('root')!.innerHTML = body;
    }, { head, body });
    const outside = page.getByRole('button', { name: 'Outside root', exact: true });
    await outside.focus();
    await page.addScriptTag({ type: 'module', url: `/tree-select-root-hydration.client.ts?sample=${id}` });
    await page.waitForFunction(() => window.treeSelectRootHydration);
    await expect(page.locator('[data-tree-select-root-host]')).toHaveAttribute('data-root-ready', 'true');
    await expect(outside).toBeFocused();
    expect(await page.evaluate(() => {
      const field = document.querySelector('[data-root-probe]');
      return { field: field === window.treeSelectRootHydration!.field,
        native: (field?.closest('.root-own') ?? field) === window.treeSelectRootHydration!.native };
    })).toEqual({ field: true, native: true });
    await expect(page.locator('[data-root-events]')).toHaveText('[]');
    const field = page.locator('[data-tree-select-root-host] [data-root-probe]');
    if (id === 'own-input' || id === 'composite') {
      await field.fill('Hydrated root draft');
      await field.click();
      await expect(field).toHaveValue('Hydrated root draft');
      await expect(page.locator('[data-root-events]')).not.toContainText('search');
    }
    await page.getByRole('button', { name: 'Root ref focus', exact: true }).dispatchEvent('click');
    await expect(field).toBeFocused();
    await expect(page.locator('[data-root-native-editor]')).toHaveText('');
    await page.evaluate(() => window.treeSelectRootHydration!.dispose());
    await expect(page.locator('[popover]')).toHaveCount(0);
  });
}
