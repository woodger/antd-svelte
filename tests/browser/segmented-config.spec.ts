import { test, expect } from './test';
import reference from './fixtures/ant-design-segmented-config-reference.json' with { type: 'json' };
import { snapshotSegmentedConfig } from './segmented-config-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Segmented context and semantic slots match the pinned source for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=segmented-config');
      await page.getByLabel('Segmented config preset', { exact: true }).selectOption(sample.name);

      await expect.poll(() => page.evaluate(snapshotSegmentedConfig)).toEqual(sample.metrics);
      const root = page.locator('[data-segmented-config="normal"]');
      if (sample.name === 'zero-icon-label') {
        await expect(root.getByRole('radio', { name: '0', exact: true })).toBeChecked();
      } else if (['empty-icon-label', 'missing-icon-label'].includes(sample.name)) {
        await expect(root.getByRole('radio', { name: 'Icon option', exact: true })).toBeChecked();
      }
    });
}

test('Segmented config updates retain selection, focus, refs and independent context records', async ({ page }) => {
  await page.goto('/?fixture=segmented-config');
  const root = page.locator('[data-segmented-config="normal"] .ant-segmented');
  await root.locator('label').nth(1).click();
  const radio = root.getByRole('radio', { name: 'Beta', exact: true });
  await radio.focus();
  const original = await radio.elementHandle();
  const control = await root.elementHandle();
  await page.getByRole('button', { name: 'Update Segmented context padding', exact: true })
    .evaluate(node => (node as HTMLButtonElement).click());

  for (const id of ['normal', 'inherit', 'undefined']) {
    await expect(page.locator(`[data-segmented-config="${id}"] .ant-segmented`))
      .toHaveCSS('padding', '21px');
  }
  for (const [id, padding] of [['empty', 3], ['replace', 14], ['sibling', 14], ['outside', 2]]) {
    await expect(page.locator(`[data-segmented-config="${id}"] .ant-segmented`))
      .toHaveCSS('padding', `${padding}px`);
  }
  await expect(radio).toBeChecked();
  await expect(radio).toBeFocused();
  expect(await radio.evaluate((node, old) => node === old, original)).toBe(true);
  expect(await root.evaluate((node, old) => node === old, control)).toBe(true);
  await expect(page.getByLabel('Segmented config events', { exact: true })).toHaveText('["b"]');
  await expect(page.getByLabel('Segmented config ref', { exact: true })).toHaveText('mounted');
  await page.getByLabel('Apply Segmented context record', { exact: true }).dispatchEvent('click');

  await expect(root).toHaveCSS('padding', '3px');
  await expect(root).not.toHaveClass(/segcfg-context/);
  await expect(radio).toBeChecked();
  expect(await radio.evaluate((node, old) => node === old, original)).toBe(true);
  await radio.press('ArrowLeft');

  await expect(root.getByRole('radio', { name: 'Alpha', exact: true })).toBeChecked();
  await expect(page.getByLabel('Segmented config events', { exact: true })).toHaveText('["b","a"]');
  await page.getByLabel('Mount configured Segmented', { exact: true }).uncheck();

  await expect(root).toHaveCount(0);
  await expect(page.locator('[data-segmented-config="outside"] .ant-segmented')).toBeVisible();
});
