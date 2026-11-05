import { test, expect } from './test';
import reference from './fixtures/ant-design-segmented-prefix-reference.json' with { type: 'json' };
import { snapshotSegmentedPrefix, snapshotSegmentedPrefixInteraction } from './segmented-prefix-metrics';

test.use({ viewport: reference.viewport });

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=segmented-prefix');
  await expect(page.getByRole('heading', { name: 'Segmented local prefixes', exact: true }))
    .toBeVisible();
});

for (const sample of reference.cases) {
  test(`Segmented prefix matches source classes, geometry and states for ${sample.name}`,
    async ({ page }) => {
      await page.getByLabel('Segmented prefix preset', { exact: true }).selectOption(sample.name);
      await page.mouse.move(0, 0);
      const prefix = 'prefix' in sample && sample.prefix || 'ant-segmented';

      await expect.poll(() => page.evaluate(snapshotSegmentedPrefix, prefix))
        .toEqual(sample.metrics);
      await page.locator('[data-segmented-prefix-case="normal"] label').nth(1).hover();

      await expect.poll(() => page.evaluate(snapshotSegmentedPrefixInteraction)).toEqual(sample.hover);
      await page.mouse.down();

      await expect.poll(() => page.evaluate(snapshotSegmentedPrefixInteraction))
        .toEqual(sample.active);
      await page.mouse.move(0, 0);
      await page.mouse.up();
    });
}

for (const preset of ['tenant', 'component-tokens', 'native-dark-compact']) {
  test(`Segmented prefix updates preserve focus, values, refs and callbacks for ${preset}`,
    async ({ page }) => {
      await page.getByLabel('Segmented prefix preset', { exact: true }).selectOption(preset);
      const root = page.getByRole('radiogroup', { name: 'Prefix control normal', exact: true });
      const radio = root.getByRole('radio', { name: 'Alpha', exact: true });
      await radio.focus();
      await radio.press('ArrowRight');
      const selected = root.getByRole('radio', { name: 'Beta', exact: true });
      const input = await selected.elementHandle();
      const control = await root.elementHandle();
      const prefix = preset === 'tenant' ? 'tenant-segmented'
        : preset === 'component-tokens' ? 'theme-segmented' : 'native-segmented';
      const neighbor = await page.evaluate(snapshotSegmentedPrefix, prefix);
      const appearance = await root.evaluate(node => {
        const css = getComputedStyle(node);
        return [css.padding, css.backgroundColor, css.fontSize, node.getBoundingClientRect().height];
      });
      await page.getByRole('button', { name: 'Set alternate Segmented prefix', exact: true })
        .dispatchEvent('click');

      await expect(root).toHaveClass(/next-segmented/);
      await expect(selected).toBeChecked();
      await expect(selected).toBeFocused();
      expect(await selected.evaluate((node, original) => node === original, input)).toBe(true);
      expect(await root.evaluate((node, original) => node === original, control)).toBe(true);
      await expect(page.getByLabel('Segmented prefix value', { exact: true })).toHaveText('b');
      await expect(page.getByLabel('Segmented prefix events', { exact: true })).toHaveText('["b"]');
      await expect(page.getByLabel('Segmented prefix ref', { exact: true })).toHaveText('mounted');
      expect(await root.evaluate(node => {
        const css = getComputedStyle(node);
        return [css.padding, css.backgroundColor, css.fontSize, node.getBoundingClientRect().height];
      })).toEqual(appearance);
      expect((await page.evaluate(snapshotSegmentedPrefix, 'next-segmented')).outside)
        .toEqual(neighbor.outside);
      expect(await page.getByRole('form', { name: 'Segmented prefix form', exact: true })
        .evaluate(form => new FormData(form as HTMLFormElement).getAll('prefix-normal')))
        .toEqual(['on']);
      await page.getByRole('button', { name: 'Use default Segmented prefix', exact: true })
        .dispatchEvent('click');

      await expect(root).toHaveClass(/\bant-segmented\b/);
      await expect(selected).toBeFocused();
      await expect(page.locator('style[data-ant-svelte-theme^="segmented-prefix:"]')).toHaveCount(0);
      await selected.press('ArrowRight');

      await expect(radio).toBeChecked();
      await expect(radio).toBeFocused();
      await expect(page.getByLabel('Segmented prefix events', { exact: true }))
        .toHaveText('["b","a"]');
    });
}

