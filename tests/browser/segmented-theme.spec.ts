import { test, expect } from './test';
import reference from './fixtures/ant-design-segmented-theme-reference.json' with { type: 'json' };
import { snapshotSegmentedTheme, snapshotSegmentedState } from './segmented-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Segmented tokens match pinned geometry and interaction colors for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=segmented-theme');
      await page.getByLabel('Segmented token preset', { exact: true }).selectOption(sample.name);

      await expect.poll(() => page.evaluate(snapshotSegmentedTheme)).toEqual(sample.metrics);
      for (const [key, states] of Object.entries(sample.states)) {
        const [id, rawIndex] = key.split('-');
        const index = Number(rawIndex);
        const node = page.locator(`[data-segmented-theme="${id}"] label`).nth(index);
        await node.hover();

        await expect.poll(() => page.evaluate(snapshotSegmentedState, { id, index }))
          .toEqual(states.hover);
        await page.mouse.down();
        try {
          await expect.poll(() => page.evaluate(snapshotSegmentedState, { id, index }))
            .toEqual(states.active);
        } finally {
          await page.mouse.move(1, 1);
          await page.mouse.up();
        }
      }
    });
}

test('Segmented token updates preserve selection, radio nodes, focus and provider scopes', async ({ page }) => {
  await page.goto('/?fixture=segmented-theme');
  const root = page.locator('[data-segmented-theme="normal"]');
  await root.locator('label').nth(1).click();
  const radio = root.getByRole('radio', { name: 'Beta', exact: true });
  await radio.focus();
  const original = await radio.elementHandle();
  await page.getByRole('button', { name: 'Update Segmented track padding', exact: true })
    .evaluate(node => (node as HTMLButtonElement).click());

  await expect(root.locator('.ant-segmented')).toHaveCSS('padding', '7px');
  await expect(radio).toBeFocused();
  await expect(radio).toBeChecked();
  expect(await radio.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(page.getByLabel('Segmented theme events', { exact: true })).toHaveText('["b"]');
  for (const [id, padding] of [['nested', 1], ['reset', 3], ['sibling', 5], ['outside', 2]]) {
    await expect(page.locator(`[data-segmented-theme="${id}"] .ant-segmented`))
      .toHaveCSS('padding', `${padding}px`);
  }
  await page.getByLabel('Inherit child Segmented tokens', { exact: true }).uncheck();

  await expect(page.locator('[data-segmented-theme="nested"] .ant-segmented'))
    .toHaveCSS('color', 'rgba(0, 0, 0, 0.65)');
  await page.getByLabel('Apply source Segmented tokens', { exact: true }).dispatchEvent('click');

  await expect(root.locator('.ant-segmented')).toHaveCSS('padding', '2px');
  await expect(root.locator('.ant-segmented')).not.toHaveClass(/(?:^|\s)css-(?:dev-only-do-not-override-)?[a-z0-9]+(?:\s|$)/);
  expect(await radio.evaluate((node, old) => node === old, original)).toBe(true);
  await radio.press('ArrowLeft');

  await expect(root.getByRole('radio', { name: 'Alpha', exact: true })).toBeChecked();
  await expect(page.getByLabel('Segmented theme events', { exact: true })).toHaveText('["b","a"]');
  await page.getByLabel('Mount themed Segmented controls', { exact: true }).uncheck();

  await expect(root).toHaveCount(0);
});

test('Segmented theme geometry changes cancel the thumb and retain the selected input', async ({ page }) => {
  await page.goto('/?fixture=segmented-theme');
  await page.getByLabel('Animate Segmented theme', { exact: true }).check();
  const root = page.locator('[data-segmented-theme="normal"]');
  await root.locator('.ant-segmented').evaluate(node => {
    (node as HTMLElement).style.setProperty('--ant-motion-duration-slow', '2s');
  });
  await root.locator('label').nth(1).click();
  const thumb = root.locator('.ant-segmented-thumb');
  await expect(thumb).toBeAttached();
  await thumb.evaluate(node => node.getAnimations().forEach(animation => animation.pause()));
  const radio = root.getByRole('radio', { name: 'Beta', exact: true });
  const original = await radio.elementHandle();
  await page.getByRole('button', { name: 'Update Segmented track padding', exact: true })
    .evaluate(node => (node as HTMLButtonElement).click());

  await expect(thumb).toHaveCount(0);
  await expect(radio).toBeChecked();
  await expect(root.locator('.ant-segmented-item-selected')).toHaveText('Beta');
  expect(await radio.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(page.getByLabel('Segmented theme events', { exact: true })).toHaveText('["b"]');
});
