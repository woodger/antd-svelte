import { test, expect } from './test';
import reference from './fixtures/ant-design-typography-theme-reference.json' with { type: 'json' };
import { snapshotTypographyTheme } from './typography-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Typography themes match source text, headings, links and editors for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=typography-theme');
      await page.getByLabel('Typography theme preset', { exact: true }).selectOption(sample.name);

      await expect.poll(() => page.evaluate(snapshotTypographyTheme)).toEqual(sample.metrics);
    });
}

for (const part of ['edit-text', 'edit-title']) {
  test(`Typography theme updates preserve the ${part} draft, DOM, focus and selection`,
    async ({ page }) => {
      await page.goto('/?fixture=typography-theme');
      await expect(page.locator(
        '[data-typography-theme="outside"] [data-typography-part="edit-title"] textarea'
      )).toBeFocused();
      const root = page.locator('[data-typography-theme="normal"]');
      const editor = root.locator(`[data-typography-part="${part}"] textarea`);
      const original = await editor.elementHandle();
      await root.getByRole('button', { name: 'Clear typography events normal', exact: true })
        .dispatchEvent('click');
      await editor.fill('Retained typography draft');
      await editor.evaluate(node => (node as HTMLTextAreaElement).setSelectionRange(2, 10));

      await page.getByRole('button', { name: 'Update Typography tokens', exact: true })
        .dispatchEvent('click');

      const updated = reference.cases.find(sample => sample.name === 'updated-aliases')!;
      await expect.poll(() => page.evaluate(snapshotTypographyTheme)).toEqual(updated.metrics);
      expect(await editor.evaluate((node, old) => node === old, original)).toBe(true);
      await expect(editor).toBeFocused();
      await expect(editor).toHaveValue('Retained typography draft');
      expect(await editor.evaluate(node => [
        (node as HTMLTextAreaElement).selectionStart,
        (node as HTMLTextAreaElement).selectionEnd
      ])).toEqual([2, 10]);
      const events = root.getByLabel('Typography theme events normal', { exact: true });
      await expect(events).toHaveText('[]');

      await editor.press('End');
      await editor.press('Enter');

      await expect(events).toHaveText(JSON.stringify([
        `${part === 'edit-title' ? 'title' : 'text'}:Retained typography draft`
      ]));
      await page.getByLabel('Mount themed Typography controls', { exact: true })
        .dispatchEvent('click');
      expect(await original!.evaluate(node => node.isConnected)).toBe(false);
      await expect(page.locator(
        '[data-typography-theme="normal"]'
      )).toHaveCount(0);
      await expect(page.locator(
        '[data-typography-theme="sibling"] [data-typography-part="text"] > .ant-typography'
      )).toHaveCSS('font-size', '18px');
    });
}

test('Typography keeps async copy pending through theme updates', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/?fixture=typography-theme');
  await expect(page.locator(
    '[data-typography-theme="outside"] [data-typography-part="edit-title"] textarea'
  )).toBeFocused();
  const root = page.locator('[data-typography-theme="normal"]');
  const copy = root.locator('[data-typography-part="copy"]');
  await root.getByRole('button', { name: 'Clear typography events normal', exact: true })
    .dispatchEvent('click');
  await copy.getByRole('button', { name: 'Копировать', exact: true }).click();
  const original = await copy.locator('.ant-typography').elementHandle();
  await expect(copy.locator('.anticon-loading')).toBeVisible();

  await page.getByRole('button', { name: 'Update Typography tokens', exact: true })
    .dispatchEvent('click');

  await expect(copy.locator('.ant-typography')).toHaveCSS('font-size', '24px');
  await expect(copy.locator('.anticon-loading')).toBeVisible();
  expect(await copy.locator('.ant-typography').evaluate((node, old) => node === old, original))
    .toBe(true);
  await expect(root.getByLabel('Typography theme events normal', { exact: true })).toHaveText('[]');
  await root.getByRole('button', { name: 'Resolve themed copy normal', exact: true }).click();

  await expect(copy.getByRole('button', { name: 'Скопировано', exact: true })).toBeVisible();
  await expect(copy.locator('.anticon-loading')).toHaveCount(0);
  await expect(root.getByLabel('Typography theme events normal', { exact: true }))
    .toHaveText('["copy"]');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('Clipboard theme text');
});

test('Typography resets inherited tokens while preserving its nested editor', async ({ page }) => {
  await page.goto('/?fixture=typography-theme');
  await expect(page.locator(
    '[data-typography-theme="outside"] [data-typography-part="edit-title"] textarea'
  )).toBeFocused();
  const root = page.locator('[data-typography-theme="nested"]');
  const editor = root.locator('[data-typography-part="edit-text"] textarea');
  const original = await editor.elementHandle();
  await editor.fill('Nested typography draft');

  await page.getByLabel('Inherit Typography theme', { exact: true }).dispatchEvent('click');

  const defaults = reference.cases.find(sample => sample.name === 'default')!;
  await expect.poll(() => page.evaluate(snapshotTypographyTheme).then(metrics => metrics.nested))
    .toEqual(defaults.metrics.nested);
  expect(await editor.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue('Nested typography draft');
  await expect(page.locator(
    '[data-typography-theme="normal"] [data-typography-part="text"] > .ant-typography'
  )).toHaveCSS('font-size', '20px');
});

test('Typography restores legacy styles and preserves its editor draft', async ({ page }) => {
  await page.goto('/?fixture=typography-theme');
  await expect(page.locator(
    '[data-typography-theme="outside"] [data-typography-part="edit-title"] textarea'
  )).toBeFocused();
  const root = page.locator('[data-typography-theme="normal"]');
  const editor = root.locator('[data-typography-part="edit-text"] textarea');
  const original = await editor.elementHandle();
  await root.getByRole('button', { name: 'Clear typography events normal', exact: true })
    .dispatchEvent('click');
  await editor.fill('Legacy typography draft');

  await page.getByLabel('Apply source Typography theme', { exact: true }).dispatchEvent('click');

  await expect(root.locator('[data-typography-part="text"] > .ant-typography'))
    .toHaveCSS('font-size', '14px');
  await expect(root.locator('[data-typography-part="h1"] > h1'))
    .toHaveCSS('margin-bottom', '19px');
  expect(await editor.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue('Legacy typography draft');
  await expect(root.getByLabel('Typography theme events normal', { exact: true })).toHaveText('[]');
  await expect(page.locator(
    '[data-typography-theme="sibling"] [data-typography-part="text"] > .ant-typography'
  )).toHaveCSS('font-size', '18px');
});
