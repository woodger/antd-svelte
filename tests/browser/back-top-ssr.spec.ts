import { fileURLToPath } from 'node:url';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer as createHttpServer } from 'node:http';
import { createServer, type ViteDevServer } from 'vite';
import reference from './fixtures/ant-design-back-top-theme-reference.json' with { type: 'json' };
import { test, expect } from './test';

test.use({ javaScriptEnabled: false });
let server: ViteDevServer;
let cache: string;

test.beforeAll(async () => {
  cache = await mkdtemp(fileURLToPath(new URL(
    '../../.upstream/artifacts/back-top-ssr-', import.meta.url
  )));
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
  test(`BackTop SSR applies registered source styles with package CSS ${placement} scoped styles`,
    async ({ page }) => {
      const module = await server.ssrLoadModule(fileURLToPath(new URL(
        './fixtures/back-top.server.ts', import.meta.url
      )));
      await page.goto('/');
      const href = new URL(`/@fs${fileURLToPath(new URL('../../dist/styles.css',
        import.meta.url))}`, page.url()).href;
      const link = `<link rel="stylesheet" href="${href}">`;
      const samples = reference.cases.filter(sample => [
        'default', 'compact', 'custom-css-prefix', 'local-prefix', 'global-media', 'undefined'
      ].includes(sample.name));
      for (const sample of samples) {
        const rendered = module.renderBackTop(sample);
        const head = placement === 'before' ? link + rendered.head : rendered.head + link;
        await page.setContent(`<!doctype html><html><head>${head}</head><body>${rendered.body}</body></html>`);
        const root = page.locator('#back-top-control');
        for (const mode of ['normal', 'md', 'xs', 'after-xs', 'after-md'] as const) {
          const state = sample.states[mode];
          await page.setViewportSize({ width: state.width, height: 800 });

          await expect(root).toHaveCSS('inset-inline-end', state.expected.root['inset-inline-end']);
          await expect(root).toHaveCSS('inset-block-end', state.expected.root['inset-block-end']);
          await expect(root).toHaveCSS('z-index', state.expected.root['z-index']);
          await expect(root.getByRole('button')).toHaveCSS('width', state.expected.content.width);
        }
      }
    });
}
