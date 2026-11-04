import { test, expect } from './test';
import reference from './fixtures/ant-design-progress-line-reference.json' with { type: 'json' };
import nativeClipping from './fixtures/progress-native-clipping-reference.json' with { type: 'json' };
import { snapshotProgressLine } from './progress-line-metrics';

const root = '[data-progress-line] > [data-ant-progress-root]';
test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=progress-line');
  expect(await page.evaluate(() => document.compatMode)).toBe(reference.reference.documentMode);
  await expect(page.getByRole('heading', { name: 'Source Progress line', exact: true })).toBeVisible();
});
for (const sample of reference.cases) {
  const title = sample.name === 'numeric'
    ? 'Progress line retains the existing native clipping at numeric size 24'
    : `Progress line matches the source for ${sample.name}`;
  test(title, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Progress line case', exact: true })
      .selectOption(sample.name);

    await expect.poll(() => page.evaluate(snapshotProgressLine, sample.props.prefixCls || 'ant-progress'))
      .toEqual(sample.name === 'numeric' ? nativeClipping.snapshot : sample.snapshot);
    await expect(page.getByLabel('Progress line ref', { exact: true })).toHaveText('true');
  });
}

test('Progress updates segments, prefix and tokens without replacing its root or taking focus', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Progress line case', exact: true })
    .selectOption('success-part');
  const original = await page.locator(root).elementHandle();
  const input = page.getByRole('textbox', { name: 'Progress line draft', exact: true });
  await input.fill('Retained draft');
  await input.focus();

  for (const name of ['Update line percent', 'Update success percent', 'Change Progress prefix',
    'Square themed Progress']) {
    await page.getByRole('button', { name, exact: true }).dispatchEvent('click');
  }

  await expect(page.locator(root)).toHaveAttribute('aria-valuenow', '80');
  await expect.poll(() => page.locator(root).evaluate(node => {
    const rail = node.querySelector('.live-progress-rail')!.getBoundingClientRect();
    const track = node.querySelector('.live-progress-track')!.getBoundingClientRect();
    return track.width / rail.width;
  })).toBeCloseTo(0.8, 3);
  await expect(page.locator(root).locator('.live-progress-rail')).toHaveCSS('border-radius', '0px');
  expect(await page.locator(root).evaluate((node, old) => node === old, original)).toBe(true);
  await expect(input).toHaveValue('Retained draft');
  await expect(input).toBeFocused();
});

test('Progress moves info into the rail and changes steps without altering its root ref', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Progress line case', exact: true })
    .selectOption('fractional');
  const original = await page.locator(root).elementHandle();
  await page.getByRole('button', { name: 'Toggle inner percent', exact: true }).click();

  await expect(page.locator(root).locator('[data-ant-progress-part="track"] [data-ant-progress-part="indicator"]'))
    .toHaveText('42.5%');
  await page.getByRole('button', { name: 'Set line steps', exact: true }).click();
  await expect(page.locator(root).locator('[data-ant-progress-part="step"]')).toHaveCount(7);
  await expect(page.locator(root).locator('.ant-progress-rail')).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear line steps', exact: true }).click();

  await expect(page.locator(root).locator('.ant-progress-rail')).toHaveCount(1);
  expect(await page.locator(root).evaluate((node, old) => node === old, original)).toBe(true);
  await expect(page.getByLabel('Progress line ref', { exact: true })).toHaveText('true');
});

test('Progress renders formatter snippets as nodes while preserving semantic values', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Progress line case', exact: true })
    .selectOption('format-rich');

  await expect(page.locator(root).locator('strong')).toHaveText('65 / 30');
  await expect(page.locator(root)).toHaveAttribute('aria-valuenow', '65');
  await expect(page.locator(root)).toHaveAttribute('aria-valuetext', '65%');
  await page.getByRole('button', { name: 'Update success percent', exact: true }).click();

  await expect(page.locator(root).locator('strong')).toHaveText('65 / 45');
});

test('Progress keeps source gradient directions reactive and respects reduced motion for custom prefixes', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Progress line case', exact: true })
    .selectOption('gradient');
  await page.getByRole('button', { name: 'Toggle line RTL', exact: true }).click();

  await expect(page.locator(root).locator('.ant-progress-track'))
    .toHaveCSS('background-image', 'linear-gradient(to left, rgb(16, 142, 233), rgb(135, 208, 104))');
  await page.getByRole('button', { name: 'Change Progress prefix', exact: true }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await expect(page.locator(root).locator('.live-progress-track')).toHaveCSS('transition-duration', '0s');
  expect(await page.locator(root).evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
});

test('Progress clears its public ref and theme scope when unmounted', async ({ page }) => {
  await page.getByRole('button', { name: 'Change Progress prefix', exact: true }).click();
  await page.getByRole('button', { name: 'Toggle line mount', exact: true }).click();

  await expect(page.locator(root)).toHaveCount(0);
  await expect(page.getByLabel('Progress line ref', { exact: true })).toHaveText('false');
  await expect(page.locator('style[data-ant-svelte-theme="progress-prefix:live-progress"]')).toHaveCount(0);
});
