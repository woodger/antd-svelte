import { fileURLToPath } from 'node:url';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer as createHttpServer } from 'node:http';
import { createServer, type ViteDevServer } from 'vite';
import reference from './fixtures/ant-design-grid-breakpoints-reference.json' with { type: 'json' };
import { test, expect } from './test';

test.use({ javaScriptEnabled: false });
let server: ViteDevServer;
let cache: string;

test.beforeAll(async () => {
  cache = await mkdtemp(fileURLToPath(new URL('../../.upstream/artifacts/grid-media-ssr-',
    import.meta.url)));
  server = await createServer({
    configFile: fileURLToPath(new URL('./vite.config.ts', import.meta.url)),
    server: { middlewareMode: true, hmr: { server: createHttpServer() }, watch: null },
    appType: 'custom',
    cacheDir: cache
  });
});

test.afterAll(async () => {
  await server?.close();
  if (cache) await rm(cache, { recursive: true, force: true });
});

for (const placement of ['before', 'after']) {
  test(`Grid SSR media work without JavaScript with package CSS ${placement} scoped styles`,
    async ({ page }) => {
      const module = await server.ssrLoadModule(fileURLToPath(new URL(
        './fixtures/grid-breakpoints.server.ts', import.meta.url
      )));
      await page.goto('/');
      const href = new URL(`/@fs${fileURLToPath(new URL('../../dist/styles.css',
        import.meta.url))}`, page.url()).href;
      const link = `<link rel="stylesheet" href="${href}">`;
      const samples = reference.cases.filter(sample => sample.direction === 'ltr'
        && ['shifted', 'custom-prefix'].includes(sample.name));
      for (const sample of samples) {
        const rendered = module.renderGridBreakpoints(sample);
        const head = placement === 'before' ? link + rendered.head : rendered.head + link;
        await page.setContent(`<!doctype html><html><head>${head}</head><body>${rendered.body}</body></html>`);
        const row = page.locator('#grid-breakpoints-control .ant-row').first();
        for (const width of [800, 900]) {
          await page.setViewportSize({ width, height: 1000 });
          const shifted = sample.scope !== 'reset' && width < 900;

          await expect(row).toHaveCSS('row-gap', '42px');
          await expect(row.locator('.ant-col').first())
            .toHaveCSS('flex-basis', shifted ? '50%' : '33.3333%');
          await expect(row.locator('.ant-col').last())
            .toHaveCSS('flex-basis', shifted ? 'auto' : '33.3333%');
        }
      }
    });
}
