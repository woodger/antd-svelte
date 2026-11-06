import { test, expect } from './test';
import reference from './fixtures/ant-design-listy-theme-reference.json' with { type: 'json' };
import { snapshotListyTheme, snapshotListyVirtualSizes } from './listy-theme-metrics';

test.use({ viewport: reference.viewport });

const updatedSample = reference.cases.find(sample => sample.name === 'updated-tokens')!;
// Source 1.5.1 пропускает itemHeight в useMemo: для неизменных строк берём свежий source кадр.
const updatedVirtualSizes = {
  ...reference.updatedVirtualSizes,
  priority: {
    ...reference.updatedVirtualSizes.priority,
    virtual: reference.staleEstimateObservation.freshMount
  }
};

for (const sample of reference.cases) {
  test(`Listy tokens match source raw, virtual and grouped styles for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=listy-theme');
      await page.getByLabel('Listy theme preset', { exact: true }).selectOption(sample.name);

      await expect.poll(() => page.evaluate(snapshotListyTheme)).toEqual(sample.metrics);
      await expect.poll(() => page.evaluate(snapshotListyVirtualSizes)).toEqual(sample.virtualSizes);
    });
}

for (const part of ['raw', 'raw-grouped', 'virtual', 'virtual-grouped']) {
  test(`Listy theme updates preserve ${part} DOM, draft, focus, selection and measured cache`,
    async ({ page }) => {
      await page.goto('/?fixture=listy-theme');
      await expect(page.getByLabel('Listy theme refs normal', { exact: true })).toHaveText('4');
      const root = page.locator(`[data-listy-theme="normal"] [data-listy-part="${part}"]`);
      const input = root.getByRole('textbox', {
        name: `Listy theme draft normal ${part} row-00`, exact: true
      });
      const original = await input.elementHandle();
      await input.fill('Retained Listy draft');
      await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 8));

      await page.getByRole('button', { name: 'Update Listy tokens', exact: true })
        .dispatchEvent('click');

      await expect.poll(() => page.evaluate(snapshotListyTheme)).toEqual(updatedSample.metrics);
      // Внеэкранные строки сохраняют старые измерения; эталон также обновляет живой cache.
      await expect.poll(() => page.evaluate(snapshotListyVirtualSizes))
        .toEqual(updatedVirtualSizes);
      expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
      await expect(input).toBeFocused();
      await expect(input).toHaveValue('Retained Listy draft');
      expect(await input.evaluate(node => [
        (node as HTMLInputElement).selectionStart,
        (node as HTMLInputElement).selectionEnd
      ])).toEqual([1, 8]);
      await expect(page.getByLabel('Listy theme refs normal', { exact: true })).toHaveText('4');

      await page.getByLabel('Mount themed Listy controls', { exact: true }).dispatchEvent('click');

      expect(await original!.evaluate(node => node.isConnected)).toBe(false);
      await expect(page.locator('[data-listy-theme="normal"]')).toHaveCount(0);
      await expect(page.getByLabel('Listy theme refs sibling', { exact: true })).toHaveText('4');
      await expect(page.locator('[data-listy-theme="sibling"] .ant-listy').first())
        .toHaveCSS('font-size', '18px');
    });
}

test('Listy scrollTo follows source measured and estimated sticky-header offsets', async ({ page }) => {
  await page.goto('/?fixture=listy-theme');
  await expect(page.getByLabel('Listy theme refs normal', { exact: true })).toHaveText('4');
  await page.getByRole('button', { name: 'Update Listy tokens', exact: true }).dispatchEvent('click');
  await expect.poll(() => page.evaluate(snapshotListyVirtualSizes))
    .toEqual(updatedVirtualSizes);

  const root = page.locator('[data-listy-theme="normal"] [data-listy-part="virtual-grouped"]');
  const holder = root.locator('.ant-listy-holder');
  const header = root.locator('.ant-listy-group-header-fixed');
  for (const sample of reference.scrollAlignments) {
    await page.getByRole('button', {
      name: `Scroll themed ${sample.key} normal`, exact: true
    }).click();

    const item = root.locator(`.ant-listy-item:has([data-record="${sample.key}"])`);
    await expect(header).toHaveText(sample.headerText);
    await expect(item).toBeVisible();
    await expect.poll(async () => {
      const row = (await item.boundingBox())!;
      const viewport = (await holder.boundingBox())!;
      return Math.abs(row.y - viewport.y - sample.gap);
    }).toBeLessThan(1);
    expect((await header.boundingBox())!.height).toBe(sample.headerHeight);
    await expect(item).toHaveCSS('padding-top', sample.itemPadding);
  }
  await expect(header).toHaveCSS('font-size', '24px');
  await expect(page.getByLabel('Listy theme refs normal', { exact: true })).toHaveText('4');
});

test('Listy refreshes unmounted estimates when measured row heights stay unchanged', async ({ page }) => {
  await page.goto('/?fixture=listy-theme');
  const root = page.locator('[data-listy-theme="priority"] [data-listy-part="virtual"]');
  const item = root.locator('.ant-listy-item').first();
  const original = await item.elementHandle();
  const observation = reference.staleEstimateObservation;
  await expect.poll(() => page.evaluate(snapshotListyVirtualSizes)
    .then(sizes => sizes.priority.virtual)).toEqual({
      fillerHeight: observation.before.fillerHeight,
      keys: observation.before.keys
    });
  expect(await item.evaluate(node => (node as HTMLElement).offsetHeight))
    .toBe(observation.before.measuredItemHeight);

  await page.getByRole('button', { name: 'Update Listy tokens', exact: true }).dispatchEvent('click');

  await expect.poll(() => page.evaluate(snapshotListyVirtualSizes)
    .then(sizes => sizes.priority.virtual)).toEqual(observation.freshMount);
  expect(await item.evaluate(node => (node as HTMLElement).offsetHeight))
    .toBe(observation.after.measuredItemHeight);
  expect(await item.evaluate((node, old) => node === old, original)).toBe(true);
});

test('Listy resets inherited tokens without replacing its nested field', async ({ page }) => {
  await page.goto('/?fixture=listy-theme');
  const root = page.locator('[data-listy-theme="nested"] [data-listy-part="raw-grouped"]');
  const input = root.getByRole('textbox', {
    name: 'Listy theme draft nested raw-grouped row-00', exact: true
  });
  const original = await input.elementHandle();
  await input.fill('Nested Listy draft');

  await page.getByLabel('Inherit Listy theme', { exact: true }).dispatchEvent('click');

  const defaults = reference.cases.find(sample => sample.name === 'default')!;
  await expect.poll(() => page.evaluate(snapshotListyTheme).then(metrics => metrics.nested))
    .toEqual(defaults.metrics.nested);
  expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(input).toHaveValue('Nested Listy draft');
  await expect(input).toBeFocused();
  await expect(page.locator('[data-listy-theme="normal"] .ant-listy').first())
    .toHaveCSS('font-size', '20px');
});

test('Listy restores legacy styles while retaining the field and refs', async ({ page }) => {
  await page.goto('/?fixture=listy-theme');
  const root = page.locator('[data-listy-theme="normal"] [data-listy-part="raw"]');
  const input = root.getByRole('textbox', { name: 'Listy theme draft normal raw row-00', exact: true });
  const original = await input.elementHandle();
  await input.fill('Legacy Listy draft');

  await page.getByLabel('Apply source Listy theme', { exact: true }).dispatchEvent('click');

  await expect(root.locator('.ant-listy')).toHaveCSS('font-size', '14px');
  await expect(root.locator('.ant-listy')).toHaveCSS('line-height', '22px');
  await expect(root.locator('.ant-listy-item').first()).toHaveCSS('padding-top', '12px');
  expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(input).toHaveValue('Legacy Listy draft');
  await expect(input).toBeFocused();
  await expect(page.getByLabel('Listy theme refs normal', { exact: true })).toHaveText('4');
});
