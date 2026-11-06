import { test, expect } from './test';
import reference from './fixtures/ant-design-progress-circle-reference.json' with { type: 'json' };
import { snapshotProgressCircle } from './progress-circle-metrics';

const root = '[data-progress-circle] > [data-ant-progress-root]';
test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=progress-circle');
  expect(await page.evaluate(() => document.compatMode)).toBe(reference.reference.documentMode);
  await expect(page.getByRole('heading', { name: 'Source Progress circle', exact: true }))
    .toBeVisible();
});

for (const sample of reference.cases) {
  test(`Progress circle matches the source for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Progress circle case', exact: true })
      .selectOption(sample.name);

    await expect.poll(() => page.evaluate(snapshotProgressCircle,
      sample.props.prefixCls || 'ant-progress')).toEqual(sample.snapshot);
    await expect(page.getByLabel('Progress circle ref', { exact: true })).toHaveText('true');
  });
}

test('Progress circle retains root, values and focus across segments, gaps and prefix changes', async ({ page }) => {
  const original = await page.locator(root).elementHandle();
  const input = page.getByRole('textbox', { name: 'Progress circle draft', exact: true });
  await input.fill('Retained draft');
  await input.focus();

  for (const name of ['Update circle percent', 'Update circle success', 'Change circular gap',
    'Change circular prefix', 'Toggle circle RTL']) {
    await page.getByRole('button', { name, exact: true }).dispatchEvent('click');
  }

  await expect(page.locator(root)).toHaveAttribute('aria-valuenow', '80');
  await expect(page.locator(root)).toHaveAttribute('dir', 'rtl');
  await expect(page.locator(root).locator('.live-progress-circle-path')).toHaveCount(2);
  expect(await page.locator(root).evaluate((node, old) => node === old, original)).toBe(true);
  await expect(input).toHaveValue('Retained draft');
  await expect(input).toBeFocused();
});

test('Progress circular steps and gradients update without retaining old masks', async ({ page }) => {
  const original = await page.locator(root).elementHandle();
  await page.getByRole('button', { name: 'Toggle circular gradient', exact: true }).click();

  await expect(page.locator(root).locator('mask')).toHaveCount(1);
  await expect(page.locator(root).locator('foreignObject')).toHaveCount(1);
  await page.getByRole('button', { name: 'Set circular steps', exact: true }).click();

  await expect(page.locator(root).locator('.ant-progress-circle-path')).toHaveCount(8);
  await expect(page.locator(root).locator('mask')).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear circular steps', exact: true }).click();
  await expect(page.locator(root).locator('mask')).toHaveCount(1);
  expect(await page.locator(root).evaluate((node, old) => node === old, original)).toBe(true);
});

test('Tiny circular progress shows its live indicator in Tooltip and retains passive focus order', async ({ page }) => {
  await page.getByRole('button', { name: 'Shrink circular progress', exact: true }).click();
  const body = page.locator(root).locator('[data-ant-progress-circle-body]');

  await expect(page.locator(root).locator('[data-ant-progress-part="indicator"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Before circle', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'After circle', exact: true })).toBeFocused();
  await body.hover();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText('25%');
  await page.getByRole('button', { name: 'Update circle percent', exact: true }).dispatchEvent('click');
  await expect(tooltip).toHaveText('80%');
  await page.getByRole('button', { name: 'Grow circular progress', exact: true }).click();
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await expect(page.locator(root).locator('[data-ant-progress-part="indicator"]')).toHaveText('80%');
});

test('Progress circle respects reduced motion and cleans refs and popup on unmount', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Update circle percent', exact: true }).click();

  for (const path of await page.locator(root).locator('.ant-progress-circle-path').all()) {
    await expect(path).toHaveCSS('transition-duration', '0s');
  }
  await page.getByRole('button', { name: 'Shrink circular progress', exact: true }).click();
  await page.locator(root).locator('[data-ant-progress-circle-body]').hover();
  await expect(page.getByRole('tooltip')).toBeVisible();
  await page.getByRole('button', { name: 'Toggle circle mount', exact: true }).dispatchEvent('click');

  await expect(page.locator(root)).toHaveCount(0);
  await expect(page.getByLabel('Progress circle ref', { exact: true })).toHaveText('false');
  await expect(page.getByRole('tooltip')).toHaveCount(0);
});

test('Progress circle matches source transition durations for rapid and spaced updates', async ({ page }) => {
  await page.clock.install({ time: new Date('2030-01-01T00:00:00Z') });
  // install продолжает ход часов; pauseAt отделяет интервалы приложения от задержек DOM/CDP.
  await page.clock.pauseAt(new Date('2030-01-01T00:00:01Z'));
  const select = page.getByRole('combobox', { name: 'Progress circle case', exact: true });
  await select.selectOption('empty');
  await select.selectOption('quarter');
  const durations = () => page.locator(root).locator('.ant-progress-circle-path')
    .evaluateAll(nodes => nodes.map(node => getComputedStyle(node).transitionDuration));

  await expect.poll(durations).toEqual(reference.transitionTrace[0]);
  await page.clock.runFor(20);
  await page.getByRole('button', { name: 'Update circle percent', exact: true }).dispatchEvent('click');
  await expect.poll(durations).toEqual(reference.transitionTrace[1]);
  await page.clock.runFor(150);
  await page.getByRole('button', { name: 'Update circle percent', exact: true }).dispatchEvent('click');
  await expect.poll(durations).toEqual(reference.transitionTrace[2]);
});
