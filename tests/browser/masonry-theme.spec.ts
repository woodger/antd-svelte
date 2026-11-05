import { test, expect } from './test';
import reference from './fixtures/ant-design-masonry-theme-reference.json' with { type: 'json' };
import { snapshotMasonryTheme } from './masonry-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Masonry theme matches source with its declared scope marker for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=masonry-theme');
      await page.getByLabel('Masonry theme preset', { exact: true }).selectOption(sample.name);
      await expect(page.locator('[data-masonry-theme="normal"] .ant-masonry-item')).toHaveCount(4);
      await expect(page.locator('.ant-masonry-item-fade')).toHaveCount(0);

      await expect.poll(() => page.evaluate(snapshotMasonryTheme)).toEqual(sample.metrics);
    });
}

test('Masonry font aliases remeasure fresh content while preserving drafts, focus, refs and notifications',
  async ({ page }) => {
    await page.goto('/?fixture=masonry-theme');
    const root = page.locator('[data-masonry-theme="normal"] .ant-masonry');
    const stale = page.locator('[data-masonry-theme="stale"] .ant-masonry');
    const draft = root.getByRole('textbox', { name: 'Masonry theme draft normal b', exact: true });
    await expect(root).toHaveCSS('height', '158px');
    await expect(stale).toHaveCSS('height', '158px');
    await draft.fill('Retained Masonry draft');
    await draft.focus();
    await draft.evaluate(node => {
      if (!(node instanceof HTMLInputElement)) throw new Error('Expected native draft input');
      node.setSelectionRange(2, 9);
    });
    const oldRoot = await root.elementHandle();
    const oldInput = await draft.elementHandle();
    const before = await page.getByLabel('Masonry theme notifications normal', { exact: true })
      .textContent();
    const updated = reference.cases.find(sample => sample.name === 'font-updated')!;
    await page.getByRole('button', { name: 'Update Masonry font', exact: true })
      .dispatchEvent('click');

    await expect.poll(async () => (await page.evaluate(snapshotMasonryTheme)).normal)
      .toEqual(updated.metrics.normal);
    await expect(stale).toHaveCSS('font-size', '20px');
    await expect(stale).toHaveCSS('height', '158px');
    await expect(draft).toHaveValue('Retained Masonry draft');
    await expect(draft).toBeFocused();
    expect(await draft.evaluate(node => {
      if (!(node instanceof HTMLInputElement)) throw new Error('Expected native draft input');

      return [node.selectionStart, node.selectionEnd];
    })).toEqual([2, 9]);
    expect(await root.evaluate((node, previous) => node === previous, oldRoot)).toBe(true);
    expect(await draft.evaluate((node, previous) => node === previous, oldInput)).toBe(true);
    await expect(page.getByLabel('Masonry theme ref normal', { exact: true })).toHaveText('mounted');
    await expect(page.getByLabel('Masonry theme notifications normal', { exact: true }))
      .toHaveText(before!);
    await stale.dispatchEvent('load');

    await expect(stale).toHaveCSS('height', '108px');
    await page.getByRole('button', { name: 'Reverse themed Masonry items', exact: true })
      .dispatchEvent('click');

    await expect(draft).toBeFocused();
    expect(await draft.evaluate((node, previous) => node === previous, oldInput)).toBe(true);
    await expect(page.locator('[data-masonry-theme="nested"] .ant-masonry'))
      .toHaveCSS('font-size', '24px');
    await expect(page.locator('[data-masonry-theme="reset"] .ant-masonry'))
      .toHaveCSS('font-size', '16px');
    await expect(page.locator('[data-masonry-theme="variable"] .ant-masonry'))
      .toHaveCSS('font-size', '35px');
  });

test('Masonry disabling motion finishes pending leave even when CSS durations remain positive',
  async ({ page }) => {
    await page.goto('/?fixture=masonry-theme');
    await page.getByLabel('Masonry theme preset', { exact: true })
      .selectOption('motion-disabled-long-css');
    const root = page.locator('[data-masonry-theme="normal"] .ant-masonry');
    await expect(root.locator('.ant-masonry-item')).toHaveCount(4);
    await expect(root.locator('.ant-masonry-item-fade')).toHaveCount(0);
    await expect(root.locator('.ant-masonry-item').first())
      .toHaveCSS('transition-duration', '2s, 2s, 2s');
    await page.getByRole('button', { name: 'Enable Masonry motion', exact: true }).click();

    await expect(root.locator('.ant-masonry-item-fade')).toHaveCount(0);
    await page.getByRole('button', { name: 'Remove themed Masonry item', exact: true }).click();
    const leaving = root.locator('.ant-masonry-item:has([data-key="b"])');
    await expect(leaving).toHaveClass(/ant-masonry-item-fade-leave-active/);
    await page.getByRole('button', { name: 'Disable Masonry motion', exact: true }).click();

    await expect(leaving).toHaveCount(0);
    await expect(root.locator('.ant-masonry-item')).toHaveCount(3);
    await expect(root.locator('.ant-masonry-item-fade')).toHaveCount(0);
  });

test('Masonry removes items without transition events when theme motion is disabled',
  async ({ page }) => {
    await page.goto('/?fixture=masonry-theme');
    const root = page.locator('[data-masonry-theme="normal"] .ant-masonry');
    await expect(root.locator('.ant-masonry-item')).toHaveCount(4);
    await expect(root.locator('.ant-masonry-item-fade')).toHaveCount(0);
    await page.getByRole('button', { name: 'Remove themed Masonry item', exact: true }).click();

    await expect(root.locator('.ant-masonry-item')).toHaveCount(3);
    await expect(root.locator('[data-key="b"]')).toHaveCount(0);
    await expect(root.locator('.ant-masonry-item-fade')).toHaveCount(0);
    await page.getByLabel('Mount themed Masonry controls', { exact: true }).uncheck();

    await expect(root).toHaveCount(0);
    await expect(page.locator('[data-masonry-theme="outside"] .ant-masonry-item')).toHaveCount(4);
  });

test('Masonry finishes zero-duration component motion without requiring synthetic CSS end events',
  async ({ page }) => {
    await page.goto('/?fixture=masonry-theme');
    await page.getByLabel('Masonry theme preset', { exact: true }).selectOption('default');
    await page.getByLabel('Use zero-duration Masonry CSS', { exact: true }).check();
    const root = page.locator('[data-masonry-theme="normal"] .ant-masonry');
    await expect(root.locator('.ant-masonry-item')).toHaveCount(4);
    await expect(root.locator('.ant-masonry-item-fade')).toHaveCount(0);
    await expect(root.locator('.ant-masonry-item').first())
      .toHaveCSS('transition-duration', '0s, 0s, 0s');
    await page.getByRole('button', { name: 'Remove themed Masonry item', exact: true }).click();

    await expect(root.locator('.ant-masonry-item')).toHaveCount(3);
    await expect(root.locator('[data-key="b"]')).toHaveCount(0);
    await expect(root.locator('.ant-masonry-item-fade')).toHaveCount(0);
  });
