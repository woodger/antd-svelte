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
  cache = await mkdtemp(join(tmpdir(), 'antd-alert-boundary-hydration-'));
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

test('Alert.ErrorBoundary preserves healthy SSR DOM, focus and selection and catches errors after hydration', async ({ page }) => {
  const module = await server.ssrLoadModule(fileURLToPath(new URL(
    './fixtures/alert-boundary-hydration.server.ts', import.meta.url
  )));
  const rendered = module.renderAlertBoundary();
  await page.goto('/alert-boundary-hydration.html');
  await page.evaluate(({ head, body }) => {
    document.head.insertAdjacentHTML('beforeend', head);
    document.getElementById('root')!.innerHTML = body;
  }, { head: rendered.head, body: rendered.body });
  await page.addScriptTag({ type: 'module', url: '/alert-boundary-hydration.client.ts' });
  await page.waitForFunction(() => window.alertBoundaryHydration?.ready);

  expect(await page.evaluate(() => {
    const state = window.alertBoundaryHydration!;

    return {
      focusedBefore: state.focusedBefore,
      framePreserved: state.frame === document.querySelector('[data-boundary-frame]'),
      inputPreserved: state.input === document.querySelector('[data-boundary-frame] input'),
      focusedAfter: document.activeElement === state.input,
      value: state.input?.value,
      selection: [state.input?.selectionStart, state.input?.selectionEnd]
    };
  })).toEqual({
    focusedBefore: true, framePreserved: true, inputPreserved: true,
    focusedAfter: true, value: 'Pre-hydration draft', selection: [2, 8]
  });
  await expect(page.locator('[data-boundary-frame] .ant-alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Fail boundary child', exact: true }).click();

  await expect(page.locator('[data-boundary-frame] .ant-alert-title'))
    .toHaveText('Error: Boundary failure');
  await expect(page.getByRole('textbox', { name: 'Healthy boundary draft', exact: true }))
    .toHaveCount(0);
});