for (const preset of ['native-light', 'native-dark', 'native-dark-compact']) {
  test(`Segmented keeps native theme geometry and colors with local prefixes for ${preset}`,
    async ({ page }) => {
      await page.getByLabel('Segmented prefix preset', { exact: true }).selectOption(preset);
      const before = await page.evaluate(snapshotSegmentedPrefix, 'native-segmented');
      for (const metrics of Object.values(before)) {
        for (const item of metrics.items) item.input.className = 'ant-segmented-item-input';
      }
      await page.getByRole('button', { name: 'Use default Segmented prefix', exact: true })
        .dispatchEvent('click');

      await expect.poll(() => page.evaluate(snapshotSegmentedPrefix, 'ant-segmented')).toEqual(before);
    });
}

test('Segmented prefix changes cancel an active thumb and retain keyboard focus', async ({ page }) => {
  const root = page.getByRole('radiogroup', { name: 'Prefix control normal', exact: true });
  await root.evaluate(node => (node as HTMLElement).style
    .setProperty('--ant-motion-duration-slow', '2s'));
  await root.getByRole('radio', { name: 'Alpha', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  const thumb = root.locator('.tenant-segmented-thumb');
  await expect(thumb).toHaveCount(1);
  const animation = await thumb.evaluateHandle(node => {
    const active = node.getAnimations()[0];
    active.pause();
    return active;
  });
  await page.getByRole('button', { name: 'Set alternate Segmented prefix', exact: true })
    .dispatchEvent('click');

  await expect(root.locator('[data-ant-segmented-thumb]')).toHaveCount(0);
  expect(await animation.evaluate(value => value.playState)).toBe('idle');
  await expect(root.locator('.next-segmented-item-selected')).toHaveText('Beta');
  await expect(root.getByRole('radio', { name: 'Beta', exact: true })).toBeFocused();
  await expect(page.getByLabel('Segmented prefix events', { exact: true })).toHaveText('["b"]');
  await page.keyboard.press('ArrowRight');

  await expect(root.locator('.next-segmented-thumb')).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await expect(root.locator('[data-ant-segmented-thumb]')).toHaveCount(0);
  await expect(root.getByRole('radio', { name: 'Alpha', exact: true })).toBeChecked();
});

test('Segmented prefix tooltip ownership and styles clean up with the focused control', async ({ page }) => {
  const root = page.getByRole('radiogroup', { name: 'Prefix control normal', exact: true });
  await root.getByRole('radio', { name: 'Alpha', exact: true }).focus();

  await expect(root.locator('.tenant-segmented-tooltip-item')).toHaveCSS('display', 'contents');
  await expect(page.getByRole('tooltip')).toHaveText('Prefix help');
  await page.getByRole('button', { name: 'Set alternate Segmented prefix', exact: true })
    .dispatchEvent('click');

  await expect(root.locator('.next-segmented-tooltip-item')).toHaveCSS('display', 'contents');
  await expect(page.getByRole('tooltip')).toHaveText('Prefix help');
  await page.getByLabel('Mount prefix Segmented controls', { exact: true }).dispatchEvent('click');

  await expect(root).toHaveCount(0);
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await expect(page.locator('style[data-ant-svelte-theme^="segmented-prefix:"]')).toHaveCount(0);
  await expect(page.getByRole('radiogroup', { name: 'Prefix control outside', exact: true }))
    .toBeVisible();
});
