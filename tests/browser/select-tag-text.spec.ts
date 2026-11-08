import { test, expect } from './test';
import reference from './fixtures/ant-design-select-tag-text-reference.json' with { type: 'json' };

for (const entry of reference.cases) {
  test(`Selected tag text matches source for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=select-tag-text');
    await page.getByRole('combobox', { name: 'Tag text sample', exact: true })
      .selectOption(entry.sample.id);
    const expected = structuredClone(entry.tags);
    if (entry.sample.id.endsWith('-emoji-split')) expected[0].text = '...';
    if (entry.sample.id.endsWith('-middle-pair')) expected[0].text = 'A...';

    await expect.poll(() => page.locator('[data-tag-text] .ant-select-selection-item')
      .evaluateAll(nodes => nodes.map(node => ({
        text: node.querySelector('.ant-select-selection-item-content')!.textContent,
        title: node.getAttribute('title')
      })))).toEqual(expected);
    await expect(page.getByRole('status', { name: 'Tag text changes', exact: true })).toHaveText('0');
  });
}

for (const component of ['select', 'cascader']) {
  test(`Tag text length updates ${component} without changing selected values, DOM or focus`,
    async ({ page }) => {
      await page.goto('/?fixture=select-tag-text');
      await page.getByRole('combobox', { name: 'Tag text sample', exact: true })
        .selectOption(`${component}-cut`);
      const input = page.getByRole('combobox', { name: 'Truncated values', exact: true });
      await input.focus();
      const original = await input.elementHandle();
      await page.getByRole('checkbox', { name: 'Override tag text length', exact: true })
        .evaluate((node: HTMLInputElement) => {
          node.checked = true;
          node.dispatchEvent(new Event('change', { bubbles: true }));
        });
      await expect(page.locator('[data-tag-text] .ant-select-selection-item-content'))
        .toHaveText('Al...');
      await page.getByRole('spinbutton', { name: 'Tag text length', exact: true })
        .evaluate((node: HTMLInputElement) => {
          node.value = '5';
          node.dispatchEvent(new Event('input', { bubbles: true }));
        });

      expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
      await expect(input).toBeFocused();
      await expect(page.locator('[data-tag-text] .ant-select-selection-item-content'))
        .toHaveText('Alpha...');
      await expect(page.locator('[data-tag-text] .ant-select-selection-item'))
        .toHaveAttribute('title', 'Alphabet');
      await expect(page.getByRole('status', { name: 'Tag text values', exact: true }))
        .toHaveText(component === 'select' ? '["a"]' : '[["a"]]');
      await expect(page.getByRole('status', { name: 'Tag text changes', exact: true }))
        .toHaveText('0');
    });
}

test('Tag truncation preserves free text values, native form fields and full remove names',
  async ({ page }) => {
    await page.goto('/?fixture=select-tag-text');
    await page.getByRole('combobox', { name: 'Tag text sample', exact: true })
      .selectOption('select-cut');
    await page.getByRole('checkbox', { name: 'Free text tags', exact: true }).check();
    const input = page.getByRole('combobox', { name: 'Truncated values', exact: true });
    await input.fill('created-tag');
    await input.press('Enter');
    await expect(page.locator('[data-tag-text] .ant-select-selection-item-content'))
      .toHaveText(['Alp...', 'cre...']);
    const form = page.getByRole('form', { name: 'Tag text native form', exact: true });
    expect(await form.evaluate(node => new FormData(node as HTMLFormElement).getAll('tag-text')))
      .toEqual(['a', 'created-tag']);
    await page.getByRole('button', { name: 'Удалить created-tag', exact: true }).click();
    await expect(input).toBeFocused();
    await expect(page.getByRole('status', { name: 'Tag text values', exact: true }))
      .toHaveText('["a"]');
  });
