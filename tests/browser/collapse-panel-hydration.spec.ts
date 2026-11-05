import { fileURLToPath } from 'node:url';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer as createHttpServer } from 'node:http';
import { createServer, type ViteDevServer } from 'vite';
import { test, expect } from './test';

let server: ViteDevServer;
let cache: string;

test.beforeAll(async () => {
  // Как в Tag hydration: HMR compile options совпадают с client, host не слушает порт.
  const hmrHost = createHttpServer();
  cache = await mkdtemp(join(tmpdir(), 'antd-collapse-panel-hydration-'));
  server = await createServer({
    configFile: fileURLToPath(new URL('./vite.config.ts', import.meta.url)),
    server: { middlewareMode: true, hmr: { server: hmrHost }, watch: null },
    appType: 'custom',
    cacheDir: cache
  });
});

test.afterAll(async () => {
  await server?.close();
  if (cache) await rm(cache, { recursive: true, force: true });
});

test('Collapse.Panel hydrates open SSR fields without replacing DOM, focus or selection', async ({ page }) => {
  const module = await server.ssrLoadModule(fileURLToPath(new URL(
    './fixtures/collapse-panel-hydration.server.ts', import.meta.url
  )));
  const rendered = module.renderCollapsePanels();
  await page.goto('/collapse-panel-hydration.html');
  await page.evaluate(({ head, body }) => {
    document.head.insertAdjacentHTML('beforeend', head);
    document.getElementById('root')!.innerHTML = body;
  }, { head: rendered.head, body: rendered.body });
  await page.addScriptTag({ type: 'module', url: '/collapse-panel-hydration.client.ts' });
  await page.waitForFunction(() => window.collapsePanelHydration?.ready);

  expect(await page.evaluate(() => {
    const state = window.collapsePanelHydration!;

    return {
      focusedBefore: state.focusedBefore,
      framePreserved: state.frame === document.querySelector('[aria-label="Legacy sections"]'),
      inputPreserved: state.input === document.querySelector('[aria-label="Legacy sections"] input'),
      focusedAfter: document.activeElement === state.input,
      value: state.input?.value,
      selection: [state.input?.selectionStart, state.input?.selectionEnd]
    };
  })).toEqual({
    focusedBefore: true, framePreserved: true, inputPreserved: true,
    focusedAfter: true, value: 'Pre-hydration draft', selection: [2, 8]
  });
  await expect(page.getByLabel('Legacy first object ref', { exact: true })).toHaveText('true');
  await page.keyboard.press('F7');
  await expect(page.getByRole('button', { name: 'First legacy section', exact: true }))
    .toBeFocused();
  await page.getByRole('button', { name: 'First legacy section', exact: true }).press('Enter');
  await expect(page.getByRole('textbox', { name: 'First legacy draft', exact: true }))
    .toHaveValue('Pre-hydration draft');
});
