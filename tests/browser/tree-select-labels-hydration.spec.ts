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
    'tree-select-labels-hydration-'));
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

test('TreeSelect hydrates bound summary labels in place with context, head, drafts and working events', async ({ page }) => {
  const module = await server.ssrLoadModule(fileURLToPath(new URL(
    './fixtures/tree-select-labels-hydration.server.ts', import.meta.url
  )));
  const rendered = module.renderTreeLabels();
  await page.goto('/tree-select-labels-hydration.html');
  await page.evaluate(({ head, body }) => {
    document.head.insertAdjacentHTML('beforeend', head);
    document.getElementById('root')!.innerHTML = body;
  }, { head: rendered.head, body: rendered.body });
  await page.addScriptTag({ type: 'module', url: '/tree-select-labels-hydration.client.ts' });
  await page.waitForFunction(() => window.treeLabelHydration?.ready);

  expect(await page.evaluate(() => {
    const { control, editor, field, outside } = window.treeLabelHydration!;
    return {
      control: control === document.querySelector('[data-tree-label-control] [data-ant-tree-choice-control]'),
      editor: editor === document.querySelector('[data-tree-label-control] [data-ant-tree-choice-input]'),
      field: field === document.querySelector('[aria-label="header label draft 0"]'),
      outside: outside === document.querySelector('[aria-label="Outside renderer draft"]'),
      focused: field === document.activeElement,
      fieldValue: field.value, selection: [field.selectionStart, field.selectionEnd],
      outsideValue: outside.value, outsideSelection: [outside.selectionStart, outside.selectionEnd],
      stableId: field.id.startsWith('tree-label-hydration-')
    };
  })).toEqual({ control: true, editor: true, field: true, outside: true, focused: true,
    fieldValue: 'Rich label draft before hydration', selection: [2, 7],
    outsideValue: 'Outside draft before hydration', outsideSelection: [1, 6], stableId: true });
  await expect(page.locator('[data-tree-label-head]')).toHaveCount(2);
  await expect(page.locator('[data-tree-label-events]')).toHaveText('[]');
  await expect(page.locator('[data-tree-label-lifecycle]'))
    .toHaveText('["mount:header:0","mount:header:1"]');
  await expect(page.locator('[data-tree-label-intro-probe]')).toContainText('Intro label');
  await expect(page.locator('[data-tree-label-intro-count]')).toHaveText('0');
  const rich = page.locator('[data-render-label][data-render-value="0"]');
  await rich.getByRole('button', { name: 'Count 0', exact: true }).click();
  await expect(rich.getByRole('button', { name: 'Count 1', exact: true })).toBeVisible();
  expect(await page.getByRole('form', { name: 'Renderer form' }).evaluate((form: HTMLFormElement) =>
    new FormData(form).getAll('renderer-value'))).toEqual(['0', '1']);
  await page.evaluate(() => window.treeLabelHydration!.dispose());
  await expect(page.locator('[data-tree-label-head]')).toHaveCount(0);
});
