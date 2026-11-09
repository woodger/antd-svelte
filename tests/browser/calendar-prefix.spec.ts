import { test, expect } from './test';
import reference from './fixtures/ant-design-calendar-prefix-reference.json' with { type: 'json' };
import { snapshotCalendarPrefix } from './calendar-prefix-metrics';

test.use({ viewport: reference.reference.viewport });
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2024-09-15T03:00:00.000Z'));
});

for (const entry of reference.cases) {
  for (const scope of ['normal', 'nested', 'sibling'] as const) {
    test(`Calendar prefixes match Source ${entry.sample.id}/${scope}`, async ({ page }) => {
      if ('viewport' in entry.sample && entry.sample.viewport) {
        await page.setViewportSize({ width: entry.sample.viewport, height: 900 });
      }
      await page.goto('/?fixture=calendar-prefix');
      await page.getByRole('combobox', { name: 'Calendar prefix sample', exact: true })
        .selectOption(entry.sample.id);
      await page.getByRole('combobox', { name: 'Calendar prefix scope', exact: true })
        .selectOption(scope);
      await page.mouse.move(10, 890);

      const expected = structuredClone(entry.result[scope]);
      if (scope !== 'sibling' && entry.wideHeader) {
        // Native сохраняет прежний nowrap; Source 320px растягивает controls до 48px.
        const source = entry.wideHeader[scope];
        expected.mode!['height'] = source.mode!['height'];
        expected.year!.style!['height'] = source.year!.style!['height'];
        expected.month!.style!['height'] = source.month!.style!['height'];
      }

      await expect.poll(() => page.evaluate(snapshotCalendarPrefix)).toEqual(expected);
    });
  }
}

test('Calendar prefix updates retain year focus, selection, cells, ref and timestamp', async ({ page }) => {
  await page.goto('/?fixture=calendar-prefix');
  await page.getByRole('checkbox', { name: 'Live Calendar prefix', exact: true }).check();
  const root = page.locator('.fixture-calendar-prefix');
  const year = root.locator('.calendar-year-select').getByRole('combobox');
  const selected = root.getByRole('gridcell', { name: '2024-09-15', exact: true });
  const oldRoot = await root.elementHandle();
  const oldYear = await year.elementHandle();
  const oldCell = await selected.elementHandle();
  const id = await year.getAttribute('id');
  const yearValue = await year.inputValue();
  await year.focus();
  await year.evaluate((node: HTMLInputElement) => node.setSelectionRange(0, 2, 'backward'));
  // Source хранит подпись рядом с пустым search input; Native Select показывает её в input.
  const selection = await year.evaluate((node: HTMLInputElement) =>
    [node.selectionStart, node.selectionEnd, node.selectionDirection]);

  for (const step of reference.transitions) {
    await page.getByRole('textbox', { name: 'Live Calendar prefix value', exact: true })
      .evaluate((node: HTMLInputElement, value) => {
        node.value = value;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, step.prefix);

    await expect.poll(() => page.evaluate(snapshotCalendarPrefix)).toEqual(step.result);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(true);
    expect(await year.evaluate((node, old) => node === old, oldYear)).toBe(true);
    expect(await selected.evaluate((node, old) => node === old, oldCell)).toBe(true);
    await expect(year).toBeFocused();
    await expect(year).toHaveValue(yearValue);
    await expect(year).toHaveAttribute('id', id!);
    expect(await year.evaluate((node: HTMLInputElement) =>
      [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual(selection);
    await expect(page.getByLabel('Calendar prefix ref', { exact: true })).toHaveText('true');
    await expect(page.getByLabel('Calendar prefix events', { exact: true })).toHaveText('');
    await expect(page.getByLabel('Calendar prefix value', { exact: true }))
      .toHaveText('2024-09-15T12:34:56.789Z');
  }
  await root.getByRole('gridcell', { name: '2024-09-16', exact: true }).click();

  await expect(page.getByLabel('Calendar prefix events', { exact: true })).toHaveText(
    'change:2024-09-16T12:34:56.789Z|select:2024-09-16T12:34:56.789Z:date'
  );
});

test('Calendar local prefixes keep focused cell keyboard behavior and independent header controls',
  async ({ page }) => {
    await page.goto('/?fixture=calendar-prefix');
    await page.getByRole('checkbox', { name: 'Live Calendar prefix', exact: true }).check();
    const root = page.locator('.fixture-calendar-prefix');
    const selected = root.getByRole('gridcell', { name: '2024-09-15', exact: true });
    const oldCell = await selected.elementHandle();
    await selected.focus();

    await page.getByRole('textbox', { name: 'Local Calendar prefix value', exact: true })
      .evaluate((node: HTMLInputElement) => {
        node.value = 'dates';
        node.dispatchEvent(new Event('input', { bubbles: true }));
      });

    await expect(root).toHaveClass(/\bdates-calendar\b/);
    await expect(root.locator('.dates-calendar-year-select > .suite-select')).toHaveCount(1);
    await expect(root.locator('.suite-radio-group')).toHaveCount(1);
    expect(await selected.evaluate((node, old) => node === old, oldCell)).toBe(true);
    await expect(selected).toBeFocused();
    await selected.press('ArrowRight');
    const next = root.getByRole('gridcell', { name: '2024-09-16', exact: true });
    await expect(next).toBeFocused();
    await next.press('Enter');

    await expect(next).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByLabel('Calendar prefix value', { exact: true }))
      .toHaveText('2024-09-16T12:34:56.789Z');
  });

test('Calendar prefix changes preserve default styling, selected date and open month options',
  async ({ page }) => {
    await page.goto('/?fixture=calendar-prefix');
    await page.getByRole('checkbox', { name: 'Live Calendar prefix', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Source prefix Calendar theme', exact: true })
      .dispatchEvent('click');
    const root = page.locator('.fixture-calendar-prefix');
    const month = root.locator('.calendar-month-select').getByRole('combobox');
    await month.click();
    const option = root.getByRole('option', { name: 'Oct', exact: true });
    const oldOption = await option.elementHandle();
    await page.mouse.move(10, 890);
    await page.evaluate(() => Promise.all(document.getAnimations()
      .filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity)
      .map(animation => animation.finished.catch(() => {}))));
    const before = await page.evaluate(snapshotCalendarPrefix);

    await page.getByRole('textbox', { name: 'Live Calendar prefix value', exact: true })
      .evaluate((node: HTMLInputElement) => {
        node.value = 'next';
        node.dispatchEvent(new Event('input', { bubbles: true }));
      });

    await expect.poll(() => page.evaluate(snapshotCalendarPrefix)).toEqual(before);
    expect(await option.evaluate((node, old) => node === old, oldOption)).toBe(true);
    await expect(month).toBeFocused();
    await expect(option).toBeVisible();
    await option.click();

    await expect(page.getByLabel('Calendar prefix value', { exact: true }))
      .toHaveText('2024-10-15T12:34:56.789Z');
    await expect(page.getByLabel('Calendar prefix events', { exact: true })).toHaveText(
      'panel:2024-10-15T12:34:56.789Z:month|change:2024-10-15T12:34:56.789Z|select:2024-10-15T12:34:56.789Z:month'
    );
  });
