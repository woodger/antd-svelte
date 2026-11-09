import { test, expect } from './test';
import reference from './fixtures/ant-design-responsive-controls-reference.json' with { type: 'json' };
import { snapshotResponsiveControls } from './responsive-controls-metrics';

for (const [index, entry] of reference.cases.entries()) {
  test(`Responsive controls match Source ${entry.sample.id}/${entry.scope}`, async ({ page }) => {
    await page.goto('/?fixture=responsive-controls');
    await page.getByRole('combobox', { name: 'Responsive controls sample', exact: true })
      .selectOption(String(index));

    for (const frame of entry.result) {
      await page.setViewportSize({ width: frame.width, height: 1200 });

      await expect.poll(() => page.evaluate(snapshotResponsiveControls)).toEqual(frame.metrics);
    }
  });
}

test('Responsive tokens update Masonry and Pagination without replacing focused item or pager',
  async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 1200 });
    await page.goto('/?fixture=responsive-controls');
    await page.getByRole('checkbox', { name: 'Live responsive controls', exact: true }).check();
    const input = page.getByRole('textbox', { name: 'Responsive masonry 0', exact: true });
    const root = page.locator('[data-responsive-masonry] > div');
    const pager = page.locator('.fixture-responsive-pagination');
    await input.fill('Retained draft');
    await input.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 5, 'backward'));
    const oldInput = await input.elementHandle();
    const oldRoot = await root.elementHandle();
    const oldPager = await pager.elementHandle();
    await expect.poll(() => page.evaluate(snapshotResponsiveControls)).toEqual(reference.live.initial);

    await page.getByRole('button', { name: 'Update responsive breakpoints', exact: true })
      .dispatchEvent('click');

    for (const frame of reference.live.fresh) {
      await page.setViewportSize({ width: frame.width, height: 1200 });

      // Source token update оставляет старые queries; fresh public mount даёт текущую раскладку.
      await expect.poll(() => page.evaluate(snapshotResponsiveControls)).toEqual(frame.metrics);
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
      expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(true);
      expect(await pager.evaluate((node, old) => node === old, oldPager)).toBe(true);
      await expect(input).toBeFocused();
      await expect(input).toHaveValue(reference.live.updated.value);
      expect(await input.evaluate((node: HTMLInputElement) =>
        [node.selectionStart, node.selectionEnd, node.selectionDirection]))
        .toEqual(reference.live.updated.selection);
      await expect(page.getByLabel('Responsive Masonry ref', { exact: true })).toHaveText('true');
      await expect(page.getByLabel('Responsive Pagination events', { exact: true })).toHaveText('');
      expect(await page.getByRole('form', { name: 'Responsive controls form', exact: true })
        .evaluate(node => new FormData(node as HTMLFormElement).get('draft-0')))
        .toBe('Retained draft');
    }
  });

test('Responsive Pagination retains current page, quick-jump draft and selection during token updates',
  async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 1200 });
    await page.goto('/?fixture=responsive-controls');
    await page.getByRole('checkbox', { name: 'Live responsive controls', exact: true }).check();
    const pager = page.locator('.fixture-responsive-pagination');
    const input = pager.getByRole('textbox', { name: 'Page', exact: true });
    await input.fill('7');
    await input.evaluate((node: HTMLInputElement) => node.setSelectionRange(0, 1, 'backward'));
    const oldInput = await input.elementHandle();

    await page.getByRole('button', { name: 'Update responsive breakpoints', exact: true })
      .dispatchEvent('click');

    await expect.poll(() => page.evaluate(snapshotResponsiveControls))
      .toEqual(reference.live.fresh[0].metrics);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('7');
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
    expect(await input.evaluate((node: HTMLInputElement) =>
      [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual([0, 1, 'backward']);
    await expect(pager.locator('[aria-current="page"]')).toHaveText('4');
    await expect(page.getByLabel('Responsive Pagination events', { exact: true })).toHaveText('');
    await input.press('Enter');

    await expect(pager.locator('[aria-current="page"]')).toHaveText('7');
    await expect(page.getByLabel('Responsive Pagination events', { exact: true })).toHaveText('7');
    await page.getByRole('checkbox', { name: 'Mount responsive controls', exact: true }).uncheck();
    await expect(pager).toHaveCount(0);
    await page.setViewportSize({ width: 900, height: 1200 });
    await page.getByRole('checkbox', { name: 'Mount responsive controls', exact: true }).check();

    await expect(page.locator('.fixture-responsive-pagination [aria-current="page"]'))
      .toHaveText('4');
    await expect(page.getByRole('textbox', { name: 'Responsive masonry 0', exact: true }))
      .toHaveValue('Draft 0');
  });
