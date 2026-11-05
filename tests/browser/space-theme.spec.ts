import { test, expect } from './test';
import reference from './fixtures/ant-design-space-theme-reference.json' with { type: 'json' };
import { snapshotSpaceTheme } from './space-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Space theme and provider configuration match source scopes for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=space-theme');
      await page.getByLabel('Space theme preset', { exact: true }).selectOption(sample.name);

      await expect.poll(() => page.evaluate(snapshotSpaceTheme)).toEqual(sample.metrics);
    });
}

test('Space aliases update gaps without resetting typography, drafts, selection, focus or keyed DOM',
  async ({ page }) => {
    await page.goto('/?fixture=space-theme');
    const host = page.locator('[data-space-theme="default"]');
    const root = host.locator('.ant-space');
    const draft = host.getByRole('textbox', { name: 'Space themed draft default', exact: true });
    await draft.fill('Persistent Space draft');
    await draft.focus();
    await draft.evaluate(node => {
      if (!(node instanceof HTMLInputElement)) throw new Error('Expected native draft input');
      node.setSelectionRange(2, 8);
    });
    const originalRoot = await root.elementHandle();
    const originalInput = await draft.elementHandle();
    await page.getByRole('button', { name: 'Update Space padding', exact: true })
      .dispatchEvent('click');

    await expect(root).toHaveCSS('column-gap', '26px');
    await expect(root).toHaveCSS('font-size', '21px');
    await expect(draft).toBeFocused();
    await expect(draft).toHaveValue('Persistent Space draft');
    expect(await draft.evaluate(node => {
      if (!(node instanceof HTMLInputElement)) throw new Error('Expected native draft input');

      return [node.selectionStart, node.selectionEnd];
    })).toEqual([2, 8]);
    expect(await root.evaluate((node, old) => node === old, originalRoot)).toBe(true);
    expect(await draft.evaluate((node, old) => node === old, originalInput)).toBe(true);
    await expect(page.getByLabel('Space theme ref default', { exact: true })).toHaveText('mounted');
    await expect(page.locator('[data-space-theme="variable"] .ant-space'))
      .toHaveCSS('column-gap', '19px');
    await expect(page.locator('[data-space-theme="nested"] .ant-space'))
      .toHaveCSS('column-gap', '6px');
    await expect(page.locator('[data-space-theme="reset"] .ant-space'))
      .toHaveCSS('column-gap', '8px');
    await expect(page.locator('[data-space-theme="sibling"] .ant-space'))
      .toHaveCSS('column-gap', '3px');
    await page.getByRole('button', { name: 'Reverse themed Space items', exact: true })
      .dispatchEvent('click');

    await expect(draft).toBeFocused();
    expect(await draft.evaluate((node, old) => node === old, originalInput)).toBe(true);
    await page.getByLabel('Apply source Space theme', { exact: true }).dispatchEvent('click');

    await expect(root).toHaveCSS('column-gap', '8px');
    await expect(root).toHaveCSS('font-size', '21px');
    await expect(draft).toBeFocused();
    await page.getByLabel('Mount themed Space controls', { exact: true }).dispatchEvent('click');

    await expect(root).toHaveCount(0);
    expect(await originalInput!.evaluate(node => node.isConnected)).toBe(false);
    await expect(page.locator('[data-space-theme="outside"] .ant-space')).toBeVisible();
  });

test('Space provider updates replace records while local size and semantic layers keep priority',
  async ({ page }) => {
    await page.goto('/?fixture=space-theme');
    await page.getByLabel('Space theme preset', { exact: true }).selectOption('config-functions');
    const root = page.locator('[data-space-theme="default"] .ant-space');
    const draft = page.getByRole('textbox', { name: 'Space themed draft default', exact: true });
    await draft.fill('Configured draft');
    await draft.focus();
    await page.getByRole('button', { name: 'Update Space config', exact: true })
      .dispatchEvent('click');

    await expect(root).toHaveClass(/context-updated/);
    await expect(root).toHaveClass(/ctx-horizontal-center-4-6/);
    await expect(root).toHaveCSS('column-gap', '47px');
    await expect(root).toHaveCSS('row-gap', '17px');
    await expect(draft).toHaveValue('Configured draft');
    await expect(draft).toBeFocused();
    await expect(page.locator('[data-space-theme="small"] .ant-space'))
      .toHaveClass(/ctx-horizontal-center-small/);
    await expect(page.locator('[data-space-theme="replace"] .ant-space'))
      .not.toHaveClass(/context-updated|ctx-horizontal/);
    await expect(page.locator('[data-space-theme="compact"] .ant-space-compact'))
      .not.toHaveClass(/context-updated|ctx-horizontal/);
    await page.getByLabel('Replace Space config with empty record', { exact: true })
      .dispatchEvent('click');

    await expect(root).not.toHaveClass(/context-updated|ctx-horizontal/);
    await expect(root).toHaveCSS('column-gap', '14px');
    await expect(root).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(draft).toBeFocused();
    await expect(draft).toHaveValue('Configured draft');
  });
