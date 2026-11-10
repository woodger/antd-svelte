import { fileURLToPath } from 'node:url';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { createServer as createHttpServer } from 'node:http';
import { createServer, type ViteDevServer } from 'vite';
import { test, expect } from './test';

let server: ViteDevServer;
let cache: string;
test.beforeAll(async () => {
  const hmrHost = createHttpServer();
  cache = await mkdtemp(join(fileURLToPath(new URL('../../.upstream/artifacts/', import.meta.url)),
    'tree-select-tags-hydration-'));
  server = await createServer({
    configFile: fileURLToPath(new URL('./vite.config.ts', import.meta.url)),
    server: { middlewareMode: true, hmr: { server: hmrHost }, watch: null },
    appType: 'custom', cacheDir: cache
  });
});
test.afterAll(async () => {
  await server?.close();
  if (cache) await rm(cache, { recursive: true, force: true });
});

for (const name of ['count-one', 'responsive-400', 'renderer-summary']) {
  test(`TreeSelect tag hydration preserves DOM, draft, selection and raw fields for ${name}`, async ({ page }) => {
    const module = await server.ssrLoadModule(fileURLToPath(new URL(
      './fixtures/tree-select-tags-hydration.server.ts', import.meta.url
    )));
    const rendered = module.renderTreeTags(name);
    await page.goto(`/tree-select-tags-hydration.html?name=${name}`);
    await page.evaluate(({ head, body }) => {
      document.head.insertAdjacentHTML('beforeend', head);
      document.getElementById('root')!.innerHTML = body;
    }, { head: rendered.head, body: rendered.body });
    await page.addScriptTag({ type: 'module', url: '/tree-select-tags-hydration.client.ts' });
    await page.waitForFunction(() => window.treeTagsHydration?.ready);

    // Закрытый multiple сбрасывает pre-hydration query, как неизменённый React-эталон.
    expect(await page.evaluate(() => {
      const state = window.treeTagsHydration!;
      return {
        root: state.root === document.querySelector('[data-ant-tree-choice-control]'),
        input: state.input === document.querySelector('[data-ant-tree-choice-input]'),
        tag: state.tag?.isConnected,
        focusedBefore: state.focusedBefore,
        focusedAfter: state.input === document.activeElement,
        value: state.input?.value,
        selection: [state.input?.selectionStart, state.input?.selectionEnd],
        outsidePreserved: state.outside === document.querySelector('[aria-label="Tree tag outside draft"]'),
        outsideValue: state.outside?.value,
        outsideSelection: [state.outside?.selectionStart, state.outside?.selectionEnd]
      };
    })).toEqual({ root: true, input: true, tag: true, focusedBefore: true, focusedAfter: true,
      value: '', selection: [0, 0], outsidePreserved: true,
      outsideValue: 'Outside hydration draft', outsideSelection: [2, 8] });
    const form = page.getByRole('form', { name: 'Tree tag native form', exact: true });
    expect(await form.evaluate((node: HTMLFormElement) => new FormData(node).getAll('tree-tags')))
      .toEqual(['0', '1', 'locked', 'tail']);
    await expect(page.locator('[data-tree-tag-events]')).toHaveText('[]');
  });
}
