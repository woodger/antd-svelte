import { test, expect } from './test';
import { formTooltipMetrics } from './form-tooltip-metrics';
import reference from './fixtures/ant-design-form-tooltip-reference.json' with { type: 'json' };

for (const { sample, metrics } of reference.cases) {
  test(`Form label tooltip matches source merging, geometry and content for ${sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-tooltip');
    await page.getByRole('combobox', { name: 'Form tooltip sample', exact: true }).selectOption(sample.id);
    const icon = page.locator('.ant-form-item-tooltip');
    if ('activate' in sample && sample.activate === 'hover') await icon.hover();
    if ('activate' in sample && sample.activate === 'click') await icon.click();
    const expected = sample.id === 'array'
      ? reference.cases.find(({ sample }) => sample.id === 'array-title')!.metrics : metrics;
    const { click, ...visual } = expected;

    await expect.poll(() => page.evaluate(formTooltipMetrics)).toEqual(visual);
    if (click) {
      await page.locator('#before-tooltip').focus();
      expect(await icon.evaluate((element) => {
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        return { prevented: event.defaultPrevented,
          inputFocused: document.activeElement === document.querySelector('[data-tooltip-case] input') };
      })).toEqual(click);
    }
  });
}

test('Form tooltip keeps its default decorative icon out of the field name and its popup outside the label', async ({ page }) => {
  await page.goto('/?fixture=form-tooltip');
  await page.getByRole('combobox', { name: 'Form tooltip sample', exact: true }).selectOption('text');
  const input = page.getByLabel('Caption', { exact: true });

  await expect(input).toHaveAccessibleName('Caption');
  await expect(page.getByRole('tooltip')).toHaveText('Details');
  expect(await page.getByRole('tooltip').evaluate((element) => element.closest('label'))).toBeNull();
  const glyph = await page.locator('.anticon-question-circle svg').evaluate((element, source) => {
    const original = new DOMParser().parseFromString(source, 'image/svg+xml');
    return {
      actual: [...element.querySelectorAll('path')].map((node) => node.getAttribute('d')),
      expected: [...original.querySelectorAll('path')].map((node) => node.getAttribute('d'))
    };
  }, reference.defaultIcon.svg);
  expect(glyph.actual).toEqual(glyph.expected);
  await page.locator('#before-tooltip').focus();
  await page.keyboard.press('Tab');
  await expect(input).toBeFocused();
});

test('Form tooltip updates preserve control, focus, selection, metadata and native serialization', async ({ page }) => {
  await page.goto('/?fixture=form-tooltip');
  const input = page.locator('[data-tooltip-case] input');
  await input.fill('Draft name');
  await page.getByRole('button', { name: 'Seed tooltip metadata', exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
  await input.focus();
  await input.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 4); });
  const original = await input.elementHandle();
  const metadata = await page.getByRole('status', { name: 'Tooltip field metadata', exact: true }).textContent();

  for (const id of ['text', 'context-icon', 'item-icon', 'array', 'false']) {
    await page.getByRole('combobox', { name: 'Form tooltip sample', exact: true }).evaluate(
      (element: HTMLSelectElement, value) => {
        element.value = value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }, id
    );
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Draft name');
    await expect(input).toHaveAccessibleDescription('Stored error Stored note');
    await expect(page.getByRole('status', { name: 'Tooltip field metadata', exact: true })).toHaveText(metadata!);
    expect(await input.evaluate((element, old) => element === old, original)).toBe(true);
    expect(await input.evaluate((element: HTMLInputElement) =>
      [element.selectionStart, element.selectionEnd]
    )).toEqual([1, 4]);
    expect(await input.evaluate((element: HTMLInputElement) =>
      new FormData(element.form!).get('name')
    )).toBe('Draft name');
  }
  await expect(page.getByRole('tooltip')).toHaveCount(0);
});
