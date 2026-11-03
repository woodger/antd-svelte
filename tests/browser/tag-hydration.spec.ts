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
  // HMR compile options должны совпадать с client; host без listen не открывает HTTP/WS порт.
  const hmrHost = createHttpServer();
  cache = await mkdtemp(join(tmpdir(), 'antd-tag-hydration-'));
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

for (const name of ['link-close', 'icon-snippet', 'reactive-aria']) {
  test(`Tag preserves SSR DOM and focused close control for ${name}`, async ({ page }) => {
    const module = await server.ssrLoadModule(fileURLToPath(new URL(
      './fixtures/tag-close-hydration.server.ts', import.meta.url
    )));
    const rendered = module.renderTagClose(name);
    await page.goto(`/tag-close-hydration.html?name=${name}`);
    await page.evaluate(({ head, body }) => {
      document.head.insertAdjacentHTML('beforeend', head);
      document.getElementById('root')!.innerHTML = body;
    }, { head: rendered.head, body: rendered.body });
    await page.addScriptTag({ type: 'module', url: '/tag-close-hydration.client.ts' });
    await page.waitForFunction(() => window.tagCloseHydration?.ready);

    expect(await page.evaluate(() => {
      const state = window.tagCloseHydration!;
      return {
        focusedBefore: state.focusedBefore,
        rootPreserved: state.root === document.querySelector('[data-tag-api-root]'),
        closePreserved: state.close === document.querySelector('.ant-tag-close-icon'),
        focusedAfter: state.close === document.activeElement
      };
    })).toEqual({
      focusedBefore: true,
      rootPreserved: true,
      closePreserved: true,
      focusedAfter: true
    });
    await expect(page.getByRole('status', { name: 'Tag close events' })).toHaveText('[]');
  });
}
