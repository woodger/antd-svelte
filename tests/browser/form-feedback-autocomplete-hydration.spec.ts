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
    'form-feedback-autocomplete-hydration-'));
  server = await createServer({ configFile: fileURLToPath(new URL('./vite.config.ts', import.meta.url)),
    server: { middlewareMode: true, hmr: { server: createHttpServer() }, watch: null },
    appType: 'custom', cacheDir: cache });
});
test.afterAll(async () => {
  await server?.close();
  if (cache) await rm(cache, { recursive: true, force: true });
});
for (const picker of ['live-feedback', 'input-live', 'textarea-live']) {
  test(`${picker} hydrates Form feedback in place and preserves focus during status updates`, async ({ page }) => {
    const module = await server.ssrLoadModule(fileURLToPath(new URL(
      './fixtures/form-feedback-autocomplete-hydration.server.ts', import.meta.url
    )));
    const { head, body } = module.renderFormFeedbackAutoComplete(picker);
    await page.goto('/tree-select-surface-hydration.html?feedbackSample=' + picker);
    await page.evaluate(({ head, body }) => {
      document.head.insertAdjacentHTML('beforeend', head);
      document.getElementById('root')!.innerHTML = body;
    }, { head, body });
    const outside = page.getByRole('button', { name: 'Outside feedback', exact: true });
    await outside.focus();
    await page.addScriptTag({ type: 'module', url: '/form-feedback-autocomplete-hydration.client.ts' });
    await page.waitForFunction(() => window.formFeedbackAutoCompleteHydration);
    await expect(outside).toBeFocused();
    await expect(page.locator('[data-custom-feedback]')).toHaveCount(picker === 'live-feedback' ? 1 : 2);
    expect(await page.evaluate(() => {
      const captured = window.formFeedbackAutoCompleteHydration!;
      return { input: captured.input === document.querySelector('[aria-label="Feedback completion"]'),
        icons: captured.icons.every((icon, index) => icon === document.querySelectorAll('[data-custom-feedback]')[index]) };
    })).toEqual({ input: true, icons: true });
    const input = page.getByRole('combobox', { name: 'Feedback completion', exact: true });
    await input.focus();
    await page.getByRole('combobox', { name: 'Feedback action', exact: true }).selectOption('1');
    await page.getByRole('button', { name: 'Apply feedback action', exact: true }).dispatchEvent('click');
    await expect(page.locator('[data-custom-feedback]')).toHaveText(picker === 'live-feedback' ? ['local 0 error'] : ['local 0 error', 'local 0 error']);
    await expect(input).toBeFocused();
    expect(await input.evaluate(node => window.formFeedbackAutoCompleteHydration!.input === node)).toBe(true);
    await page.evaluate(() => window.formFeedbackAutoCompleteHydration!.dispose());
    await expect(input).toHaveCount(0);
    await expect(page.locator('[class*="-item-feedback-icon"]')).toHaveCount(0);
  });
}
