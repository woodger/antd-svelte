import { test, expect } from './test';
import reference from './fixtures/ant-design-select-tag-count-reference.json' with { type: 'json' };

const cases = reference.cases.filter(entry => entry.sample.count !== 'responsive');

for (const entry of cases) {
  test(`Select numeric tag count matches source for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=select-tag-count');
    await page.getByRole('combobox', { name: 'Tag count sample', exact: true })
      .selectOption(entry.sample.id);
    const expected = entry.sample.id === 'nan' ? reference.cases[0].tags : entry.tags;

    await expect.poll(() => page.locator('[data-tag-count] .ant-select-selection-item')
      .evaluateAll(nodes => nodes.map(node => ({
        text: node.querySelector('.ant-select-selection-item-content')!.textContent,
        title: node.getAttribute('title'),
        disabled: node.classList.contains('ant-select-selection-item-disabled'),
        removable: Boolean(node.querySelector('.ant-select-selection-item-remove'))
      })))).toEqual(expected);
    await expect(page.getByRole('status', { name: 'Tag count values', exact: true }))
      .toHaveText(JSON.stringify(entry.sample.values));
    await expect(page.getByRole('status', { name: 'Tag count changes', exact: true }))
      .toHaveText('0');
    if ('omitted' in entry) {
      const omitted = await page.locator('[data-tag-count] [data-omitted]')
        .getAttribute('data-omitted');
      expect(JSON.parse(omitted!)).toEqual(entry.omitted);
    }
  });
}

test('Select tag count hands hidden remove focus to input and respects explicit outside focus',
  async ({ page }) => {
    await page.goto('/?fixture=select-tag-count');
    const input = page.getByRole('combobox', { name: 'Counted values', exact: true });
    const original = await input.elementHandle();
    await page.getByRole('button', { name: 'Удалить Zeta', exact: true }).focus();
    await page.getByRole('checkbox', { name: 'Override visible tag count', exact: true })
      .evaluate((node: HTMLInputElement) => {
        node.checked = true;
        node.dispatchEvent(new Event('change', { bubbles: true }));
      });

    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(page.locator('[data-tag-count] .ant-select-selection-item-content'))
      .toHaveText(['Alpha', 'Locked', '+ 2 ...']);
    await page.getByRole('checkbox', { name: 'Override visible tag count', exact: true }).uncheck();
    await page.getByRole('button', { name: 'Удалить Zeta', exact: true }).focus();
    await page.getByRole('checkbox', { name: 'Override visible tag count', exact: true })
      .evaluate((node: HTMLInputElement) => {
        node.checked = true;
        node.dispatchEvent(new Event('change', { bubbles: true }));
        document.getElementById('tag-count-outside')!.focus();
      });
    await expect(page.getByRole('button', { name: 'Outside tag count', exact: true })).toBeFocused();
    await expect(page.getByRole('status', { name: 'Tag count changes', exact: true })).toHaveText('0');
  });

test('Select hidden tags stay in FormData, Backspace, clear, reset and disabled behavior',
  async ({ page }) => {
    await page.goto('/?fixture=select-tag-count');
    await page.getByRole('combobox', { name: 'Tag count sample', exact: true }).selectOption('one');
    const input = page.getByRole('combobox', { name: 'Counted values', exact: true });
    const form = page.getByRole('form', { name: 'Tag count native form', exact: true });
    expect(await form.evaluate(node => new FormData(node as HTMLFormElement).getAll('tag-count')))
      .toEqual(['a', 'locked', '0', 'z']);
    await input.press('Backspace');
    await expect(page.getByRole('status', { name: 'Tag count values', exact: true }))
      .toHaveText('["a","locked",0]');
    await input.press('Backspace');
    await input.press('Backspace');
    await expect(page.getByRole('status', { name: 'Tag count values', exact: true }))
      .toHaveText('["locked"]');
    await page.locator('[data-tag-count] .clear').click();
    await expect(page.getByRole('status', { name: 'Tag count values', exact: true })).toHaveText('[]');
    await page.getByRole('button', { name: 'Reset tag count', exact: true }).click();
    await expect(page.getByRole('status', { name: 'Tag count values', exact: true }))
      .toHaveText('["a","locked",0,"z"]');
    await page.getByRole('checkbox', { name: 'Right to left', exact: true }).check();
    await input.click();
    await expect(page.getByRole('listbox', { name: 'Counted values', exact: true }))
      .toHaveCSS('direction', 'rtl');
    await page.getByRole('checkbox', { name: 'Disable all components', exact: true }).check();
    await expect(input).toBeDisabled();
    expect(await form.evaluate(node => new FormData(node as HTMLFormElement).getAll('tag-count')))
      .toEqual([]);
  });
