import { test, expect } from './test';
import reference from './fixtures/ant-design-calendar-theme-reference.json' with { type: 'json' };
import { snapshotCalendarTheme } from './calendar-theme-metrics';

test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date(reference.reference.now));
  await page.goto('/?fixture=calendar-theme');
});

for (const sample of reference.cases) {
  test(`Calendar component themes match source cells, header and child scopes for ${sample.name}`,
    async ({ page }) => {
      await page.getByLabel('Calendar theme preset', { exact: true }).selectOption(sample.name);

      await expect.poll(() => page.evaluate(snapshotCalendarTheme)).toEqual(sample.metrics);
    });
}

for (const sample of reference.mobile) {
  test(`Calendar themes match source at a 400px viewport for ${sample.name}`, async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 1200 });
    await page.getByLabel('Calendar theme preset', { exact: true }).selectOption(sample.name);

    await expect.poll(() => page.evaluate(snapshotCalendarTheme)).toEqual(sample.metrics);
  });
}

test('Calendar token updates preserve the focused date, selection and precise change callbacks',
  async ({ page }) => {
    const host = page.locator('[data-calendar-theme="normal"]');
    const full = host.locator('[data-calendar-panel="full-month"]');
    const selected = full.getByRole('gridcell', { name: '2024-09-15', exact: true });
    const focused = full.getByRole('gridcell', { name: '2024-09-16', exact: true });
    const originalSelected = await selected.elementHandle();
    const originalFocused = await focused.elementHandle();
    await focused.focus();

    await page.getByRole('button', { name: 'Update Calendar tokens', exact: true })
      .dispatchEvent('click');

    const expected = reference.cases.find(sample => sample.name === 'updated-tokens')!
      .metrics.normal['full-month'];
    await expect(full.locator('.ant-picker-calendar'))
      .toHaveCSS('background-color', expected.root['background-color']);
    await expect(selected.locator('.ant-picker-cell-inner'))
      .toHaveCSS('background-color', expected.selected!.inner!['background-color']);
    expect(await focused.evaluate((node, old) => node === old, originalFocused)).toBe(true);
    expect(await selected.evaluate((node, old) => node === old, originalSelected)).toBe(true);
    await expect(focused).toBeFocused();
    await expect(selected).toHaveAttribute('aria-selected', 'true');
    await expect(host.getByLabel('Calendar theme events normal', { exact: true })).toHaveText('[]');

    await focused.press('Enter');

    await expect(focused).toHaveAttribute('aria-selected', 'true');
    await expect(host.getByLabel('Calendar theme events normal', { exact: true }))
      .toHaveText('["change:2024-09-16T12:34:56.789Z","select:2024-09-16T12:34:56.789Z:date"]');
  });

test('Calendar keeps the intrinsic year editor and open options while token widths change',
  async ({ page }) => {
    await page.getByLabel('Calendar theme preset', { exact: true }).selectOption('zero-metrics');
    const host = page.locator('[data-calendar-theme="normal"]');
    const full = host.locator('[data-calendar-panel="full-month"]');
    const year = full.locator('.ant-picker-calendar-year-select');
    const input = year.getByRole('combobox');
    await input.click();
    const option = year.getByRole('option', { name: '2024', exact: true });
    const originalInput = await input.elementHandle();
    const originalOption = await option.elementHandle();

    await page.getByRole('button', { name: 'Update Calendar tokens', exact: true })
      .dispatchEvent('click');

    await expect(year).toHaveCSS('width', '135px');
    await expect(year.getByRole('listbox')).toHaveCSS('width', '135px');
    expect(await input.evaluate((node, old) => node === old, originalInput)).toBe(true);
    expect(await option.evaluate((node, old) => node === old, originalOption)).toBe(true);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('2024');
    await expect(option).toHaveAttribute('aria-selected', 'true');
    await expect(host.getByLabel('Calendar theme events normal', { exact: true })).toHaveText('[]');

    await year.getByRole('option', { name: '2025', exact: true }).click();

    await expect(input).toHaveValue('2025');
    await expect(host.getByLabel('Calendar theme events normal', { exact: true }))
      .toHaveText('["panel:2025-09-15T12:34:56.789Z:month","change:2025-09-15T12:34:56.789Z","select:2025-09-15T12:34:56.789Z:year"]');
  });

test('Calendar inheritance reset preserves focused cells and its controlled value', async ({ page }) => {
  const host = page.locator('[data-calendar-theme="nested"]');
  const selected = host.getByRole('gridcell', { name: '2024-09-15', exact: true });
  const original = await selected.elementHandle();
  await selected.focus();

  await page.getByLabel('Inherit Calendar theme', { exact: true }).dispatchEvent('click');

  const defaults = reference.cases.find(sample => sample.name === 'default')!;
  await expect.poll(() => page.evaluate(snapshotCalendarTheme).then(metrics => metrics.nested))
    .toEqual(defaults.metrics.nested);
  expect(await selected.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(selected).toBeFocused();
  await expect(selected).toHaveAttribute('aria-selected', 'true');
  await expect(host.getByLabel('Calendar theme events nested', { exact: true })).toHaveText('[]');
});

test('Calendar restores default styling without replacing fields or changing sibling tokens',
  async ({ page }) => {
    const host = page.locator('[data-calendar-theme="normal"]');
    const full = host.locator('[data-calendar-panel="full-month"]');
    const year = full.locator('.ant-picker-calendar-year-select');
    const input = year.getByRole('combobox');
    const original = await input.elementHandle();
    await input.focus();

    await page.getByLabel('Apply source Calendar theme', { exact: true }).dispatchEvent('click');

    await expect(full.locator('.ant-picker-calendar')).toHaveCSS('font-size', '14px');
    await expect(year).toHaveCSS('width', '80px');
    await expect(year.locator('.intrinsic-label')).toHaveCount(0);
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('2024');
    await expect(full.getByRole('gridcell', { name: '2024-09-15', exact: true }))
      .toHaveAttribute('aria-selected', 'true');
    await page.getByLabel('Mount themed Calendar controls', { exact: true }).dispatchEvent('click');
    expect(await original!.evaluate(node => node.isConnected)).toBe(false);
    const defaults = reference.cases.find(sample => sample.name === 'default')!;
    await expect.poll(() => page.evaluate(snapshotCalendarTheme).then(metrics => metrics.sibling))
      .toEqual(defaults.metrics.sibling);
  });
